var path = require('path');
var index = 0;

function File(filepath, metadata) {
  this.id = ++index;
  this.filepath = filepath;
  this.filename = path.basename(filepath);
  this.date = new Date(metadata.exif.date || metadata.fileDate);
  this.caption = metadata.exif.caption;
  this.isVideo = (metadata.mediaType === 'video');
  this.urls = urls(filepath, metadata.mediaType);
}

function urls(filepath, mediaType) {
  return (mediaType === 'video') ? videoUrls(filepath) : photoUrls(filepath);
}

function videoUrls(filepath) {
  return {
    thumb:     'media/thumbs/' + ext(filepath, 'jpg'),
    poster:    'media/large/' + ext(filepath, 'jpg'),
    video:     'media/large/' + ext(filepath, 'mp4'),
    original:  'media/original/' + filepath
  };
}

function photoUrls(filepath) {
  return {
    thumb:     'media/thumbs/' + filepath,
    large:     'media/large/' + filepath,
    original:  'media/original/' + filepath
  };
}

function ext(file, ext) {
  return file.replace(/\.[a-z0-9]+$/i, '.' + ext);
}

module.exports = File;
