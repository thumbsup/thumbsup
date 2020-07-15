const fs = require('fs')
const path = require('path')
const should = require('should/as-function')
const tmp = require('tmp')
const AlbumMapper = require('../../src/input/album-mapper.js')
const fixtures = require('../fixtures.js')

const TEST_FILE = fixtures.photo({
  path: 'Holidays/IMG_0001.jpg',
  date: '2016:07:14 12:07:41'
})

describe('Album mapper', function () {
  it('can use a single string pattern', function () {
    const mapper = new AlbumMapper(['%path'])
    should(mapper.getAlbums(TEST_FILE)).eql(['Holidays'])
  })

  it('can use a single function (for testing)', function () {
    const custom = file => 'hello'
    const mapper = new AlbumMapper([custom])
    should(mapper.getAlbums(TEST_FILE)).eql(['hello'])
  })

  it('can provide multiple string patterns', function () {
    const mapper = new AlbumMapper(['%path', '{YYYY}'])
    should(mapper.getAlbums(TEST_FILE)).eql(['Holidays', '2016'])
  })

  it('merges all albums into a single array', function () {
    const custom1 = file => ['one']
    const custom2 = file => ['two', 'three']
    const mapper = new AlbumMapper([custom1, custom2])
    should(mapper.getAlbums(TEST_FILE)).eql(['one', 'two', 'three'])
  })

  it('defaults to %path if no patterns are specified', () => {
    const mapper = new AlbumMapper()
    should(mapper.getAlbums(TEST_FILE)).eql(['Holidays'])
  })

  describe('custom function using file://', () => {
    it('with an absolute path', () => {
      const absolutePath = createTmpFile({
        contents: "module.exports = file => ['my-album']"
      })
      const mapper = new AlbumMapper([`file://${absolutePath}`])
      should(mapper.getAlbums(TEST_FILE)).eql(['my-album'])
    })

    it('with a path relative to the current directory', () => {
      const absolutePath = createTmpFile({
        tmpdir: process.cwd(),
        contents: "module.exports = file => ['my-album']"
      })
      const relative = path.basename(absolutePath)
      const mapper = new AlbumMapper([`file://${relative}`])
      should(mapper.getAlbums(TEST_FILE)).eql(['my-album'])
    })
  })
})

/*
  Create a temporary file.
  It will automatically be deleted when the tests finish.
*/
function createTmpFile (opts) {
  const file = tmp.fileSync({
    tmpdir: opts.tmpdir || undefined,
    discardDescriptor: true
  })
  fs.writeFileSync(file.name, opts.contents)
  // return the absolute path to the file
  return file.name
}
