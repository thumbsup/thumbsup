const _ = require('lodash')
const moment = require('moment')
const path = require('path')

const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'
var index = 0;

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
  const desc = file.meta.EXIF ? file.meta.EXIF['ImageDescription'] : null
  const caption = file.meta.IPTC ? file.meta.IPTC['Caption-Abstract'] : null
  return desc || caption
}

function animated (file) {
  if (file.meta.File['MIMEType'] !== 'image/gif') return false
  if (file.meta.GIF && file.meta.GIF.FrameCount > 0) return true
  return false
}

module.exports = Media
