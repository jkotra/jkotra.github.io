---
title: "C11 Threads"
date: 2020-08-03T11:23:52+05:30
description: "counting to a billion 7x faster with threads.h🚀"
tags: ["c"]
images:
 - https://i.imgur.com/ikZi4XM.jpg
draft: false
---

## Introduction

this is a simple introduction to threading in C. I will be using inbuild [C threading library](https://en.cppreference.com/w/c/thread) `threads.h` which is a feature of [C11 standard](https://en.wikipedia.org/wiki/C11_(C_standard_revision)).

the advantages of using C11 threads over platform-specific solutions like [`pthread`](https://en.wikipedia.org/wiki/POSIX_Threads) is obvious, code portability. write it once, compile it anywhere with the compiler that supports C11 std.


## Counting to a Billion

### Single-threaded

For the demonstration, we take a simple program the counts to 1 billion (*1 billion x 5 times*)

```c

#include <stdio.h>
#include <stdlib.h>

void count_to_billion()
{
    int at = 0;
    for (int i = 0; i < 1000000000; i++)
    {
        at++;
    }

    printf("counted to 1 billion! at=%d\n", at);
}

int main()
{

    // count to 5 billion 5 times
    count_to_billion();
    count_to_billion();
    count_to_billion();
    count_to_billion();
    count_to_billion();

    return EXIT_SUCCESS;
}

```

let's compile the program

```
gcc main.c
```

we use a Unix utility `time` to measure the execution time of the program.

run the compiled program with `time` as the prefix

```
time ./a.out
```

Output:
```bash

~/Documents/Projects/CWS » time ./a.out
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
./a.out  8.68s user 0.00s system 99% cpu 8.686 total

```

as we can see from the output it took `8.686` secs to complete

---

### MultiThreading

{{% notice note %}}
from [cppreference.com](https://en.cppreference.com/w/c/thread/thrd_create):

The type `thrd_start_t` is a typedef of `int(*)(void*)`, which differs from the POSIX equivalent `void*(*)(void*)`
{{% /notice %}}

```c

#include <stdio.h>
#include <threads.h>
#include <stdlib.h>

int count_to_billion(void* arg)
{
    int at = 0;
    for (int i = 0; i < 1000000000; i++)
    {
        at++;
    }

    printf("counted to 1 billion! at=%d\n", at);
}

int main()
{

    int n_threads = 5;

    thrd_t thread[n_threads];

    for (int i = 0; i < n_threads; i++)
    {
        thrd_create(&thread[i], count_to_billion, NULL);
    }

    for (int i = 0; i < n_threads; i++)
    {
        thrd_join(thread[i], NULL);
    }
    return EXIT_SUCCESS;
}

```

let's compile our program and run it.

```
gcc main.c -lpthread
```
don't forget to link it with thread library of your OS, in my case, it's `pthreads`

```
~/Documents/Projects/CWS » time ./a.out
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
counted to 1 billion! at=1000000000
./a.out  8.92s user 0.00s system 497% cpu 1.794 total
```

---

## Conclusion 

as it's quite evident from the execution time of both programs, Multi-threaded program is much faster.

> 1.794(MT) > 8.686(ST) 
