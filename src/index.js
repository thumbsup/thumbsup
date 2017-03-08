const async = require('async')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const database = require('./input/database')
const progress = require('./utils/progress')
const File = require('./input/file')
const hierarchy = require('./model/hierarchy.js')
const mapper = require('./model/mapper')
const Media = require('./model/media')
const resize = require('./output-media/resize')
const tasks = require('./output-media/tasks')
const website = require('./output-website/website')

exports.build = function (opts) {
  resize.sizes.thumb = opts.thumbSize
  resize.sizes.large = opts.largeSize

  fs.mkdirpSync(opts.output)
  const databaseFile = path.join(opts.output, 'metadata.json')

  var album = null        // root album with nested albums
  var fileCollection = null   // all files in the database

  async.series([

    function updateDatabase (callback) {
      database.update(opts.input, databaseFile, (err, dbFiles) => {
        fileCollection = dbFiles.map(f => new File(f, opts))
        callback(err)
      })
    },

    function processPhotos (callback) {
      const photos = tasks.create(opts, fileCollection, 'image')
      const bar = progress.create('Processing photos', photos.length)
      parallel(photos, bar, callback)
    },

    function processVideos (callback) {
      const videos = tasks.create(opts, fileCollection, 'video')
      const bar = progress.create('Processing videos', videos.length)
      parallel(videos, bar, callback)
    },

    function createAlbums (callback) {
      const bar = progress.create('Creating albums')
      const albumMapper = mapper.create(opts)
      const mediaCollection = fileCollection.map(f => new Media(f))
      album = hierarchy.createAlbums(mediaCollection, albumMapper, opts)
      bar.tick(1)
      callback()
    },

    function createWebsite (callback) {
      const bar = progress.create('Building website')
      website.build(album, opts, (err) => {
        bar.tick(1)
        callback(err)
      })
    }

  ], finish)
}

function parallel (tasks, bar, callback) {
  const decorated = tasks.map(t => done => {
    t(err => {
      bar.tick(1)
      done(err)
    })
  })
  async.parallelLimit(decorated, os.cpus().length, callback)
}

function finish (err) {
  console.log(err ? 'Unexpected error' : '')
  console.log(err || 'Gallery generated successfully')
  console.log()
  process.exit(err ? 1 : 0)
}
