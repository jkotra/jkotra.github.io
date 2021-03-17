---
title: "Algoticks v2.0 - improving memory efficiency."
date: 2021-03-17T23:06:47Z
description: Changelog of algoticks v2.0
tags: ["C", "algoticks"]
images:
  - https://i.imgur.com/2EVP0SE.gif
draft: false
---

[Github](https://github.com/jkotra/algoticks)

---

it's been in my mind for a few months, but I always said "*it's just a few megabytes pff*.  :expressionless:" and kept on postponing it. one fine day, I started branch `2.0` and finally started to refactor my code, most of it is converting stack allocation to heap allocation.

# What changed?


to start with, most of the memory is now allocated on the heap rather than the stack. this has some performance gains but not much compared to humongous memory savings compared to the previous version(s). *algoticks v2.0* uses less than **110%** less memory.


some other significant changes were:

* sending callbacks is now much simplified.
* JSON parsing code has been moved to src/parser.c.
* a bug with `sync_curr` has been fixed. presence of this bug might have produced false results with derivative + benchmark mode.
* string length restrictions are virtually gone, the length is calculated at runtime, and memory allocated appropriately
* memory-efficient *==* embedded friendly (more on that later!)
