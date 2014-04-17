var _           = require('lodash');
var path        = require('path');
var wrench      = require('wrench');

exports.fromDisk = function(mediaPath, mediaPrefix) {

  function fileInfo(file) {
    return {
      // read file date
      date: 2340930845,
      path: file,
      url: mediaPrefix + '/' + file,
      thumbnail: 'thumbs/' + file,
      video: file.match(/\.mp4$/)
    }
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
