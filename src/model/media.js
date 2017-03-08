const _ = require('lodash')
const moment = require('moment')
const path = require('path')

const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'
var index = 0

/*
  View model for album entries
*/
function Media (file) {
  this.id = ++index
  this.file = file
  this.filename = path.basename(file.path)
  this.urls = _.mapValues(file.output, o => o.path)
  this.date = exifDate(file)
  this.caption = caption(file)
  this.isVideo = (file.type === 'video')
  this.isAnimated = animated(file)
  // view model could also include fields like
  //  - country = "England"
  //  - city = "London"
  //  - exif summary = [
  //   { field: "Aperture", icon: "fa-camera", value: "1.8" }
  // ]
}

function exifDate (file) {
  if (!file.meta.EXIF) return file.date
  const exifDate = moment(file.meta.EXIF['DateTimeOriginal'], EXIF_DATE_FORMAT).valueOf()
  return exifDate || file.date
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

function tagValue (file, type, name) {
  if (!file.meta[type]) return null
  return file.meta[type][name]
}

module.exports = Media
