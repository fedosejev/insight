# Insight

Easily collect and publish your daily observations.

__Insight__ is a static website generator that is tailored for creating a diary with daily observations.

## Install

`npm install`

## Run

1. `./serve.sh`
2. Open `http://localhost:8080` in a web browser.

## Setup

Edit `./data/config.json` file.

## Create new observation

1. `./create-new.sh`.
2. Open and edit `content.md` file in `./data/<today's year>/<today's month>/<today's date>` directory.
3. Generate static web pages: `./generate.sh`.

## Publish on GitHub Pages

`./publish.sh`

## Author

[Artemij Fedosejev](http://artemij.com)