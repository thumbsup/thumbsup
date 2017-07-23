const should = require('should/as-function')
const mock = require('mock-fs')
const Picasa = require('../../src/input/picasa.js')

const PICASA_INI = `
[Picasa]
name=My holidays

[IMG_0001.jpg]
star=yes
caption=Nice sunset
keywords=beach,sunset
`

describe('Picasa', function () {
  afterEach(function () {
    mock.restore()
  })
  it('reads album metadata', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    const picasa = new Picasa()
    const meta = picasa.album('holidays')
    should(meta).eql({
      name: 'My holidays'
    })
  })
  it('returns <null> if there is no album metadata', function () {
    const picasa = new Picasa()
    const meta = picasa.album('holidays')
    should(meta).eql(null)
  })
  it('returns raw file metadata as read from the INI file', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    const picasa = new Picasa()
    const meta = picasa.file('holidays/IMG_0001.jpg')
    should(meta).eql({
      star: 'yes',
      caption: 'Nice sunset',
      keywords: 'beach,sunset'
    })
  })
  it('can read metadata of a file with several dots in the name', function () {
    mock({
      'holidays/picasa.ini': '[IMG.0001.small.jpg]\ncaption=dots'
    })
    const picasa = new Picasa()
    const meta = picasa.file('holidays/IMG.0001.small.jpg')
    should(meta).eql({
      caption: 'dots'
    })
  })
  it('returns <null> if a file has no metadata', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    const picasa = new Picasa()
    const meta = picasa.album('holidays/IMG_0002.jpg')
    should(meta).eql(null)
  })
})
