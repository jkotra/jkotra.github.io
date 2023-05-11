---
title: "Python Decorators demystified"
description: "🤓 Finally decided to learn something I avoided for years!"
date: 2020-09-27T22:32:50+05:30
images:
 - /images/Lz9fDCK.jpg
draft: false
---

# Introduction

This is a short primer on [python decorators](https://python101.pythonlibrary.org/chapter25_decorators.html). I will show 2 examples and walk you through it.

# What are decorators?

As the name suggests, a decorator is a special type of function that decorates another function. Here, Decoration may mean extending functionality (or) preprocessing before passing it to the subject function. Using decorates is a nice abstraction that can be reused as needed.

---

## Example 1

```py
def upperalpha(func):
    def inner(s):
        s = s.upper()
        return func(s)
    return inner


@upperalpha
def proc(s):
    return s


print(proc("Hello World!"))
```

The above code contains two functions, `upperalpha` and `proc`. Our aim is to decorate `proc` with `upperalpha`.

we start by defining `upperalpha` which takes a function(`func`). we then define an inner function (`inner`). Note that `inner` takes the same argument as `proc`. `inner` contains the statements to *decorate* the function. `.upper()` is called on the string and passed on to `func`(which simply returns whatever it received). Finally, `inner` function is returned.

in python, function(s) can be decorated using `@DEC` syntax where `DEC` is the name of the decorator.

we finally run the `proc` with `Hello World`. the output will in capital letter because our decorator calls `.upper()` on our input.

# Example 2

```py
def init_mul(func):
    def inner(n):
        n = n * 100
        return func(n)
    
    return inner

@init_mul
def proc(n):
    print("I received", n)
    return n+1


print(proc(1))
```

Let's assume we want to multiply the input by a number before passing on to the function, while you can do this directly on a single function it's not ideal to keep repeating `n += n*100` everywhere. This is where `init_mul` decorator comes in handy, just decorate the required function with `@init_mul` and it will take care of the multiplication requirement.

Output:
```
I received 100
101
```

`1` get's multiplied by `100` in the decorator and the original function is called on modified `n` value.
