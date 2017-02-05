# thumbsup

[![NPM](http://img.shields.io/npm/v/thumbsup.svg?style=flat)](https://npmjs.org/package/thumbsup)
[![License](http://img.shields.io/npm/l/thumbsup.svg?style=flat)](https://github.com/thumbsup/node-thumbsup)
[![Travis CI](https://travis-ci.org/thumbsup/node-thumbsup.svg?branch=master)](https://travis-ci.org/thumbsup/node-thumbsup)
[![Dependencies](http://img.shields.io/david/thumbsup/node-thumbsup.svg?style=flat)](https://david-dm.org/thumbsup/node-thumbsup)
[![Dev dependencies](https://david-dm.org/thumbsup/node-thumbsup/dev-status.svg?style=flat)](https://david-dm.org/thumbsup/node-thumbsup?type=dev)

![banner](banner.jpg)

Turn any folder with photos &amp; videos into a web gallery.

- thumbnails & multiple resolutions for fast previews
- mobile friendly website with customisable themes
- only rebuilds changed files: it's fast!
- uses relative paths so you can deploy the pages anywhere
- works great with Amazon S3 for static hosting

## Quick start

Simply point `thumbsup` to a folder with photos &amp; videos. All nested folders become separate albums.

*Requirements*
- [Node.js](http://nodejs.org/): `brew install Node`
- [GraphicsMagick](http://www.graphicsmagick.org/): `brew install graphicsmagick`
- [FFmpeg](http://www.ffmpeg.org/): `brew install ffmpeg`


```bash
npm install thumbsup
thumbsup --input ./media --output ./website
```

There are many more command line arguments to customise the output.
You can also run `thumbsup` as a Docker container which pre-packages all dependencies like `ffmpeg`.
See the website for the full documentation: https://thumbsup.github.io.

## Sample gallery

See a sample gallery online at https://thumbsup.github.io/demos/themes/mosaic/

![sample gallery](screenshot.png)

## Command line arguments

This reflects the CLI for the latest code on `master`.
For the latest published version please refer to the [docs on the website](https://thumbsup.github.io).

<!-- START cli -->
```

Usages:
  thumbsup [required] [options]
  thumbsup --config config.json

Required:
  --input   Path to the folder with all photos/videos  [string] [required]
  --output  Output path for the static website  [string] [required]

Options:
  --help                   Show help  [boolean]
  --index                  Filename of the home page, without extension  [default: "index"]
  --title                  Website title  [default: "Photo album"]
  --thumb-size             Pixel size of the square thumbnails  [number] [default: 120]
  --large-size             Pixel height of the fullscreen photos  [number] [default: 1000]
  --original-photos        Allow download of full-size photos  [boolean] [default: false]
  --original-videos        Allow download of full-size videos  [boolean] [default: false]
  --albums-from            How to group media into albums  [choices: "folders", "date"] [default: "folders"]
  --albums-date-format     How albums are named in <date> mode [moment.js pattern]  [default: "YYYY-MM"]
  --sort-folders           How to sort albums [deprecated]  [choices: "name", "date"]
  --sort-albums-by         How to sort albums  [choices: "title", "start-date", "end-date"] [default: "start-date"]
  --sort-albums-direction  Album sorting direction  [choices: "asc", "desc"] [default: "asc"]
  --sort-media-by          How to sort photos and videos  [choices: "filename", "date"] [default: "date"]
  --sort-media-direction   Media sorting direction  [choices: "asc", "desc"] [default: "asc"]
  --theme                  Name of the gallery theme to apply  [choices: "classic", "cards", "mosaic"] [default: "classic"]
  --css                    Path to a CSS/LESS file for styling  [string]
  --config                 Path to JSON config file  [string]
  --google-analytics       Code for Google Analytics tracking  [string]
  --footer                 Text or HTML footer  [default: null]

The optional JSON config should contain a single object with one key per argument, not including the leading "--". For example:

{ "sort-albums-by": "start-date" }

```

<!-- END cli -->

## Contributing

We welcome all [issues](https://github.com/thumbsup/node-thumbsup/issues)
and [pull requests](https://github.com/thumbsup/node-thumbsup/pulls)!
Please make sure the tests are passing when submitting a code change:

```bash
./scripts/cibuild
```
