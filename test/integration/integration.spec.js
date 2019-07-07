const debug = require('debug')
const glob = require('glob')
const path = require('path')
const should = require('should/as-function')
const fixtures = require('../fixtures')
const index = require('../../src/index')

describe('Full integration', function () {
  this.slow(5000)
  this.timeout(5000)

  var tmpdir = null
  var options = null

  before(() => {
    const image = fixtures.fromDisk('photo.jpg')
    tmpdir = fixtures.createTempStructure({
      'input/london/IMG_0001.jpg': image,
      'input/london/IMG_0002.jpg': image,
      'input/newyork/day 1/IMG_0003.jpg': image,
      'input/newyork/day 2/IMG_0004.jpg': image
    })
    options = {
      input: path.join(tmpdir, 'input'),
      output: path.join(tmpdir, 'output'),
      title: 'Photo album',
      homeAlbumName: 'Home',
      theme: 'classic',
      log: 'info'
    }
  })

  // Listr uses control.log() to print progress
  // But so does Mocha to print test results
  // So we override it for the duration of the integration test
  beforeEach(() => {
    console.logOld = console.log
    console.log = debug('thumbsup:info')
    debug.reset()
  })

  afterEach(() => {
    console.log = console.logOld
  })

  it('builds the gallery from scratch', function (testDone) {
    index.build(options, err => {
      // Reset the logger ASAP to print the test status
      console.log = console.logOld
      // Check for any errors
      should(err).eql(null)
      debug.assertNotContains('thumbsup:error')
      // Check the contents of the output folder
      const actualFiles = actualStructure(options.output)
      // Database
      assertExist(actualFiles, [
        'thumbsup.db'
      ])
      // Albums
      assertExist(actualFiles, [
        'index.html',
        'london.html',
        'newyork-day-1.html',
        'newyork-day-2.html'
      ])
      // Thumbnails
      assertExist(actualFiles, [
        'media/thumbs/london/IMG_0001.jpg',
        'media/thumbs/london/IMG_0002.jpg',
        'media/thumbs/newyork/day 1/IMG_0003.jpg',
        'media/thumbs/newyork/day 2/IMG_0004.jpg'
      ])
      // Large versions
      assertExist(actualFiles, [
        'media/large/london/IMG_0001.jpg',
        'media/large/london/IMG_0002.jpg',
        'media/large/newyork/day 1/IMG_0003.jpg',
        'media/large/newyork/day 2/IMG_0004.jpg'
      ])
      testDone()
    })
  })

  it('builds the gallery a second time (nothing to do)', function (testDone) {
    index.build(options, err => {
      // Reset the logger ASAP to print the test status
      console.log = console.logOld
      should(err).eql(null)
      testDone()
    })
  })
})

function actualStructure (dir) {
  return glob.sync('**/*', {
    cwd: dir,
    ignore: 'public',
    nodir: true,
    nonull: false
  })
}

function assertExist (actual, expected) {
  const missing = expected.filter(f => actual.indexOf(f) === -1)
  should([]).eql(missing)
}
