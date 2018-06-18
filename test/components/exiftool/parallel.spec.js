const should = require('should/as-function')
const sinon = require('sinon')
const streamMock = require('stream-mock')
const exifStream = require('../../../src/components/exiftool/stream')
const parallel = require('../../../src/components/exiftool/parallel')

describe('exiftool parallel', function () {
  beforeEach(() => {
    sinon.stub(exifStream, 'parse').callsFake(mockExifStream)
  })

  afterEach(() => {
    exifStream.parse.restore()
  })

  it('creates 1 stream if no concurrency', (done) => {
    // test data
    const files = numberedFiles(3)
    const concurrency = 1
    // create the streams
    const stream = parallel.parse('input', files, concurrency)
    reduceStream(stream, emittedData => {
      const emittedPaths = emittedData.map(e => e.SourceFile)
      should(emittedPaths).eql([
        'input/IMG_0001.jpg',
        'input/IMG_0002.jpg',
        'input/IMG_0003.jpg'
      ])
      done()
    })
  })

  it('creates concurrent streams to split files evenly', (done) => {
    // test data
    const files = numberedFiles(5)
    const concurrency = 2
    // create the streams
    const stream = parallel.parse('input', files, concurrency)
    reduceStream(stream, emittedData => {
      // should have created 2 streams, with 2 or 3 files each
      sinon.assert.callCount(exifStream.parse, 2)
      should(exifStream.parse.args[0]).eql(['input', ['IMG_0001.jpg', 'IMG_0002.jpg', 'IMG_0003.jpg']])
      should(exifStream.parse.args[1]).eql(['input', ['IMG_0004.jpg', 'IMG_0005.jpg']])
      // should have 5 files in the merged output
      const emittedPaths = emittedData.map(e => e.SourceFile)
      should(emittedPaths).eql([
        'input/IMG_0001.jpg',
        'input/IMG_0002.jpg',
        'input/IMG_0003.jpg',
        'input/IMG_0004.jpg',
        'input/IMG_0005.jpg'
      ])
      done()
    })
  })
})

function numberedFiles (count) {
  return Array(count).join(' ').split(' ').map((a, i) => `IMG_000${i + 1}.jpg`)
}

function mockExifStream (root, filenames) {
  const input = filenames.map(name => {
    return { SourceFile: `${root}/${name}`, Directory: root }
  })
  return new streamMock.ReadableMock(input, {objectMode: true})
}

function reduceStream (stream, done) {
  const emittedData = []
  stream.on('data', entry => {
    emittedData.push(entry)
  }).on('end', () => {
    done(emittedData)
  })
}
