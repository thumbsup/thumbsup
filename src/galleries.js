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
      video: video(file),
      size: thumbSize,
      urls: {
        original: mediaUrl(file, 'original'),
        large: mediaUrl(file, 'large'),
        thumb: mediaUrl(file, 'thumbs')
      }
    }
  }

  function date(file) {
    return fs.statSync(file).ctime.getTime();
  }

  function mediaUrl(file, type) {
    if (type != 'original') {
      file = file.replace(/\.(mp4|mov)$/, '.jpg');
    }
    return path.join('media', type, file);
  }

  function video(file) {
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
