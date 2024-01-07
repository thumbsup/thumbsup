const path = require('node:path')
const should = require('should/as-function')
const Index = require('../../../src/components/index/index')
const fixtures = require('../../fixtures')

describe('Index', function () {
  this.slow(1000)
  this.timeout(1000)

  let tmpdir = null
  const image = fixtures.fromDisk('photo.jpg')

  beforeEach(() => {
    tmpdir = fixtures.createTempStructure({
      'input/london/IMG_0001.jpg': image,
      'input/newyork/IMG_0002.jpg': image
    })
  })

  function runIndex (options, done) {
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    const emitter = index.update(path.join(tmpdir, 'input'), options)
    const emitted = []
    let processed = 0
    let stats = null
    emitter.on('progress', () => ++processed)
    emitter.on('file', meta => emitted.push(meta))
    emitter.on('stats', s => { stats = s })
    emitter.on('done', result => {
      done({ result, stats, emitted, processed })
    })
  }

  it('indexes a folder', (done) => {
    runIndex({}, data => {
      should(data.result.count).eql(2)
      should(data.stats).eql({
        database: 0,
        disk: 2,
        unchanged: 0,
        added: 2,
        modified: 0,
        deleted: 0,
        skipped: 0
      })
      // check all files were indexed
      const paths = data.emitted.map(e => e.path).sort()
      should(paths).eql([
        'london/IMG_0001.jpg',
        'newyork/IMG_0002.jpg'
      ])
      // check all files were sent to exiftool
      should(data.processed).eql(2)
      // check the path matches the SourceFile property
      const sourceFiles = data.emitted.map(e => e.metadata.SourceFile).sort()
      should(paths).eql(sourceFiles)
      done()
    })
  })

  it('can re-index with no changes', (done) => {
    runIndex({}, () => {
      // then do a second run
      runIndex({}, data => {
        should(data.result.count).eql(2)
        should(data.stats).eql({
          database: 2,
          disk: 2,
          unchanged: 2,
          added: 0,
          modified: 0,
          deleted: 0,
          skipped: 0
        })
        // all files are emitted, but they were not processed again
        should(data.emitted).has.length(2)
        should(data.processed).eql(0)
        done()
      })
    })
  })

  it('can un-index a deleted file', (done) => {
    runIndex({}, () => {
      // then do a second run
      fixtures.deleteTempFile(tmpdir, 'input/newyork/IMG_0002.jpg')
      runIndex({}, data => {
        should(data.result.count).eql(1)
        should(data.stats).eql({
          database: 2,
          disk: 1,
          unchanged: 1,
          added: 0,
          modified: 0,
          deleted: 1,
          skipped: 0
        })
        // the remaining file was emitted
        should(data.emitted).has.length(1)
        should(data.processed).eql(0)
        done()
      })
    })
  })

  describe('scan modes', () => {
    it('partial ignores changes outside the include pattern', (done) => {
      runIndex({}, () => {
        // then do a second run
        fixtures.deleteTempFile(tmpdir, 'input/newyork/IMG_0002.jpg')
        const options = { scanMode: 'partial', include: ['london/**'] }
        runIndex(options, data => {
          should(data.result.count).eql(2)
          should(data.stats).eql({
            database: 2,
            disk: 1,
            unchanged: 1,
            added: 0,
            modified: 0,
            deleted: 0,
            skipped: 1
          })
          // but it still emitted 2 files
          should(data.emitted).has.length(2)
          should(data.processed).eql(0)
          done()
        })
      })
    })
  })

  it('can vacuum the database', () => {
    const index = new Index(path.join(tmpdir, 'thumbsup.db'))
    index.vacuum()
  })
})
