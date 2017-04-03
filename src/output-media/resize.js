const async = require('async')
const childProcess = require('child_process')
const fs = require('fs-extra')
const gm = require('gm')
const path = require('path')

exports.sizes = {
  thumb: 120,
  large: 1000
}

exports.copy = function (task, callback) {
  fs.copy(task.src, task.dest, callback)
}

// Small square photo thumbnail
exports.photoSquare = function (task, callback) {
  gm(task.src)
    .autoOrient()
    .coalesce()
    .resize(exports.sizes.thumb, exports.sizes.thumb, '^')
    .gravity('Center')
    .crop(exports.sizes.thumb, exports.sizes.thumb)
    .quality(90)
    .write(task.dest, callback)
}

// Large photo
exports.photoLarge = function (task, callback) {
  gm(task.src)
    .autoOrient()
    .resize(null, exports.sizes.large, '>')
    .quality(90)
    .write(task.dest, callback)
}

// Web-streaming friendly video
exports.videoWeb = function (task, callback) {
  const args = ['-i', task.src, '-y', task.dest, '-f', 'mp4', '-vcodec', 'libx264', '-ab', '96k']
  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(task.src).toLowerCase() === '.mts') {
    args.push('-vf', 'yadif=1', '-qscale:v', '4')
  } else {
    args.push('-vb', '1200k')
  }
  exec('ffmpeg', args, callback)
}

// Large video preview (before you click play)
exports.videoLarge = function (task, callback) {
  async.series([
    function (next) {
      extractFrame(task, next)
    },
    function (next) {
      exports.photoLarge({
        src: task.dest,
        dest: task.dest
      }, next)
    }
  ], callback)
}

// Small square video preview
exports.videoSquare = function (task, callback) {
  async.series([
    function (next) {
      extractFrame(task, next)
    },
    function (next) {
      exports.photoSquare({
        src: task.dest,
        dest: task.dest
      }, next)
    }
  ], callback)
}

function extractFrame (task, callback) {
  const args = ['-itsoffset', '-1', '-i', task.src, '-ss', '0.1', '-vframes', 1, '-y', task.dest]
  exec('ffmpeg', args, callback)
}

function exec (command, args, callback) {
  const child = childProcess.spawn(command, args, {
    stdio: 'ignore'
  })
  child.on('error', err => callback(err))
  child.on('exit', (code, signal) => {
    if (code > 0) callback(new Error(`${command} exited with code ${code}`))
    else callback(null)
  })
}
