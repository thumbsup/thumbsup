/*
--------------------------------------------------------------------------------
Represents an album, which is made of many photos and videos
This is a virtual grouping of files, independent of the location on disk
A single photo/video could exist in multiple albums
--------------------------------------------------------------------------------
*/

const _ = require('lodash')
const path = require('path')
const url = require('url')
const slugify = require('slugify')
var index = 0

// number of images to show in the album preview grid
const PREVIEW_COUNT = 10

const SORT_ALBUMS_BY = {
  'title': function (album) { return album.title },
  'start-date': function (album) { return album.stats.fromDate },
  'end-date': function (album) { return album.stats.toDate }
}

const SORT_MEDIA_BY = {
  'filename': function (file) { return file.filename },
  'date': function (file) { return file.meta.date }
}

const PREVIEW_MISSING = {
  urls: {
    thumbnail: 'public/missing.png'
  }
}

function Album (opts) {
  if (typeof opts === 'string') opts = { title: opts }
  this.id = opts.id || ++index
  this.title = opts.title || ('Album ' + this.id)
  this.basename = slugify(this.title)
  this.files = opts.files || []
  this.albums = opts.albums || []
  this.depth = 0
  this.home = false
  this.stats = null
  this.previews = null
}

Album.prototype.finalize = function (options, parent) {
  options = options || {}
  var albumsOutputFolder = options.albumsOutputFolder || '.'
  // calculate final file paths and URLs
  if (parent == null) {
    this.path = options.index || 'index.html'
    this.url = options.index || 'index.html'
    this.depth = 0
  } else {
    if (parent.depth > 0) {
      this.basename = parent.basename + '-' + this.basename
    }
    this.path = path.join(albumsOutputFolder, this.basename + '.html')
    this.url = url.resolve(albumsOutputFolder + '/', this.basename + '.html')
    this.depth = parent.depth + 1
  }
  // path to the optional ZIP file
  if (options.albumZipFiles && this.files.length > 0) {
    this.zip = this.path.replace(/\.[^\\/.]+$/, '.zip')
  }
  // then finalize all nested albums (which uses the parent basename)
  for (var i = 0; i < this.albums.length; ++i) {
    this.albums[i].finalize(options, this)
  }
  // perform stats & other calculations
  // once the nested albums have been finalized too
  this.home = this.depth === 0
  this.calculateStats()
  this.calculateSummary()
  this.sort(options)
  this.pickPreviews()
}

Album.prototype.calculateStats = function () {
  // nested albums
  var nestedPhotos = _.map(this.albums, 'stats.photos')
  var nestedVideos = _.map(this.albums, 'stats.videos')
  var nestedFromDates = _.map(this.albums, 'stats.fromDate')
  var nestedToDates = _.map(this.albums, 'stats.toDate')
  // current level
  var currentPhotos = _.filter(this.files, { type: 'image' }).length
  var currentVideos = _.filter(this.files, { type: 'video' }).length
  var currentFromDate = _.map(this.files, 'meta.date')
  var currentToDate = _.map(this.files, 'meta.date')
  // aggregate all stats
  this.stats = {
    albums: this.albums.length,
    photos: _.sum(_.compact(_.concat(nestedPhotos, currentPhotos))) || 0,
    videos: _.sum(_.compact(_.concat(nestedVideos, currentVideos))) || 0,
    fromDate: _.min(_.compact(_.concat(nestedFromDates, currentFromDate))),
    toDate: _.max(_.compact(_.concat(nestedToDates, currentToDate)))
  }
  this.stats.total = this.stats.photos + this.stats.videos
}

Album.prototype.calculateSummary = function () {
  var items = [
    itemCount(this.stats.albums, 'album'),
    itemCount(this.stats.photos, 'photo'),
    itemCount(this.stats.videos, 'video')
  ]
  this.summary = _.compact(items).join(', ')
}

Album.prototype.sort = function (options) {
  this.files = _.orderBy(this.files, SORT_MEDIA_BY[options.sortMediaBy], options.sortMediaDirection)
  this.albums = _.orderBy(this.albums, SORT_ALBUMS_BY[options.sortAlbumsBy], options.sortAlbumsDirection)
}

Album.prototype.pickPreviews = function () {
  // also consider previews from nested albums
  var nestedPicks = _.flatten(_.map(this.albums, 'previews')).filter(function (file) {
    return file !== PREVIEW_MISSING
  })
  // then pick the top ones
  var potentialPicks = _.concat(this.files, nestedPicks)
  this.previews = potentialPicks.slice(0, PREVIEW_COUNT)
  // and fill the gap with a placeholder
  var missing = PREVIEW_COUNT - this.previews.length
  for (var i = 0; i < missing; ++i) {
    this.previews.push(PREVIEW_MISSING)
  }
}

function itemCount (count, type) {
  if (count === 0) return ''
  var plural = (count > 1) ? 's' : ''
  return '' + count + ' ' + type + plural
}

// for testing purposes
Album.resetIds = function () {
  index = 0
}

module.exports = Album
