const path = require('path')
const should = require('should/as-function')
const fixtures = require('../../fixtures')
const exiftool = require('../../../src/components/exiftool/parallel')

describe('exiftool', function () {
  this.slow(10000)
  this.timeout(10000)

  it('processes all files', (done) => {
    // generate some photos in a temp folder
    const image = fixtures.fromDisk('photo.jpg')
    const structure = {}
    for (let i = 0; i < 10; ++i) {
      structure[`IMG_00${i}.jpg`] = image
    }
    const tmpdir = fixtures.createTempStructure(structure)
    // process them in batch
    const processed = []
    const stream = exiftool.parse(tmpdir, Object.keys(structure))
    stream.on('data', entry => {
      // <entry> should be the deserialized JSON output from exiftool
      processed.push(entry.SourceFile)
    }).on('end', () => {
      const expected = Object.keys(structure).sort()
      should(processed.sort()).eql(expected)
      done()
    })
  })

  it('can process files with UTF8 names', (done) => {
    // generate some photos in a temp folder
    const structure = {
      'photoà.jpg': fixtures.fromDisk('photo.jpg')
    }
    const tmpdir = fixtures.createTempStructure(structure)
    const processed = []
    const stream = exiftool.parse(tmpdir, Object.keys(structure))
    stream.on('data', entry => {
      processed.push(entry.SourceFile)
    }).on('end', () => {
      should(processed).eql(['photoà.jpg'])
      done()
    })
  })

  it('can process badly encoded fields', (done) => {
    // here we test with an XMP file because it's easier to see what's wrong
    // but the problem will more likely be with a badly encoded XMP section inside a JPG file
    // note: use <vi> to edit <bad-encoding.xmp> if required, to avoid converting it to UTF
    const testFixtures = path.join(__dirname, '..', '..', '..', 'test-fixtures')
    const stream = exiftool.parse(testFixtures, ['bad-encoding.xmp'])
    const processed = []
    stream.on('data', entry => {
      processed.push(entry.SourceFile)
    }).on('end', () => {
      should(processed).eql(['bad-encoding.xmp'])
      done()
    })
  })
})
