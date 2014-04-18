var _           = require('lodash');
var path        = require('path');
var wrench      = require('wrench');

exports.fromDisk = function(mediaPath, mediaPrefix) {

  function fileInfo(file) {
    return {
      // read file date
      date: 2340930845,
      name: path.basename(file),
      path: file,
      url: mediaPrefix + '/' + file,
      thumbnail: thumbsPath(file),
      video: isVideo(file),
      poster: videoPoster(file)
    }
  }

  function thumbsPath(file) {
    return 'thumbs/' + file.replace(/\.[a-z0-9]+$/, '.jpg');
  }

  function videoPoster(file) {
    if (file.match(/mp4$/)) {
      return file.replace(/\.[a-z0-9]+$/, '_poster.jpg')
    } else {
      return null;
    }
  }
  function isVideo(file) {
    return file.match(/mp4$/) != null;
  }

  function byFolder(file) {
    return path.dirname(file.path);
  }

  function byExtension(file) {
    return file.match(/\.(jpg|jpeg|png|mp4)$/)
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
                 .groupBy(byFolder)
                 .map(folderInfo)
                 .value();

};
