const debug = require('debug')('thumbsup')
const exifdb = require('exiftool-json-db')
const pad = require('pad')
const progress = require('../utils/progress')

exports.update = function(media, databasePath, callback) {

  var updateBar = null
  var emitter = null

  try {
    emitter = exifdb.create({media: media, database: databasePath})
  } catch (ex) {
    const message = 'Loading database\n' + ex.toString() + '\n' +
      'If migrating from thumbsup v1, delete <metadata.json> to rebuild the database from scratch'
    callback(new Error(message))
  }

  emitter.on('stats', (stats) => {
    debug(`Database stats: total=${stats.total}`)
    const totalBar = progress.create('List media files', stats.total)
    totalBar.tick(stats.total)
    updateBar = progress.create('Updating database', stats.added + stats.modified)
    if (stats.added + stats.modified === 0) {
      updateBar.tick(1)
    }
  })

  emitter.on('file', (file) => {
    updateBar.tick()
  })

  emitter.on('done', (files) => {
    callback(null, files)
  })

  emitter.on('error', callback)

}
