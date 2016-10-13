var _      = require('lodash');
var path   = require('path');
var Album  = require('./album');

// for now, a single level of albums by month named "{year}-{month}"
// eventually could support nested albums e.g. "{year}/{month}"
// it could be an option like "format: yyyy/mm"
exports.albums = function(collection, opts) {
  var groups = {};
  collection.files.forEach(function(file) {
    var groupName = exports.format(file.date);
    if (!groups.hasOwnProperty(groupName)) {
      groups[groupName] = [];
    }
    groups[groupName].push(file);
  });
  var albums = _.map(groups, function(val, key) {
    return new Album({
      title: key,
      files: groups[key]
    });
  })
  return albums;
};

exports.format = function(date) {
  var year = date.getFullYear().toString();
  var month = new String(date.getMonth() + 1);
  if (month.length === 1) month = '0' + month;
  return year + '-' + month;
};
