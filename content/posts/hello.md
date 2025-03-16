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

{{% notice note %}}
Some Code Test Block:

```rs
pub fn to_grayscale_simd_u8(width: u32, height: u32, image_data: Vec<u8>) -> Vec<u8> {
    let mut gray_pixels: Vec<u8> = Vec::with_capacity((width * height) as usize);

    let r_coeff = u16x8::splat(77);
    let g_coeff = u16x8::splat(150);
    let b_coeff = u16x8::splat(29);

    for chunk in image_data.chunks(8 * 4) {
        // process 8 RGBA pixels at a time.
        let mut a = [0; 8];
        let mut b = [0; 8];
        let mut c = [0; 8];
        let mut d = [0; 8];

        for (i, pixel) in chunk.chunks_exact(4).enumerate() {
            a[i] = pixel[0];
            b[i] = pixel[1];
            c[i] = pixel[2];
            d[i] = pixel[3];
        }

        let r_arr = u8x8::from_slice(&a).cast::<u16>();
        let g_arr = u8x8::from_slice(&b).cast::<u16>();
        let b_arr = u8x8::from_slice(&c).cast::<u16>();

        let gray = (r_coeff * r_arr) + (g_coeff * g_arr) + (b_coeff * b_arr);
        gray_pixels.extend((gray >> 8).cast::<u8>().to_array());
    }

    gray_pixels
}
```
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

{{< highlight c "hl_lines=8-12, linenos=inline" >}}
int change_in_modified_date(char *filename)
{

    if (stat(filename, &stat_info) != 1)
    {

        // if datasource_lastmodified is -1 then it's initial check
        if (datasource_lastmodified == -1)
        {
            datasource_lastmodified = stat_info.st_mtime;
            return false;
        }

        // if file modified
        if (datasource_lastmodified != stat_info.st_mtime)
        {

            // update var.
            datasource_lastmodified = stat_info.st_mtime;
            return true;
        }
    }

    return false;
}
{{< / highlight >}}

![IceCream Truck](/images/icecream-dbus.webp "DALL-E rendition of a icecream truck.")

[^1]: This is the first footnote.
[^bignote]: Here's one with multiple paragraphs and code.
