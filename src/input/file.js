const moment = require('moment')
const output = require('./output')

const MIME_REGEX = /([^/]+)\/(.*)/
const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

/*
  Represents a source file on disk and how it maps to output files
  + all known metadata
*/
function File (dbEntry, opts) {
  this.meta = dbEntry
  this.path = dbEntry.SourceFile
  this.date = fileDate(dbEntry)
  this.type = mediaType(dbEntry)
  this.output = output.paths(this.path, this.mediaType, opts)
}

function fileDate (dbEntry) {
  return moment(dbEntry.File.FileModifyDate, EXIF_DATE_FORMAT).valueOf()
}

function mediaType (dbEntry) {
  const match = MIME_REGEX.exec(dbEntry.File.MIMEType)
  // "image" or "video"
  if (match) return match[1]
  return 'unknown'
}

module.exports = File
