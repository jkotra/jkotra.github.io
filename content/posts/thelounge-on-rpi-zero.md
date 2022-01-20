---
title: "Install thelounge on Raspberry Pi Zero"
date: 2022-01-16T19:20:12+05:30
draft: false
description: "self-host IRC client on your rpi and stay connected 🌏"
tags: ["tutorial"]
images:
 - /images/thelounge.png
---

![](/images/thelounge.png "thelounge running on my Raspberry Pi Zero W")

# Introduction

This is a short tutorial to install [thelounge](https://thelounge.chat/) on [Raspberry Pi Zero / W](https://www.raspberrypi.com/products/raspberry-pi-zero-w/). I assume you have already set up your rpi and connected to the internet.

# 1. Installing dependencies

[thelounge](https://thelounge.chat/) depends on `nodejs` LTS or greater. current `nodejs` LTS version is 17.x (as of writing this article) but only 12.x is available in raspbian OS repository. even though, nodejs discontinued *official* support for `armv6`, we can still get precompiled binaries from [unoffical builds](https://unofficial-builds.nodejs.org/). just don't expect any kind of support if you run into any problems 😑️

1. [Download](https://unofficial-builds.nodejs.org/download/release/v17.4.0/) *nodejs* LTS for armv6.

```sh
wget https://unofficial-builds.nodejs.org/download/release/v17.4.0/node-v17.4.0-linux-armv6l.tar.gz
```

2. extract the downloaded file.
```sh
tar -xvf node-v17.4.0-linux-armv6l.tar.gz
```

3. install
```sh
cd node-v17.4.0-linux-armv6l
sudo cp * -R /usr
```

4. confirm by checking version
```sh
node -v
```

# 2. Install yarn

`nodejs` is prepackaged with `npm` package manager. we can use `npm` to install `yarn` which is recommended to use with `thelounge`[^1]

```sh
sudo npm install yarn --global
```

# 3. install thelounge

{{% notice tip %}}
I recommend setting a static IP to your rpi. this makes it easier to access services hosted on our pi with a single memorable address (usually *192.168.x.x*)

[How Do I Set a Static IP Address on Raspberry Pi?](https://www.makeuseof.com/raspberry-pi-set-static-ip/)
{{% /notice %}}

1. get latest .deb from [github release page](https://github.com/thelounge/thelounge/releases).

2. as we installed `nodejs` from an unofficial source (and not through `apt` package manager), it will not satisfy the `nodejs` requirement of `.deb` file. we can skip dependency checks in two ways.
* force `dpkg`
    * `dpkg --force-all -i thelounge.deb`

*(OR)*

* edit `.deb` dependencies
    * [How To: Change .deb Package Dependencies](https://forums.linuxmint.com/viewtopic.php?t=35136)
    

3. add (default) user to `thelounge`
```sh
sudo thelounge add ircuser
```

it will prompt for a password, choose any password. you can then head to `http://192.168.x.x:9000` and log in.


# Conclusion
A suggestion in good faith: don't buy `armv6` boards. they are already obsolete and as time goes on, compatible software will be hard t come by.


[^1]: [thelounge documentation](https://thelounge.chat/docs/install-and-upgrade#debian-and-ubuntu-based-distributions)
