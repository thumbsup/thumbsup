const Index = require('../../../src/components/index/index')
const path = require('path')
const should = require('should/as-function')

describe('Index', function () {
  this.slow(1000)
  this.timeout(1000)

  it('indexes the fixtures', (done) => {
    const index = new Index('thumbsup.db')
    const fixtures = path.join(__dirname, '..', '..', '..', 'fixtures')
    const emitter = index.update(fixtures)
    const emitted = []
    emitter.on('file', meta => emitted.push(meta))
    emitter.on('done', () => {
      // check all files were indexed
      const paths = emitted.map(e => e.path).sort()
      should(paths).eql([
        'holidays/beach.jpg',
        'holidays/tower.jpg',
        'home/desk.jpg',
        'home/fruit.jpg'
      ])
      // check the path matches the SourceFile property
      const sourceFiles = emitted.map(e => e.metadata.SourceFile).sort()
      should(paths).eql(sourceFiles)
      done()
    })
  })

  it('vacuums the database', () => {
    const index = new Index('thumbsup.db')
    index.vacuum()
  })
})
