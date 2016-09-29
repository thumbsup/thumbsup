
```
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ t │ │ h │ │ u │ │ m │ │ b │ │ s │ │ u │ │ p │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
```

[![NPM](http://img.shields.io/npm/v/thumbsup.svg?style=flat)](https://npmjs.org/package/thumbsup)
[![License](http://img.shields.io/npm/l/thumbsup.svg?style=flat)](https://github.com/rprieto/thumbsup)
[![Dependencies](http://img.shields.io/david/rprieto/thumbsup.svg?style=flat)](https://david-dm.org/rprieto/thumbsup)

Build static HTML galleries from local photos & videos.

- thumbnails & multiple resolutions for fast previews
- only rebuilds changed files: it's fast!
- supports custom styles
- uses relative paths so you can deploy the pages anywhere
- works great with Amazon S3 for static hosting

## Table of contents

<!-- START toc -->
- [Table of contents](#table-of-contents)
- [Example gallery](#example-gallery)
- [Required folder structure](#required-folder-structure)
- [Setup](#setup)
  * [As an npm package](#as-an-npm-package)
  * [As a docker container](#as-a-docker-container)
- [Expected output](#expected-output)
- [Configuration](#configuration)
- [Generated gallery structure](#generated-gallery-structure)
- [Deployment](#deployment)
- [Password protection](#password-protection)
- [Dev notes](#dev-notes)

<!-- END toc -->

## Example gallery

You can [view a sample gallery here](http://rprieto.github.io/thumbsup).
The home/index page shows all folders, with a few stats and some previews:

[![screenshot](https://raw.github.com/rprieto/thumbsup/master/screenshot.jpg)](http://rprieto.github.io/thumbsup)

The photo pages are a grid of photos:

[![screenshot](https://raw.github.com/rprieto/thumbsup/master/screenshot.jpg)](http://rprieto.github.io/thumbsup)

## Required folder structure

Any folder with photos and videos!
`thumbsup` currently supports 1 level of subfolders, where they each become a gallery.

```
input
  |
  |__ paris
  |    |__ img001.jpg
  |    |__ img002.jpg
  |
  |__ sydney
       |__ vid001.mp4
       |__ img003.png
```

## Setup

There is 2 main ways to run `thumbsup`: straight up as an `npm` package, or using the pre-built Docker image.
They each have trade-offs, which one you choose depends on your requirements.

<table>
  <tr>
    <th></th>
    <th>npm</th>
    <th>docker</th>
  </tr>
  <tr>
    <td>Dependencies</td>
    <td>Need to install manually (e.g. `node`, `ffmpeg`)</td>
    <td>All bundled in</td>
  </tr>
  <tr>
    <td>Codecs</td>
    <td>Need to provide your own. Useful if you have specific video formats to process.</td>
    <td>Most common codecs built-in. You can create a derived image if you want to include new ones.</td>
  </tr>
  <tr>
    <td>Performance</td>
    <td>As fast as your computer</td>
    <td>Up to 50% slower than the `npm` version.</td>
  </tr>
</table>

### As an npm package

**Requirements**

- [Node.js](http://nodejs.org/): `brew install Node`
- [GraphicsMagick](http://www.graphicsmagick.org/): `brew install graphicsmagick`
- [FFmpeg](http://www.ffmpeg.org/): `brew install ffmpeg`

*Note: there currently is [an issue with Ubuntu 14.04](#27) if you build `ffmpeg` from source. Please upgrade to 14.10 and install it with `apt-get`.*

**Installation**

```bash
npm install -g thumbsup
```

**Creating a basic gallery**

```bash
thumbsup --input ~/photos --output ~/gallery
```

### As a docker container

**Requirements**

- [Docker](https://www.docker.com/products/docker)

**Installation**

```bash
docker pull asyncadventures/thumbsup
```

**Creating a basic gallery**

```bash
docker run -t              \
  -v `pwd`:/docs           \
  -u $(id -u):$(id -g)     \
  asyncadventures/thumbsup \
  thumbsup --input /docs/media --output /docs/gallery
```

You can of course mount the volumes differently.
The only requirement is to make sure the files referenced in the config settings
are accessible from within the Docker container.

*Notes:*

- the `-t` argument is for the progress bars to render properly
- the `-u` argument is to avoid permission issues, where the generated gallery is owned by an unknown user

Photo dates displayed on the website are based on the current machine timezone.
When running in Docker, this is `GMT`. If the timezone is important to you, you should also add

```bash
docker run -v /etc/localtime:/etc/localtime [...]
```

## Expected output

If the gallery generation works, you should expect an output similar to this:

```bash
$ thumbsup [args]

  List all files      [===================] 6/6 files
  Update metadata     [===================] 6/6 files
  Original photos     [===================] 6/6 files
  Original videos     [===================] 6/6 files
  Photos (large)      [===================] 5/5 files
  Photos (thumbs)     [===================] 5/5 files
  Videos (resized)    [===================] 1/1 files
  Videos (poster)     [===================] 1/1 files
  Videos (thumbs)     [===================] 1/1 files
  Static website      [===================] done

  Gallery generated successfully
```

## Configuration

The following args are required:

- `--input <path>` path to the folder with photos / videos
- `--output <path>` target output folder

And you can optionally specify:

- `--title [text]` website title (default: `Photo gallery`)
- `--thumb-size [pixels]` thumbnail image size (default: `120`)
- `--large-size [pixels]` fullscreen image size (default: `1000`)
- `--original-photos [true|false]` to allow download of full-size photos (default: `false`)
- `--original-videos [true|false]` to allow download of full-size videos (default: `false`)
- `--sort-folders [name|date]` how to sort the folders/galleries (default: `date`)
- `--css [file]` styles to be applied on top of the default theme (no default)
- `--google-analytics [code]` code for Google Analytics tracking (no default)

*Note:* all paths are relative to the current working directory.
For example:

```bash
thumbsup --input "/media/photos" --output "./website" --title "My holidays" --thumb-size 200 --large-size 1500 --full-size-photos true --sort-folders date --css "./custom.css" --google-analytics "UA-999999-9"
```

You can also save all your arguments to a `JSON` file.
When running with Docker, make sure the config file is also accessible inside the container.

```bash
thumbsup --config config.json
```

**config.json**

```js
{
  "input": "/media/output",
  "output": "./website",
  "title": "My holiday",
  "thumb-size": 200,
  "large-size": 1500,
  "original-photos": true,
  "original-videos": false,
  "sort-folders": "date",
  "css": "./custom.css",
  "google-analytics": "UA-999999-9"
}
```

## Generated gallery structure

The generated static website has the following structure:

```
website
  |__ index.html
  |__ sydney.html
  |__ paris.html
  |__ public
  |__ media
  |    |__ original
  |    |__ large
  |    |__ thumbs
```

## Deployment

The simplest is to deploy the media and generated pages to S3 buckets on AWS using the [AWS CLI tools](http://aws.amazon.com/cli/).

- `aws s3 sync ./generated/website s3://my.website.bucket --delete`

You can also use [s3cmd](http://s3tools.org/) which offer a few more options.

- `s3cmd sync --config=<credentials> --delete-removed --exclude-from <exclude-file> ./generated/website/ s3://my.website.bucket/`


## Password protection

Amazon S3 buckets do not offer any type of authentication. However you can choose to deploy to another web server that offers password protection, such as HTTP Basic Auth.

An alternative is to deploy the galleries to UUID-based locations, like Dropbox shared galleries.

## Dev notes

To create the final Docker image

```bash
./scripts/make-docker
```

To create the sample gallery locally

```bash
./scripts/test-npm
./scripts/test-docker
```

To update the README table of contents:

```bash
npm run readme
```
