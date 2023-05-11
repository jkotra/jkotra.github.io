---
title: "Getting Started with GTK4 on Windows"
description: "Setup - Compile - Debug 🤩"
date: 2021-09-04T23:16:02Z
tags: ["C", "gtk"]
images:
  - https://www.gtk.org/assets/img/logo-gtk-sm.png
draft: false
---

# Introduction

This article guides how to set up and write applications with GTK4 on the windows operating system.

# GTK

![https://www.gtk.org/assets/img/logo-gtk-sm.png](https://www.gtk.org/assets/img/logo-gtk-sm.png)

GTK (formerly GIMP ToolKit then GTK+) is a free and open-source cross-platform widget toolkit for creating graphical user interfaces (GUIs).

[[wikipedia]](https://en.wikipedia.org/wiki/GTK#Windows) [[Official Website]](https://gtk.org)

# Setup

{{% notice info %}}
GTK can also be compiled with MSVC / Visual Studio. while compiling with MSVC makes it more compatible with the Visual Studio ecosystem, it limits the libraries we can include in our project. mixing MSYS2 and MSVC libraries cause problems.

To compile with MSVC:
* [Get the latest tarball](https://download.gnome.org/sources/gtk/).
* Run the following Commands:
```
meson setup -Dmedia-gstreamer=disabled -Dbuild-tests=disabled build
meson compile -C build
meson install -C build
```

Refer: [Build and run GTK 4 applications with Visual Studio](https://www.collabora.com/news-and-blog/blog/2021/03/18/build-and-run-gtk-4-applications-with-visual-studio/)

{{% /notice %}}

### MSYS2

**MSYS2** is a collection of tools and libraries providing you with an easy-to-use environment for building, installing, and running native Windows software.

1. Install the latest version MSYS2 [from their website](https://www.msys2.org/).
2. Navigate to  `C:\msys2\` and launch `mingw64.exe`.
3. to update available repositories and packages, run:
`pacman -Syyu`
4. install `gtk4`, `gcc` (`llvm` should work too!), `pkg-config`:
`pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-gtk4 mingw-w64-x86_64-pkg-config`

Now add Mingw64 directories to System Path so that windows can find them:
add the following to the system path:

```
C:\\msys64\\mingw64\\include
C:\\msys64\\mingw64\\bin
C:\\msys64\\mingw64\\lib
```

![/images/9nD9ZCp.png](/images/9nD9ZCp.png)

1. We also need to pass the output of `pkg-config` to `gcc` while compiling. firstly, open `CMD` and get the output of `pkg-config --cflags --libs gtk4`.

It will produce something like this:

```
-mfpmath=sse -msse -msse2 -pthread -mms-bitfields -IC:/msys64/mingw64/include/gtk-4.0 -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/pango-1.0 -IC:/msys64/mingw64/include/harfbuzz -IC:/msys64/mingw64/include/pango-1.0 -IC:/msys64/mingw64/include/fribidi -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/gdk-pixbuf-2.0 -IC:/msys64/mingw64/include/libpng16 -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/cairo -IC:/msys64/mingw64/include/lzo -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/freetype2 -IC:/msys64/mingw64/include/libpng16 -IC:/msys64/mingw64/include/harfbuzz -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/pixman-1 -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/graphene-1.0 -IC:/msys64/mingw64/lib/graphene-1.0/include -IC:/msys64/mingw64/include -IC:/msys64/mingw64/include/glib-2.0 -IC:/msys64/mingw64/lib/glib-2.0/include -IC:/msys64/mingw64/include -LC:/msys64/mingw64/lib -lgtk-4 -lpangowin32-1.0 -lpangocairo-1.0 -lpango-1.0 -lharfbuzz -lgdk_pixbuf-2.0 -lcairo-gobject -lcairo -lvulkan -lgraphene-1.0 -lgio-2.0 -lgobject-2.0 -lglib-2.0 -lintl
```

copy the output and add it as a System Variable (I saved it as `GTK4-PKG-CONFIG`):

![/images/oxcoJbA.png](/images/oxcoJbA.png)

### Visual Studio Code

I prefer Visual studio code for all my coding tasks. You can get the latest version of Visual studio code [from their website](https://code.visualstudio.com/).

1. Create a new folder and open it in VSCode.
2. create a new file `.vscode/c_cpp_properties.json` and put the following in it:

```json
{
    "configurations": [
        {
            "name": "Win32",
            "includePath": [
                "${workspaceFolder}\\**",
                "C:\\msys64\\mingw64\\include\\**",
                "C:\\msys64\\mingw64\\lib\\glib-2.0\\include",
                "C:\\msys64\\mingw64\\lib\\graphene-1.0\\include"
            ]
        }
    ],
    "version": 4
}

```

notice the `C:\msys64\mingw64\include\**`, `C:\msys64\mingw64\lib\glib-2.0\include` and `C:\msys64\mingw64\lib\graphene-1.0\include`. these are the header files we need for auto complete suggestions which will make our life easier.

3. create a new file, `hello_world.c` file, and paste the `Hello World` C program from [GTK.org](https://gtk.org):

```c
// Include gtk
#include <gtk/gtk.h>

static void on_activate (GtkApplication *app) {
  // Create a new window
  GtkWidget *window = gtk_application_window_new (app);
  // Create a new button
  GtkWidget *button = gtk_button_new_with_label ("Hello, World!");
  // When the button is clicked, close the window passed as an argument
  g_signal_connect_swapped (button, "clicked", G_CALLBACK (gtk_window_close), window);
  gtk_window_set_child (GTK_WINDOW (window), button);
  gtk_window_present (GTK_WINDOW (window));
}

int main (int argc, char *argv[]) {
  // Create a new application
  GtkApplication *app = gtk_application_new ("com.example.GtkApplication",
                                             G_APPLICATION_FLAGS_NONE);
  g_signal_connect (app, "activate", G_CALLBACK (on_activate), NULL);
  return g_application_run (G_APPLICATION (app), argc, argv);
}

```

4. Compile the program:
`gcc hello_world.c -o hello_world.exe -mwindows %GTK4-PKG-CONFIG%`
5. Run the program by clicking on generated `.exe` file.

![/images/oHf7ZqG.png](/images/oHf7ZqG.png)

{{% notice note %}}
If you are running Windows on a **virtual machine** and facing any issues with rendering such as bulky black borders, use `CAIRO` backend for now. support for VGPU (provided by the hypervisor) is very basic and unstable.

`$env:GSK_RENDERER = "CAIRO"`
{{% /notice %}}

### Debugging

Setting up debugging enviroment is quite easy. Defaults should just work fine as long as you select the correct compiler when prompted, I've added `-mwindows` to compile flags for good measure.

`.vscode/launch.json`

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "gcc.exe - Build and debug active file",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "C:\\msys64\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: gcc.exe build active file"
        }
    ]
}

```

`.vscode/tasks.json`

```json
{
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: gcc.exe build active file",
            "command": "C:\\msys64\\mingw64\\bin\\gcc.exe",
            "args": [
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe",
                "-mwindows",
                "%GTK4-PKG-CONFIG%"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "Task generated by Debugger."
        }
    ],
    "version": "2.0.0"
}

```

Add breakpoint wherever you wish and debug away! 

![/images/QVZD3Bq.png](/images/QVZD3Bq.png)

## A bit complicated example...

Let's make things a little complicated, suppose we want to make an application to show the current time using Win32 API, this is how it can be done:

```c
#include <stdio.h>
#include <windows.h>
#include <gtk/gtk.h>


void get_current_time(GtkButton *btn, GtkLabel *label){

  SYSTEMTIME st, lt;
  printf("Button Clicked!\n");
    
  GetSystemTime(&st);
  GetLocalTime(&lt);

  char buf[1024];
  sprintf(buf, "%02d:%02d:%02d %d/%d/%d", st.wHour, st.wMinute, st.wSecond, st.wDay, st.wMonth, st.wYear);
  gtk_label_set_label(label, buf);
  
}

static void on_activate (GtkApplication *app) {
  // Create a new window
  GtkWidget *window = gtk_application_window_new (app);

  GtkWidget *box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 4);

  GtkWidget *label = gtk_label_new("Hello GTK!");
  GtkWidget *btn = gtk_button_new_with_label("Get Current Time");
  gtk_widget_set_margin_start(GTK_WIDGET(btn), 4);
  gtk_widget_set_margin_end(GTK_WIDGET(btn), 4);
  g_signal_connect_after(btn , "clicked", (GCallback)get_current_time, label);

  gtk_box_append(GTK_BOX(box), label);
  gtk_box_append(GTK_BOX(box), btn);

  gtk_window_set_child (GTK_WINDOW (window), box);
  gtk_window_present (GTK_WINDOW (window));
}

int main (int argc, char *argv[]) {
  // Create a new application
  GtkApplication *app = gtk_application_new ("com.example.GtkApplication",
                                             G_APPLICATION_FLAGS_NONE);
  g_signal_connect (app, "activate", G_CALLBACK (on_activate), NULL);
  return g_application_run (G_APPLICATION (app), argc, argv);
}
```

Compile the program with:

`gcc whatismytime.c -o whatismytime -mwindows %GTK4-PKG-CONFIG%`

![/images/YURHuEM.png](/images/YURHuEM.png)

### Meson Build System

[Available on Github](https://github.com/jkotra/WhatIsMyTime).

Meson is the official build system used by GNOME. I've taken the above example and made it into a Meson Project.

```
tree
├── meson.build
├── README.md
└── src
    ├── meson.build
    └── whatismytime.c

1 directory, 4 files
```


{{% notice info %}}
`meson` uses `ninja` to build/compile. get the latest `ninja` from [their Github page](https://github.com/ninja-build/ninja/releases) and add the extracted directory to System Path. 
{{% /notice %}}

to build:
```
meson build
ninja -C build
```

and then navigate to `build/src` and execute `whatismytime.exe`