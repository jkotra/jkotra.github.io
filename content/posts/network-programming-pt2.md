---
title: "Network Programming Pt 2 - TCP client"
description: "communicate with TCP servers and websites(HTTP)🌎"
date: 2020-08-31T01:49:14+05:30
tags: ["network programming", "c"]
draft: false
images:
 - https://i.imgur.com/8g8yX84.jpg
---

# Introduction

HTTP is powered by TCP, websites can be retrieved by communicating through TCP socket. this a code walkthrough of c program to retrieve `example.com`

# TCP client

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/tcp_client_classic.c).
{{% /notice %}}

![Flowchart](/images/tcp_client.png "TCP client flowchart")


```c
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

```

1. we start by declaring a `addrinfo` struct `hints`. we then call `getaddrinfo()`. `getaddrinfo()` resolves domain name into IP address.
2. note that unlike in server, we only need to set `hints.ai_socktype = SOCK_STREAM;` other fields are filled automatically by `getaddrinfo()` based on IP we are connecting to.

```c
    char peer_addr[100];
    char peer_protocol[100];
    getnameinfo(peer->ai_addr, peer->ai_addrlen, peer_addr, sizeof(peer_addr), peer_protocol, sizeof(peer_protocol), NI_NUMERICHOST);

    printf("ip: %s | protocol: %s\n", peer_addr, peer_protocol);

```

0. we can print the domain and protocol using the code above (Optional)


```c
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
```

1. we start by creating a socket using `peer` fields are arguments.
2. we then need to call `connect()` to connect to a remote address.`connect()` returns a negative number on error. 


```c
    char *header = "GET /index.html HTTP/1.1\r\nHost: www.example.com\r\n\r\n";
    send(socket_fd, header, strlen(header), 0);

    char res[4096];
    int bytes_received = recv(socket_fd, res, 4096, 0);
    printf("bytes_received: %d\n", bytes_received);

    printf("%s\n", res);

    close(socket_fd);
```

1. declare a string **header**, this needs to be sent to the server to get a response.
2. we can then call `recv()`, this stores response from the web server into `res`
3. the response is printed to `stdout` using `printf()`


# Let's test it out!

compile the program using `gcc`

`gcc tcp_client_classic.c -o tcp_client`

run the program with required args: `domain` and `protocol`

`./tcp_client example.com http`

Output:
```html

args: example.com http
ip: 93.184.216.34 | protocol: http
connected!
bytes_received: 1607
HTTP/1.1 200 OK
Accept-Ranges: bytes
Age: 505529
Cache-Control: max-age=604800
Content-Type: text/html; charset=UTF-8
Date: Wed, 02 Sep 2020 08:30:19 GMT
Etag: "3147526947"
Expires: Wed, 09 Sep 2020 08:30:19 GMT
Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
Server: ECS (nyb/1D10)
Vary: Accept-Encoding
X-Cache: HIT
Content-Length: 1256

<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        
    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 2em;
        background-color: #fdfdff;
        border-radius: 0.5em;
        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        div {
            margin: 0 auto;
            width: auto;
        }
    }
    </style>    
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>

```

# Conclusion

This article covered a code walkthrough on how to retrieve a web page using sockets.
