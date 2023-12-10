/*
--------------------------------------------------------------------------------
Represents a file on disk, inside the input folder
Also includes how it maps to the different output files
--------------------------------------------------------------------------------
*/

const path = require('node:path')
const _ = require('lodash')
const moment = require('moment')
const output = require('./output')
const url = require('./url')

const MIME_REGEX = /([^/]+)\/(.*)/
const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

let index = 0

class File {
  constructor (dbEntry, meta, opts) {
    this.id = ++index
    this.path = dbEntry.SourceFile
    this.filename = path.basename(dbEntry.SourceFile)
    this.date = fileDate(dbEntry)
    this.type = mediaType(dbEntry)
    this.isVideo = (this.type === 'video')
    this.output = output.paths(this.path, this.type, opts || {})
    this.urls = _.mapValues(this.output, o => url.fromPath(o.path))
    this.meta = meta
  }
}

function fileDate (dbEntry) {
  return moment(dbEntry.File.FileModifyDate, EXIF_DATE_FORMAT).valueOf()
}

function mediaType (dbEntry) {
  const match = MIME_REGEX.exec(dbEntry.File.MIMEType)
  if (match && match[1] === 'image') return 'image'
  if (match && match[1] === 'video') return 'video'
  return 'unknown'
}

module.exports = File
