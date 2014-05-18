var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var glob   = require('glob');

exports.fromDisk = function(mediaPath, thumbSize, callback) {

  function fileInfo(file) {
    return {
      date: date(mediaPath, file),
      name: path.basename(file),
      path: file,
      video: isVideo(file),
      size: thumbSize,
      urls: urls(file)
    }
  }

  function urls(file) {
    if (isVideo(file)) {
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

  function date(file) {
    return fs.statSync(file).ctime.getTime();
  }

  function ext(file, ext) {
    return file.replace(/\.[a-z0-9]+$/i, '.' + ext);
  }

  function isVideo(file) {
    return (file.match(/\.(mp4|mov)$/) != null);
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

  var globOptions = {
    cwd: mediaPath,
    nonull: false,
    nocase: true
  };

  glob('**/*.{jpg,jpeg,png,mp4,mov}', globOptions, function (err, files) {
    if (err) return callback(err);
    var galleries = _(files)
                   .map(fileInfo)
                   .sortBy('date')
                   .groupBy(byFolder)
                   .map(folderInfo)
                   .value();
    callback(null, galleries);
  });

};
