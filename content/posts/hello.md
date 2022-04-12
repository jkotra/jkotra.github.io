---
title: "Hello"
date: 1971-01-01T11:54:58+05:30
draft: true
description: "Hello, Hugo!"
description_meta: "this is an SEO-friendly loong description of my post! blah blah blah"
tags: ["Hello"]
js: ["https://cdn.jsdelivr.net/npm/chart.js@2.8.0"]
---

```
Hello hugo!
```

```rust

fn main() {

println!("Hello, World");

}
```

:smile:

$$\int_{a}^{b} x^2 dx$$

{{% notice note %}}
A notice disclaimer
{{% /notice %}}


{{% notice info %}}
An information disclaimer
{{% /notice %}}

{{% notice tip %}}
A tip disclaimer
{{% /notice %}}

{{% notice warning %}}
A warning disclaimer
{{% /notice %}}


---

> Quote here.
>
> -- <cite>Benjamin Franklin</cite>

<canvas id="myChart" width="1100" height="500" ></canvas>

<script>
    var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(118, 110, 145)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45]
        }]
    },

    // Configuration options go here
    options: {}
});

</script>

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

```rust
pub fn wallheaven_wallpaperinfo(apikey: &str, id: &str) -> Result<serde_json::value::Value, Box<dyn std::error::Error>> 

pub fn wallheaven_search(apikey: &str, query: HashMap<&str, &str>) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_taginfo(id: &str) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_usersettings(apikey: &str) -> Result<Value, Box<dyn std::error::Error>>

pub fn wallheaven_getid(apikey: &str) -> Result<serde_json::value::Value, Box<dyn std::error::Error>>

pub fn wallheaven_getcoll(username: &str, collid: i64) -> Result<serde_json::value::Value, Box<dyn std::error::Error>>

```

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.
