#!/usr/bin/env node

const fs = require('node:fs')
const moment = require('moment')
const dependencies = require('../src/cli/dependencies')
const messages = require('../src/cli/messages')
const options = require('../src/cli/options')

console.log('')

// Read all options from the command-line / config file
const args = process.argv.slice(2)
const opts = options.get(args)

// Only require the index after logging options have been set
fs.mkdirSync(opts.output, { recursive: true })
require('./log').init(opts.log, opts.logFile)
const index = require('../src/index')

// If this is the first run, display a welcome message
const firstRun = fs.existsSync(opts.databaseFile) === false
if (firstRun) {
  console.log(`${messages.GREETING()}\n`)
}

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
    console.log(messages.SUCCESS(stats) + '\n')
    exit(0)
  }
})

// Print an error report and exit
// Note: remove "err.context" (entire data model) which can make the output hard to read
function handleError (err) {
  delete err.context
  require('debug')('thumbsup:error')(err)
  console.error('\nUnexpected error', err.message)
  console.error(`\n${messages.SORRY(opts.logFile)}\n`)
  exit(1)
}

// Force a successful or failed exit
// This is required because capturing unhandled errors will make Listr run forever
function exit (code) {
  process.exit(code)
}

// Count the total number of nested albums
function countAlbums (total, album) {
  return 1 + album.albums.reduce(countAlbums, total)
}
