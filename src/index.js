const Listr = require('listr')
const steps = require('./steps/index')
const website = require('./website/website')
const Problems = require('./problems')

exports.build = function (opts, done) {
  // How to render tasks
  const renderer = (opts.log === 'default') ? 'update' : 'verbose'
  // List of high level tasks
  const tasks = new Listr([
    {
      title: 'Indexing folder',
      task: (ctx, task) => {
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
        ctx.problems = new Problems()
        const tasks = steps.process(ctx.files, ctx.problems, opts, task)
        if (!opts.dryRun) {
          return tasks
        } else {
          task.skip()
          return null
        }
      }
    },
    {
      title: 'Get file sizes',
      enabled: (ctx) => true,
      skip: () => opts.dryRun,
      task: (ctx, task) => {
        return steps.fileSize(ctx.files, opts)
      }
    },
    {
      title: 'Updating ZIP files',
      enabled: (ctx) => opts.albumDownload === 'zip',
      skip: () => opts.dryRun,
      task: (ctx) => {
        return steps.zipAlbums(ctx.album, opts.output)
      }
    },
    {
      title: 'Cleaning up',
      enabled: (ctx) => opts.cleanup,
      task: (ctx) => {
        return steps.cleanup(ctx.files, opts.output, opts.dryRun)
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
    renderer,
    dateFormat: false
  })

  tasks.run().then(ctx => {
    done(null, {
      album: ctx.album,
      problems: ctx.problems
    })
  }).catch(err => {
    done(err)
  })
}
