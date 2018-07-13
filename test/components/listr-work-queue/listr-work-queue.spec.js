const _ = require('lodash')
const Listr = require('listr')
const should = require('should/as-function')
const ListrWorkQueue = require('../../../src/components/listr-work-queue/index')
const ListrTestRenderer = require('./listr-test-renderer.js')

describe('Listr work queue', function () {
  this.slow(2000)
  this.timeout(2000)

  it('processes all jobs in parallel', done => {
    const jobs = makeJobs(10)
    const listr = createWorkQueue(jobs, 3, null)
    listr.run().then(() => {
      const output = listr._renderer.output
      for (let i = 1; i <= 10; ++i) {
        hasItemMatching(output, `Job ${i}`)
      }
      done()
    })
  })

  it('renders thread-like entries which keep changing title', done => {
    const jobs = makeJobs(10)
    const listr = createWorkQueue(jobs, 3, null)
    listr.run().then(() => {
      const output = listr._renderer.output
      // At some point a thread should have been waiting
      hasItemMatching(output, `Waiting`)
      // And a thread should have finished
      hasItemMatching(output, `Finished`)
      // And every single render should conform to a particular format
      const regex = /^Running jobs\n((\s\s(Waiting|Finished|Job \d+)\n){3})?$/
      for (let line of output) {
        if (!regex.test(line)) {
          should.fail(`Listr output does not match expected format: ${line}`)
        }
      }
      done()
    })
  })

  it('reports progress', done => {
    const jobs = makeJobs(10)
    const listr = createWorkQueue(jobs, 3, (done, total) => {
      const progress = done === total ? '' : ` (${done}/${total})`
      return `Running jobs${progress}`
    })
    listr.run().then(() => {
      const output = listr._renderer.output
      for (let i = 1; i < 10; ++i) {
        hasItemMatching(output, `Running jobs (${i}/10)`)
      }
      done()
    })
  })
})

function createWorkQueue (jobs, concurrency, updater) {
  const task = {
    title: 'Running jobs',
    task: (ctx, task) => new ListrWorkQueue(jobs, {
      concurrent: concurrency,
      update: (done, total) => {
        if (updater) {
          task.title = updater(done, total)
        }
      }
    })
  }
  return new Listr([task], {
    renderer: ListrTestRenderer
  })
}

function makeJobs (count) {
  return _.times(count, i => {
    return {
      title: `Job ${i + 1}`,
      task: () => new Promise(resolve => setTimeout(resolve, 100))
    }
  })
}

function hasItemMatching (list, substring) {
  const match = _.some(list, item => item.includes(substring))
  if (!match) {
    should.fail(`Excepted ${substring} to be present in ${list}`)
  }
}
