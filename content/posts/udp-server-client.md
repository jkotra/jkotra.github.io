---
title: "Communicating between server and client using UDP"
description: "Fire and Forget 🔫"
date: 2020-09-06T00:34:58+05:30
tags: ["network programming", "c"]
draft: false
images:
 - https://i.imgur.com/8g8yX84.jpg
---


# Introduction

This article provides a brief introduction to the UDP protocol, what makes it different from TCP. we further delve into how to set up a server and a client to communicate with each other using UDP protocol.


## Gentle introduction to UDP

> UDP (User Datagram Protocol) is a communications protocol that is primarily used for establishing low-latency and loss-tolerating connections between applications on the internet. It speeds up transmissions by enabling the transfer of data before an agreement is provided by the receiving party. As a result, UDP is beneficial in time-sensitive communications, including voice over Internet Protocol (VoIP), domain name system (DNS) lookup, and video or audio playback. UDP is an alternative to Transmission Control Protocol (TCP).

Source: [techtarget.com](https://searchnetworking.techtarget.com/definition/UDP-User-Datagram-Protocol)

<br>

<u>Salient features of UDP</u>:

* UDP is a called "connection-less" protocol. no prior handshake is required to send data.
* UDP has an infamous tagline "Fire and Forget", unlike in TCP, UDP does not bother to check if the packets reached the destination or not.
* UDP is the primary protocol for DNS resolution, most DNS servers support TCP as a fallback.
* UDP is fast compared to TCP, because of the low overhead.

# UDP Server

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/udp/udp_server_select.c).
{{% /notice %}}

```c
    struct addrinfo hints;
    memset(&hints, 0 , sizeof(hints));

    struct addrinfo *bind_addr;

    hints.ai_family = AF_INET; //ipv4
    hints.ai_socktype = SOCK_DGRAM; // UDP
    hints.ai_flags = AI_PASSIVE;

    getaddrinfo(0, "8080", &hints, &bind_addr);

```

1. we start by declaring `addrinfo` struct. we set the contents of `hints` to `0` using `memset()`
2. we need to set required fields in `hints`,

Notice the `hints.ai_socktype` is set to `SOCK_DGRAM`. this indicates that we want a UDP address. use `SOCK_STREAM` for TCP.

3. we then call `getaddrinfo()` with the required parameters. the result will be stored in `bind_addr` struct.

```c
    //bind it
    int socket_fd = socket(bind_addr->ai_family, bind_addr->ai_socktype, bind_addr->ai_protocol);
    printf("socket_fd: %d\n", socket_fd);

    if (socket_fd < 0){
        return 1;
    }

    if ( bind(socket_fd, bind_addr->ai_addr, bind_addr->ai_addrlen) < 0 ){
        return 1;
    }
    else{
        printf("UDP server listing on 127.0.0.1:8080\n");
    }
```

1. create a socket. it returns a negative number on failure.
2. we can then bind the address to the port, we do it by calling `bind()` with socket descriptor, address, and address length.

```c
    struct sockaddr_storage client_address;
    socklen_t client_len = sizeof(client_address);

    char read[1024];
    int bytes_received = recvfrom(socket_fd, read, 1024, 0, (struct sockaddr*)&client_address, &client_len);

    printf("%s\n", read);

    close(socket_fd);
```

1. declare `sockaddr_storage` struct. this is used to store the address of the client.
2. declare `client_len` of type `socklen_t`. this stores the length of the client address.
3. declare a char array of length `1024`.
4. we then call `recvfrom()`. this is where UDP defers from TCP in a major way. in UDP we do not need to call `accept()` or any other handshake procedure, the data can be directly sent to the client.

```c
int bytes_received = recvfrom(socket_fd, read, 1024, 0, (struct sockaddr*)&client_address, &client_len);
```

`socket_fd` - socket descriptor.

`read` - message buffer. the response will be stored here.

`1024` - length of `read`.

`0` - Flags.

`(struct sockaddr*)&client_address` - client address will be stored in this on connection.

`&client_len` - length of client address.

<br>

we finally close the socket after reading from the client using `close()`

---

# UDP Client

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/udp/udp_client.c).
{{% /notice %}}

```c
int main(int argc, char *argv[])
{

    if (argc < 3){
        printf("invalid no of args.\n");
        return 1;
    }

    struct addrinfo hints;

    memset(&hints, 0, sizeof(hints));

    struct addrinfo *peer;
    hints.ai_socktype = SOCK_DGRAM;

    printf("args: %s %s %s\n", argv[1], argv[2], argv[3]);

    if (getaddrinfo(argv[1], argv[2], &hints, &peer) < 0)
    {

        printf("addrinfo() error!\n");
        return 1;
    }

```

1. as always, we start by declaring `hints` and set required fields, in this case, we only need to set the required socket type i.e UDP `hints.ai_socktype = SOCK_DGRAM;`
2. we call `getaddrinfo()` with user arguments, example (*argv[1]* = `example.com` and *argv[2]* = `80` or `http`). result is stored in `peer` struct.

```c
    //create socket
    int socket_fd = socket(peer->ai_family, peer->ai_socktype, peer->ai_protocol);
    
    char msg[1024];
    strncpy(msg, argv[3], 1024);
    int bytes_sent = sendto(socket_fd, msg, strlen(msg), 0, peer->ai_addr, peer->ai_addrlen);

    printf("Sent %s (%d bytes)\n", msg, bytes_sent);

    close(socket_fd);
```

1. create a socket.
2. declare a char array of length `1024` `msg`.
3. copy user input into `msg`.
4. use `sendto()` to send data to the server. this works similar to `recvfrom()` and is the opposite of it.
5. finally close the socket using `close()`

--

## Let's chat!

compile both server and client using `GCC`

`gcc udp_server_select.c -o server`

`gcc udp_client.c -o client`

1. First, run the `server`

```bash
~/Documents/Projects/network_programming/udp(master*) » ./server                                              jojo@synk
socket_fd: 3
UDP server listing on 127.0.0.1:8080
```

2. once the server is up and running, we can test it out by sending messages from our `client`

```bash
./client 127.0.0.1 8080 hello
```

you should see `hello` printed to in server window.

![](https://i.imgur.com/DSN1YQa.gif "UDP Demo")

# Conclusion

this article demonstrates/code walkthrough on how to set up a server and client and communicate using UDP protocol. 
