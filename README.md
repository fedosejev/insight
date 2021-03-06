<img src="./insight-logo.png" alt="Insight Logo" width="150" />

Easily collect and publish your daily insights.

__Insight__ is a static microblog generator that is tailored for publishing your daily insights. [See Insight in action](https://fedosejev.github.io/insight/).

## Install

`./install.sh`

## Run

1. `./serve.sh`
2. Open `http://localhost:8080` in a web browser.

## Setup

Edit `./data/config.json` file.

## Create new insight

1. `./create-new.sh`.
2. Open and edit `content.md` file in `./data/<today's year>/<today's month>/<today's date>` directory.
3. Generate static web pages: `./generate.sh`.

## Publish on GitHub Pages

`./publish.sh`

## Author

Artemij Fedosejev
+ [Website](http://artemij.com)
+ [LinkedIn](https://www.linkedin.com/in/artemij)
+ [React.Tips](http://react.tips)
