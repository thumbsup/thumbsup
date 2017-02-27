const moment = require('moment')

const MIME_REGEX = /([^/])\/(.*)/
const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

function File (dbFile) {
  this.path = dbFile.SourceFile
  this.fileDate = fileDate(dbFile)
  this.mediaType = mediaType(dbFile)
  this.exif = {
    date: exifDate(dbFile),
    caption: caption(dbFile)
  }
}

function mediaType (dbFile) {
  const match = MIME_REGEX.exec(dbFile.File.MIMEType)
  if (match) return match[1]
  return 'unknown'
}

function fileDate (dbFile) {
  return moment(dbFile.File.FileModifyDate, EXIF_DATE_FORMAT).valueOf()
}

function exifDate (dbFile) {
  if (!dbFile.EXIF) return null
  return moment(dbFile.EXIF.DateTimeOriginal, EXIF_DATE_FORMAT).valueOf()
}

function caption (dbFile) {
  return dbFile.EXIF ? dbFile.EXIF.ImageDescription : null
}

module.exports = File
