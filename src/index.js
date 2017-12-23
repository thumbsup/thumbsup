const fs = require('fs-extra')
const Listr = require('listr')
const steps = require('./steps/index')
const website = require('./website/website')

exports.build = function (opts, done) {
  // How to render tasks
  const renderer = (!opts.log) ? 'update' : 'verbose'
  // List of high level tasks
  const tasks = new Listr([
    {
      title: 'Indexing folder',
      task: (ctx, task) => {
        fs.mkdirpSync(opts.output)
        return steps.index(opts, (err, files, album) => {
          if (!err) {
            ctx.files = files
            ctx.album = album
          }
        })
      }
    },
    {
      title: 'Resizing media',
      task: (ctx, task) => {
        const tasks = steps.process(ctx.files, opts, task)
        if (!opts.dryRun) {
          return tasks
        } else {
          task.skip()
          return null
        }
      }
    },
    {
      title: 'Cleaning up',
      enabled: (ctx) => opts.cleanup,
      skip: () => opts.dryRun,
      task: (ctx) => {
        return steps.cleanup(ctx.files, opts.output)
      }
    },
    {
      title: 'Creating website',
      skip: () => opts.dryRun,
      task: (ctx) => new Promise((resolve, reject) => {
        website.build(ctx.album, opts, err => {
          err ? reject(err) : resolve()
        })
      })
    }
  ], {
    renderer: renderer,
    dateFormat: false
  })

  tasks.run().then(ctx => {
    done(null, ctx.album)
  }).catch(err => {
    done(err)
  })
}
