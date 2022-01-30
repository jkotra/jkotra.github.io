---
title: "Making the best PDF Unlocker / Decryptor App"
description: "A technical 👨‍🔧 eassy about my app - PDFUnlockR."
tags: ["React Native", "cpp", "Java"]
date: 2021-07-23T00:08:43+05:30
draft: false
images:
 - https://i.imgur.com/yeKb8dn.png
---

<a href='https://play.google.com/store/apps/details?id=com.pdfunlockr&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img height="192px" width="192px" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>

## Preface

My foray into React native happened approximately a month before of publishing date of this article, I know of very little javascript (non ES6) and almost a *newb* with React ecosystem. It almost felt like an adventure, after many months developing and improving my libraries and application written in a language(s) I'm comfortable with. 

As of writing this, I feel like a pro of javascript. No wonder JS rules across the tech industry, the ease of learning makes it easy for a beginner like me. Even though I'm no stranger to the programming paradigm, it must be said that JS(ES6 variant) is the easiest to write, debug and extend.

With a mixture of learning [from a book](https://www.newline.co/fullstack-react-native/), [Udemy course](https://www.udemy.com/course/react-native-the-practical-guide/), and tinkering around with examples, I made a simple app to view semester results of my university. It's now [available on the Google play store](https://play.google.com/store/apps/details?id=com.ouresults).

## Problem 

You have a pdf file, and it has a password. The aim is to generate a new file from input with password / any other encryption removed. 

### But why? 

In general, it's a hassle to enter the password every time you need to view it. The default PDF viewer on android does not have a feature to remember passwords. 

Often, Financial institutions request bank statements other KYC documents which are often encrypted with a password(for example, eAadhar in India). There are several tools available online with varying downsides. I discussed these issues in the section below. 

## Competition Research

A [search](https://play.google.com/store/search?q=pdf%20unlocker) for "*pdf unlocker*" on google play store returns at least 6 that claim to do the job. But after I tested each one of them(excluding corporate type, discussed in next paragraph) I find their functionality ranging from unusable to badly designed UI to just crash. I don't want to take the name of the developers here, I have immense respect for my colleagues in the trades irrespective of skill. The problem is quite possibly API and old age(depreciation). Many years after writing this article, my app might as well join them becoming unusable, the trick here is to use a newer SDK for future-proofing. I have a good feeling this is good for at least the next 4-5 Android versions. For this reason, `PDFUnlockR` requires a minimum SDK of 24 (API) (Android 7)

Those which work and look nice are the corporate variety. An example is [Smallpdf](https://play.google.com/store/apps/details?id=com.smallpdf.app.android&hl=en_IN&gl=US) and [iLovePDF](https://play.google.com/store/apps/details?id=com.ilovepdf.www&hl=en_IN&gl=US). Both of these are in a way more than a tool, they have a business model, charging users money if they exceed a certain limit of files. I feel this is a very dubious practice because of two reasons, they offer no value and little convenience, just jump on a computer and there are many programs to decrypt unlimited no. of files with no catch. 2nd reason is even though a guess, they are probably using some open-source library under the hood. The license of said Open source library may even explicitly prohibit profiting from their code.


## UI/UX Design

The basic structure of `PDFUnlockR` consists of mainly 3 screens. 

- `Home / Queue`
- `Processing `
- `Decrypt(Final Results) `

![](https://i.imgur.com/fBTnKbV.png)

Components used are a combination of vanilla react native and [react-native-paper](https://callstack.github.io/react-native-paper/)

## the best PDF library - QPDF. There's a problem though... 

I'm quite confident QPDF is the best *opensource*  PDF library out there. The emphasis on open-source is important here, during my research I've encountered many closed source libraries with java bindings(that would have made my life easier, not having to deal with JNI). The problem is that QPDF is a c++ library and the way to connect it with java is through JNI(Java Native Interface)

### Cross Compiling QPDF to multiple  CPU architectures.

We first need to compile the library into a shared object(`.so`) file to include in our project. 

From `android/app/gradle.build` we can specify the architectures we can target: 

```gradle
        externalNativeBuild {
            cmake {
                cppFlags "-O2 -frtti -fexceptions -Wall -fstack-protector-all"
                abiFilters 'x86', 'x86_64', 'armeabi-v7a', 'arm64-v8a'
            }
        }
```        

Here, I've chosen to use the library for all 4 (`'x86', 'x86_64', 'armeabi-v7a', 'arm64-v8a'`) architecture, cross-compiling is pretty straightforward once you figure out ins and outs of NDK compilers. 

[QPDF](https://sourceforge.net/projects/qpdf/files/qpdf/) depends on one other library: 

- [libjpeg](http://www.ijg.org/files/jpegsrc.v9d.tar.gz)

I've included links to gists of bash scripts to cross-compile these dependencies and also `qpdf` itself. 

[Github Gist](https://gist.github.com/jkotra/e5cfa6f2b06c97dafe11384594000a4a)

{{% notice note %}}

compilation of QPDF will fail during cross-compilation due to its inability to confirm the existence of `/dev/urandom`. This check must be disabled in `configure`

```sh
#ln 16476 - version - 10.3.2
test "$cross_compiling" = no &&
```

{{% /notice %}}


Running the above bash scripts should produce binary `.so` for each architecture. 

```
.
├── arm64-v8a
│   ├── libjpeg.so
│   └── libqpdf.so
├── armeabi-v7a
│   ├── libjpeg.so
│   └── libqpdf.so
├── x86
│   ├── libjpeg.so
│   └── libqpdf.so
└── x86_64
    ├── libjpeg.so
    └── libqpdf.so
```

### JNI + NDK

[JNI](https://en.wikipedia.org/wiki/Java_Native_Interface) stands for **J**ava **N**ative **I**nterface. [NDK](https://developer.android.com/ndk) (**N**ative **D**evelopment **K**it) is what allows us to run C++ natively on the android platform. 

JNI acts as a bridge between java and NDK/C++.


## Stitching it all together

The process of putting all these together starts with the bottom, our pure C++ library which uses `qpdf` to decrypt the file. 

{{% notice warning %}}

**Update [30/01/2022]**

Passing file descriptor to C++ seems to cause problems with `targetSdkVersion` >= 30 due to [fdsan](https://android.googlesource.com/platform/bionic/+/master/docs/fdsan.md). I solved thisd issue by reading the file on java side and passing `byteArray` to JNI and further. Refer [ContentResolver](https://developer.android.com/reference/android/content/ContentResolver#openInputStream(android.net.Uri))

{{% /notice %}}

An excerpt is given below: 

```cpp
bool decryptPDF_wFD(int fd, std::string filename, std::string out, size_t size, std::string password)
{
    
    __android_log_print(ANDROID_LOG_DEBUG,
     "PDFUnlockR",
      "%s%d\n", "decryptPDF_wFD Received FD:", fd);

    //read from FD
    FILE *fp = fdopen(fd, "r");
    if (fp == NULL){
        throw("Cannot open file descriptor.");
    }

    //malloc
    char* data = (char *)malloc(size * sizeof(char));
    fread(data, sizeof(data), size, fp);
    
    __android_log_print(ANDROID_LOG_DEBUG, "PDFUnlockR", "FD loaded!\n");

    QPDF qpdf;

    try
    {
        __android_log_print(ANDROID_LOG_DEBUG, "PDFUnlockR", "received inputs: %s %s %d %s\n", filename.c_str(), out.c_str(), size, password.c_str());
        qpdf.processMemoryFile(filename.c_str(), (const char *)data, size, password.c_str());
        QPDFWriter w(qpdf, out.c_str());
        w.setPreserveEncryption(false);
        w.write();
        free(data);
        return true;
    }
    catch (std::exception& err)
    {
        __android_log_print(ANDROID_LOG_DEBUG, "PDFUnlockR", "Decrypt Error: %s\n", err.what());
        free(data);
        throw(&err);
    }

}
```

Next comes the JNI C++, which acts as a glue between java and our code mentioned above: 

```cpp
extern "C"
JNIEXPORT jboolean JNICALL
Java_com_pdfunlockr_QPDFModule_decryptPDF(JNIEnv *env, jclass type, jint fd, jstring filename, jlong pdf_size, jstring password, jstring out) {
    const char* input_fname = env->GetStringUTFChars(filename, NULL);
    const char* passwd = env->GetStringUTFChars(password, NULL);
    const char* output = env->GetStringUTFChars(out, NULL);
    size_t size = (long)pdf_size;
    bool result = false;

    try{
    result = decryptPDF_wFD(fd, std::string(input_fname), std::string(output), size, std::string(passwd));
    } catch(std::exception *e){
        jclass exp = env->FindClass("java/lang/Exception");
        env->ThrowNew(exp, e->what());
    };

    return jboolean(result);
}
```

Finally, these native functions can be used in java, and using React native modules, these wrapped methods can be invoked from javascript. 

```java
   @ReactMethod
   public void QPDFdecryptPDF(String file_uri, String filename, String pdf_size, String password, final Promise promise){

      Uri uri = Uri.parse(file_uri);
      ContentResolver resolver = ctx.getContentResolver();
       String output_file;

      output_file = ctx.getCacheDir().getAbsolutePath() + "/" + filename;
      
      try {
          ParcelFileDescriptor fd = resolver.openFileDescriptor(uri, "r");
          int pdf_fd = fd.getFd();
          long lsize = Long.parseLong(pdf_size);
          boolean out = decryptPDF(pdf_fd, filename, lsize, password, output_file);
          fd.close();
          promise.resolve(output_file);
      }catch(Exception e){
        Log.d("PDFUnlockr", e.getMessage());
        promise.reject(e.getMessage());
       }

   }
   
   public static native boolean decryptPDF(int in_fd, String filename, long pdf_size, String password, String output);
```

{{% notice tip %}}
Refer to [RN Documentation](https://reactnative.dev/docs/native-modules-android) on how to bridge `Java <-> Javascript`.
{{% /notice %}}

{{% notice info %}}
My code is highly inspired at initial setup stage by [reime005's react-native-cpp-code](https://github.com/reime005/react-native-cpp-code)
{{% /notice %}}

{{% notice note %}}
Exception handling is a **MUST** if you want to remain sane during the development. Without exception handling, if an error occurs, the app abruptly crashes. 

The only way to debug what caused the crash is to look for hints in `adb logcat`.this ordeal is comparable to finding a needle in a haystack. 
{{% /notice %}}


## Monetization 

I placed just 2 ads. 

- [Banner Ad](https://developers.google.com/admob/android/banner) in Processing Screen
- [Interstitial Ad](https://developers.google.com/admob/android/interstitial) on final/decrypt stage

There's a lot of ad placement potential in here, At this point, I don't feel like adding more ads that might make the app less functional and annoying. 

## Conclusion 

Over and all, I'm still surprised how fast this whole journey has been thanks to JS. Considering how little if anything about making apps before jumping in just a week ago. I still do not know a lot of vanilla java / Kotlin principles and practices. This is not a deficiency of me or a supposedly steep learning curve of Vanilla Android Development, rather the point here is that **React Native just WORKS!** 




