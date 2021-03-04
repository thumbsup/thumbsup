const childProcess = require('child_process')
const trace = require('debug')('thumbsup:trace')
const debug = require('debug')('thumbsup:debug')
const error = require('debug')('thumbsup:error')
const es = require('event-stream')
const JSONStream = require('JSONStream')
const through2 = require('through2')

/*
  Spawn a single <exiftool> process and send all the files to be parsed
  Returns a stream which emits JS objects as they get returned
*/
exports.parse = (rootFolder, filePaths) => {
  const args = [
    '-a', // include duplicate tags
    '-s', // use tag ID, not display name
    '-g', // include group names, as nested structures
    '-c', // specify format for GPS lat/long
    '%+.6f', // lat/long = float values
    '-struct', // preserve XMP structure
    '-json', // JSON output
    '-charset', // allow UTF8 filenames
    'filename=utf8', // allow UTF8 filenames
    '-@', // specify more arguments separately
    '-' // read arguments from standard in
  ]

  // create a new <exiftool> child process
  const child = childProcess.spawn('exiftool', args, {
    cwd: rootFolder,
    stdio: [ 'pipe', 'pipe', 'pipe' ]
  })
  child.on('error', (err) => {
    error(`Error: please verify that <exiftool> is installed on your system`)
    error(err.toString())
  })
  child.on('close', (code, signal) => {
    debug(`Exiftool exited with code ${code}`)
  })

  child.stderr.on('data', chunk => {
    trace('Exiftool output:', chunk.toString())
  })

  // write all files to <stdin>
  // exiftool will only start processing after <stdin> is closed
  const allFiles = filePaths.join('\n')
  child.stdin.write(allFiles + '\n')
  child.stdin.end()

  // stream <stdout> into a JSON parser
  // parse every top-level object and emit it on the stream
  return es.pipeline(
    child.stdout,
    through2(chunkToString),
    JSONStream.parse([true])
  )
}

function chunkToString (chunk, enc, callback) {
  // convert to string to help JSONStream deal with odd encodings
  this.push(chunk.toString())
  callback()
}
