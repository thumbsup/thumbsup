var _ = require('lodash');
var index = 0;

// number of images to show in the album preview grid
var PREVIEW_COUNT = 10;

var SORT_ALBUMS_BY = {
  'title': function(album) { return album.title; },
  'start-date': function(album) { return album.stats.fromDate; },
  'end-date': function(album) { return album.stats.toDate; }
};

var SORT_MEDIA_BY = {
  'filename': function(file) { return file.filename; },
  'date': function(file) { return file.date; }
};

var PREVIEW_MISSING = {
  urls: {
    thumb: 'public/missing.png'
  }
};

function Album(opts) {
  if (typeof opts === 'string') opts = { title: opts };
  this.id = opts.id || ++index;
  this.title = opts.title || ('Album ' + this.id);
  this.filename = sanitise(this.title);
  this.files = opts.files || [];
  this.albums = opts.albums || [];
  this.depth = 0;
  this.home = false;
  this.stats = null;
  this.previews = null;
  this.allFiles = [];
}

Album.prototype.finalize = function(options) {
  options = options || {};
  // is this the top-level album?
  this.home = this.depth === 0;
  // finalize all nested albums first (recursive)
  // and set a nested filename
  for (var i = 0; i < this.albums.length; ++i) {
    var prefix = this.home ? '' : (this.filename + '-');
    this.albums[i].filename = prefix + this.albums[i].filename;
    this.albums[i].depth = this.depth + 1;
    this.albums[i].finalize(options);
  }
  // perform stats & other calculations
  // once the nested albums have been finalized too
  this.calculateStats();
  this.calculateSummary();
  this.sort(options);
  this.pickPreviews();
  this.aggregateAllFiles();
};

Album.prototype.calculateStats = function() {
  // nested albums
  var nestedPhotos    = _.map(this.albums, 'stats.photos');
  var nestedVideos    = _.map(this.albums, 'stats.videos');
  var nestedFromDates = _.map(this.albums, 'stats.fromDate');
  var nestedToDates   = _.map(this.albums, 'stats.toDate');
  // current level
  var currentPhotos   = _.filter(this.files, {isVideo: false}).length;
  var currentVideos   = _.filter(this.files, {isVideo: true}).length;
  var currentFromDate = _.map(this.files, 'date');
  var currentToDate   = _.map(this.files, 'date');
  // aggregate all stats
  this.stats = {
    albums:   this.albums.length,
    photos:   _.sum(_.compact(_.concat(nestedPhotos, currentPhotos))) || 0,
    videos:   _.sum(_.compact(_.concat(nestedVideos, currentVideos))) || 0,
    fromDate: _.min(_.compact(_.concat(nestedFromDates, currentFromDate))),
    toDate:   _.max(_.compact(_.concat(nestedToDates, currentToDate)))
  };
  this.stats.total = this.stats.photos + this.stats.videos;
}

Album.prototype.calculateSummary = function() {
  var items = [
    itemCount(this.stats.albums, 'album'),
    itemCount(this.stats.photos, 'photo'),
    itemCount(this.stats.videos, 'video')
  ];
  this.summary = _.compact(items).join(', ');
};

Album.prototype.sort = function(options) {
  this.files = _.orderBy(this.files, SORT_MEDIA_BY[options.sortMediaBy], options.sortMediaDirection);
  this.albums = _.orderBy(this.albums, SORT_ALBUMS_BY[options.sortAlbumsBy], options.sortAlbumsDirection);
};

Album.prototype.pickPreviews = function() {
  // also consider previews from nested albums
  var nestedPicks =  _.flatten(_.map(this.albums, 'previews')).filter(function(file) {
    return file !== PREVIEW_MISSING;
  });
  // then pick the top ones
  var potentialPicks = _.concat(this.files, nestedPicks);
  this.previews = potentialPicks.slice(0, PREVIEW_COUNT);
  // and fill the gap with a placeholder
  var missing = PREVIEW_COUNT - this.previews.length;
  for (var i = 0; i < missing; ++i) {
    this.previews.push(PREVIEW_MISSING);
  }
};

Album.prototype.aggregateAllFiles = function() {
  var nestedFiles = _.flatten(_.map(this.albums, 'allFiles'))
  this.allFiles = _.concat(nestedFiles, this.files);
};

function sanitise(filename) {
  return filename.replace(/[^a-z0-9-_]/ig, '');
}

function itemCount(count, type) {
  if (count === 0) return '';
  var plural = (count > 1) ? 's' : '';
  return '' + count + ' ' + type + plural;
}

// for testing purposes
Album.resetIds = function() {
  index = 0;
};

module.exports = Album;
