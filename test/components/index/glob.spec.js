const mock = require('mock-fs')
const glob = require('../../../src/components/index/glob')
const should = require('should/as-function')

describe('Index: glob', function () {
  this.slow(500)
  this.timeout(500)

  afterEach(() => {
    mock.restore()
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

  it('ignores folders starting with a dot', (done) => {
    mock({
      'media/IMG_0001.JPG': '...',
      'media/.git/IMG_0002.JPG': '...'
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
})
