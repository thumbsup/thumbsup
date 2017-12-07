/*
--------------------------------------------------------------------------------
Indexes all photos and videos in the input folder, and parses their metadata
Caches the results in <thumbsup.db> for faster re-runs
--------------------------------------------------------------------------------
*/

const hierarchy = require('../input/hierarchy.js')
const Index = require('../components/index/index')
const mapper = require('../input/mapper')
const Metadata = require('../model/metadata')
const File = require('../model/file')
const Observable = require('zen-observable')
const path = require('path')
const Picasa = require('../input/picasa')

exports.run = function (opts, callback) {
  return new Observable(observer => {
    const picasaReader = new Picasa()
    const index = new Index(path.join(opts.output, 'thumbsup.db'))
    const emitter = index.update(opts.input)
    const files = []

    // after a file is indexed
    var lastPercent = -1
    emitter.on('progress', stats => {
      const percent = Math.floor(stats.processed * 100 / stats.total)
      if (percent > lastPercent) {
        observer.next(`Indexing ${stats.processed}/${stats.total} (${percent}%)`)
        lastPercent = percent
      }
    })

    // emmitted for every file once indexing is finished
    emitter.on('file', file => {
      const picasa = picasaReader.file(file.metadata.SourceFile)
      const meta = new Metadata(file.metadata, picasa || {})
      const model = new File(file.metadata, meta, opts)
      // only include valid photos and videos (i.e. exiftool recognised the format)
      if (model.type !== 'unknown') {
        files.push(model)
      }
    })

    // finished, we can create the albums
    emitter.on('done', stats => {
      const albumMapper = mapper.create(opts)
      const album = hierarchy.createAlbums(files, albumMapper, opts)
      callback(null, files, album)
      observer.complete()
    })
  })
}
