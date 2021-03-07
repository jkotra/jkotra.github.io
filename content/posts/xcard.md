---
title: "Xcard library"
description: "Multi-threaded library to generator and validate cards 💳."
tags: ["cpp"]
date: 2020-08-20T22:36:03+05:30
images:
 - https://i.imgur.com/EDamtgl.jpg
draft: false
---

# Introduction

[xcard](https://github.com/jkotra/xcard) is a library to generate and validate credit/debit cards. it's divided into two classes:

* [`xcard`](https://github.com/jkotra/xcard/blob/master/src/xcard.cpp)
* [`xcardMT`](https://github.com/jkotra/xcard/blob/master/src/xcard_mt.cpp)

[`xcardMT`](https://github.com/jkotra/xcard/blob/master/src/xcard_mt.cpp) class consists of multithreaded functions which are useful when processing millions of cards.

## Luhn checksum

> The Luhn algorithm or Luhn formula, also known as the "modulus 10" or "mod 10" algorithm, named after its creator, IBM scientist Hans Peter Luhn, is a simple checksum formula used to validate a variety of identification numbers, such as credit card numbers, IMEI numbers, National Provider Identifier numbers in the United States, Canadian Social Insurance Numbers, Israeli ID Numbers, South African ID Numbers, Greek Social Security Numbers (ΑΜΚΑ), and survey codes appearing on McDonald's, Taco Bell, and Tractor Supply Co. receipts.

[From Wikipedia: Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)

---

## using `xcard` library

[demo.cpp](https://github.com/jkotra/xcard/blob/master/src/demo.cpp) contains simple code to generate a random credit card with prefix `4`(VISA)

```cpp
#include <iostream>
#include <vector>
#include <threads.h>
#include "../include/xcard.hpp"

int main()
{

    //initialize
    xcard xc("4", false);

    std::cout << "xcard version: " << xc.VERSION << std::endl;

    std::cout << "Generate 10 random valid cards with prefix 4" << std::endl;

    for (int i = 0; i < 10; i++)
    {
        std::cout << xc.generateCard() << std::endl;
    }

    return 0;
}

```

### Multithreaded functions for validation and search

`xcardMT` consists of a `constructor` which takes 3 arguments (prefix, no of threads and debug switch) and two multi-threaded functions:

```cpp
public:
    xcardMT(std::string prefix, int threads, int debug);
    std::vector<bool> validateFromFile(std::ifstream &fp);
    std::vector<std::string> LinearSearch();
```


---

# Conclusion

`xcard` is a very simple C++ library to validate and generate credit cards, multi-threaded functions are useful to speed up processing on supported CPU(s).

