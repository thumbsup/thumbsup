const exiftool = require('../../../src/components/exiftool/parallel')
const path = require('path')
const readdir = require('readdir-enhanced')
const should = require('should/as-function')

// Find all test photos
const folder = path.join(__dirname, '..', '..', '..', 'fixtures')
const files = readdir.sync(folder, {
  filter: stats => stats.isFile() && path.extname(stats.path) === '.jpg',
  deep: true
})

describe('exiftool', function () {
  this.slow(1000)
  this.timeout(1000)
  it('processes all files', (done) => {
    const processed = []
    const stream = exiftool.parse(folder, files)
    stream.on('data', entry => {
      processed.push(entry.SourceFile)
    })
    .on('end', () => {
      files.sort()
      processed.sort()
      should(processed).eql(files)
      done()
    })
  })
  it('can process badly encoded fields', (done) => {
    // here we test with an XMP file because it's easier to see what's wrong
    // but the problem will more likely be with a badly encoded XMP section inside a JPG file
    // note: use <vi> to edit <bad-encoding.xmp> if required, to avoid converting it to UTF
    const stream = exiftool.parse(folder, ['bad-encoding.xmp'])
    const processed = []
    stream.on('data', entry => {
      processed.push(entry.SourceFile)
    })
    .on('end', () => {
      should(processed).eql(['bad-encoding.xmp'])
      done()
    })
  })
})
