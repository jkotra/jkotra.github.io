---
title: "D-Bus - IPC on Linux"
date: 2024-08-02T04:21:56+05:30
description: Write an IceCream Truck 🍨 IPC service in Rust. 
images:
 - /images/icecream-dbus.webp
draft: false
tags: ["dbus"]
---

![IceCream Truck](/images/icecream-dbus.webp "DALL-E rendition of a icecream truck.")

# Introduction

> D-Bus is a message bus system, a simple way for applications to talk to one another. In addition to interprocess communication, D-Bus helps coordinate process lifecycle; it makes it simple and reliable to code a "single instance" application or daemon, and to launch applications and daemons on demand when their services are needed.

> D-Bus supplies both a system daemon (for events such as "new hardware device added" or "printer queue changed") and a per-user-login-session daemon (for general IPC needs among user applications). Also, the message bus is built on top of a general one-to-one message passing framework, which can be used by any two apps to communicate directly (without going through the message bus daemon). 
>
> -- *What is D-Bus?* [freedesktop.org](https://www.freedesktop.org/wiki/Software/dbus/)

Are you looking for a IPC framework for your Linux application that integrates well with existing desktops? look no further, **D-Bus** is an IPC mechanism available by default on all major Linux systems. In my opinion, D-Bus is an option for you if you need a better DX than sockets but do not need the throughput it provides. D-Bus is the perfect option if you are developing an application that needs to integrate with other Linux services tightly.

## 🚌 📢 - All abord the bus!

There are 2 busses available:

**System Bus** - is started when the system first boots up. essential services required for critical functionality are started on the system bus. (eg: *systemd*, *bluetooth*)

**Session Bus** - is started upon user login. services that are specific to the user (and work in tandem with system bus) are started on the session bus. (eg: *DLNA*, *time services*)

# Building an IceCream Truck IPC Service

I want to demonstrate how D-Bus works with an example of the IceCream Truck Application. Our application is a daemon that starts on the session bus. a user will be able to place an order and any application can listen to the signal and be aware of the flow of orders.

## Prerequisites
* Rust - we will be using `zbus` library for this.
* `busctl` - to monitor messages on the bus.

## zbus
`zbus` is D-Bus implementation written in Rust.
[Know More](https://github.com/dbus2/zbus)

## Let's Code an IceCream Truck 🍦

[Code available on Github.](https://github.com/jkotra/icecream-dbus)

let's start by defining the required structs and enums:

```rs
use serde::{Deserialize, Serialize};
use std::future::pending;
use std::str::FromStr;
use strum_macros::{Display, EnumString};
use zbus::{connection, fdo, interface, SignalContext};

#[derive(Debug, Serialize, Deserialize, EnumString, Display, zbus::zvariant::Type)]
enum IceCreamFalvour {
 Chocolate,
 Vanilla,
}

#[derive(Debug, Serialize, Deserialize, zbus::zvariant::Type)]
struct IceCreamReply {
 flavor: IceCreamFalvour,
 quantity: u32,
 total: f32,
}

#[allow(dead_code)]
struct IceCreamTruck {
 name: String,
}
```

* `IceCreamFalvour` is an enum which declares the flavors we intend to sell. this will be used for input validation later on.
*  `IceCreamReply` is the struct we want to send to the user upon a successful call to the method.
* `IceCreamTruck` is the base struct, we extend this with `zbus` macros to define the interface's methods and signals.

---

Let's define our method on `top.stdin.icecream` interface to buy an ice cream and a signal that will send out order details to all subscribers.

```rs
#[interface(name = "top.stdin.icecream")]
impl IceCreamTruck {
    async fn buy_icecream(
        &self,
 flavor: &str,
 quantity: u32,
 #[zbus(signal_context)] ctx: SignalContext<'_>,
 ) -> fdo::Result<IceCreamReply> {
        let flavor = match IceCreamFalvour::from_str(flavor) {
 Ok(v) => v,
 Err(err) => return Err(fdo::Error::Failed(format!("{:?}", err))),
 };

        println!(
            "received order: flavor = {} quantity = {}",
 flavor, quantity
 );
        let details = IceCreamReply {
 flavor,
 quantity,
 total: 6.99 * quantity as f32,
 };
 Self::orders(&ctx, &details).await.unwrap();
 Ok(details)
 }

 #[zbus(signal)]
    async fn orders(ctxt: &SignalContext<'_>, details: &IceCreamReply) -> zbus::Result<()>;
}
```

1. we start by adding methods to `IceCreamTruck` struct we defined earlier. we also add a macro, `interface` from zbus with our intended interface name.
2. define a method `buy_icecream` which takes in the following args:
    * `flavor` - This string should match a value in `IceCreamFalvour` enum.
    * `quantity`
    * `ctx` - this is a special argument from zbus with a static lifetime. we used this as a parameter to emit the signal.
3. validate and convert the input string to `IceCreamFalvour` enum value.
4. print the order to the console.
5. emit the signal to `orders` - which takes in the signal context (`ctx`) and `IceCreamReply` struct.

---

To start the service, put the following in `main`:

```rs
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let truck = IceCreamTruck {
 name: "JK".to_string(),
 };
    let _conn = connection::Builder::session()?
        .name("top.stdin.icecream")?
        .serve_at("/top/stdin/IceCreamTruck", truck)?
        .build()
        .await;

    pending::<()>().await;
 Ok(())
}
```

1. initialize our struct with `name` parameter.
2. using `connection::Builder` from `zbus`, we start on the session bus with the following details:
    * name = `top.stdin.icecream`
    * interface = `/top/stdin/IceCreamTruck`
3. `pending` will put our application into an async loop until exit.

{{% notice note %}}
**What is an interface in dbus?**

*An interface defines the API exposed by object on the bus. They are akin to the concept of interfaces in many programming languages and traits in Rust. Each object can (and typically do) provide multiple interfaces at the same time. A D-Bus interface can have methods, properties and signals.*

*While each interface of a service is identified by a unique name, its API is described by an XML description. It is mostly a machine-level detail. Most services can be queried for this description through a D-Bus standard introspection interface.*

Source: [zbus Docs - Interfaces](https://dbus2.github.io/zbus/concepts.html#interfaces)
{{% /notice %}}

## Testing

we can use `D-Spy` application [^1] to call our interface's method.

![](/images/d-spy.png)

you can try invoking the `BuyIcecream` method with parameters: `("Chocolate", 1)`. You will receive a reply with enum of `Chocolate` and a total order value.

you can also listen to all the signal emitted by our interface by running the following command:
```sh
busctl --user monitor --match 'sender=top.stdin.icecream'
```

![](/images/dbus-signal.png)

# Conclusion

I hope this article provided you with an intro to D-Bus and how you could write your service. For more reading on D-Bus and `zbus` you can refer to their official [docs/book](https://dbus2.github.io/zbus/introduction.html).

[^1]: https://flathub.org/apps/org.gnome.dspy