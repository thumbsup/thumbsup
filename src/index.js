const async = require('async')
const fs = require('fs-extra')
const pad = require('pad')
const path = require('path')
const database = require('./input/database')
const progress = require('./utils/progress')
const File = require('./input/file')
const Media = require('./model/media')
const hierarchy = require('./model/hierarchy.js')
const resize = require('./output-media/resize')
const website = require('./output-website/website')

exports.build = function (opts) {

  resize.sizes.thumb = opts.thumbSize
  resize.sizes.large = opts.largeSize

  fs.mkdirpSync(opts.output)
  const media = path.join(opts.output, 'media')
  const databaseFile = path.join(opts.output, 'metadata.json')

  var album = null        // root album with nested albums
  var collection = null   // all files in the database

  async.series([

    function updateDatabase (callback) {
      database.update(opts.input, databaseFile, (err, dbFiles) => {
        collection = dbFiles.map(f => new File(f, opts))
        callback(err)
      })
    },

    function processPhotos (callback) {
      const tasks = require('./output-media/tasks')
      const imageTasks = tasks.create(opts, collection, 'image')
      const imageBar = progress.create('Processing photos', imageTasks.length)
      async.parallelLimit(imageTasks.map(asyncProgress(imageBar)), 2, callback)
    },

    function processVideos (callback) {
      const tasks = require('./output-media/tasks')
      const videoTasks = tasks.create(opts, collection, 'video')
      const videoBar = progress.create('Processing videos', videoTasks.length)
      async.parallelLimit(videoTasks.map(asyncProgress(videoBar)), 2, callback)
    },

    function createAlbums (callback) {
      const bar = progress.create('Creating albums')
      const mediaCollection = collection.map(f => new Media(f))
      album = hierarchy.createAlbums(mediaCollection, opts)
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

function asyncProgress (bar) {
  return fn => {
    return done => {
      fn(err => {
        bar.tick(1)
        done(err)
      })
    }
  }
}

function finish (err) {
  console.log(err ? 'Unexpected error' : '')
  console.log(err || 'Gallery generated successfully')
  console.log()
  process.exit(err ? 1 : 0)
}
