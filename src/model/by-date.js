var _      = require('lodash');
var path   = require('path');
var moment = require('moment');
var Album  = require('./album');

// creates nested albums based on the media date, e.g. "{year}/{month}"
// opts = {format}, where format is a valid <moment> format
// e.g. "YYYY-MM" or "YYYY/MMMM" for nested albums
exports.albums = function(collection, opts) {
  opts = _.defaults(opts, {
    grouping: opts.albumsDateFormat || 'YYYY-MMMM'
  });
  var groups = {};
  // put all files in the right albums
  collection.forEach(function(file) {
    var groupName = moment(file.date).format(opts.grouping);
    createAlbumHierarchy(groups, groupName);
    groups[groupName].files.push(file);
  });
  // only return top-level albums
  var topLevel = _.keys(groups).filter(function(dir) {
    return path.dirname(dir) === '.';
  });
  return _.values(_.pick(groups, topLevel));
};

function createAlbumHierarchy(albumsByFullDate, dateSegment) {
  if (!albumsByFullDate.hasOwnProperty(dateSegment)) {
    // create parent albums first
    var parentDate = path.dirname(dateSegment);
    if (parentDate !== '.') {
      createAlbumHierarchy(albumsByFullDate, parentDate);
    }
    // then create album if it doesn't exist
    var lastDateSegment = path.basename(dateSegment);
    albumsByFullDate[dateSegment] = new Album({title: lastDateSegment});
    // then attach to parent
    if (parentDate !== '.') {
      albumsByFullDate[parentDate].albums.push(albumsByFullDate[dateSegment]);
    }
  }
}
