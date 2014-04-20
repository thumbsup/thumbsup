# thumbsup

Static HTML galleries from a list of photos & videos.

- creates thumbnails for fast previews
- uses relative paths so you can deploy the pages anywhere
- supports custom CSS for styling
- works great with Amazon S3 for static hosting

![screenshot](https://raw.github.com/rprieto/thumbsup/master/screenshot.jpg)

*Note: `thumbsup` keeps generated content separate from the original media. This means you're free to upload the media anywhere, and never have to worry about deleting the output folder*

## Requirements

- [Node.js](http://nodejs.org/): `brew install Node`
- [GraphicsMagick](http://www.graphicsmagick.org/): `brew install graphicsmagick`
- [FFmpeg](http://www.ffmpeg.org/): `brew install ffmpeg`

## Input

Any folder with photos and videos. `thumbsup` supports 1 level of subfolders, where they each become a gallery.

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

## Generating the galleries

```
thumbsup <args>
```

The following args are required:

- `--input <path>` path to the folder with photos / videos
- `--output <path>` target output folder
- `--media-prefix <url>` prefix for the photos / videos URLS (can be relative or absolute)

And you can optionally specify:

- `--size <pixels>` size of the thumbnails
- `--css <path>` use the given CSS file instead of the default style

For example:

```bash
thumbsup --input "/media/photos" --output "./website" --media-prefix "http://my.photo.bucket.s3.amazon.com" --css "custom.css" --size 200
```

## Deployment

The simplest is to deploy the media and generated pages to S3 buckets on AWS using the [AWS CLI tools](http://aws.amazon.com/cli/).

- `aws s3 sync /media/photos s3://my.photo.bucket --delete`
- `aws s3 sync /generated/website s3://my.website.bucket --delete`

## Password protection

Amazon S3 buckets do not offer any type of authentication. However you can choose to deploy to another web server that offers password protection, such as HTTP Basic Auth.

An alternative is to deploy the galleries to UUID-based locations, like Dropbox shared galleries.

## Dev notes

To create the sample gallery locally:

```
npm run example
```
