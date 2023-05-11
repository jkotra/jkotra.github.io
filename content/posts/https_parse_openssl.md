---
title: "Parse HTTPS website(s) in C with OpenSSL"
description: "Integrate TLS with TCP to securely communicate 🔒" 
date: 2020-09-20T20:07:40+05:30
tags: ["network programming", "c"]
images:
 - /images/YGtDgXv.png
draft: false
---

# Introduction

In this article, I will explain how to parse a website that uses  `HTTPS`. in the process, one must get a grip on OpenSSL and integrating it with TCP (TLS) to retrieve content.

# OpenSSL

> OpenSSL is a software library for applications that secure communications over computer networks against eavesdropping or need to identify the party at the other end. It is widely used by Internet servers, including the majority of HTTPS websites.

[Source](https://en.wikipedia.org/wiki/OpenSSL)

## Parsing from `HTTPS` website


{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/tls/get_https_webpage.c).
{{% /notice %}}

### TLS

> Transport Layer Security, and its now-deprecated predecessor, Secure Sockets Layer, are cryptographic protocols designed to provide communications security over a computer network. Several versions of the protocols find widespread use in applications such as web browsing, email, instant messaging, and voice over IP.

[Source](https://en.wikipedia.org/wiki/Transport_Layer_Security)

### Walkthrough

```c
#include <openssl/x509.h>
#include <openssl/crypto.h>
#include <openssl/pem.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/evp.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>
#include <netdb.h>

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>
#include <errno.h>
```

We start by importing the required headers. Notice the OpenSSL headers, these contain essential functions to communicate securely with the website.

```c
int main(int argc, char *argv[])
{

    // ssl initialization.
    SSL_library_init();
    OpenSSL_add_all_algorithms();
```

`main()` function takes two arguments, a domain name/ IP and a port/protocol. SSL port is `443`. we can also use `https`(which defaults to `443`) as the port. `getaddrinfo()` will understand it either way.

we need to initialize two functions, `SSL_library_init()` will set up the environment to use other functions of OpenSSL. `OpenSSL_add_all_algorithms()` will load required algorithms to encrypt, decrypt data and negotiate cipher with server.


```c
    //init context
    SSL_CTX *ctx = SSL_CTX_new(TLS_client_method());
    if (!ctx)
    {
        printf("cannot create SSL context!\n");
        return 1;
    }
```

we then need to initialize a context using `SSL_CTX_new()`. we pass a inbuilt constructor, `TLS_client_method()` indicating that we expect a client functionality.

{{% notice info %}}
`TLS_method(), TLS_server_method(), TLS_client_method()`

These are the general-purpose version-flexible SSL/TLS methods. The actual protocol version used will be negotiated to the highest version mutually supported by the client and the server. The supported protocols are SSLv3, TLSv1, TLSv1.1 and TLSv1.2. Applications should use these methods, and avoid the version-specific methods described below.

[Source](https://www.openssl.org/docs/man1.1.0/man3/TLS_client_method.html)
{{% /notice %}} 


```c
    /* code taken from tcp_client_classic.c */
    struct addrinfo hints;

    memset(&hints, 0, sizeof(hints));

    struct addrinfo *peer;
    hints.ai_socktype = SOCK_STREAM;

    printf("args: %s %s\n", argv[1], argv[2]);

    if (getaddrinfo(argv[1], argv[2], &hints, &peer) < 0)
    {

        printf("addrinfo() error!\n");
        return 1;
    }

    char peer_addr[100];
    char peer_protocol[100];
    getnameinfo(peer->ai_addr, peer->ai_addrlen, peer_addr, sizeof(peer_addr), peer_protocol, sizeof(peer_protocol), NI_NUMERICHOST);

    printf("ip: %s | protocol: %s\n", peer_addr, peer_protocol);

    //family socket_type protocol
    int socket_fd = socket(peer->ai_family, peer->ai_socktype, peer->ai_protocol);

    if (socket_fd < 0)
    {
        printf("socket error.\n");
        return 1;
    }

    if (connect(socket_fd, peer->ai_addr, peer->ai_addrlen) < 0)
    {
        printf("connect error.\n");
        return 1;
    }

    printf("connected!\n");

    /* END */
```

The above code is directly taken from `tcp_client_classic.c` which is explained in [this article](/posts/network-programming-pt2/).

this essentially initiates a connection with the server, involving address resolution, socket creation, and `connect()`

```c
    SSL *ssl = SSL_new(ctx);
    if (!ctx)
    {
        fprintf(stderr, "SSL_new() failed.\n");
        return 1;
    }
```

next, we create an `SSL` pointer for peer(server). this will be used to communicate with the server replacing a `socket_fd`.

```c
    if (!SSL_set_tlsext_host_name(ssl, argv[1]))
    {
        fprintf(stderr, "SSL_set_tlsext_host_name() failed.\n");

        return 1;
    }
```

The above code will ask the server to send details only related to the required website/Hostname. This is a necessary step if multiple sites are hosted under 1(single) IP. The server will then send a certificate pertaining to the hostname provided. it's up to us(client) to validate the details.

Usually, a self-signed certificate cannot be trusted, every OS comes with a set of trusted CA(certificate authorities) that are to be trusted. the client also must verify that the certificate is valid and not expired or yet-to-be issued.

(certificate validation is not covered in this article)

```c
    SSL_set_fd(ssl, socket_fd);
    if (SSL_connect(ssl) == -1)
    {
        fprintf(stderr, "SSL_connect() failed.\n");
        return 1;
    }
```

In the above step, we connect our TCP socket to `SSL` using `SSL_set_fd`. from this point onwards (after `SSL_connect()`) we can communicate securely.

`ssl_connect()` negotiates the best possible and mutually accepted cipher to decrypt and encrypt.it returns `-1` on error.


```c
printf("SSL/TLS using %s\n", SSL_get_cipher(ssl));
```

(Optional) print the cipher being used using `SSL_get_cipher()`


```c
char buffer[2048];

    sprintf(buffer, "GET / HTTP/1.1\r\n");
    sprintf(buffer + strlen(buffer), "Host: %s:%s\r\n", argv[1], argv[2]);
    sprintf(buffer + strlen(buffer), "Connection: close\r\n");
    sprintf(buffer + strlen(buffer), "User-Agent: https_simple\r\n");
    sprintf(buffer + strlen(buffer), "\r\n");

    SSL_write(ssl, buffer, strlen(buffer));
    printf("Sent Headers:\n%s", buffer);

    int bytes_received = SSL_read(ssl, buffer, sizeof(buffer));
    if (bytes_received < 1)
    {
        printf("\nConnection closed by peer.\n");
    }

    printf("Received (%d bytes): '%.*s'\n", bytes_received, bytes_received, buffer);
```

The above code[^credits] declares a buffer. the buffer is filled with requred HTTP headers to make a request. `send()` is replaced by `SSL_write()` and `recv()` is replaced by `SSL_read()`.

the response is then stored into the `buffer`. the response is printed onto the screen.


```c
    // shutdown ssl connection and free() ctx. 
    SSL_shutdown(ssl);
    SSL_free(ssl);
    SSL_CTX_free(ctx);
    
    // close socket
    close(socket_fd);

    return 0;
}
```

Finally, we must clean up pointers n stuff, starting with OpenSSL. shutdown the current SSL connection using `SSL_shutdown()`, then free it from memory i.e `SSL_free(ssl)`. SSL context that is used to create SSL should be free'd (since we are exiting the application, keep it around if you don't). Finally, as always, close the socket using `close()`

### Output

compile the program with GCC (remember to link with openSSL library)

`gcc get_https_webpage.c -lcrypto -lssl`

Run the program:
```
~/Documents/Projects/network_programming/tls(master) » ./a.out example.org 443                                            jojo@synk
args: example.org 443
ip: 93.184.216.34 | protocol: https
connected!
SSL/TLS using TLS_AES_256_GCM_SHA384
Sent Headers:
GET / HTTP/1.1
Host: example.org:443
Connection: close
User-Agent: https_simple

Received (370 bytes): 'HTTP/1.1 200 OK
Accept-Ranges: bytes
Age: 361373
Cache-Control: max-age=604800
Content-Type: text/html; charset=UTF-8
Date: Mon, 21 Sep 2020 18:13:25 GMT
Etag: "3147526947"
Expires: Mon, 28 Sep 2020 18:13:25 GMT
Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
Server: ECS (nyb/1D1B)
Vary: Accept-Encoding
X-Cache: HIT
Content-Length: 1256
Connection: close

'

```

Note, the response is only partial. `SSL_read()` must be run in a loop to receive until end.

[^credits]: Code was taken from [Hands-On Network Programming with C Code Repo](https://github.com/codeplea/Hands-On-Network-Programming-with-C/blob/master/chap09/https_get.c)



