var _      = require('lodash');
var path   = require('path');
var Album  = require('./album');

// for now only 1 level of folders,
// e.g. an album might be called "holidays/newyork" or "holidays/tokyo"n
// eventually we could return nested albums as an option
exports.albums = function(collection, opts) {
  var folders = {};
  collection.files.forEach(function(file) {
    var dir = path.dirname(file.filepath);
    if (!folders.hasOwnProperty(dir)) {
      folders[dir] = [];
    }
    folders[dir].push(file);
  });
  var albums = _.map(folders, function(val, key) {
    return new Album({
      title: key,
      files: folders[key]
    });
  })
  return albums;
};
