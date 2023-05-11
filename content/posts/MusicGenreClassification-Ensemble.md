---
title: "MusicGenreClassification - Combining multiple features to make a better model"
description: "detect 🎶 genres"
date: 2020-10-31T23:13:27+05:30
draft: false
---

# Introduction

This post is about the extension of my work in one of my projects [MusicGenreClassification](https://github.com/jkotra/MusicGenreClassification/) - a collection of methods to classify given audio clips into any of the 10 categories of [GTZAN dataset](http://marsyas.info/downloads/datasets.html) that it was trained on.

# Observations

in [MusicGenreClassification_FeatureEnsemble.ipynb](https://github.com/jkotra/MusicGenreClassification/blob/master/MusicGenreClassification_FeatureEnsemble.ipynb), i combined multiple features of a audio clip to make a dataset. refer to [librosa](https://librosa.org/doc/latest/feature.html) documentaion for more details.

running a Dense Network on this data, this proved to be the best model giving 5-7% more accurate results compared to previous models based on MEL.the best loss achieved with this model is `0.9987499713897705`

The accuracy graph of train and validation sets:

![accuracy graph](/images/uj6NOks.png)

---

[<img src="https://colab.research.google.com/assets/colab-badge.svg">](https://colab.research.google.com/drive/1F-wKKgE--e_EdY_ZO4jYTpkQJVtIwcHR?usp=sharing)
