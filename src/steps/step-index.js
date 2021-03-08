/*
--------------------------------------------------------------------------------
Indexes all photos and videos in the input folder, and parses their metadata
Caches the results in <thumbsup.db> for faster re-runs
--------------------------------------------------------------------------------
*/

const path = require('path')
const hierarchy = require('../input/hierarchy.js')
const Index = require('../components/index/index')
const info = require('debug')('thumbsup:info')
const AlbumMapper = require('../input/album-mapper')
const Metadata = require('../model/metadata')
const File = require('../model/file')
const Observable = require('zen-observable')
const Picasa = require('../input/picasa')

exports.run = function (opts, callback) {
  return new Observable(observer => {
    const picasaReader = new Picasa()
    const index = new Index(opts.databaseFile)
    const emitter = index.update(opts.input, opts)
    const files = []

    emitter.on('stats', stats => {
      info('Differences between disk and index', stats)
    })

    // after a file is indexed
    var lastPercent = -1
    emitter.on('progress', stats => {
      const percent = Math.floor(stats.processed * 100 / stats.total)
      if (percent > lastPercent) {
        observer.next(`Indexing ${stats.processed}/${stats.total} (${percent}%)`)
        lastPercent = percent
      }
    })

    // emitted for every file once indexing is finished
    emitter.on('file', file => {
      const filePath = path.join(opts.input, file.metadata.SourceFile)
      const picasa = picasaReader.file(filePath)
      const meta = new Metadata(file.metadata, picasa || {}, opts)
      const model = new File(file.metadata, meta, opts)
      // only include valid photos and videos (i.e. exiftool recognised the format)
      if (model.type !== 'unknown') {
        files.push(model)
      }
    })

    // finished, we can create the albums
    emitter.on('done', stats => {
      const mapper = new AlbumMapper(opts.albumsFrom, opts)
      const album = hierarchy.createAlbums(files, mapper, opts)
      callback(null, files, album)
      observer.complete()
    })
  })
}
