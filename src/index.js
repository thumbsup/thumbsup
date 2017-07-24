const async = require('async')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const cleanup = require('./output-media/cleanup')
const database = require('./input/database')
const progress = require('./utils/progress')
const File = require('./input/file')
const hierarchy = require('./model/hierarchy.js')
const mapper = require('./model/mapper')
const Media = require('./model/media')
const tasks = require('./output-media/tasks')
const website = require('./output-website/website')
const jsonModel = require('./output-website/json-model')

exports.build = function (opts) {
  fs.mkdirpSync(opts.output)
  const databaseFile = path.join(opts.output, 'metadata.json')

  var album = null        // root album with nested albums
  var fileCollection = null   // all files in the database

  async.series([

    function updateDatabase (callback) {
      database.update(opts.input, databaseFile, (err, dbFiles) => {
        if (err) return callback(err)
        fileCollection = dbFiles.map(f => new File(f, opts))
        callback()
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

    function removeOldOutput (callback) {
      if (!opts.cleanup) return callback()
      cleanup.run(fileCollection, opts.output, callback)
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
      if (!opts.createWebsite) return callback()
      const bar = progress.create('Building website')
      website.build(album, opts, (err) => {
        bar.tick(1)
        callback(err)
      })
    },

    function exportModel (callback) {
      if (!opts.exportModel) return callback()
      const bar = progress.create('Exporting JSON albums')
      const targetPath = path.join(opts.output, 'albums.json')
      const json = jsonModel.from(album)
      fs.writeFile(targetPath, json, (err) => {
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
