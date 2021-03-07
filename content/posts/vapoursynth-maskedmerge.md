---
title: "Vapoursynth - Merge clips using MaskedMerge"
date: 2020-03-03T22:03:21+05:30
draft: false
tags: ["vapoursynth"]
description: demonstrating the use of std.MaskedMerge function. I will show how you can merge two clips using a mask.
images:
  - https://raw.githubusercontent.com/jkotra/maskedmerge_vs/master/1.PNG
---



{{% notice note %}}

`std.MaskedMerge(clip clipa, clip clipb, clip mask[, int[] planes, bint first_plane=0, bint premultiplied=0])
`

[**MaskedMerge**](http://www.vapoursynth.com/doc/functions/maskedmerge.html#std.MaskedMerge) merges *clipa* with *clipb* using the per pixel weights in the mask, where 0 means that clipa is returned unchanged. If mask is a grayscale clip or if first_plane is true, the mask’s first plane will be used as the mask for merging all planes. The mask will be bilinearly resized if necessary.

{{% /notice %}}


---

# Objective

  

To demonstrate the use of `std.MaskedMerge` function. I will show how you can merge two clips using a mask.

Two small clips (*00:01:00* each) are extracted from [Gemini Man (film)](https://en.wikipedia.org/wiki/Gemini_Man_(film)) for example usage. No copyright infringement intended.

{{% notice tip %}}
The code and resources used in this article are availabe in [Github repo](https://github.com/jkotra/maskedmerge_vs).
<br>
Video Files:
<br>
[GM_clip_1.mkv](https://drive.google.com/open?id=1O5my4F0cX4vrT-1NWfSdV9WCrlSMYf-A)
<br>
[GM_clip_2.mkv](https://drive.google.com/open?id=1wcBgSDxO5B_GsfUUqmMGLMOujJdXe_yi)
{{% /notice %}}

---

Requirements:


* [Vapoursynth](http://www.vapoursynth.com/) - Obviously!

* [lsmas](https://github.com/VFR-maniac/L-SMASH-Works)- to load clip and extract a frame. (Optional)
* [Photoshop](https://www.photoshop.com/) *or* [Gimp](https://www.gimp.org/)

---

1. We use `lsmas.LWLibavSource` to load the clip and save a frame as `.png`


```python
clip_a = core.lsmas.LWLibavSource(script_path + "/GM_clip_1.mkv",threads=6)
```

{{% notice info %}}
you can use any other application/video player such as [VLC player](https://www.videolan.org/vlc/index.html) to save a screenshot.
{{% /notice %}}
  
  
![Frame 214 from GM_clip_1.mkv](https://raw.githubusercontent.com/jkotra/maskedmerge_vs/master/frame214.png)
  

2. Open the `png` in *photoshop* and select the area you want to mask. Right-click on the selected area and choose **Layer via cut**

3. After removing the original layer, we are left with our required mask.

![Frame 214 Mask in Photoshop](https://raw.githubusercontent.com/jkotra/maskedmerge_vs/master/1.PNG)


4. You can view the mask in [vapoursynth editor](https://bitbucket.org/mystery_keeper/vapoursynth-editor/src/master/) by using the snippet below.

```python
mask = core.imwri.Read(script_path + "/mask.png",alpha=True)[1]

mask.set_output()
```

![](https://raw.githubusercontent.com/jkotra/maskedmerge_vs/master/2.png)

{{% notice tip %}}
while using `alpha=True` with `core.imwri.Read` returns list with 2 clips, a normal RGB clip and Gray8 clip.the alpha clip is of index `1` (or `-1`).
{{% /notice %}}



5. Putting it all together..


```python
import vapoursynth as vs
import os

script_path = os.path.dirname(os.path.abspath(__file__))

core = vs.get_core()

clip_a = core.lsmas.LWLibavSource(script_path + "/GM_clip_1.mkv",threads=6)
clip_b = core.lsmas.LWLibavSource(script_path + "/GM_clip_2.mkv",threads=6)

mask = core.imwri.Read(script_path + "/mask.png",alpha=True)[1]

merged_clip = core.std.MaskedMerge(clip_a,clip_b,mask)
merged_clip.set_output()
```

![Merged](https://raw.githubusercontent.com/jkotra/maskedmerge_vs/master/merged.png)

