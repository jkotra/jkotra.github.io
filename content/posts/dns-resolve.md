---
title: "DNS resolution in C"
description: "Domain to IP resolution using getnameinfo()🌐"
date: 2020-09-08T01:20:42+05:30
tags: ["network programming", "c"]
draft: false
images:
 - /images/8g8yX84.jpg
---

# Introduction

DNS resolution is the process of converting Domain name (example.com) into an IP address, Reverse DNS is the opposite of it, IP -> Domain

this article is a code walkthrough of a simple C program to resolve domain names into their respective IP address(s).

# Code

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/dns/lookup.c).
{{% /notice %}}

```c
#include <stdio.h>
#include <string.h>
#include<netdb.h>

int main(int argc, char *argv[]){

    printf("resolving host: %s\n", argv[1]);

    struct addrinfo hints;
    memset(&hints, 0, sizeof(hints));

    hints.ai_flags = AI_ALL;

    struct addrinfo *peer;

    if ( getaddrinfo(argv[1], 0, &hints, &peer) != 0 ){
        printf("getaddrinfo error!\n");
        return 1;
    }

    struct addrinfo *address = peer;

    do
    {
        char addr_buf[100];

        getnameinfo(address->ai_addr, address->ai_addrlen, addr_buf, sizeof(addr_buf),
                                    0, 0, NI_NUMERICHOST);

        printf("%s\n", addr_buf);
    } while ((address = address->ai_next));
    
    return 0;
}
```

## explanation

1. we start by first printing arguments to screen, the program expects two arguments, a domain name and a port/protocol.

2. a struct of `addrinfo` is declared `hints`. this struct fields need to be set as per our requirement. in the next line, we set `hints.ai_flags = AI_ALL;`. this means that we want bot IPV4 and IPV6 addresses. the result will be in the form of a linked list that can be iterated.

3. we then declare another `addrinfo` struct called `peer`. this holds the results of `getnameinfo()`

### `getnameinfo()`

```c

       int getnameinfo(const struct sockaddr *addr, socklen_t addrlen,
                       char *host, socklen_t hostlen,
                       char *serv, socklen_t servlen, int flags);

```

---

4. the address(s) will be stored in a linked, there can be iterated using `do while` loop as shown above in code.

# Output

compile the program using `gcc`

`gcc lookup.c -o lookup`

run the program:
```
~/Documents/Projects/network_programming/dns(master*) » ./lookup example.com http                              jojo@synk
resolving host: example.com
93.184.216.34
93.184.216.34
93.184.216.34
2606:2800:220:1:248:1893:25c8:1946
2606:2800:220:1:248:1893:25c8:1946
2606:2800:220:1:248:1893:25c8:1946
```


{{% notice tip %}}
the above output contains multiple duplicates, this can be fixed by adding another field to `hints`

```c
hints.ai_socktype = SOCK_STREAM;
```
{{% /notice %}}


---

# Conclusion

* resolving domain names to IP address.
* usage of `getnameinfo()`
