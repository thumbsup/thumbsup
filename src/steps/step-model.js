const Picasa = require('../input/picasa')
const mapper = require('../input/mapper')
const hierarchy = require('../input/hierarchy.js')
const File = require('../model/file')
const Metadata = require('../model/metadata')

exports.run = function (database, opts, callback) {
  const picasaReader = new Picasa()
  // create a flat array of files
  const files = database.map(entry => {
    // create standarised metadata model
    const picasa = picasaReader.file(entry.SourceFile)
    const meta = new Metadata(entry, picasa || {})
    // create a file entry for the albums
    return new File(entry, meta, opts)
  })
  // create the full album hierarchy
  const albumMapper = mapper.create(opts)
  const album = hierarchy.createAlbums(files, albumMapper, opts)
  // return the results
  return {files, album}
}
