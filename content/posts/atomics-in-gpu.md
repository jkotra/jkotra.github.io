---
title: "Atomics in GPU"
description: "Comparing traditional CAS spin-loops vs. native FP32 atomics in OpenCL on Mesa Rusticl."
date: 2026-11-22T03:36:14+05:30
tags: ["opencl", "gpu", "rusticl", "performance", "amd"]
images:
 - /images/atomics-in-gpu/runtime_comparison.png
draft: false
---

# Introduction

Modern GPUs can perform trillions of operations per second by exploiting massive parallelism: thousands of threads execute the same operation on different pieces of data.

This works well when threads operate independently, but many algorithms eventually require threads to update shared state.

Consider a simple counter:

```c
counter++;
```

If thousands of GPU threads execute this simultaneously, multiple threads may read the same value and overwrite each other's updates.

This is where **atomic operations** become useful. An atomic operation performs a read-modify-write on a memory location without allowing conflicting atomic operations to interfere.

For example:

```c
atomic_add(&counter, 1);
```

Now multiple threads can safely increment the same counter.
 
---

A recent addition to Mesa's Rusticl OpenCL driver brings support for the `cl_ext_float_atomics` extension, enabling atomic operations on floating-point values. On AMD, floating-point atomics in OpenCL have largely been available only on CDNA-based datacenter GPUs, while NVIDIA's OpenCL implementation does not provide this extension. Rusticl's support therefore makes floating-point atomics accessible through an open OpenCL implementation on a broader range of consumer hardware.

In this article, we'll benchmark the traditional emulated CAS spin-loop against native hardware floating-point atomics (`cl_ext_float_atomics`) in a real-world aggregation problem, and compare it against SQLite's CPU execution, to see how much of a performance advantage native atomics provide.


# Example: Grouping and Accumulating (The Fruit Inventory)

A histogram or aggregation is a classic parallel reduction problem. At its core, a histogram is simply accumulating items into different categories or "bins".

To make this concrete and intuitive, imagine managing a wholesale fruit inventory with **3,000,000 items** across three categories: **apples**, **oranges**, and **bananas**. Each record consists of:
* `name`: Category string (`apple`, `orange`, `banana`)
* `type`: Specific variety (`Honeycrisp`, `Valencia`, `Cavendish`)
* `weight`: Single-precision float weight in grams (e.g., `180.25f`)

In relational databases like SQLite, calculating the total inventory weight per fruit category is a classic SQL query:

```sql
SELECT name, SUM(weight) 
FROM fruits 
GROUP BY name;
```

In GPU terms, this is fundamentally an accumulation into 3 bins:
* **Bin 0**: Apple
* **Bin 1**: Orange
* **Bin 2**: Banana

In a parallel GPU kernel, we launch one thread per fruit item. Each thread reads its fruit category ID, locates the corresponding bin, and adds its weight to the running total:

```c
int bin = category_ids[gid];
sums[bin] += weights[gid]; // Data race!
```

Because thousands of threads execute concurrently across the GPU's compute units, multiple threads will constantly attempt to update the same fruit bin at the exact same clock cycle. A naive write results in catastrophic data loss from overwritten values. To guarantee correct sums, every update must be atomic.


## The Integer Case vs. Floating-Point Dilemma

For integer counting, OpenCL has long supported `atomic_add(&sums[bin], 1)`. 

However, scientific, financial, and data-processing pipelines almost always accumulate **floating-point values** (like weights, prices, or probabilities). Historically, standard OpenCL specifications omitted floating-point atomic additions. To work around this limitation on consumer GPUs, developers had to resort to an **emulated Compare-And-Swap (CAS) spin-loop** using integer bit-reinterpretation:

```c
// Emulating float atomic addition via atomic_cmpxchg
void atomic_add_f32_cas(volatile __global int* addr, float val) {
    int old_val, new_val, read_val;
    do {
        old_val = *addr;
        new_val = as_int(as_float(old_val) + val);
        read_val = atomic_cmpxchg(addr, old_val, new_val);
    } while (read_val != old_val);
}

__kernel void fruit_histogram_cas(
    __global int* out_bins,
    __global const int* category_ids,
    __global const float* weights,
    int N
) {
    int gid = get_global_id(0);
    if (gid < N) {
        int cat = category_ids[gid];
        atomic_add_f32_cas(&out_bins[cat], weights[gid]);
    }
}
```

In this CAS loop, each thread reads the current memory value, calculates the new floating-point sum, and attempts an `atomic_cmpxchg`. If another thread modified the memory location in the meantime, the swap fails, and the thread must retry from scratch.


## Native Floating-Point Atomics via `cl_ext_float_atomics`

With the introduction of the `cl_ext_float_atomics` extension in Mesa's Rusticl, we no longer need to spin on integer CAS operations. The GPU can perform the floating-point addition natively in hardware:

```c
// Function declaration provided by cl_ext_float_atomics
float __attribute__((overloadable)) atomic_fetch_add(volatile __global atomic_float *, float);

__kernel void fruit_histogram_native(
    volatile __global atomic_float* out_bins,
    __global const int* category_ids,
    __global const float* weights,
    int N
) {
    int gid = get_global_id(0);
    if (gid < N) {
        int cat = category_ids[gid];
        atomic_fetch_add(&out_bins[cat], weights[gid]);
    }
}
```

