#!/usr/bin/env node

const Analytics = require('./analytics')
const fs = require('fs')
const messages = require('./messages')
const path = require('path')
const options = require('./options')
const tty = require('tty')

console.log('')

// Read all options from the command-line / config file
const opts = options.get()

// If stdout is non TTY, make sure there is at least some text logging on stderr
if (!opts.log && tty.isatty(process.stdout.fd) === false) {
  opts.log = 'info'
}
// Only require the index after logging options have been set
require('./log').init(opts.log)
const index = require('../src/index')

// If this is the first run, display a welcome message
const indexPath = path.join(opts.output, 'thumbsup.db')
const firstRun = fs.existsSync(indexPath) === false
if (firstRun) {
  console.log(`${messages.GREETING()}\n`)
}

// Basic usage report (anonymous statistics)
const analytics = new Analytics({
  enabled: opts['usageStats']
})
analytics.start()

// Catch all exceptions and exit gracefully
process.on('uncaughtException', handleError)

// Build the gallery!
index.build(opts, (err, album) => {
  if (err) {
    handleError(err)
  } else {
    const stats = {
      albums: countAlbums(0, album),
      photos: album.stats.photos,
      videos: album.stats.videos
    }
    analytics.finish(stats)
    const message = messages.SUCCESS(stats)
    console.log(`\n${message}\n`)
    exit(0)
  }
})

// Print an error report and exit
// Note: remove "err.context" (entire data model) which can make the output hard to read
function handleError (err) {
  analytics.error()
  delete err.context
  console.error('\nUnexpected error', err)
  console.error(`\n${messages.SORRY()}\n`)
  exit(1)
}

// Force a successful or failed exit
// This is required
// - because capturing unhandled errors will make Listr run forever
// - to ensure pending Analytics HTTP requests don't keep the tool running
function exit (code) {
  // just some time to ensure analytics has time to fire
  setTimeout(() => process.exit(code), 10)
}

// Cound the total number of nested albums
function countAlbums (total, album) {
  return 1 + album.albums.reduce(countAlbums, total)
}
