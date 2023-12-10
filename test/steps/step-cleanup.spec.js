const fs = require('node:fs')
const sinon = require('sinon')
const debug = require('debug')
const should = require('should/as-function')
const cleanup = require('../../src/steps/step-cleanup')
const fixtures = require('../fixtures')

const ospath = fixtures.ospath

describe('Steps: cleanup', () => {
  // we require "mock-fs" inside the tests, otherwise it also affects other tests
  let mock = null

  beforeEach(() => {
    mock = require('mock-fs')
    sinon.stub(fs, 'unlinkSync')
  })

  afterEach(() => {
    mock.restore()
    fs.unlinkSync.restore()
  })

  it('does nothing if there are no extra files', testEnd => {
    const input = [
      fixtures.file({ path: 'paris/IMG_0001.jpg' }),
      fixtures.file({ path: 'london/IMG_0002.jpg' })
    ]
    mock({
      'output/media/thumbs/paris/IMG_0001.jpg': '',
      'output/media/thumbs/london/IMG_0002.jpg': '',
      'output/media/small/paris/IMG_0001.jpg': '',
      'output/media/small/london/IMG_0002.jpg': '',
      'output/media/large/paris/IMG_0001.jpg': '',
      'output/media/large/london/IMG_0002.jpg': ''
    })
    const obs = cleanup.run(input, 'output', false)
    obs.reduce(toArray, []).subscribe(deletedFiles => {
      should(deletedFiles).deepEqual([])
      should(fs.unlinkSync.called).equal(false)
      testEnd()
    })
  })

  it('deletes output files that are not linked to the input', testEnd => {
    const input = [
      fixtures.file({ path: 'paris/IMG_0001.jpg' }),
      fixtures.file({ path: 'london/IMG_0002.jpg' })
    ]
    mock({
      'output/media/large/paris/IMG_0001.jpg': '',
      'output/media/large/london/IMG_0002.jpg': '',
      'output/media/large/newyork/IMG_0003.jpg': ''
    })
    const obs = cleanup.run(input, 'output', false)
    const extraFile = 'media/large/newyork/IMG_0003.jpg'
    obs.reduce(toArray, []).subscribe(deletedFiles => {
      should(deletedFiles).deepEqual([ospath(extraFile)])
      should(fs.unlinkSync.called).equal(true)
      should(fs.unlinkSync.args).deepEqual([[ospath(`output/${extraFile}`)]])
      testEnd()
    })
  })

  it('prints the name but does not delete in dry-run mode', testEnd => {
    const input = [
      fixtures.file({ path: 'paris/IMG_0001.jpg' }),
      fixtures.file({ path: 'london/IMG_0002.jpg' })
    ]
    mock({
      'output/media/large/paris/IMG_0001.jpg': '',
      'output/media/large/london/IMG_0002.jpg': '',
      'output/media/large/newyork/IMG_0003.jpg': ''
    })
    const obs = cleanup.run(input, 'output', true)
    obs.reduce(toArray, []).subscribe(deletedFiles => {
      should(deletedFiles).deepEqual([])
      should(fs.unlinkSync.called).equal(false)
      debug.assertContains('would delete: media/large/newyork/IMG_0003.jpg')
      testEnd()
    })
  })
})

function toArray (list, item) {
  return list.concat([item])
}
