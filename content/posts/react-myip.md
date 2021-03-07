---
title: "'Know Your IP Address' with React"
date: 2020-03-21T20:13:16+05:30
description: Making a 'Know Your IP' page with React.js.
draft: false
tags: ["React","Web Development"]
images:
  - https://i.imgur.com/2AUyhE5.png
---
[Demo](https://lab.stdin.top/#/myip/) | [Code](https://gitlab.com/synk.0x1/lab.stdin.top/-/blob/master/src/components/pages/MyIp.js)


This is a quick primer on how to make a 'Know Your IP' page with React.


{{% notice info %}}

To follow through this, you will need to install `node`, and create a new project using `create-react-app`.This tutorial only deals with creating *Know Your IP Address* Component.

{{% /notice %}}

---

# Prerequisites

1. [public-ip](https://www.npmjs.com/package/public-ip) module
2. Working knowledge with [React](https://reactjs.org/) and ES6 Javascript.

---

Start by making a default skeleton component.

```js

import React from 'react';
const publicIp = require('public-ip');


    render(){

        return <div>
            
            <h1>Hello World!</h1>
        </div>

    }

}

export default MyIp;

```

Make sure this is working, when you visit the component, it should display "Hello World!"

---

Create a `constructor` for our class.

```js
constructor(props){
        super(props)
        this.state = {'ipv4': '0.0.0.0', 'ok': false}
    }
```

Here, I initiate a React `state` with 2 value pairs.

* `'ipv4': '0.0.0.0'` - Placeholder that we update after retriving user's ip.
*  `'ok': false` - This will be set to `True` if user's ip is sucessfully retrived.

---

These are some helper functions the retrieve and update IP in the state:

```js
   async get_ip_user_ipv4(){
        let ip = await publicIp.v4();
        return ip
}


    async set_ip(){
        
        var curr_ip_ipv4;

        try{

            curr_ip_ipv4 = await this.get_ip_user_ipv4();
            
           }catch(err){ console.log(err); curr_ip_ipv4=undefined; }

        if (!(curr_ip_ipv4 === undefined)){
        this.setState({'ipv4': curr_ip_ipv4})
        this.setState({'ok': true})
     }

        console.log(this.state.ipv4);
 }
```

`set_ip()` is the entry point. It will further call `get_ip_user_ipv4()` to get IP address of the user.It will then update `ipv4` state with retrieved IP and set `ok` state to `True`

---

```js
render(){

        return <div>
            
            {this.state.ok ? 
            <div className="alert alert-primary" role="alert">
                <h3>Your IP: {this.state.ipv4}</h3>
                </div>: null}
            <button className="btn btn-success" onClick={() => this.set_ip()}>Get IP!</button>
        </div>

}
```

first, we check whether `state.ok` is set to True, This means we only want it to render if it is set to true or else return `null`. I used [Bootstrap alert](https://getbootstrap.com/docs/4.0/components/alerts/) to make it look good, this is is *optional*.


in `Button` we use `onClick` prop to invoke our function that retrieves and displays user IP on screen.


{{% notice tip %}}

[Full code - MyIp.js](https://gitlab.com/synk.0x1/lab.stdin.top/-/blob/master/src/components/pages/MyIp.js)

{{% /notice %}}

