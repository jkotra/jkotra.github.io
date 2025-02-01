---
title: "Eclipse IDE Essentials"
description: "Saner defaults, Themes and plugins 💫"
date: 2022-03-17T14:14:03+05:30
draft: false
tags: ["eclipse", "java"]
images:
    - /images/XO0GmiH.png
---

![My Eclipse setup](/images/ucKScjF.png "My eclipse IDE")

# Introduction

In this article, I will briefly go over settings and modifications to eclipse IDE that is essential in my opinion to work smoothly with various projects and look closer to a modern-day IDE.

I'd recommend going with the [vanilla version](https://www.eclipse.org/downloads/) of Eclipse IDE, it comes with bare essentials. anything/everything else can be installed through eclipse marketplace/plugins.

---

# Essential Settings & Options

### Content Assist

![Content Assist in Action](/images/KOGUReO.png "Content Assist in Action")

Content Assist (or) Auto Complete is an essential part of any IDE. It is enabled by default but proposals might be unchecked (depends on your edition, of course).

*Window->Preferences->Editor->Content Assist->Advanced*

enable the following under **Default Proposal Kinds**:

* Java Proposals
* Template Proposals

enable the following under **Content Assist cycling**:

* Java Type Proposals
* Template Proposals
* Language Server Proposals

you can sort the above as per your liking, generally eclipse to smart enough to suggest the best match at the top without manual intervention.

---

### Content Assist Triggers

it's always a good idea to trigger auto complete on every character (like in every other IDE!) and not just the default `.` character.

*Window->Preferences->Editor->Content Assist->Auto Activation*

1. enable auto activation.

2. to trigger content assist on all common key presses, paste the following into *Auto Activation Triggers for Java*:

`.@_abcdefghijklmnopqrstuvwxyz`

---

### Enable Oomph Recorder

Some settings in eclipse are not persisted through a restart. enable *Oomph recorder* to save settings changes permanently.

*Window->Preferences->Oomph*

---

# Color Themes
    
[Top 12 Eclipse IDE Themes]()
| [archive.org mirror](https://web.archive.org/web/20220318170730/https://www.tabnine.com/blog/top-eclipse-ide-themes/)

{{% notice tip %}}
If you are using Linux and especially Gnome DE, the dark theme of the eclipse while the system is using a light variant theme seems broken. one way to mitigate this is to use the `GTK_THEME` environment variable to force eclipse to use a dark theme for its components.

`GTK_THEME=Adwaita:dark ./eclipse`
{{% /notice %}}

These color themes work best with [Darkest Dark Theme with DevStyle](https://marketplace.eclipse.org/content/darkest-dark-theme-devstyle) plugin. It also brings with it modern icons and tries to polish some rough edges. Using the above color themes with the default Light/Dark theme may result in broken  HTML and XML foreground and background.

---

# Plugins

### Web Development

[Eclipse Web Developer Tools](https://marketplace.eclipse.org/content/eclipse-web-developer-tools-0)

**Eclipse Web Developer Tools** given all the necessary support for common types of web files you may encounter like HTML, CSS or YAML, etc...

you can install plugins from the Eclipse marketplace (*Help->Eclipse Marketplace*).

You may also want to install features from EE edition that are not part of the plugin, these include specific wizards.

1. Select your version from [releases page](https://download.eclipse.org/releases/). Copy the URL.

2. Navigate to *Help->Install New Software*.

3. Paste the URL in **Work with** field.

![](/images/4xNnBtk.png "Install New Software Window")

4. Select `Web, XML, Java EE and OSGi Enterprise Development` and install it.


### Misc.

* [Lombak](https://projectlombok.org/setup/eclipse) - Automatically generates getters and setters when a class is annotated with `@Data`. Also provides other convenient annotations. 

---

# Conclusion

Eclipse is hard on the beginner's often overwhelming them with many options and (tiny!) icons. it's worth it to get familiarized with eclipse as it's the go-to choice of many small/medium/startups who are cost-conscious.

