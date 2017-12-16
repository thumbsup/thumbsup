const async = require('async')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const cleanup = require('./output-media/cleanup')
const database = require('./input/database')
const Picasa = require('./input/picasa')
const progress = require('./utils/progress')
const hierarchy = require('./input/hierarchy.js')
const mapper = require('./input/mapper')
const File = require('./model/file')
const Metadata = require('./model/metadata')
const tasks = require('./output-media/tasks')
const website = require('./output-website/website')

exports.build = function (opts) {
  fs.mkdirpSync(opts.output)
  const databaseFile = path.join(opts.output, 'metadata.json')
  const threads = opts['parallel-threads'] > 0 ? opts['parallel-threads'] : os.cpus().length

  // all files, unsorted
  var files = null

  // root album with nested albums
  var album = null

  async.series([

    function updateDatabase (callback) {
      const picasaReader = new Picasa()
      database.update(opts.input, databaseFile, (err, entries) => {
        if (err) return callback(err)
        files = entries.map(entry => {
          // create standarised metadata model
          const picasa = picasaReader.file(entry.SourceFile)
          const meta = new Metadata(entry, picasa || {})
          // create a file entry for the albums
          return new File(entry, meta, opts)
        })
        callback()
      })
    },

    function processPhotos (callback) {
      const photos = tasks.create(opts, files, 'image')
      const bar = progress.create('Processing photos', photos.length)
      parallel(photos, bar, threads, callback)
    },

    function processVideos (callback) {
      const videos = tasks.create(opts, files, 'video')
      const bar = progress.create('Processing videos', videos.length)
      parallel(videos, bar, threads, callback)
    },

    function removeOldOutput (callback) {
      if (!opts.cleanup) return callback()
      cleanup.run(files, opts.output, callback)
    },

    function createAlbums (callback) {
      const bar = progress.create('Creating albums')
      const albumMapper = mapper.create(opts)
      album = hierarchy.createAlbums(files, albumMapper, opts)
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

function parallel (tasks, bar, threads, callback) {
  const decorated = tasks.map(t => done => {
    t(err => {
      bar.tick(1)
      done(err)
    })
  })
  async.parallelLimit(decorated, threads, callback)
}

function finish (err) {
  console.log(err ? 'Unexpected error' : '')
  console.log(err || 'Gallery generated successfully')
  console.log()
  process.exit(err ? 1 : 0)
}
