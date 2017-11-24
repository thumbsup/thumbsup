/*
--------------------------------------------------------------------------------
Provides most metadata based on the output of <exiftool>
Caches the resulting DB in <metadata.json> for faster re-runs
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
    // console.log(`RAM before index: ${ram()} MB`)
    const picasaReader = new Picasa()
    const index = new Index(path.join(opts.output, 'thumbsup.db'))
    const emitter = index.update(opts.input)
    const files = []
    // var total = 0
    emitter.on('stats', stats => {
      // console.log(stats)
      // total = stats.added + stats.modified
    })
    emitter.on('progress', stats => {
      observer.next(`Indexing ${stats.processed}/${stats.total}`)
    })
    emitter.on('file', file => {
      const picasa = picasaReader.file(file.metadata.SourceFile)
      const meta = new Metadata(file.metadata, picasa || {})
      const model = new File(file.metadata, meta, opts)
      files.push(model)
    })
    emitter.on('done', stats => {
      const albumMapper = mapper.create(opts)
      const album = hierarchy.createAlbums(files, albumMapper, opts)
      // console.log(`RAM after index: ${ram()} MB`)
      callback(null, files, album)
      observer.complete()
    })
  })
}
