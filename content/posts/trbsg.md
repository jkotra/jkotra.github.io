---
title: "They are Billions - Automatic game saving utility"
date: 2020-08-09T15:52:50+05:30
tags: ["python"]
draft: false
description: "python 🐍 script to automatically save and restore 'They are Billions' .ZX* files."
images:
 - /images/uCJpz2a.jpg
---

[Github repository](https://github.com/jkotra/trbsg)

---

## Introduction

technical overview of [TRBSG](https://github.com/jkotra/trbsg). the purpose of the tool is to automatically backup(zip) save files of [They are Billions](https://en.wikipedia.org/wiki/They_Are_Billions) and easily restore them afterward.

## Usecase

* start from anytime the game is saved.
* easy to restore (`-r`)

## How

{{% notice note %}}
save directory is by default set to `C:\\Users\{user}\Documents\My Games\They Are Billions\`. 
non-default value can be passed using `--path` arg. 
{{% /notice %}}

This is a small script(*< 80 ln*) written in python (>= *3.0*). this script repeatedly checks for a change in modified date of files ending with `*zx*` file extension as an indication that savefiles are modified.

```python
def watch(path):
    print("Watching: ", path)

    modified_times = []
    for root, _, files in os.walk(path):
        for file in files:
            if ".zx" in file:
                modified_times.append(os.path.getmtime(os.path.join(root, file)))


    
    while True:
        current_modified_times = []

        for root, _, files in os.walk(path):
            for file in files:
                if ".zx" in file:
                    try:
                        current_modified_times.append(os.path.getmtime(os.path.join(root, file)))
                    except FileNotFoundError:
                        continue    
  

        if current_modified_times != modified_times:
            print(modified_times, current_modified_times)
            modified_times = current_modified_times

            zipSave(path)
        else:
            continue
```

1st loop stores the initial `modified time` of files in a list. this is later compared every time in an infinite loop to check for a change in the modified timestamp. if any change is detected, it calls `zipSave(path)` and sets `modified_times = current_modified_times`

`zipSave()` uses `shutil.make_archive()` to make zip file and store it under `saves/`

```python
def zipSave(path):
    zipfname = "saves\\{n}".format(n=len(os.listdir("saves"))+1)
    shutil.make_archive(zipfname, 'zip', path)
    print("Backup completed ", zipfname)
```

the user has 2 option to restore the backup(s),
1. extract zip file directly to save directory, relacing files.
(or)
2. use `-r` option


## Demo

{{< youtube LzF1HebMW1Y >}}

## Conclusion

this is a very simple script to backup your progress in the game and restart conveniently. this makes playing 'They are Billions' a bit easier.  :blush:


