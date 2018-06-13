const _ = require('lodash')
const fs = require('fs')
const Observable = require('zen-observable')
const path = require('path')
const readdir = require('fs-readdir-recursive')

exports.run = function (fileCollection, outputRoot) {
  return new Observable(observer => {
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
      useless.forEach(f => {
        observer.next(path.relative(outputRoot, f))
        fs.unlinkSync(f)
      })
    }
    observer.complete()
  })
}
