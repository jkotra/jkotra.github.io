---
title: "Network programming Pt. 1 - TCP and Hello World!"
description: "📡 Introduction to TCP and basic 'Hello World!' web server!"
date: 2020-08-27T16:40:15+05:30
tags: ["network programming", "c"]
draft: false
images:
 - https://i.imgur.com/8g8yX84.jpg
---

# Introduction

a short introduction to [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) and code walkthrough of a simple TCP web server. 

## TCP protocol

The Transmission Control Protocol (TCP) is one of the main protocols of the Internet protocol suite. It originated in the initial network implementation in which it complemented the Internet Protocol (IP). Therefore, the entire suite is commonly referred to as TCP/IP. TCP provides reliable, ordered, and error-checked delivery of a stream of octets (bytes) between applications running on hosts communicating via an IP network. Major internet applications such as the World Wide Web, email, remote administration, and file transfer rely on TCP, which is part of the Transport Layer of the TCP/IP suite. SSL/TLS often runs on top of TCP.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)

{{% notice note %}}
TCP is a streaming protocol whereas UDP is a connectionless protocol.
{{% /notice %}}

## Code

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/hello.c).
{{% /notice %}}


# Walkthrough

we need a bunch of header files that contain different functions and structures that we need.

```c
#include <sys/types.h>
#include <sys/socket.h>

#include <netinet/in.h>

#include <netdb.h>

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>

#define MAX_BACKLOG 10
#define PORT "8080"
```

## Header Breakdown

| Header  | what for?  |
|---|---|
| [sys/types.h](https://pubs.opengroup.org/onlinepubs/007904975/basedefs/sys/types.h.html)  | system types. used in cpmbination with `sys/socket.h` for compatibily on all unix-like systems. |
| [sys/socket.h](https://pubs.opengroup.org/onlinepubs/007908799/xns/syssocket.h.html)  |  `socket(), bind(), connect(), accept(), send()` etc.. |
| [netinet/in.h](https://pubs.opengroup.org/onlinepubs/000095399/basedefs/netinet/in.h.html) | Internet address family - structures for `IPV4` `IPV6` etc. |
| [netdb.h](https://pubs.opengroup.org/onlinepubs/007908799/xns/netdb.h.html) | `getaddrinfo()` `getnameinfo()` etc.. |

---

![TCP server](/images/tcp_server.png "TCP server flowchart")


we start by calling `init_server()` function. this function will create a socket and bind it to a port.

`init_server` return's a socket descriptor (`> 0`) if the socket is created and the address is successfully binded.

```c

    int socketfd = init_server();

    if (socketfd < 0)
    {
        printf("cannot init_server()");
        return 1;
    }
```


this is our `init_server()` function.
```c
int init_server()
{

    struct addrinfo hints;
    struct addrinfo *bind_addr;

    memset(&hints, 0, sizeof(hints)); //zero out!

    hints.ai_family = AF_INET;       // we need ipv4
    hints.ai_socktype = SOCK_STREAM; // TCP
    hints.ai_flags = AI_PASSIVE;     // PASSIVE mode

    getaddrinfo(0, PORT, &hints, &bind_addr); //get local address from system.

    //init socket
    int socketfd = socket(bind_addr->ai_family, bind_addr->ai_socktype, bind_addr->ai_protocol);

    if (bind(socketfd, bind_addr->ai_addr, bind_addr->ai_addrlen) == -1)
    {
        return -1;
    }

    return socketfd;
}
```

1. we first start by declaring two structs of `addrinfo` - `hints` and `bind_addr`
2. we must zero out the struct struct `memset()`. this will remove any garbage data from it and set all friends to `0`.
3. set fields in `hints` struct. (refer to inline comments).

{{% notice tip %}}
we only need to set `hints.ai_socktype` in a **TCP client** scenario. more on that in later parts.
{{% /notice %}}


4. we then call `getaddrinfo()`. it's defined as:

```c
int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints,
                struct addrinfo **res);
```


set `NULL` as the first argument(*node*) indicating we need an address from system, 2nd arg. is our desired port, 3rd arg is `hints` struct passed as a ref, the result of this is stored in `bind_addr` struct that we defined above and passed as a ref as 4th arg.

5. we start a socket by passing the required parameters from `bind_addr` struct. it will return a negative number on failure. a positive number is returned on successful creation of socket, this number indicates the file descriptor associated with the socket.

6. we call `bind()`. this will bind the IP to port. `bind()` returns a negative number on failure.

7. finally we return the `socket_fd`


Back to `main()`
we then call `listen()` with two arguments, 1st arg is `socket_fd` and second one is `MAX_BACKLOG` - this is the maximum number of simultanious connection that our socket will accept before refusing.
```c
//start listining
    if (listen(socketfd, MAX_BACKLOG) >= 0)
    {
        printf("✅ server listining on 127.0.0.1:%s\n", PORT);
    }
    else
    {
        printf("❌ cannot listen()! %d \n", listen(socketfd, MAX_BACKLOG));
    }

```

we then call to `accept_and_send()` function with `socket_fd` as arg. this function will accept incoming connections (forwarded by `listen()`)

```c
    while (true)
    {
        accept_and_send(socketfd);
    }

    return 0;
```

`accept_and_send()` function:

```c
int accept_and_send(int socketfd)
{

    struct sockaddr_storage client_addr; //to store client addr
    socklen_t client_addr_len;           //length of client addr;

    int client = accept(socketfd, (struct sockaddr *)&client_addr, &client_addr_len);

    if (client == -1)
    {
        printf("cannot accept connection from client!\n");
        return -1;
    }

    char addr_buffer[100]; //empty buf. to store ip.

    getnameinfo((struct sockaddr *)&client_addr, client_addr_len, addr_buffer, sizeof(addr_buffer), 0, 0, NI_NUMERICHOST);

    printf("client IP: %s\n", addr_buffer);

    // HANDLE / READ REQ
    char request[1024];

    int bytes_received = recv(client, request, 1024, 0);

    //send response
    const char *response = "HTTP/1.1 200 OK\r\n"
                           "Connection: close\r\n"
                           "Content-Type: text/plain\r\n\r\n"
                           "Hello World from hello.c";

    int bytes_sent = send(client, response, strlen(response), 0);

    close(client);
}
```

1. we start the function by declaring two structs - `client_addr` and `client_addr_len`
`sockaddr_storage` stores the client address. `client_addr_len` stores lenth of client address.

2. we call `accept()`. this will accept the client connection and store the details in above-declared structs.it returns `-1` on failure. this returns a file descriptor for the accepted socket that we can use to send and receive data from the client.

optionally, we can get ip address of client using `getnameinfo()`. `getnameinfo()` is essentially inverse of `getaddrinfo()`.

4. TCP connection is initiated by receiving data from the client. this acts as a handshake between client and server.

5. we can then send data to the client, we use `send()`. to send data to the client.

6. close the connection by closing the client file descriptor.

{{% notice tip %}}
it's always a good practice to close socket at end of program.

`close(socket_fd)`
{{% /notice %}}


# Let's test it out!

compile the program using `gcc`

`gcc hello.c -o hello`

Run the program
```
~/Documents/Projects/network_programming » ./hello 
socketfd = 3
✅ server listining on 127.0.0.1:8080
```

open a browser and navigate to `http://127.0.0.1:8080/`

you should see a nice message from our webserver:

`Hello World from hello.c`

---

# Conclusion

My humble attempt to re-explain network programming concepts and code in C as I learn them myself, I hope this series helps in your learning and also serves as a note-keeping for me :blush: 