This code is substantially cleaner and more expressive. But how does it perform when contention spikes?


# Warning: Contention Kills Performance

Atomic operations guarantee mathematical correctness, but they do not eliminate the physical limitations of hardware. 

On a modern GPU, thousands of threads are organized into SIMD warps or wavefronts (32 threads on NVIDIA, 32 or 64 on AMD). When thousands of threads execute concurrently, memory controllers and L2 cache crossbars must serialize concurrent read-modify-write requests targeting the same 64-byte or 128-byte cacheline.

In our fruit dataset, **3,000,000 threads** are attempting to update just **3 memory addresses**. This creates extreme contention:

### 1. The Global CAS Disaster
In an emulated Compare-And-Swap spin-loop, every thread reads the memory address, performs the floating-point addition in its vector ALU, and executes an `atomic_cmpxchg`. 

When millions of threads contend for just three bins:
* Exactly **one thread succeeds** per memory cycle for that bin.
* All other contending threads **fail their check**.
* Every failing thread must discard its calculation, re-read the updated value from cache or memory, recompute the sum, and retry.

This creates an avalanche of L2 cache invalidations and memory transaction replays. The threads waste the vast majority of their cycles spinning uselessly.

### 2. Native Hardware Float Atomics
With `cl_ext_float_atomics`, the GPU uses dedicated atomic arithmetic units embedded directly in the memory subsystem and L2 cache (such as RDNA3's `BUFFER_ATOMIC_ADD_F32` instruction).

Work-items no longer spin or retry in software. Instead, they issue a hardware atomic packet and immediately proceed. The L2 cache controller queues and aggregates the operations in hardware, completely eliminating the retry storm.


# Benchmarks: SQLite vs. GPU CAS vs. GPU Native FP32

{{% notice warning %}}
**A Note on Practical System Architecture**:
Writing a custom GPU kernel solely to compute a standalone sum or simple group-by is rarely justified in production. For isolated reductions, mature engines and libraries (such as DuckDB, Polars, or CUB/Thrust) provide highly optimized parallel algorithms out of the box without requiring custom OpenCL code or PCIe transfer overhead.

Where custom GPU kernels and hardware atomics truly shine is **Kernel Fusion**: when heavy data transformations, filtering, simulation, or domain-specific business logic execute entirely on-chip within GPU compute units, and intermediate results must be accumulated directly into categorical bins without spilling gigabytes of temporary arrays back to global memory or host RAM.
{{% /notice %}}

To quantify the real-world performance difference, we benchmarked the aggregation of our **3,000,000 fruit records** across three engines:
1. **SQLite 3 (`GROUP BY name, SUM(weight)`)**: Standard row-oriented CPU database engine running locally against `fruits.db` (96.6 MB).
2. **GPU Emulated CAS Spin-Loop (`fruit_histogram_cas`)**: OpenCL kernel using `atomic_cmpxchg`.
3. **GPU Native FP32 Atomics (`fruit_histogram_native`)**: OpenCL kernel using `cl_ext_float_atomics` (`atomic_fetch_add`).

### Hardware & Environment
* **GPU**: AMD Radeon RX 7600 (RDNA3, Navi 33, 8GB VRAM)
* **Driver**: Mesa Rusticl 26.3 via Zink over RADV (Vulkan 1.4)
* **Dataset**: 3,000,000 rows (1M Apple, 1M Orange, 1M Banana) stored in `fruits.parquet` (15.2 MB) and `fruits.db` (96.6 MB)

---

### Execution Time Comparison

| Engine | Median Runtime (ms) | Speedup vs. SQLite | Speedup vs. GPU CAS |
| :--- | :--- | :--- | :--- |
| **SQLite 3 `GROUP BY + SUM` (CPU)** | **2,567.66 ms** (~2.57 sec) | 1.0x (Baseline) | — |
| **GPU Emulated CAS Loop (Kernel)** | **609.44 ms** | **4.2x faster** | 1.0x (Baseline) |
| **GPU Native FP32 Atomics (Total incl. GPU Buffer Load)** | **9.91 ms** | **259.2x faster** | **61.5x faster** |
| **GPU Native FP32 Atomics (Pure Kernel)** | **1.08 ms** | **2,377.6x faster** | **564.3x faster** |

---

### Runtime Comparison (Log Scale)

Because execution times range from sub-millisecond on native hardware atomics to over 2.5 seconds in SQLite, the y-axis is plotted on a logarithmic scale for clear comparison:

![Runtime Comparison](/images/atomics-in-gpu/runtime_comparison.png "Aggregation Runtime: SQLite vs. GPU CAS vs. Native FP32 Atomics (Lower is Better)")


# Conclusion

For years, developing high-performance data processing pipelines in OpenCL on consumer AMD GPUs required ugly, fragile CAS spin-loops to perform floating-point reductions.

With Mesa's Rusticl driver adopting `cl_ext_float_atomics`, consumer GPUs can finally execute native floating-point atomic instructions cleanly and efficiently.

---

{{% notice note %}}
The complete synthetic dataset generator, OpenCL kernels, and benchmarking suite are available in the [atomics-in-gpu repository](https://github.com/jkotra/atomics-in-gpu).
{{% /notice %}}
