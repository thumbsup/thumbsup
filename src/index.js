const fs = require('fs-extra')
const path = require('path')
const Listr = require('listr')
const steps = require('./steps/index')
const summary = require('./steps/summary')
const website = require('./website/website')

exports.build = function (opts) {
  const tasks = new Listr([
    {
      title: 'Updating database',
      task: (ctx, task) => {
        // returns an observable which will complete when the database is loaded
        fs.mkdirpSync(opts.output)
        const databaseFile = path.join(opts.output, 'metadata.json')
        return steps.database(opts.input, databaseFile, (err, res) => {
          if (!err) {
            ctx.database = res.database
          }
        })
      }
    },
    {
      title: 'Creating model',
      task: (ctx) => {
        const res = steps.model(ctx.database, opts)
        ctx.files = res.files
        ctx.album = res.album
      }
    },
    {
      title: 'Processing media',
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
    console.log('\n' + summary.create(ctx) + '\n')
    process.exit(0)
  }).catch(err => {
    console.log('\nUnexpected error', err)
    process.exit(1)
  })
}
