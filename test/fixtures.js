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
    XMP: {
      PersonInImage: opts.people,
      Subject: opts.subjects
    },
    H264: {},
    QuickTime: {}
  }
}

exports.metadata = function (opts) {
  return new Metadata(exports.exiftool(opts))
}

exports.file = function (fileOpts, opts) {
  const exiftool = exports.exiftool(fileOpts)
  const meta = new Metadata(exiftool, undefined, opts)
  return new File(exiftool, meta)
}

exports.date = function (str) {
  return new Date(moment(str, 'YYYYMMDD HHmmss').valueOf())
  // return new Date(Date.parse(str))
}

exports.photo = function (photoOpts, opts) {
  if (typeof photoOpts === 'string') {
    photoOpts = { path: photoOpts }
  } else {
    photoOpts = photoOpts || {}
  }
  photoOpts.mimeType = 'image/jpg'
  return exports.file(photoOpts, opts)
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

// convert to OS-dependent style paths for testing
exports.ospath = function (filepath) {
  return filepath.replace(/\//g, path.sep)
}
