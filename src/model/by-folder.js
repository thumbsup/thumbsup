var _      = require('lodash');
var path   = require('path');
var Album  = require('./album');

// for now only 1 level of folders,
// e.g. an album might be called "holidays/newyork" or "holidays/tokyo"n
// eventually we could return nested albums as an option
exports.albums = function(collection, opts) {
  var albumsByFullPath = {};
  // put all files in the right album
  collection.forEach(function(file) {
    var fullDir = path.dirname(file.filepath);
    createAlbumHierarchy(albumsByFullPath, fullDir);
    albumsByFullPath[fullDir].files.push(file);
  });
  // only return top-level albums
  var topLevel = _.keys(albumsByFullPath).filter(function(dir) {
    return path.dirname(dir) === '.';
  });
  return _.values(_.pick(albumsByFullPath, topLevel));
};

function createAlbumHierarchy(albumsByFullPath, fullDir) {
  if (!albumsByFullPath.hasOwnProperty(fullDir)) {
    // create parent albums first
    var parentDir = path.dirname(fullDir);
    if (parentDir !== '.') {
      createAlbumHierarchy(albumsByFullPath, parentDir);
    }
    // then create album if it doesn't exist
    var dirname = path.basename(fullDir);
    albumsByFullPath[fullDir] = new Album({title: dirname});
    // then attach to parent
    if (parentDir !== '.') {
      albumsByFullPath[parentDir].albums.push(albumsByFullPath[fullDir]);
    }
  }
}
