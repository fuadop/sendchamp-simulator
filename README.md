# Sendchamp Local simulator
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Run a sendchamp simulator locally, to test your apps using sendchamp API without having to spend a dime, you can also write your unit tests with this tool.

## Table of contents

- [Quick start](#quick-start)
- [Setup](#setup)
- [Usage(Lets gooo) 😅](#lets-gooo)
- [Examples](#examples)
- [Timeline](#timeline)
- [Contributing](#contributing)

## Quick start

![summary](/assets/summary.gif)

## Setup

**CLI Tool**
<br />
Make sure you already have NodeJS + NPM installed. To run `sendchamp-simulator`, it's as simple as doing an `npx` which means running the latest version available on npmjs.com.

```bash
npx sendchamp-simulator --phone=2349153207998
```

As seen in the above command, you need to specify a number for the simulator to receive text messages on. That doesn't mean you cannot run multiple simulators with different numbers. Of course you can !

<br />

```bash
[5/27/2022, 11:59:40 PM] Simulator started on http://localhost:2920/?phone=2349153207998
```

☝️ You'll see a similar url printed on your console after running the command from before.

<br />

So you have another number right ? Create a new browser tab copy and paste this url there, and you get a simulator for this number. Create a new tab again 🙃. Paste the url again, but this time replace the phone number in the url.

<br />

For example: You want to run a simulator for both numbers **2348123775374** and **2349153207998**.
After starting the simulator: Go to your browser and open two tabs with the urls:

- http://localhost:2920/?phone=2348123775374
- http://localhost:2920/?phone=2349153207998

👏 Yes !. You now have two simulators ready to receive messages.

![simulators](/assets/simulators.png)

You see that green dot at the top right edge of the simulator ? If it's not green means your simulator isn't connected. Either you need to reload the page or restart your simulator ! Please don't use old browsers like Internet Explorer for this simulator or I would come for you 😠.

<br />

## Lets gooo

Now that we have the simulator setup, It's time for us to start developing our app using the sendchamp api. I said sendchamp api right 🤔. Not really. This simulator is more like a proxy to the sendchamp API and intercepts endpoints like the /sms/send, /verification/create , etc. So you won't have to spend a dime when testing your sendchamp integrated apps.

<br />

Ideally you would have a constant holding the sendchamp api base url before making api calls in your app. So you can dynamically change this url based on your app environment. Let's see what I am talking about below.

<br />

## Examples

Pardon me 🙏, I only know how to write nodejs and golang fluently.

**Nodejs with axios**

```javascript
// use simulator url if in dev mode and live url in production
const axios = require("axios");

const BASE_URL =
	process.env.NODE_ENV === "development"
		? "http://localhost:2920"
		: "https://api.sendchamp.com";

// Now lets start attacking the endpoints.
// Lets send a text message to one of our simulators phone number.

let options = {
	to: "2349153207998",
	message: "Pinging my simulator",
	sender_name: "Sendchamp",
	route: "dnd",
};

axios
	.post("/api/v1/sms/send", options, {
		baseURL: BASE_URL,
		headers: {
			// this doesn't neccessarily need to be a valid key.. anything works 😜. but if you want to use other endpoints like /wallet/wallet_balance you need to put a valid sendchamp public key, since those endpoints aren't intercepted and they go directly to api.sendchamp.com.
			Authorization: "Bearer <sendchamp_key>",
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	})
	.then((response) => {
		// exactly as sendchamp would respond you 😉
		console.log(response);
	})
	.catch((error) => {
		console.error(error);
	});
```

Now, let's check the simulator !.

![result](/assets/sms-send.png)

And also in the console, we get the regular sendchamp response.

![console](/assets/console.png)

**Nodejs with [sendchamp-sdk](https://github.com/fuadop/sendchamp-sdk)**

```javascript
const Sendchamp = require("sendchamp-sdk");

const sendchamp = new Sendchamp({
	publicKey: "sk_test_$lkdl$lksd...",
	mode: "local-simulator",
});

const sms = sendchamp.SMS;

const options = {
	sender_name: "sendchamp.sdk",
	to: "2349153207998",
	message: "test from sendchamp-sdk",
	route: "dnd",
};

sms
	.send(options)
	.then((res) => {
		console.log(res);
	})
	.catch((err) => {
		console.log(err);
	});
```

![sendchamp-sdk](/assets/js-sdk.png)
![sendchamp-sdk response](/assets/js-sdk-res.png)

**Golang with [sendchamp go sdk](https://github.com/fuadop/sendchamp)**

```go
package main

import (
	"fmt"
	"log"

	"github.com/fuadop/sendchamp"
)

var publicKey string = "your-public-key"

var mode string = sendchamp.ModeLocalSimulator

func main() {
	client := sendchamp.NewClient(publicKey, mode)
	sender := "sendchamp"
	to := []string{"2349153207998"}
	message := "my sms message"
	route := sendchamp.RouteInternational

	res, err := client.NewSms().Send(sender, to, message, route)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(res)
}
```

![go-sdk](/assets/go-sdk.png)

**Golang with net/http**

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

func main() {

	url := "https://api.sendchamp.com/api/v1/sms/send"

	if env := os.Getenv("GO_ENV"); env == "development" {
		url = "http://localhost:2920/api/v1/sms/send"
	}

	type SendSMSPayload struct {
		To         []string `json:"to"`
		Message    string   `json:"message"`
		SenderName string   `json:"sender_name"`
		Route      string   `json:"route"`
	}

	sp := SendSMSPayload{
		To:         []string{"2349153207998"},
		Message:    "Lorem ipsum d, no lele",
		SenderName: "Dash",
		Route:      "non_dnd",
	}

	j, _ := json.Marshal(sp)
	payload := bytes.NewReader(j)

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer ACCESS_KEY")

	res, e := http.DefaultClient.Do(req)

	if e != nil {
		log.Fatal(e)
	}

	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))
}
```

![go-http](/assets/go-http.png)

## Notes

The following endpoints communicate with the simulator:

- "/api/v1/sms/send"
- "/api/v1/verification/create"

Yes, sms OTPs would get received by the emulator and you can use the "/api/v1/verification/confirm" endpoint to verify it.
If the channel set in the "/api/v1/verification/create" body is not "sms" the request is processed by "api.sendchamp.com".

<br />

All other endpoints not listed above are all processed by "api.sendchamp.com". Your local simulator is a proxy ✅.

## Timeline

Currently the simulator works for all sms based requests. I am looking into also intercept the voice based requests to the simulator, if that would be necessary.
<br />
If you find any bugs or have a feature request, please file an issue on the [issue tracker](https://github.com/fuadop/sendchamp-simulator/issues), I'll be happy to help!.

## Contributing

PRs are greatly appreciated, help us build this hugely needed tool so anyone else can easily test their apps using sendchamp.

1. Create a fork
2. Create your feature branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request 🚀

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://fuadolatunji.me"><img src="https://avatars.githubusercontent.com/u/65264054?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fuad Olatunji</b></sub></a><br /><a href="https://github.com/fuadop/sendchamp-simulator/issues?q=author%3Afuadop" title="Bug reports">🐛</a> <a href="https://github.com/fuadop/sendchamp-simulator/commits?author=fuadop" title="Code">💻</a> <a href="#infra-fuadop" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-fuadop" title="Maintenance">🚧</a> <a href="#design-fuadop" title="Design">🎨</a> <a href="#example-fuadop" title="Examples">💡</a> <a href="#security-fuadop" title="Security">🛡️</a> <a href="#tool-fuadop" title="Tools">🔧</a> <a href="#userTesting-fuadop" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/sadiqful"><img src="https://avatars.githubusercontent.com/u/39303081?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aliyu Abubakar</b></sub></a><br /><a href="#blog-sadiqful" title="Blogposts">📝</a> <a href="#business-sadiqful" title="Business development">💼</a> <a href="#content-sadiqful" title="Content">🖋</a> <a href="#financial-sadiqful" title="Financial">💵</a> <a href="#ideas-sadiqful" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-sadiqful" title="Mentoring">🧑‍🏫</a> <a href="#platform-sadiqful" title="Packaging/porting to new platform">📦</a> <a href="#question-sadiqful" title="Answering Questions">💬</a> <a href="#tutorial-sadiqful" title="Tutorials">✅</a> <a href="#talk-sadiqful" title="Talks">📢</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!