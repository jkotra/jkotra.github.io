---
title: "Writing an Algorithm for Algoticks"
date: 2020-07-11T01:21:15+05:30
description: a short tutorial on how to write an algorithm to use with algoticks.
draft: false
tags: ["Algoticks"]
images:
  - https://i.imgur.com/2wUgnmC.jpg
---

# Introduction

This is a short tutorial on how to write an algorithm to use with algoticks. This article also provides a general layout of how algoticks asks and receives signals from user-written algorithms.

an algorithm, in the context of algoticks, is simply a function. The function must return a `signal`

`Signal` is defined as:
```c
typedef struct Signal {
    int buy;
    int neutral;
    int sell;
}algoticks_signal;
```

only any one of the above fields shall be set to `true` and the remaining two must be set to `false`.  A `signal` response consisting of more than 1 field set as `true` will result in either an error or a guaranteed (undefined/undesired) behavior.

# Layout

Example layout of an algorithm is as follows:

```c

#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "../../include/dtypes.h"

#ifdef _WIN32
__declspec(dllexport)                     // This is required for windows compatibility.
#endif

algoticks_signal analyze(algoticks_row *series, int n_candles){

    /* Blah Blah Blah */      // a short desc. of algorithm

    struct Signal signal;
    memset(&signal, 0, sizeof(signal));
    
    
    /*
    
    
    DO SOMETHING HERE!
    
    
    */


    return signal; // finally return the signal.

}


```

# what's inside `series`?

a series is a collection of `n` rows (`n` defined by user `candles` in `config.json`)

a `Row` struct is defined as:
```c

typedef struct Row
{
    /* dataformat to store CSV data */
    char date[32];
    float open;
    float high;
    float low;
    float close;
    int volume;

    algoticks_tow_ti technical_indicators;

    int curr;
    int n_rows; //this is to be set in case of Row array of non-predetermined size.
}algoticks_row;

```

Notice `technical_indicators` of type `algoticks_tow_ti`

`algoticks_tow_ti` is another struct that holds user given technical indicator data.

`algoticks_tow_ti` is defined as:
```c

typedef struct row_ti{

    int is_ti1_p;
    float ti1;

    int is_ti2_p;
    float ti2;

    int is_ti3_p;
    float ti3;

    int is_ti_others_p;
    char ti_others[2048];

}algoticks_tow_ti;

```

algoticks allow up to 3 technical indicators i.e `ti1` `ti2` `ti3` these fields need to explicitly set by the user in CSV data source to be parsed by algoticks.

if more then 3 technical indicators are required, the user can use `ti_others` and split it inside the algorithm as he needs.

fields with `_p` prefix are flags indicating the presence of corresponding values.

# Dissecting a simple algorithm

Here, we take a simple algorithm `Greens`

[`Greens.c`](https://github.com/jkotra/algoticks/blob/master/src/algorithms/Greens.c) is included with algoticks and can be found at `algorithms/Greens.c`

```c

#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "../../include/dtypes.h"

#ifdef _WIN32
__declspec(dllexport)
#endif
algoticks_signal analyze(algoticks_row *series, int n_candles){

    /* This is a buy only algo indicator */

    struct Signal signal;                           // Step 1
    memset(&signal, 0, sizeof(signal));

    for (int i = 1; i < n_candles; i++)            // Step 2
    {

        if(series[i].close > series[i-1].close){   // Step 3
            signal.buy = true;
        }
        else {
            signal.neutral = true;
            signal.sell = false;
            signal.buy = false;
            break;
        }
    }

    return signal;                                // Step 4

}

```

There are only 4 simple steps in writing an algorithm.

1. Declare a `Signal` struct.
2. Start a `for` loop.
3. Write the condition. If the condition fails, set `signal.neutral` to `true` and `signal.buy` and `signal.sell` to `false`.
4. if the condition is met, set `signal.buy` to `true`
4. Return `signal`

# Conclusion

The example above is a very simple algorithm. a bit complex algorithm(s) like [`EveningStar`](https://github.com/jkotra/algoticks/blob/master/src/algorithms/EveningStar.c) should be reviewed for a better understanding of translating your ideas into working algorithms.
