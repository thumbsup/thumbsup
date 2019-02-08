/*
--------------------------------------------------------------------------------
Standardised metadata for a given image or video
This is based on parsing "provider data" such as Exiftool or Picasa
--------------------------------------------------------------------------------
*/

const moment = require('moment')
const path = require('path')
const Null = require('../input/metadata/null')
const Instagram = require('../input/metadata/instagram')

// mime type for videos
const MIME_VIDEO_REGEX = /^video\/.*$/

// standard EXIF date format, which is different from ISO8601
const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ssZ'

// infer dates from files with a date-looking filename
const FILENAME_DATE_REGEX = /\d{4}[_\-.\s]?(\d{2}[_\-.\s]?){5}\..{3,4}/

// moment ignores non-numeric characters when parsing
const FILENAME_DATE_FORMAT = 'YYYYMMDD HHmmss'

class Metadata {
  constructor (exiftool, opts) {

    // Parse metadata options
    let externalMeta = new Null()
    if (opts.instagram) {
      externalMeta = new Instagram(opts.instagram)
    }
    // standardise metadata
    const sourceFile = exiftool.SourceFile
    this.date = externalMeta.getDate(sourceFile) || getDate(exiftool)
    this.caption = externalMeta.getCaption(sourceFile) || caption(exiftool)
    this.keywords = externalMeta.getKeywords(sourceFile) || keywords(exiftool)
    this.video = video(exiftool)
    this.animated = animated(exiftool)
    this.rating = externalMeta.getLike(sourceFile) || rating(exiftool)
    this.favourite = externalMeta.getFavorite(sourceFile)
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

function caption (exif) {
  return tagValue(exif, 'EXIF', 'ImageDescription') ||
         tagValue(exif, 'IPTC', 'Caption-Abstract') ||
         tagValue(exif, 'IPTC', 'Headline') ||
         tagValue(exif, 'XMP', 'Description') ||
         tagValue(exif, 'XMP', 'Title') ||
         tagValue(exif, 'XMP', 'Label')
}

function keywords (exif) {
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

function tagValue (exif, type, name) {
  if (!exif[type]) return null
  return exif[type][name]
}

function makeArray (value) {
  return Array.isArray(value) ? value : [value]
}

module.exports = Metadata
