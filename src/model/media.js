const _ = require('lodash')
const moment = require('moment')
const path = require('path')

const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

// infer dates from files with a date-looking filename
const FILENAME_DATE_REGEX = /\d{4}[_\-.\s]?(\d{2}[_\-.\s]?){5}\..{3,4}/

// moment ignores non-numeric characters when parsing
const FILENAME_DATE_FORMAT = 'YYYYMMDD HHmmss'

var index = 0

/*
  View model for album entries
*/
function Media (file) {
  this.id = ++index
  // TODO: see if this is useful in the future
  // this.file = _.omit(file, ['meta', 'output'])
  this.filename = path.basename(file.path)
  this.urls = _.mapValues(file.output, o => o.path)
  this.date = getDate(file)
  this.caption = caption(file)
  this.isVideo = (file.type === 'video')
  this.isAnimated = animated(file)
  this.rating = rating(file)
  // view model could also include fields like
  //  - country = "England"
  //  - city = "London"
  //  - exif summary = [
  //   { field: "Aperture", icon: "fa-camera", value: "1.8" }
  // ]
}

function getDate (file) {
  const date = tagValue(file, 'EXIF', 'DateTimeOriginal') ||
               tagValue(file, 'H264', 'DateTimeOriginal') ||
               tagValue(file, 'QuickTime', 'CreationDate')
  if (date) {
    return moment(date, EXIF_DATE_FORMAT).valueOf()
  } else {
    if (FILENAME_DATE_REGEX.test(file.path)) {
      const namedate = moment(file.path, FILENAME_DATE_FORMAT)
      if (namedate.isValid()) return namedate.valueOf()
    }
    return file.date
  }
}

function caption (file) {
  return tagValue(file, 'EXIF', 'ImageDescription') ||
         tagValue(file, 'IPTC', 'Caption-Abstract') ||
         tagValue(file, 'IPTC', 'Headline') ||
         tagValue(file, 'XMP', 'Description') ||
         tagValue(file, 'XMP', 'Title') ||
         tagValue(file, 'XMP', 'Label')
}

function animated (file) {
  if (file.meta.File['MIMEType'] !== 'image/gif') return false
  if (file.meta.GIF && file.meta.GIF.FrameCount > 0) return true
  return false
}

function rating (file) {
  if (!file.meta.XMP) return 0
  return file.meta.XMP['Rating'] || 0
}

function tagValue (file, type, name) {
  if (!file.meta[type]) return null
  return file.meta[type][name]
}

module.exports = Media
