const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const readdir = require('fs-readdir-recursive')
const progress = require('../utils/progress')

exports.run = function (fileCollection, outputRoot, callback) {
  const mediaRoot = path.join(outputRoot, 'media')
  const diskFiles = readdir(mediaRoot).map(f => path.join(mediaRoot, f))
  const requiredFiles = []
  fileCollection.forEach(f => {
    Object.keys(f.output).forEach(out => {
      var dest = path.join(outputRoot, f.output[out].path)
      requiredFiles.push(dest)
    })
  })
  const useless = _.difference(diskFiles, requiredFiles)
  if (useless.length) {
    const bar = progress.create('Cleaning up', useless.length)
    useless.forEach(f => fs.unlinkSync(f))
    bar.tick(useless.length)
  }
  callback()
}
