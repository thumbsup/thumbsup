var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var glob   = require('glob');

exports.build = function(metadata, thumbSize) {

  function fileInfo(data, file) {
    return {
      date: data.date,
      path: file,
      name: path.basename(file),
      video: data.type === 'video',
      size: thumbSize,
      urls: urls(file, data)
    }
  }

  function urls(file, data) {
    if (data.type === 'video') {
      return {
        original: path.join('media', 'original', file),
        web:      path.join('media', 'large',  ext(file, 'mp4')),
        large:    path.join('media', 'large',  ext(file, 'jpg')),
        thumb:    path.join('media', 'thumbs', ext(file, 'jpg'))
      };
    } else {
      return {
        original: path.join('media', 'original', file),
        large:    path.join('media', 'large', file),
        thumb:    path.join('media', 'thumbs', file)
      }
    }
  }

  function ext(file, ext) {
    return file.replace(/\.[a-z0-9]+$/i, '.' + ext);
  }

  function byFolder(file) {
    return path.dirname(file.path);
  }

  function folderInfo(files, name) {
    return {
      name: name,
      media: files,
      url: name + '.html'
    };
  }

  return _(metadata).map(fileInfo)
                   .sortBy('date')
                   .groupBy(byFolder)
                   .map(folderInfo)
                   .value();

};
