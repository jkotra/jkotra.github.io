---
title: "mmap - one-liner to read file to string"
description: use mmap to read files to a string in single line 🛠️.
date: 2022-02-22T01:39:15+05:30
images:
 - /images/w9X5biT.png
draft: false
---

# Introduction

`mmap` stands for memory map. the declaration[^1] is given below:

```c
       #include <sys/mman.h>

       void *mmap(void *addr, size_t length, int prot, int flags,
                  int fd, off_t offset);
       int munmap(void *addr, size_t length);
```

* My article is partly inspired by [Jacob Sorber's](https://www.youtube.com/channel/UCwd5VFu4KoJNjkWJZMFJGHQ) [How to Map Files into Memory in C (mmap, memory mapped file io)](https://www.youtube.com/watch?v=m7E9piHcfr4)

---

# mmap vs. other ways

there are several ways to read files in C, none you could do without several line of code and iteration. the quickest approach would be `fgets()` within a loop. `mmap` offers a simple one-liner. recently I've been working with OpenCL, which is known for its unconventional practice to load kernel as a string and compile and run it during runtime.

![](https://media.giphy.com/media/sEJ2j80ZmgXPOlEYEt/giphy.gif)

---

## reading file to string with mmap

we need to know the exact size of the file we are going to read. we can do that with `stat`

```c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>
#include <sys/stat.h>

int k_fd = open("kernel.cl", O_RDONLY);
struct stat s;
fstat(k_fd, &s);
printf("%d\n", s.st_size);
```

then we need to allocate memory and call `mmap`.

```c
char *kernelSource = (char *)malloc(s.st_size * sizeof(char));
kernelSource = (char *)mmap(0, s.st_size, PROT_READ, MAP_PRIVATE, k_fd, 0);
```

`mmap` returns a void pointer, it's necessary to cast it to a `char *`.

---

# Conclusion.

It looks better and feels good (at least to me :wink:) than other ways of reading files. sharing this short example with others who might be looking for it.


[^1]: https://man7.org/linux/man-pages/man2/mmap.2.html 