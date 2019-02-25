const downsize = require('thumbsup-downsize')
const fs = require('fs-extra')

exports.createMap = function (opts) {
  const thumbSize = opts.thumbSize || 120
  const smallSize = 300
  const largeSize = opts.largeSize || 1000
  const defaultOptions = {
    quality: opts.photoQuality,
    args: opts.gmArgs
  }
  const watermark = (!opts.watermark) ? null : {
    file: opts.watermark,
    position: opts.watermarkPosition
  }
  const thumbnail = Object.assign({}, defaultOptions, {
    height: thumbSize,
    width: thumbSize
  })
  const small = Object.assign({}, defaultOptions, {
    height: smallSize
  })
  const large = Object.assign({}, defaultOptions, {
    height: largeSize,
    watermark: watermark,
    animated: true
  })
  const videoOpts = {
    format: opts.videoFormat,
    quality: opts.videoQuality,
    bitrate: opts.videoBitrate
  }
  return {
    'fs:copy': (task, done) => fs.copy(task.src, task.dest, done),
    'fs:symlink': (task, done) => fs.symlink(task.src, task.dest, done),
    'photo:thumbnail': (task, done) => downsize.image(task.src, task.dest, thumbnail, done),
    'photo:small': (task, done) => downsize.image(task.src, task.dest, small, done),
    'photo:large': (task, done) => downsize.image(task.src, task.dest, large, done),
    'video:thumbnail': (task, done) => downsize.still(task.src, task.dest, thumbnail, done),
    'video:small': (task, done) => downsize.still(task.src, task.dest, small, done),
    'video:poster': (task, done) => downsize.still(task.src, task.dest, large, done),
    'video:resized': (task, done) => downsize.video(task.src, task.dest, videoOpts, done)
  }
}
