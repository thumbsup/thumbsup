/*
--------------------------------------------------------------------------------
Standardised metadata for a given image or video
This is based on parsing "provider data" such as Exiftool or Picasa
--------------------------------------------------------------------------------
*/

const moment = require('moment')
const path = require('path')

// mime type for videos
const MIME_VIDEO_REGEX = /^video\/.*$/

// standard EXIF date format, which is different from ISO8601
const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

// infer dates from files with a date-looking filename
const FILENAME_DATE_REGEX = /\d{4}[_\-.\s]?(\d{2}[_\-.\s]?){5}\..{3,4}/

// moment ignores non-numeric characters when parsing
const FILENAME_DATE_FORMAT = 'YYYYMMDD HHmmss'

class Metadata {
  constructor (exiftool, picasa) {
    // standardise metadata
    this.date = getDate(exiftool)
    this.caption = caption(exiftool)
    this.keywords = keywords(exiftool, picasa)
    this.video = video(exiftool)
    this.animated = animated(exiftool)
    this.rating = rating(exiftool)
    this.favourite = favourite(picasa)
    // metadata could also include fields like
    //  - lat = 51.5
    //  - long = 0.12
    //  - country = "England"
    //  - city = "London"
    //  - aperture = 1.8
  }
}

function getDate (exif) {
  const date = tagValue(exif, 'EXIF', 'DateTimeOriginal') ||
               tagValue(exif, 'H264', 'DateTimeOriginal') ||
               tagValue(exif, 'QuickTime', 'CreationDate')
  if (date) {
    return moment(date, EXIF_DATE_FORMAT).valueOf()
  } else {
    const filename = path.basename(exif.SourceFile)
    if (FILENAME_DATE_REGEX.test(filename)) {
      const namedate = moment(filename, FILENAME_DATE_FORMAT)
      if (namedate.isValid()) return namedate.valueOf()
    }
    return moment(exif.File.FileModifyDate, EXIF_DATE_FORMAT).valueOf()
  }
}

function caption (exif, picasa) {
  return picasaValue(picasa, 'caption') ||
         tagValue(exif, 'EXIF', 'ImageDescription') ||
         tagValue(exif, 'IPTC', 'Caption-Abstract') ||
         tagValue(exif, 'IPTC', 'Headline') ||
         tagValue(exif, 'XMP', 'Description') ||
         tagValue(exif, 'XMP', 'Title') ||
         tagValue(exif, 'XMP', 'Label')
}

function keywords (exif, picasa) {
  const values = picasaValue(picasa, 'keywords') ||
                 tagValue(exif, 'IPTC', 'Keywords')
  return values ? values.split(',') : []
}

function video (exif) {
  return MIME_VIDEO_REGEX.test(exif.File['MIMEType'])
}

function animated (exif) {
  if (exif.File['MIMEType'] !== 'image/gif') return false
  if (exif.GIF && exif.GIF.FrameCount > 0) return true
  return false
}

function rating (exif) {
  if (!exif.XMP) return 0
  return exif.XMP['Rating'] || 0
}

function favourite (picasa) {
  return picasaValue(picasa, 'star') === 'yes'
}

function tagValue (exif, type, name) {
  if (!exif[type]) return null
  return exif[type][name]
}

function picasaValue (picasa, name) {
  if (typeof picasa !== 'object') return null
  return picasa[name]
}

module.exports = Metadata
