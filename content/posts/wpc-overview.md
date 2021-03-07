---
title: "Overview of WPC: Writing a wallpaper changer in Rust"
date: 2020-03-13T10:30:06+05:30
draft: false
description: Description and Design Overview of WPC - Wallpaper Changer
tags: ["Rust"]
images:
  - images/wpc_featured.jpg
---
[![Build Status](https://travis-ci.org/jkotra/wpc.svg?branch=master)](https://travis-ci.org/jkotra/wpc)![](https://img.shields.io/github/languages/code-size/jkotra/wpc)

WPC stands for **W**all **P**aper **C**hanger

[Github](https://github.com/jkotra/wpc)

---

## Changelog

### (09-07-2020)
- [WPC v0.5](https://github.com/jkotra/wpc/releases/tag/0.5) is a major release.  `main.rs` is mostly rewritten.

### (14-01-2021)
{{% notice warning %}}
`WPC` gained partial `async` support from `0.7` and almost full `async` (except for `wallhaven_api`) from `1.0` on wards. **some parts of this article may not be relevant anymore**, but may still be useful. I've written a short ["What changed in 1.0? a lot!"](/posts/what-changed-in-wpc-1.0-a-lot/) to provide a general change log and overview of the project.

- [this tag](https://github.com/jkotra/wpc/tree/0.1.4) might be the last tree where this article is 100% relevant.
{{% /notice %}}

---

### Why?

I have a dual boot setup (Arch Linux/Windows 10) and I use Gnome DE in my arch Linux which lacks automatic wallpaper changing functionality.

Even in the case of windows 10, While there is a *Slideshow* of wallpapers, it does not have an option like interval or web source.

both of these reasons led me to develop my own application. I want it to be simple, fast and reliable so I chose Rust.

### How?

WPC is written in rust with a modular design in mind.

APIs are divided into modules and used in main.rs as required based on the platform.

```
.
├── Cargo.lock
├── Cargo.toml
├── LICENSE.md
├── README.md
└── src
    ├── changer
    │   ├── linux
    │   │   └── DE
    │   │       ├── gnome.rs
    │   │       └── startup.rs
    │   └── windows
    │       └── windows.rs
    ├── cli.yml
    ├── main.rs
    ├── misc.rs
    └── web
        ├── bing_wpod.rs
        └── wallheaven_api.rs

6 directories, 12 files

```

---

### Dependencies

`config.toml`

```toml
[package]
name = "wpc"
version = "0.1.1"
authors = ["Jagadeesh Kotra <jagadeesh@stdin.top>"]
edition = "2018"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
serde = "1.0.104"
serde_json = "1.0.48"
reqwest = { version = "0.10", features = ["blocking", "json"] }
clap = {version = "2.33", features = ["yaml"]}
rand = "0.7"
chrono = "0.4.10"
enquote = "1.0.3"
dirs = "2.0.2"

[target.'cfg(windows)'.dependencies]
winapi = { version = "0.3", features = ["winuser"] }
```

Some notes,

`serde` and `serde_json` is used to deal with JSON data.

`reqwest` is the used to parse information from web sources.

`winapi` provides access to Windows API


---

### Wallheaven API

One of the main features of WPC is its ability to parse wallpapers from the web. Namely, [Wallheaven](https://wallhaven.cc/) and Bing WPOD are implemented.

[wallheaven API](https://wallhaven.cc/help/api) is implemented in Rust 
It uses `reqwest::blocking` to make GET requests and convert them to JSON.

```rust
pub fn wallheaven_wallpaperinfo(apikey: &str, id: &str) -> Result<serde_json::value::Value, Box<dyn std::error::Error>> 

pub fn wallheaven_search(apikey: &str, query: HashMap<&str, &str>) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_taginfo(id: &str) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_usersettings(apikey: &str) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_getid(apikey: &str) -> Result<serde_json::value::Value, Box<dyn std::error::Error>>

pub fn wallheaven_getcoll(username: &str, collid: i64) -> Result<serde_json::value::Value, Box<dyn std::error::Error>>

```

[wallhaven.rs](https://github.com/jkotra/wpc/blob/master/src/web/wallheaven_api.rs)

---

### Bing API

```rust
pub fn get_wallpaper_of_the_day() -> Result<serde_json::value::Value, Box<dyn std::error::Error>> {
    let resp = reqwest::blocking::get("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US").expect("Unable to make GET request!")
        .text()?;
    let v: Value = serde_json::from_str(&resp)
        .expect("Cannot Decode JSON Data!");
    Ok(v)
}
```

Output: `JSON`

---


### Tests

{{% notice warning %}}
Network Connectivity is required for the following tests:
<br>
`fn bing_test_is_jpg()`
<br>
`fn bing_test_is_downloadable()`
<br>
`fn wallheaven_get_wallpapers()`
<br>
{{% /notice %}}


```rust

fn it_works() {
        assert_eq!(2 + 2, 4);
}
fn bing_test_is_jpg() 
fn bing_test_is_downloadable() 
fn wallheaven_get_wallpapers()

```

---

## Conclusion

Creating this application has been a great journey. PR/Issues are welcome.

[Github](https://github.com/jkotra/wpc)
