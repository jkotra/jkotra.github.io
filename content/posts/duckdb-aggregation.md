---
title: "DuckDB as Aggregation Engine in Data Pipelines"
description: "using DuckDB as an aggregation engine in data pipelines. 🦆"
date: 2026-03-31T01:08:45+05:30
images:
 - /images/duckdb-agg-metrics/throughput.png
tags: ["duckdb"]
draft: false
---

# Introduction

A quick account on using DuckDB in HPC / High-throughput systems pipelines with a simple IPC (ZeroMQ in our case!) backend.

# DuckDB

DuckDB is a lightweight, high-performance analytical database designed to run inside your application (in-memory)

[DuckDB](https://duckdb.org/)

## Why DuckDB?

* Columnar, vectorized engine matches for NumPy/Arrow batch pipeline.
* Queries Arrow data directly with minimal copying and Python overhead.
* Executes aggregations efficiently using optimized SQL execution.
* Built for high-throughput analytical workloads.

# File Formats - Parquet

We will be using the Parquet file format for processing efficiency, which will allow us to take advantage of advanced features like Row Groups and Zero-Copy abstraction.

---

# Let's Crunch Some Data!

{{% notice note %}}
[Code available on Github](https://github.com/jkotra/pd-vs-duckdb-ipc-aggregation).
{{% /notice %}}

The layout of our pipeline is as follows:
1. *`sender.py`* - This generates data and sends it to `receiver.py` through ZMQ socket
2. *`receiver.py`* - This receives data, inserts data into duckdb and generates aggrregated average.
3. *`receiver_pd.py`* - pandas based reference implementation.

## Pipeline & Setup

We are going to send a data chunk (message) with shape `(R, 2)` rows every `N` seconds to a receiver program.

![Pipeline Architecture](/images/duckdb-agg-arch.png "Pipeline Architecture")

Our `sender.py` program is as follows: 

{{< highlight python "hl_lines=16-18 23-28, linenos=inline" >}}
# sender.py
import zmq
import numpy as np
import time
import argparse


def main(mps: int, rows: int):
    ctx = zmq.Context()
    socket = ctx.socket(zmq.PUSH)
    socket.connect("ipc://@simple-stream")

    interval = 1.0 / mps

    while True:
        # create batch (rows x 2 columns)
        ts = np.full((rows, 1), time.time(), dtype=np.float64)
        val = np.random.rand(rows, 1)

        batch = np.hstack([ts, val])  # shape (rows, 2)
        # print("sending batch:", batch)

        # send as raw bytes
        socket.send_multipart(
            [
                batch.astype(np.float64, order="F").tobytes(),
                str(rows).encode(),
                b"2",  # number of columns
            ]
        )

        time.sleep(interval)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mps", type=int, default=10)
    parser.add_argument("--rows", type=int, default=1000)
    args = parser.parse_args()

    main(args.mps, args.rows)
{{< / highlight >}}


1. In `ln 16`, we create 1000 rows of random float64 values along with the current timestamp.
2. `ln 24` sends out the message to the ZeroMQ socket (read/received by `receiver.py`) 


---

let's look at how `receiver.py` works:

{{< highlight python "hl_lines=15-20 30-31 35 41-47 51-54 57-60, linenos=inline" >}}
# receiver.py
import zmq
import numpy as np
import duckdb
import pyarrow as pa
import time
import json

def main():
    ctx = zmq.Context()
    socket = ctx.socket(zmq.PULL)
    socket.bind("ipc://@simple-stream")

    conn = duckdb.connect()
    conn.execute("""
        CREATE TABLE data (
            ts DOUBLE,
            value DOUBLE
        )
    """)

    MESSAGE_THRESHOLD = 100

    count = 0
    total_count = 0

    start_t = time.perf_counter()
    
    while True:
        data, r, c = socket.recv_multipart()
        r, c = int(r.decode()), int(c.decode())
        count += 1

        # read as Fortran order
        arr = np.frombuffer(memoryview(data), dtype=np.float64).reshape(r, c, order="F")

        # ---- column views ----
        ts_col = arr[:, 0]
        val_col = arr[:, 1]

        table = pa.Table.from_arrays(
            [
                pa.array(ts_col),
                pa.array(val_col),
            ],
            names=["ts", "value"]
        )

        conn.register("incoming", table)

        conn.execute("""
            INSERT INTO data
            SELECT * FROM incoming
        """)

        if count >= MESSAGE_THRESHOLD:
            result = conn.execute("""
                    SELECT COUNT(*), AVG(value)
                    FROM data
                """).fetchall()
            
            bench_message = {"time_s": time.perf_counter() - start_t, "total_count": total_count}
            print(json.dumps(bench_message))

            total_count += count
            count = 0

            if total_count >= 1_000:
                break

if __name__ == "__main__":
    main()
{{< / highlight >}}

1. In `ln 15`, we create a table to store the data that we are going to receive from the socket.
2. Next, in `ln 30`, we receive the message and reconstruct the data in `ln 35`
3. `ln 41` - create a PyArrow table and insert that into the DuckDB table that we created earlier.

---

## Column Major / Fortran Order Layout - Zero Copy

When we store the data in Column-Major Order/Fortran Order, a Pyarrow table can be created without modifying (copying) the underlying NumPy buffer. This is critical in High througput pipelines where CPU can be a potential bottleneck.

Let's look at an example:

$$
\begin{array}{c c}
\begin{bmatrix}
1 & 2 \\\\
3 & 4
\end{bmatrix}
&
\begin{bmatrix}
1 & 3 \\\\
2 & 4
\end{bmatrix}
\\\\
\mathrm{C\ Order} & \mathrm{(F)ortran\ Order}
\end{array}
$$

Recall how we are reading the rows in every message:
```py
ts_col = arr[:, 0]
val_col = arr[:, 1]
```

This index takes all rows of column 0 (`timestamp`) and column 1 (`value`), `ts_col` and `val_col` can be interpreted as pyarrow array with the same memory buffer underneath, i.e., zero copy.

## Benchmarks

DuckDB aggregation is about **8x** Faster than reference pandas implementation.

Here are some interesting graph metrics:

![Throughput](/images/duckdb-agg-metrics/throughput.png "Throughput - Pandas vs. DuckDB")

![CPU Usage](/images/duckdb-agg-metrics/cpu.png "CPU - Pandas vs. DuckDB")

![Memory](/images/duckdb-agg-metrics/memory.png "Memory - Pandas vs. DuckDB")

# Conclusion

DuckDB is an efficient analytics engine to use in a simple pipeline that has to deal with high throughput of data.

