const debug = require('debug')('thumbsup:debug')
const downsize = require('thumbsup-downsize')
const fs = require('fs-extra')
const info = require('debug')('thumbsup:info')
const ListrWorkQueue = require('listr-work-queue')
const path = require('path')

exports.run = function (files, opts, parentTask) {
  const jobs = exports.create(files, opts)
  // wrap each job in a Listr task that returns a Promise
  const tasks = jobs.map(job => listrTaskFromJob(job, opts.output))
  const listr = new ListrWorkQueue(tasks, {
    concurrent: opts.concurrency,
    update: (done, total) => {
      const progress = done === total ? '' : `(${done}/${total})`
      parentTask.title = `Processing media ${progress}`
    }
  })
  return listr
}

/*
  Return a list of task to build all required outputs (new or updated)
*/
exports.create = function (files, opts) {
  var tasks = {}
  const sourceFiles = new Set()
  const actionMap = getActionMap(opts)
  // accumulate all tasks into an object
  // to remove duplicate destinations
  files.forEach(f => {
    Object.keys(f.output).forEach(out => {
      var src = path.join(opts.input, f.path)
      var dest = path.join(opts.output, f.output[out].path)
      var destDate = modifiedDate(dest)
      var action = actionMap[f.output[out].rel]
      // ignore output files that don't have an action (e.g. existing links)
      debug(`Comparing ${f.path} (${f.date}) and ${f.output[out].path} (${destDate})`)
      if (action && f.date > destDate) {
        sourceFiles.add(f.path)
        tasks[dest] = {
          file: f,
          dest: dest,
          rel: f.output[out].rel,
          action: (done) => {
            fs.mkdirsSync(path.dirname(dest))
            debug(`${f.output[out].rel} from ${src} to ${dest}`)
            return action({src: src, dest: dest}, done)
          }
        }
      }
    })
  })
  // back into an array
  const list = Object.keys(tasks).map(dest => tasks[dest])
  info('Calculated required tasks', {
    sourceFiles: sourceFiles.size,
    tasks: list.length
  })
  return list
}

function listrTaskFromJob (job, outputRoot) {
  const relative = path.relative(outputRoot, job.dest)
  return {
    title: relative,
    task: (ctx, task) => {
      return new Promise((resolve, reject) => {
        var progressEmitter = job.action(err => {
          err ? reject(err) : resolve()
        })
        // render progress percentage for videos
        if (progressEmitter) {
          progressEmitter.on('progress', (percent) => {
            task.title = `${relative} (${percent}%)`
          })
        }
      })
    }
  }
}

function modifiedDate (filepath) {
  try {
    return fs.statSync(filepath).mtime.getTime()
  } catch (ex) {
    return 0
  }
}

function getActionMap (opts) {
  const defaultOptions = {
    quality: opts.photoQuality,
    args: opts.gmArgs
  }
  const thumbSize = opts.thumbSize || 120
  const largeSize = opts.largeSize || 1000
  const thumbnail = Object.assign({}, defaultOptions, {height: thumbSize, width: thumbSize})
  const large = Object.assign({}, defaultOptions, {height: largeSize})
  return {
    'fs:copy': (task, done) => fs.copy(task.src, task.dest, done),
    'fs:symlink': (task, done) => fs.symlink(task.src, task.dest, done),
    'photo:thumbnail': (task, done) => downsize.image(task.src, task.dest, thumbnail, done),
    'photo:large': (task, done) => downsize.image(task.src, task.dest, large, done),
    'video:thumbnail': (task, done) => downsize.still(task.src, task.dest, thumbnail, done),
    'video:poster': (task, done) => downsize.still(task.src, task.dest, large, done),
    'video:resized': (task, done) => downsize.video(task.src, task.dest, {}, done)
  }
}
