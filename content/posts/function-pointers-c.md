---
title: "Function Pointers in C"
date: 2020-07-24T19:00:12+05:30
description: "short note on function pointers and how to declare them. 🔨"
draft: false
---

# introduction

this is a short excerpt on function pointers in C.

## What is a pointer?

a `pointer` is a variable that holds a physical memory address of another variable. 

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{

    int a = 1337; //value
    int *b;       //declare a pointer

    b = &a; //b holds the addr to a;

    printf("addr: %d, val: %d\n", b, *b); //print addr and "a" value.

    return EXIT_SUCCESS;
}
```

**Output**:
```
addr: 1293474476, val: 1337
```



## What is a function pointer?

a `function pointer` points to a function. it can be called like any other function.

```c
#include <stdio.h>
#include <stdlib.h>


int add(int a, int b){
    return a+b;
}

int main(){


    int    (*funcPointerAdd)    (int, int) =       &add;
/*   ↓           ↓               ↓                  ↓
(return_type) (Function Name) (arg1) (arg2)  (assign to actual function addr.) 
*/


    int res = funcPointerAdd(5,8);

    printf("%d\n", res);

    return EXIT_SUCCESS;
}
```

---

## Function Pointer as a *type*


```c

#include <stdio.h>
#include <stdlib.h>

int add(int a, int b){
    return a+b;
}

    typedef int (*funcPointer_t)   (int, int);
/*   ↓       ↓            ↓            ↓      ↓
(typedef) (return_type) (type_name) (arg1) (arg2)  */


int main(){


    funcPointer_t x = &add;

    int res = x(15,51);

    printf("%d\n", res);

    return EXIT_SUCCESS;
}

```






