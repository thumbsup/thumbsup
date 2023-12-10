const fs = require('node:fs')
const path = require('node:path')
const _ = require('lodash')
const debug = require('debug')('thumbsup:debug')
const Observable = require('zen-observable')
const readdir = require('fs-readdir-recursive')

exports.run = function (fileCollection, outputRoot, dryRun) {
  const obsolete = findObsolete(fileCollection, outputRoot)
  return new Observable(observer => {
    obsolete.forEach(f => {
      const relativePath = path.relative(outputRoot, f)
      if (dryRun) {
        debug(`Dry run, would delete: ${relativePath}`)
      } else {
        observer.next(relativePath)
        fs.unlinkSync(f)
      }
    })
    observer.complete()
  })
}

function findObsolete (fileCollection, outputRoot) {
  const mediaRoot = path.join(outputRoot, 'media')
  const diskFiles = readdir(mediaRoot).map(f => path.join(mediaRoot, f))
  const requiredFiles = []
  fileCollection.forEach(f => {
    Object.keys(f.output).forEach(out => {
      const dest = path.join(outputRoot, f.output[out].path)
      requiredFiles.push(dest)
    })
  })
  return _.difference(diskFiles, requiredFiles)
}
