const fs = require('fs')
const glob = require('../../../src/components/index/glob')
const { sep } = require('path')
const os = require('os')
const should = require('should/as-function')
const tmp = require('tmp')

describe('Index: glob', function () {
  this.slow(500)
  this.timeout(500)

  // we require "mock-fs" inside the tests, otherwise it also affects other tests
  let mock = null
  before(() => {
    mock = require('mock-fs')
  })

  afterEach(() => {
    mock.restore()
  })

  it('bootstraps micromatch', () => {
    // This is a workaround for https://github.com/tschaub/mock-fs/issues/213
    // Because micromatch() loads packages dynamically which doesn't work if the filesystem is being mocked
    // So we need to pre-load them now
    require('micromatch').match('file.txt', '**/**')
  })

  it('can include photo extensions', () => {
    const ext = glob.supportedExtensions({ includePhotos: true, includeVideos: false, includeRawPhotos: false })
    should(ext.indexOf('jpg')).above(-1)
    should(ext.indexOf('mp4')).eql(-1)
    should(ext.indexOf('cr2')).eql(-1)
  })

  it('can include video extensions', () => {
    const ext = glob.supportedExtensions({ includePhotos: false, includeVideos: true, includeRawPhotos: false })
    should(ext.indexOf('jpg')).eql(-1)
    should(ext.indexOf('mp4')).above(-1)
    should(ext.indexOf('cr2')).eql(-1)
  })

  it('can include raw photo extensions', () => {
    const ext = glob.supportedExtensions({ includePhotos: false, includeVideos: false, includeRawPhotos: true })
    should(ext.indexOf('jpg')).eql(-1)
    should(ext.indexOf('mp4')).eql(-1)
    should(ext.indexOf('cr2')).above(-1)
  })

  it('lists all images by default', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.jpg': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'IMG_0001.jpg',
      'IMG_0002.jpg'
    ], done)
  })

  it('can list nested images', (done) => {
    mock({
      'media/2016/June/IMG_0001.jpg': '...',
      'media/2017/IMG_0002.jpg': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      '2016/June/IMG_0001.jpg',
      '2017/IMG_0002.jpg'
    ], done)
  })

  it('includes photos and videos by default', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.mp4': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'IMG_0001.jpg',
      'IMG_0002.mp4'
    ], done)
  })

  it('can exclude photos', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.mp4': '...'
    })
    const options = { includePhotos: false }
    assertGlobReturns('media', options, [
      'IMG_0002.mp4'
    ], done)
  })

  it('can excludes videos', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.mp4': '...'
    })
    const options = { includeVideos: false }
    assertGlobReturns('media', options, [
      'IMG_0001.jpg'
    ], done)
  })

  it('can include raw photos', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.cr2': '...'
    })
    const options = { includeRawPhotos: true }
    assertGlobReturns('media', options, [
      'IMG_0001.jpg',
      'IMG_0002.cr2'
    ], done)
  })

  it('is case insensitive for the extension', (done) => {
    mock({
      'media/IMG_0001.JPG': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'IMG_0001.JPG'
    ], done)
  })

  it('ignores any folder starting with a dot', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/.git/IMG_0002.jpg': '...',
      'media/nested/.private/IMG_0003.jpg': '...',
      'media/just/a.dot/IMG_0004.jpg': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'IMG_0001.jpg',
      'just/a.dot/IMG_0004.jpg'
    ], done)
  })

  it('ignores folders called @eaDir (Synology thumbnail folders)', (done) => {
    mock({
      'media/holidays/IMG_0001.jpg': '...',
      'media/holidays/@eaDir/IMG_0001.jpg': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'holidays/IMG_0001.jpg'
    ], done)
  })

  it('ignores root folders called #recycle (Synology recycle bin)', (done) => {
    mock({
      'media/holidays/IMG_0001.jpg': '...',
      'media/#recycle/IMG_0002.jpg': '...'
    })
    const options = {}
    assertGlobReturns('media', options, [
      'holidays/IMG_0001.jpg'
    ], done)
  })

  it('can specify an include pattern', (done) => {
    mock({
      'media/work/IMG_0001.jpg': '...',
      'media/holidays/IMG_0002.jpg': '...'
    })
    const options = {
      include: ['holidays/**']
    }
    assertGlobReturns('media', options, [
      'holidays/IMG_0002.jpg'
    ], done)
  })

  it('can specify an exclude pattern', (done) => {
    mock({
      'media/work/IMG_0001.jpg': '...',
      'media/holidays/IMG_0002.jpg': '...'
    })
    const options = {
      exclude: ['work/**']
    }
    assertGlobReturns('media', options, [
      'holidays/IMG_0002.jpg'
    ], done)
  })

  it('ignores invalid file names on Linux', function (done) {
    if (os.platform() !== 'linux') {
      // the invalid filename generates a system error on macOS
      // and is actually valid on Windows
      return this.skip()
    }
    const tmpdir = tmp.dirSync({ unsafeCleanup: true })
    const filenames = [
      Buffer.from('file1a.jpg'),
      Buffer.concat([
        Buffer.from('file2'),
        Buffer.from([0xfc]),
        Buffer.from('.jpg')
      ]),
      Buffer.from('file3c.jpg')
    ]
    for (const filename of filenames) {
      // we can't use path.join because it will check whether the components
      // are valid, which they are not
      fs.writeFileSync(Buffer.concat([
        Buffer.from(tmpdir.name),
        Buffer.from(sep),
        filename
      ]), '...')
    }
    glob.find(tmpdir.name, {}, (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'file1a.jpg',
        'file3c.jpg'
      ])
      done()
    })
  })

  it('ignores non-traversable directories', (done) => {
    mock({
      'media/secret': mock.directory({
        mode: 0,
        items: {
          'IMG_0001.jpg': '...'
        }
      }),
      'media/IMG_0002.jpg': '...'
    })
    glob.find('media', {}, (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'IMG_0002.jpg'
      ])
      done()
    })
  })
})

function assertGlobReturns (root, options, expected, done) {
  glob.find(root, options, (err, map) => {
    if (err) return done(err)
    const keys = Object.keys(map).sort()
    should(keys).eql(expected)
    done()
  })
}
