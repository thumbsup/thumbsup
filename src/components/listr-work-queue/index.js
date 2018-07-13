const _ = require('lodash')
const Listr = require('listr')

class ListrWorkQueue extends Listr {
  constructor (jobs, options) {
    options = _.defaults(options, {
      concurrent: 1,
      exitOnError: true
    })
    const threads = _.times(options.concurrent, i => {
      return {
        title: 'Waiting',
        task: (ctx, task) => {
          task.id = i
          return new Promise((resolve, reject) => {
            this.createWorker(task, jobs, err => {
              err ? reject(err) : resolve()
            })
          })
        }
      }
    })
    super(threads, options)
    this.options = options
    this.jobsTotal = jobs.length
    this.jobsDone = 0
  }

  createWorker (task, jobs, done) {
    task.title = 'Finished'
    const job = jobs.shift()
    if (!job) {
      return done()
    } else {
      task.title = job.title
    }
    const nextJob = () => {
      setImmediate(() => this.createWorker(task, jobs, done))
    }
    job.task(null, task).then(() => {
      ++this.jobsDone
      if (this.options.update) {
        this.options.update(this.jobsDone, this.jobsTotal)
      }
      nextJob()
    }).catch(err => {
      if (this.exitOnError) {
        done(new Error(`Error: ${err}`))
      } else {
        nextJob()
      }
    })
  }
}

module.exports = ListrWorkQueue
