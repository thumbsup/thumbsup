#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const Analytics = require('./analytics')
const dependencies = require('./dependencies')
const messages = require('./messages')
const options = require('./options')

console.log('')

// Read all options from the command-line / config file
const args = process.argv.slice(2)
const opts = options.get(args)

// Only require the index after logging options have been set
fs.mkdirpSync(opts.output)
require('./log').init(opts.log, opts.output)
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
process.on('unhandledRejection', handleError)

// Check that all binary dependencies are present
dependencies.checkOptional()
const missingErrors = dependencies.checkRequired()
if (missingErrors) {
  console.log(`${missingErrors}`)
  exit(1)
}

// Global settings
moment.locale(opts.locale)

// Build the gallery!
index.build(opts, (err, result) => {
  console.log('')
  if (err) {
    handleError(err)
  } else {
    // Print any problems
    result.problems.print()
    // And then a summary of the gallery
    const stats = {
      albums: countAlbums(0, result.album),
      photos: result.album.stats.photos,
      videos: result.album.stats.videos
    }
    analytics.finish(stats)
    console.log(messages.SUCCESS(stats) + '\n')
    exit(0)
  }
})

// Print an error report and exit
// Note: remove "err.context" (entire data model) which can make the output hard to read
function handleError (err) {
  analytics.error()
  delete err.context
  require('debug')('thumbsup:error')(err)
  console.error('\nUnexpected error', err.message)
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
