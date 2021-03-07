---
title: "Sending mail using SMTP protocol"
description: "Communicate with an SMTP server to send emails 📧"
date: 2020-09-17T00:47:17+05:30
tags: ["network programming", "c"]
draft: false
images:
 - https://i.imgur.com/PHC1msC.jpg
---

# Introduction

This article introduces the SMTP protocol and associated code and jargon. Next, we make a quick walkthrough of code to send mail to the smtp server.

## SMTP commands.

[Read Here](https://users.cs.cf.ac.uk/Dave.Marshall/PERL/node175.html)

### Flow

```
(ON CONNECT) (expect 220)
HELO BOOMER (expect 250)
MAIL FROM (expect 250)
RCPT TO (expect 250)
DATA (expect 354)
(ON END OF EMAIL BODY) (expect 250)
QUIT (expect 221)
```

---

{{% notice note %}}
the code explained here can be found in my [NetworkProgramming GitHub repository](https://github.com/jkotra/NetworkProgramming/blob/master/smtp/sendmail.c).
{{% /notice %}}


# Sending mail

we start by importing required headers.
```c
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/select.h>

#include <netinet/in.h>

#include <netdb.h>

#include <ctype.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>
#include <stdlib.h>
#include <errno.h>
```

SMTP server address and port are `#define`ed at start for ease of use later on.
```c
#define SMTPSERVER "gmail-smtp-in.l.google.com"
#define SMTPPORT "25"
```

there are 3 functions in this program:
```
void parse_code(char *server_response, char *resp);
int wait_for_response(int socket_fd, char *code);
int send_response(int socket_fd, char *request);
```

### Parsing code from a string

code parsing from the string is handled by `parse_code` function.

```c
void parse_code(char *server_response, char *resp)
{

    for (int i = 2; i < strlen(server_response); i++)
    {
        if (isdigit(server_response[i]) && isdigit(server_response[i - 1]) && isdigit(server_response[i - 1]))
        {
            resp[0] = server_response[i - 2];
            resp[1] = server_response[i - 1];
            resp[2] = server_response[i];

            break;
        }
    }
}
```

The above function takes two parameters `char *server_response, char *resp`. the result if found will be stored in `resp`.


# Sending and Receiving

Sending and Receiving from the server is handled by two functions - `wait_for_response` and `send_response` respectively.

```c
int wait_for_response(int socket_fd, char *code)
{

    char response[1024];
    char code_resp[4];

    int recv_bytes = recv(socket_fd, response, 1024, 0);
    printf("Server: %s\n", response);

    parse_code(response, code_resp);

    if (strcmp(code_resp, code) == 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

int send_response(int socket_fd, char *request)
{


    printf("Client: %s\n");
    int sent_bytes = send(socket_fd, request, strlen(request), 0);

}
```

---

## `main()`

we start the main function by initiating a socket.

```c
   struct addrinfo hints;
    memset(&hints, 0, sizeof(hints));
    hints.ai_socktype = SOCK_STREAM;
    struct addrinfo *peer_address;
    if (getaddrinfo(SMTPSERVER, SMTPPORT, &hints, &peer_address))
    {
        fprintf(stderr, "getaddrinfo() failed.\n");
        exit(1);
    }


    printf("Creating socket...\n");
    int server;
    server = socket(peer_address->ai_family,
                    peer_address->ai_socktype, peer_address->ai_protocol);

    printf("Connecting...\n");
    if (connect(server,
                peer_address->ai_addr, peer_address->ai_addrlen))
    {
        fprintf(stderr, "connect() failed.\n");
        exit(1);
    }

    freeaddrinfo(peer_address);

    printf("Connected!\n");
    
```

The above code takes care of address resolution and other things, for a detailed explanation see my posts with `network programming` tag.

```c
    if (!wait_for_response(server, "220")){
        printf("unexpected response\n");
        exit(1);
    }
```

on connection with SMTP server, we expect a welcome message with code `220`. The program will exit if the code is mismatched.

Example response from SMTP server:

`Server: 220 mx.google.com ESMTP s28si3735353pgn.104 - gsmtp`


```c
    send_response(server, "HELO BOOMER\r\n");
    if (!wait_for_response(server, "250")){
        printf("unexpected response\n");
        exit(1);
    }
```

Next, we need to identify ourself to the server, this can be done by a messagein the format of `HELO [YOURNAME]`

The SMTP server will greet us with code `250` followed by a vendor-specific human greeting.


```c

    send_response(server, "MAIL FROM:<hekko@xyz.com>\r\n");

    if (!wait_for_response(server, "250")){
        printf("unexpected response\n");
        exit(1);
    }
    
    send_response(server, "RCPT TO:<testing@gmail.com>\r\n");

    if (!wait_for_response(server, "250")){
        printf("unexpected response\n");
        exit(1);
    }
```

We then send the details about our ourself and the recipient. we expect a `250` response from the server.

```c
    send_response(server, "DATA\r\n");

    if (!wait_for_response(server, "354")){
        printf("unexpected response\n");
        exit(1);
    }
```

We tell the server that we are going to send email data from the next message onwards by sending it a single word `DATA\r\n`. we expect the `354` code in response, this indicates the server is ready to receive data.

```c
    send_response(server, "From:<hekko@xyz.com>\r\n");
    send_response(server, "To:<hello@gmail.com>\r\n");
    send_response(server, "Subject:SMTP TEST\r\n");
```

the above code will the required details in the body to the server, note that all of these can be sent in one message (headers and body) subject to server acceptance.

```c
    time_t timer;
    time(&timer);

    struct tm *timeinfo;
    timeinfo = gmtime(&timer);

    char date[128];
    strftime(date, 128, "%a, %d %b %Y %H:%M:%S +0000", timeinfo);
    sprintf(date, "Date:%s\r\n", date);
    
    send_response(server, date);
    send_response(server, "\r\n");
```

our message must include a timestamp. we generate a timestamp to include in our email using `strftime()`.

```c
    char helloworld_body[128] = "Hello World.\r\n.\r\n";

    send_response(server, helloworld_body);

    if (!wait_for_response(server, "250")){
        printf("unexpected response\n");
        exit(1);
    }
```

This the body of our mail, write your heart's content here :smile: a simple `.` separated by `\r\n` will indicate that message is over.the server should return  `250` code.

```c
    if (!wait_for_response(server, "221")){
        printf("unexpected response\n");
        exit(1);
    }


    close(server);
```

Finally, we send `QUIT\r\n` to the SMTP server. this formally completes our communication with the server. we then close the socket (`server`)


Congratulation, If everything works correctly, you should be able to send email using just C code.

{{% notice warning %}}
Most residential IP's are blocked to send an email. GMAIL does not allow it's SMTP servers to be used by individuals, the email we try to send is rejected by google for obvious reasons. See output below.
{{% /notice %}}


Output:
```bash
Creating socket...
Connecting...
Connected!
Server: 220 mx.google.com ESMTP s28si3735353pgn.104 - gsmtp

Client: HELO BOOMER

Server: 250 mx.google.com at your service

Client: MAIL FROM:<hekko@xyz.com>

Server: 250 2.1.0 OK s28si3735353pgn.104 - gsmtp
�-�
Client: RCPT TO:<00.xog.00@gmail.com>

Server: 250 2.1.5 OK s28si3735353pgn.104 - gsmtp
�-�
Client: DATA

Server: 354  Go ahead s28si3735353pgn.104 - gsmtp
-�
Client: From:<hekko@xyz.com>

Client: To:<hello@gmail.com>

Client: Subject:SMTP TEST

Client: Date:Date:17 Sep 2020 09:31:23 +0000

Client: 

Client: Hello World.
.

Server: 421-4.7.0 [223.230.89.223      15] Our system has detected that this message is
421-4.7.0 suspicious due to the very low reputation of the sending IP address.
421-4.7.0 To protect our users from spam, mail sent from your IP address has
421-4.7.0 been temporarily rate limited. Please visit
421 4.7.0  https://support.google.com/mail/answer/188131 for more information. s28si3735353pgn.104 - gsmtp

unexpected response
```

---

# Conclusion

This is a very basic example of SMTP protocol which is a de facto way to send emails to each other.

I hope you learned something in this article. A working production SMTP client would generally look like this albeit with extra nuts and bolts to handle additional security and authorization.
