const _ = require('lodash')
const fs = require('fs-extra')
const moment = require('moment')
const path = require('path')
const tmp = require('tmp')
const File = require('../src/model/file')
const Metadata = require('../src/model/metadata')

exports.exiftool = function (opts) {
  opts = opts || {}
  return {
    SourceFile: opts.path || 'path/image.jpg',
    File: {
      FileModifyDate: opts.date || '2016:08:24 14:51:36',
      MIMEType: opts.mimeType || 'image/jpg'
    },
    EXIF: {},
    IPTC: {
      Keywords: opts.keywords
    },
    XMP: {},
    H264: {},
    QuickTime: {}
  }
}

exports.metadata = function (opts) {
  return new Metadata(exports.exiftool(opts))
}

exports.file = function (opts) {
  const exiftool = exports.exiftool(opts)
  const meta = new Metadata(exiftool)
  return new File(exiftool, meta)
}

exports.date = function (str) {
  return new Date(moment(str, 'YYYYMMDD HHmmss').valueOf())
  // return new Date(Date.parse(str))
}

exports.photo = function (opts) {
  if (typeof opts === 'string') {
    opts = { path: opts }
  } else {
    opts = opts || {}
  }
  opts.mimeType = 'image/jpg'
  return exports.file(opts)
}

exports.video = function (opts) {
  opts = opts || {}
  opts.mimeType = 'video/mp4'
  return exports.file(opts)
}

exports.fromDisk = function (filename) {
  const filepath = path.join(__dirname, '..', 'test-fixtures', filename)
  return fs.readFileSync(filepath)
}

exports.createTempStructure = function (files) {
  const tmpdir = tmp.dirSync({ unsafeCleanup: true }).name
  _.each(files, (content, filepath) => {
    fs.ensureFileSync(`${tmpdir}/${filepath}`)
    fs.writeFileSync(`${tmpdir}/${filepath}`, content)
  })
  return tmpdir
}
