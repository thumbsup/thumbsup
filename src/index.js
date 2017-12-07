const fs = require('fs-extra')
const Listr = require('listr')
const steps = require('./steps/index')
const website = require('./website/website')

exports.build = function (opts, done) {
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
        return steps.process(ctx.files, opts, task)
      }
    },
    {
      title: 'Cleaning up',
      enabled: (ctx) => opts.cleanup,
      task: (ctx) => {
        return steps.cleanup(ctx.files, opts.output)
      }
    },
    {
      title: 'Creating website',
      task: (ctx) => new Promise((resolve, reject) => {
        website.build(ctx.album, opts, err => {
          err ? reject(err) : resolve()
        })
      })
    }
  ])

  tasks.run().then(ctx => {
    done(null, ctx.album)
  }).catch(err => {
    done(err)
  })
}
