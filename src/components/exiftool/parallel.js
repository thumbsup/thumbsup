const _ = require('lodash')
const os = require('os')
const es = require('event-stream')
const exiftool = require('./stream.js')

/*
  Fans out the list of files to multiple exiftool processes (= CPU count)
  Returns a single stream of javascript objects, parsed from the JSON response
*/
exports.parse = (rootFolder, filePaths) => {
  // create several buckets of work
  const workers = os.cpus().length
  const buckets = _.chunk(filePaths, Math.ceil(filePaths.length / workers))
  // create several <exiftool> streams that can work in parallel
  const streams = _.range(buckets.length).map(i => {
    return exiftool.parse(rootFolder, buckets[i])
  })
  // merge the object streams
  return es.merge(streams)
}
