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
- npm run dev-firefox
- cd build/firefox
- jpm run

## Building/publishing

- npm install
- npm run build

This will build a .zip file that should be uploaded to Chrome Web Store.



http://frontendbabel.info/articles/developing-cross-browser-extensions/