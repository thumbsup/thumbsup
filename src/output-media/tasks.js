const debug = require('debug')('thumbsup')
const fs = require('fs-extra')
const path = require('path')
const resize = require('./resize')

const ACTION_MAP = {
  'original': resize.copy,
  'photo:thumbnail': resize.photoSquare,
  'photo:large': resize.photoLarge,
  'video:thumbnail': resize.videoSquare,
  'video:poster': resize.videoLarge,
  'video:resized': resize.videoWeb
}

/*
  Return a list of task to build all required outputs (new or updated)
  Can be filtered by type (image/video) to give more accurate ETAs
*/
exports.create = function (opts, files, filterType) {
  var tasks = {}
  // accumulate all tasks into an object
  // to remove duplicate destinations
  files.filter(f => f.type === filterType).forEach(f => {
    debug(`Tasks for ${f.path}, ${JSON.stringify(f.output)}`)
    Object.keys(f.output).forEach(out => {
      var src = path.join(opts.input, f.path)
      var dest = path.join(opts.output, f.output[out].path)
      var destDate = modifiedDate(dest)
      if (f.date > destDate) {
        var action = ACTION_MAP[f.output[out].rel]
        tasks[dest] = (done) => {
          fs.mkdirsSync(path.dirname(dest))
          debug(`${f.output[out].rel} from ${src} to ${dest}`)
          action({src: src, dest: dest}, done)
        }
      }
    })
  })
  // back into an array
  const list = Object.keys(tasks).map(t => tasks[t])
  debug(`Created ${list.length} ${filterType} tasks`)
  return list
}

function modifiedDate (filepath) {
  try {
    return fs.statSync(filepath).mtime.getTime()
  } catch (ex) {
    return 0
  }
}
