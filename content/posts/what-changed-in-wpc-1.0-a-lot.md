---
title: "What changed in WPC 1.0? a lot."
date: 2021-01-14T02:07:19+05:30
description: Changelog and motivations behind WPC 1.0.
draft: false
tags: ["Rust"]
images:
  - images/wpc_featured.jpg
---

# Introduction

`WPC 1.0` has been released and with a whole set of new features and most importantly readable, refactored and *saner* code which should make things easy for any hackers/tinkerers out there.

Compared to a mid-release (`0.5`) which up to that point is pretty much bug fixing there are some noticeable new features to end user that started in `0.5` and finally stable in `1.0`:

- Asynchronous downloads.
- Asynchronous API calls to [Reddit](https://reddit.com/) and Bing.
- download wallpapers from any subreddit. (`--reddit`)
- convert image to grayscale before setting it as wallpaper (`--grayscale`)
- filter based on the age of the file. (`--maxage`)

# Refactoring

This took the most time, even more so than any feature. my decision(obviously not well thought of :confused:) not to come up with a flexible design pattern at the start of the project led to this, something that looked worse than a script with hard interdependency. The refactoring is not necessary for working functionality but it's of much significance if any more features are to be implemented(or removed) in the future.

Much of `main.rs` has been further cleaned. any new web plugins can be implemented in just a few lines of code as the process of downloading and saving the file(s) has been abstracted away to their respective files in the `web` dir of the project.

for example, in the previous versions, the `main()` handled everything: the calls, parsing, downloading and it became a huge mess. with `1.0` all of this has been abstracted into their respective file and `main()` simply calls `update()` on the struct, the arguments are all the same for all, `savepath`, `maxage`, and reference to `WPCDebug` impl. which prints out messages if debug is enabled (`-D`)

an example:
```rs
pub struct Bing;

impl Bing {
    pub async fn update(&self, savepath: &str, wpc_debug: &WPCDebug) -> Vec<String>  {
        let url = self.get().await;
        let file_list = misc::download_wallpapers(url, savepath, wpc_debug).await;
        return file_list;
    }

    async fn get(&self) -> Vec<String> {
        return get_bing_wpod().await;
    }
}
```

(a number too many to note down) small typos and bugs have been fixed to achieve what I believe is now feature complete. I don't intend to do any radical/breaking changes, just enough bug fixes to keep it sweet, simple, and most importantly functional.

a major reason for refactoring the code is also because of the prospect that web sources may die or change API among other zillion things that could go wrong when depending on 3rd party APIs. If I were to maintain this (i mostly use local images anyway), the Web API dependent code must be independent of the program itself to some degree and a clear distinction between OS API's (the process of changing wallpaper for example, which is unlikely to change in future (hopefully  :wink:).
 
{{% notice info %}}
Previous developments to WPC have been documented in [this](/posts/wpc-overview) article.
{{% /notice %}} 
