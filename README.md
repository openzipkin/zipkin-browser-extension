[![Build Status](https://travis-ci.org/openzipkin/zipkin-browser-extension.svg?branch=master)](https://travis-ci.org/openzipkin/zipkin-browser-extension)

# Zipkin Chrome Extension

This is an extension to the Chrome browser that lets you trigger trace generation when using your application.

## Installing

The Chrome extension can be [installed directly from Chrome Web Store](https://chrome.google.com/webstore/detail/zipkin-chrome-extension/jdpmaacocdhbmkppghmgnjmfikeeldfe).

The Firefox plugin is not production-ready yet, but can be installed manuelly by building the project from source.

## Usage

Check out the [Usage documentation](https://github.com/openzipkin/zipkin-chrome-extension/blob/master/docs/README.md).

## Developing on Chrome

- git clone [repo url] into [working directory]
- npm install
- npm run dev-chrome
- Follow [Google's guide](https://developer.chrome.com/extensions/getstarted#unpacked) on how to set up
  a local development environment for the extension.

## Developing on Firefox

- git clone [repo url] into [working directory]
- npm install
- npm install -g jpm
- npm run dev-firefox
- cd build/firefox
- jpm run

## Building

- npm install
- npm run build

This will build a .zip file that should be uploaded to Chrome Web Store.

## Publishing to Chrome Web Store

First, you need two API secrets;
1) create the file `client-secret.txt` in the root directory of this repository, with our client secret.
2) create the file `refresh-token.txt` in the root directory of this repository, with our refresh token.

- Upload the artifact to Chrome Web Store: `node upload.js upload`

- Publish the latest uploaded artifact: `node upload.js publish`

- Increment the version in the `VERSION` file

## Directory structure

This is the blog post the directory structure of this project is inspired from:

http://frontendbabel.info/articles/developing-cross-browser-extensions/
