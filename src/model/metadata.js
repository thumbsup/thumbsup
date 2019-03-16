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
  constructor (exiftool, picasa, opts) {
    // standardise metadata
    this.date = getDate(exiftool)
    this.caption = caption(exiftool)
    this.keywords = keywords(exiftool, picasa)
    this.video = video(exiftool)
    this.animated = animated(exiftool)
    this.rating = rating(exiftool)
    this.favourite = favourite(picasa)
    const size = dimensions(exiftool)
    this.width = size.width
    this.height = size.height
    this.exif = opts ? (opts.embedExif ? exiftool.EXIF : undefined) : undefined
    // metadata could also include fields like
    //  - lat = 51.5
    //  - long = 0.12
    //  - country = "England"
    //  - city = "London"
    //  - aperture = 1.8
  }
}

function getDate (exif) {
  // first, check if there's a valid date in the metadata
  const metadate = getMetaDate(exif)
  if (metadate) return metadate.valueOf()
  // next, check if the filename looks like a date
  const namedate = getFilenameDate(exif)
  if (namedate) return namedate.valueOf()
  // otherwise, fallback to the last modified date
  return moment(exif.File.FileModifyDate, EXIF_DATE_FORMAT).valueOf()
}

function getMetaDate (exif) {
  const date = tagValue(exif, 'EXIF', 'DateTimeOriginal') ||
               tagValue(exif, 'H264', 'DateTimeOriginal') ||
               tagValue(exif, 'QuickTime', 'ContentCreateDate') ||
               tagValue(exif, 'QuickTime', 'CreationDate') ||
               tagValue(exif, 'QuickTime', 'CreateDate')
  if (date) {
    const parsed = moment(date, EXIF_DATE_FORMAT)
    if (parsed.isValid()) return parsed
  }
  return null
}

function getFilenameDate (exif) {
  const filename = path.basename(exif.SourceFile)
  if (FILENAME_DATE_REGEX.test(filename)) {
    const parsed = moment(filename, FILENAME_DATE_FORMAT)
    if (parsed.isValid()) return parsed
  }
  return null
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
  // try Picasa (comma-separated)
  const picasaValues = picasaValue(picasa, 'keywords')
  if (picasaValues) return picasaValues.split(',')
  // try IPTC (string or array)
  const iptcValues = tagValue(exif, 'IPTC', 'Keywords')
  if (iptcValues) return makeArray(iptcValues)
  // no keywords
  return []
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

function makeArray (value) {
  return Array.isArray(value) ? value : [value]
}

function dimensions (exif) {
  // Use the Composite field to avoid having to check all possible tag groups (EXIF, QuickTime, ASF...)
  if (!exif.Composite) {
    return {
      width: null,
      height: null
    }
  } else {
    const size = exif.Composite.ImageSize
    const x = size.indexOf('x')
    return {
      width: parseInt(size.substr(0, x), 10),
      height: parseInt(size.substr(x + 1), 10)
    }
  }
}

module.exports = Metadata
