const path = require('node:path')
const fs = require('node:fs')
const Observable = require('zen-observable')
const trace = require('debug')('thumbsup:trace')
const debug = require('debug')('thumbsup:debug')
const error = require('debug')('thumbsup:error')

exports.run = function (files, opts) {
  return new Observable(observer => {
    
    files.map(f => {
        filePath = path.join(opts.output, f.output.download.path)
        stats = fs.statSync(filePath)
        f.fileSize = {download: stats.size}
    })
    observer.complete()

  })
}
