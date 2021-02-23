/*
--------------------------------------------------------------------------------
Represents an album, which is made of many photos and videos
This is a virtual grouping of files, independent of the location on disk
A single photo/video could exist in multiple albums
--------------------------------------------------------------------------------
*/

const _ = require('lodash')
const path = require('path')
const slugify = require('slugify')
const url = require('./url')

var index = 0

// number of images to show in the album preview grid
const PREVIEW_COUNT = 10
const SLUGIFY_OPTIONS = { replacement: '-', remove: /[*+~.()'"!:@]/g }

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
    thumbnail: 'public/missing.png',
    small: 'public/missing.png'
  }
}

function Album (opts) {
  if (typeof opts === 'string') opts = { title: opts }
  this.id = opts.id || ++index
  this.title = opts.title || ('Album ' + this.id)
  this.basename = slugify(this.title, SLUGIFY_OPTIONS)
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
    this.url = url.fromPath(this.path)
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
  this.pickPreviews(options)
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
  const sortAlbumsBy = getItemOrLast(options.sortAlbumsBy, this.depth)
  const sortAlbumsDirection = getItemOrLast(options.sortAlbumsDirection, this.depth)
  const sortMediaBy = getItemOrLast(options.sortMediaBy, this.depth)
  const sortMediaDirection = getItemOrLast(options.sortMediaDirection, this.depth)
  this.files = _.orderBy(this.files, SORT_MEDIA_BY[sortMediaBy], sortMediaDirection)
  this.albums = _.orderBy(this.albums, SORT_ALBUMS_BY[sortAlbumsBy], sortAlbumsDirection)
}

Album.prototype.pickPreviews = function (options) {
  // consider nested albums if there aren't enough photos
  var potential = this.files
  if (potential.length < PREVIEW_COUNT) {
    const nested = _.flatMap(this.albums, 'previews').filter(file => file !== PREVIEW_MISSING)
    potential = potential.concat(nested)
  }
  // choose the previews
  if (!options.albumPreviews || options.albumPreviews === 'first') {
    this.previews = _.slice(potential, 0, PREVIEW_COUNT)
  } else if (options.albumPreviews === 'random') {
    this.previews = _.sampleSize(potential, PREVIEW_COUNT)
  } else if (options.albumPreviews === 'spread') {
    if (potential.length < PREVIEW_COUNT) {
      this.previews = _.slice(potential, 0, PREVIEW_COUNT)
    } else {
      const bucketSize = Math.floor(potential.length / PREVIEW_COUNT)
      const buckets = _.chunk(potential, bucketSize)
      this.previews = buckets.slice(0, PREVIEW_COUNT).map(b => b[0])
    }
  } else {
    throw new Error(`Unsupported preview type: ${options.albumPreviews}`)
  }

  // and fill any gap with a placeholder
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

function getItemOrLast (array, index) {
  if (typeof (array) === 'undefined') return undefined
  if (typeof (array) === 'string') return array
  if (index > array.length) return array[array.length - 1]
  return array[index]
}

// for testing purposes
Album.resetIds = function () {
  index = 0
}

module.exports = Album
