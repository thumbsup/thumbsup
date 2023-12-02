const _ = require('lodash')
const fs = require('fs')
const debug = require('debug')('thumbsup:debug')
const Observable = require('zen-observable')
const path = require('path')
const readdir = require('fs-readdir-recursive')

exports.run = function (fileCollection, outputRoot, dryRun) {
  return new Observable(observer => {
    const mediaRoot = path.join(outputRoot, 'media')
    const diskFiles = readdir(mediaRoot).map(f => path.join(mediaRoot, f))
    const requiredFiles = []
    fileCollection.forEach(f => {
      Object.keys(f.output).forEach(out => {
        const dest = path.join(outputRoot, f.output[out].path)
        requiredFiles.push(dest)
      })
    })
    const useless = _.difference(diskFiles, requiredFiles)
    if (useless.length) {
      useless.forEach(f => {
        const relativePath = path.relative(outputRoot, f)
        if (dryRun) {
          debug(`Dry run, would delete: ${relativePath}`)
        } else {
          observer.next(relativePath)
          fs.unlinkSync(f)
        }
      })
    }
    observer.complete()
  })
}
