const path = require('path')
const Media = require('../src/model/media')

exports.file = function (opts) {
  opts = opts || {}
  return {
    path: opts.path || 'path/image.jpg',
    name: path.basename(opts.path || 'path/image.jpg'),
    date: opts.date ? new Date(opts.date).getTime() : new Date().getTime(),
    type: opts.type || 'image',
    meta: {
      SourceFile: 'path/image.jpg',
      File: {},
      EXIF: {},
      IPTC: {},
      XMP: {}
    }
  }
}

exports.date = function (str) {
  return new Date(Date.parse(str))
}

exports.photo = function (opts) {
  opts = opts || {}
  opts.type = 'image'
  return new Media(exports.file(opts))
}

exports.video = function (opts) {
  opts = opts || {}
  opts.type = 'video'
  return new Media(exports.file(opts))
}
