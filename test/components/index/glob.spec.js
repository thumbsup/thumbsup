const fs = require('fs')
const glob = require('../../../src/components/index/glob')
const { sep } = require('path')
const should = require('should/as-function')
const tmp = require('tmp')

describe('Index: glob', function () {
  this.slow(500)
  this.timeout(500)

  // we require "mock-fs" inside the tests, otherwise it also affects other tests
  var mock = null
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

  it('can list top-level images', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/IMG_0002.jpg': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'IMG_0001.jpg',
        'IMG_0002.jpg'
      ])
      done()
    })
  })

  it('can list nested images', (done) => {
    mock({
      'media/2016/June/IMG_0001.jpg': '...',
      'media/2017/IMG_0002.jpg': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        '2016/June/IMG_0001.jpg',
        '2017/IMG_0002.jpg'
      ])
      done()
    })
  })

  it('is case insensitive', (done) => {
    mock({
      'media/IMG_0001.JPG': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'IMG_0001.JPG'
      ])
      done()
    })
  })

  it('ignores any folder starting with a dot', (done) => {
    mock({
      'media/IMG_0001.jpg': '...',
      'media/.git/IMG_0002.jpg': '...',
      'media/nested/.private/IMG_0003.jpg': '...',
      'media/just/a.dot/IMG_0004.jpg': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'IMG_0001.jpg',
        'just/a.dot/IMG_0004.jpg'
      ])
      done()
    })
  })

  it('ignores folders called @eaDir (Synology thumbnail folders)', (done) => {
    mock({
      'media/holidays/IMG_0001.jpg': '...',
      'media/holidays/@eaDir/IMG_0001.jpg': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'holidays/IMG_0001.jpg'
      ])
      done()
    })
  })

  it('ignores root folders called #recycle (Synology recycle bin)', (done) => {
    mock({
      'media/holidays/IMG_0001.jpg': '...',
      'media/#recycle/IMG_0002.jpg': '...'
    })
    glob.find('media', (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'holidays/IMG_0001.jpg'
      ])
      done()
    })
  })

  it('ignores invalid file names', (done) => {
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
    for (let filename of filenames) {
      // we can't use path.join because it will check whether the components
      // are valid, which they are not
      fs.writeFileSync(Buffer.concat([
        Buffer.from(tmpdir.name),
        Buffer.from(sep),
        filename
      ]), '...')
    }
    glob.find(tmpdir.name, (err, map) => {
      if (err) return done(err)
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'file1a.jpg',
        'file3c.jpg'
      ])
      done()
    })
  })
})
