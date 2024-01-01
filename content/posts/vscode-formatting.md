---
title: "Formatting Code in VScode"
description: Make your code glitter ✨
description_meta: How to Setup Automatic Code formatting in Visual Studio Code (per project). Introduction to Prettier for Javascript.
images:
  - /images/sP3e1ph.png
date: 2022-04-21T02:48:44+05:30
draft: false
---


# Why?

I used to (and still do) refer to a lot of documentation and code samples, there's one thing that is common in all of them, every single one of them is formatted as per some rule (such as `PEP8` for python) that gives it a consistent look and feel, this makes it easier to read logic of the code instead of getting distracted with the styling of syntax.

Some unsung advantages of formatting are:

* uniform style and feel to code.
* automatically fix trailing and dangling spaces.
* it is *required* that code be formatted in a specific way in many situations such as contributing to open source projects.

# VScode


{{% resizeimage "/images/MJn7wQY.png" 128px 128px "VSCode Logo" %}}


VScode has the option to format your code on save as well as manually (*Shift + Ctrl + I*) or through Power Menu.

1. Create a `.vscode/settings.json` on your project root folder if it does not already exist.

2. put the following `JSON` in `settings.json` file.

{{< highlight json "hl_lines=4, linenos=inline" >}}
{

    "editor.defaultFormatter": "ms-vscode.cpptools",
    "editor.formatOnSave": true

}
{{< / highlight >}}


here, `editor.defaultFormatter` is the formatter with which you want your code to be formatted. There are different formatters available for every language for example [clang-format](https://clang.llvm.org/docs/ClangFormat.html) is very popular among C/C++ projects and [Pretter](https://prettier.io/) is a goto formatter for all things Javascript (incl. Typescript)

`editor.formatOnSave` : weather to automatically formats the code on saving of the file.

To see all the available formatters go to `File -> Preferences -> Settings` and search for "Default Formatter". IN the dropdown menu you can find all the available formatters. use your preferred and compatible formatter value in your `settings.json`

{{% resizeimage "/images/bTDWeG4.png" 256 256 "Available Formatters in VSCode" %}}

You can get more formatters in [VSCode Maketplace](https://marketplace.visualstudio.com/vscode) (Aka. Extensions).

# Prettier

![](/images/sP3e1ph.png "Prettier Formatting")

Prettier is a popular choice for many Javascript developers. I use prettier in my React Native Code to keep my JSX readable.

1. Install Prettier from Extensions.
2. An example`.prettierrc.js` file looks like this:
```
module.exports = {
  bracketSpacing: false,
  jsxBracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  arrowParens: 'always',
};
```

[Read Prettier Documentation](https://prettier.io/docs/en/index.html)

# Conclusion

A good developer not only writes logical code but also writes beautiful readable code to make it easier to read for others. Formatting is the eraser to automatically remove scratch marks on our beautiful painting 😊.