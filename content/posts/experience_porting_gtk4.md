---
title: "Porting (coinflip-gtk) to GTK4"
date: 2021-02-19T19:50:28+05:30
draft: false
tags: ['gtk', 'c']
description: My experiences porting my toy app🧸 from GTK3 to GTK4
images:
 - https://i.imgur.com/NMJ7cge.png
---

# Introduction

Recently, I decided to fix some lingering bugs in my toy project [coinflip-gtk](https://github.com/jkotra/coinflip-gtk) which I made a few months back to get a taste of GTK. this coincided with the release of GTK4(actually it released a few months earlier but it's still was very new and very few apps are ported to GTK4 from GTK3). I've successfully ported my small toy example to gtk4. This blog summarizes my experiences.

## UI

The topic of whether to use RAD tool (Glade) or not is a hot debate in the Gnome community[^1]. I went with the suggestion that is given to all the beginners i.e use glade. It took a few days to get hold of it esp. the spacing mechanism, it's not as user-friendly as Qt Creator AFAIR.

It Turned out glade files are for the most part incompatible with GTK4 as-it-is. a renowned developer even made a blog post[^2] about why glade is BAD and you should write XML by hand instead.

Gtk developers provide a tool `gtk4-builder-tool` that is intended to fix issues in `.ui`/`.glade` files.

```
Usage:
  gtk-builder-tool [COMMAND] [OPTION…] FILE

Commands:
  validate     Validate the file
  simplify     Simplify the file
  enumerate    List all named objects
  preview      Preview the file

Simplify Options:
  --replace    Replace the file
  --3to4       Convert from GTK 3 to GTK 4

Preview Options:
  --id=ID      Preview only the named object
  --css=FILE   Use style from CSS file

Perform various tasks on GtkBuilder .ui files.
```

{{% notice note %}}
from my experience, converting/fixing glade files is hit or miss for unknown reasons. I've noticed that it tends to produce good results when there is only one window per file.
{{% /notice %}}

## Code

The first obvious thing one would notice is that there is no `gtk_builder_connect_signals()`. All signals are connected by default.

another important thing to note is the introduction of `GdkTexture` which replaces `GdkPixbuf.` [this change is explained by devs on the Gtk blog.](https://blog.gtk.org/2018/03/16/textures-and-paintables/)

this creates a problem with the current implementation of about dialog in my app . in GTK4, `gtk_about_dialog_set_logo` takes `GdkPaintable` as input. The correct way to set logo is as follows:

```c
    GdkTexture *about_logo = gdk_texture_new_from_resource("/com/github/jkotra/coinflip/images/com.github.jkotra.coinflip.svg");
    gtk_about_dialog_set_logo(about, GDK_PAINTABLE(about_logo));
```


## Result

The porting explained here is [available on Github](https://github.com/jkotra/coinflip-gtk). (`gtk4-port` branch)

![](https://i.imgur.com/NMJ7cge.png)

[^1]: https://www.reddit.com/r/GTK/comments/jyf5lm/glade_not_recommended/
[^2]: https://blogs.gnome.org/christopherdavis/2020/11/19/glade-not-recommended/
