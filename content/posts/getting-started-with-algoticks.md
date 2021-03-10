---
title: "Getting Started With Algoticks"
date: 2020-07-02T03:06:47Z
description: This is a quick "Getting Started" Guide to algoticks trading simulator.
tags: ["C", "algoticks"]
images:
  - https://i.imgur.com/2EVP0SE.gif
draft: false

---

{{% notice note %}}
**Updated**: 10-Mar-2021
- *Updated things that are changed in algoticks v2.0*
{{% /notice %}}

# Introduction

This is a quick "Getting Started" Guide to algoticks trading simulator program. Algorticks is an algorithmic trading simulator written in C with Speed and modularity as design objectives. It's easy to write your own algorithms, all you need to know is how to write a for loop in C. ([learn here](https://www.tutorialspoint.com/cprogramming/c_for_loop.htm))

Algoticks is built to handle many types of OHLC data, most of the data found online can be directly fed into the program without any additional filtering.


## Getting Started

[Get latest algoticks release from github repository!](https://github.com/jkotra/algoticks/releases/)

to build from source, please refer to [README.md](https://github.com/jkotra/algoticks/blob/master/README.md)

## Preprocessing

Additional preprocessing is necessary to remove any oddities in your data like Missing data, ununiform formatting, etc.

Algoticks accepts upto 3 technical indicator columns namely as `ti1`, `ti2`, `ti3`. these values must be of type `int` or `float`. any additional technical indicators can be included using `ti_others` column name. these values are exposed as:

```c
Row -> technical_indicators -> ti1 (float)
Row -> technical_indicators -> ti2 (float)
Row -> technical_indicators -> ti3 (float)
Row -> technical_indicators -> ti_others (char [2084])
```

## Simulation

Example config file(s) can be found in the `assets` folder of the project. these are copied into `bin` folder on the invocation of `make`

example `config.json`

```json
{
    "algo": "algorithms/3Reds.so",
    "datasource": "example.csv",
    "symbol": "SUNPHARMA",
    "candles": 3,
    "interval": 0,

    "quantity": 100,
    "target": 5,
    "stoploss": 7,
    "is_training_sl": false,
    "trailing_sl_val": 1,
    
    "sliding": false,
    "intraday": true,
    "skip_header": true

}
```

`algo` - This is the name of the algorithm.

`datasource` - This is the datasource which is expected to contain OHLC data.

`symbol` - Symbol corresponding to datasource.

`candles` - `N` candles to be sent to `algo`

`interval` - `n` rows to skip. Assuming your data is `1min` interval, skipping 5 rows effectively makes it `5min` interval data.

`quantity` - Quantity

`target` - Desired target (Absolute Value)

`Stoploss` - Desired Stoploss (Absolute Value)

`is_training_sl` - Enable/Disable Trailing SL.

`trailing_sl_val` - Value to adjust on Target hit if trailing SL enabled.

`sliding` - If enabled, the data on I(Iteration)+1 will be in the form of N(Candles)+1. Otherwise only new rows are processed on every iteration.

`intraday` - Position is closed if time is over `intraday`. (`intraday_hour` and `intraday_min` is to be set in `settings.json`)

`skip_header` - Skips headers (Must be set to `true` for header order detection)


{{% notice note %}}

if `sliding: true`

$$\ [r1, r2, r3]r4,r5,r6 $$
$$\ r1, [r2, r3,r4],r5,r6 $$

if `sliding: false`

$$\ [r1, r2, r3]r4,r5,r6 $$
$$\ r1, r2, r3,[r4,r5,r6] $$

{{% /notice %}}

---

### Example

Data: [NIFTY50 1min Interval OHLC](https://drive.google.com/file/d/19sH22KV4X_reuf7wg2AWLXqVLSfqVs0K/view?usp=sharing)

`config.json`

```json

{
    "algo": "algorithms/3Reds.so",
    "datasource": "NIFTY50_1min.csv",
    "symbol": "NIFTY50",
    "candles": 3,
    "interval": 0,

    "quantity": 100,
    "target": 50,
    "stoploss": 75,
    "is_trailing_sl": true,
    "trailing_sl_val": 25,
    
    "sliding": false,
    "intraday": false,
    "skip_header": true

}

```

run algoticks from the command line:
```
./algoticks
```

to enable debug (this shows Target Hits, SL hits, TSL Adjustments, etc..)

```
./algoticks -D
```

On completion of the simulation, a `result.csv` is generated with results pertaining to completed simulation.

```csv
algo,pnl,datasource,symbol,candles,interval,target,stoploss,is_trailing_sl,trailing_sl_val,quantity,sliding,intraday,buy_signals,sell_signals,neutral_signals,trgt_hits,sl_hits,b_trgt_hits,s_trgt_hits,b_sl_hits,s_sl_hits,peak,bottom
algorithms/3Reds.so,-319344.750000,NIFTY50_1min.csv,NIFTY50,3,0,50.000000,75.000000,1,25.000000,100,0,0,0,380,1119,89,253,0,89,0,253,127930.085938,-346939.656250
```

## Benchmark

Algoticks has the ability to perform hundreds of simulation to choose the best one.

benchmark mode can be enabled using command line arg `-B`

`benchmark.json`


```json

{
    "algo": ["algorithms/3Greens.so", "algorithms/3Reds.so"],
    "datasource": ["example.csv"],
    "symbol": "SUNPHARMA",
    "candles": [4,6,8],
    "interval": [5,10,15],

    "quantity": [10],
    "target": [1.5,2,2.5],
    "stoploss": [2,2.5,3,3.5],
    "is_trailing_sl": [true,false],
    "trailing_sl_val": [1,2,3],
    
    "sliding": [true, false],
    "intraday": [true,false],
    "skip_header": true
}

```

A `results.csv` is generated with all the simulation results.


## LiveMode


Alogticks can detect and work with live updated datasource(s).

This gives the ability to monitor and test real-time market data.

this feature can be enabled using `-L` command line arg.

example:

`./algoticks -l`

What this essentially does is that, on hitting EOF, the program will repeatedly check for file modification in datasource, if it detects any modification, it reloads the file and continues execution.


# Conclusion

Algoticks is a result of almost a month of programming, tweaking and debugging. The idea was first implemented in python but the speed is not great, thus it will never see the light of the public. This is made with a vision to be very fast, compact, and robust compared to the initial python mock project.

Good day. :blush:
