const _ = require('lodash')
const debug = require('debug')('thumbsup:debug')
const es = require('event-stream')
const exiftool = require('./stream.js')
const os = require('os')

/*
  Fans out the list of files to multiple exiftool processes (default = CPU count)
  Returns a single stream of javascript objects, parsed from the JSON response
*/
exports.parse = (rootFolder, filePaths, concurrency) => {
  // create several buckets of work
  const workers = concurrency || os.cpus().length
  const buckets = _.chunk(filePaths, Math.ceil(filePaths.length / workers))
  debug(`Split files into ${buckets.length} batches for exiftool`)
  // create several <exiftool> streams that can work in parallel
  const streams = _.range(buckets.length).map(i => {
    debug(`Calling exiftool with ${buckets[i].length} files`)
    return exiftool.parse(rootFolder, buckets[i])
  })
  // merge the object streams
  return es.merge(streams)
}
