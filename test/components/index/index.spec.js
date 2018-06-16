const fs = require('fs')
const path = require('path')
const should = require('should/as-function')
const Index = require('../../../src/components/index/index')
const fixtures = require('../../fixtures')

describe('Index', function () {
  this.slow(1000)
  this.timeout(1000)

  var tmpdir = null

  before(() => {
    const image = fixtures.fromDisk('photo.jpg')
    tmpdir = fixtures.createTempStructure({
      'input/london/IMG_0001.jpg': image,
      'input/newyork/IMG_0002.jpg': image
    })
  })

  it('indexes a folder', (done) => {
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    const emitter = index.update(path.join(tmpdir, 'input'))
    const emitted = []
    var processed = 0
    var stats = null
    emitter.on('progress', () => ++processed)
    emitter.on('file', meta => emitted.push(meta))
    emitter.on('stats', s => { stats = s })
    emitter.on('done', result => {
      // check stats
      should(result.count).eql(2)
      should(stats).eql({unchanged: 0, added: 2, modified: 0, deleted: 0, total: 2})
      // check all files were indexed
      const paths = emitted.map(e => e.path).sort()
      should(paths).eql([
        'london/IMG_0001.jpg',
        'newyork/IMG_0002.jpg'
      ])
      // check all files were sent to exiftool
      should(processed).eql(2)
      // check the path matches the SourceFile property
      const sourceFiles = emitted.map(e => e.metadata.SourceFile).sort()
      should(paths).eql(sourceFiles)
      done()
    })
  })

  it('can re-index with no changes', (done) => {
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    const emitter = index.update(path.join(tmpdir, 'input'))
    var emitted = 0
    var processed = 0
    var stats = null
    emitter.on('progress', () => ++processed)
    emitter.on('file', () => ++emitted)
    emitter.on('stats', s => { stats = s })
    emitter.on('done', result => {
      // check stats
      should(result.count).eql(2)
      should(stats).eql({unchanged: 2, added: 0, modified: 0, deleted: 0, total: 2})
      // all files are emitted, but they were not processed again
      should(emitted).eql(2)
      should(processed).eql(0)
      done()
    })
  })

  it('can un-index a deleted file', (done) => {
    fs.unlinkSync(path.join(tmpdir, 'input/newyork/IMG_0002.jpg'))
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    const emitter = index.update(path.join(tmpdir, 'input'))
    var emitted = 0
    var processed = 0
    var stats = null
    emitter.on('progress', () => ++processed)
    emitter.on('file', () => ++emitted)
    emitter.on('stats', s => { stats = s })
    emitter.on('done', result => {
      // check stats
      should(result.count).eql(1)
      should(stats).eql({unchanged: 1, added: 0, modified: 0, deleted: 1, total: 1})
      // the remaining file was emitted
      should(emitted).eql(1)
      should(processed).eql(0)
      done()
    })
  })

  it('can vacuum the database', () => {
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    index.vacuum()
  })
})
