var _           = require('lodash');
var fs          = require('fs');
var path        = require('path');
var wrench      = require('wrench');

exports.fromDisk = function(mediaPath, mediaPrefix) {

  function fileInfo(file) {
    return {
      date: date(mediaPath, file),
      name: path.basename(file),
      path: file,
      url: mediaPrefix + '/' + file,
      thumbnail: thumbsPath(file),
      video: isVideo(file),
      poster: videoPoster(file)
    }
  }

  function date(mediaPath, file) {
    return fs.statSync(path.join(mediaPath + '/' + file)).ctime.getTime();
  }

  function thumbsPath(file) {
    return path.join('thumbs', file.replace(/\.[a-z0-9]+$/, '.jpg'));
  }

  function videoPoster(file) {
    if (isVideo(file)) {
      return path.join('thumbs', file.replace(/\.[a-z0-9]+$/, '_poster.jpg'));
    } else {
      return null;
    }
  }
  function isVideo(file) {
    return file.match(/\.(mp4|mov)$/) != null;
  }

  function byFolder(file) {
    return path.dirname(file.path);
  }

  function byExtension(file) {
    return file.match(/\.(jpg|jpeg|png|mp4|mov)$/)
  }

  function folderInfo(files, name) {
    return {
      name: name,
      media: files,
      url: name + '.html'
    };
  }

  var files = wrench.readdirSyncRecursive(mediaPath);
  return _(files).filter(byExtension)
                 .map(fileInfo)
                 .sortBy('date')
                 .groupBy(byFolder)
                 .map(folderInfo)
                 .value();

};
