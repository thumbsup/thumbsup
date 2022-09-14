const fs = require('fs')
const sinon = require('sinon')
const should = require('should/as-function')
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
  // we require "mock-fs" inside the tests, otherwise it also affects other tests
  var mock = null

  beforeEach(function () {
    mock = require('mock-fs')
  })

  afterEach(function () {
    mock.restore()
  })

  it('reads album metadata', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    const picasa = new Picasa()
    const meta = picasa.album('holidays')
    should(meta).have.properties({
      name: 'My holidays'
    })
  })
  it('returns <null> if there is no album metadata', function () {
    const picasa = new Picasa()
    const meta = picasa.album('holidays')
    should(meta).eql(null)
  })
  it('returns <null> if the Picasa file is invalid', function () {
    mock({
      'holidays/picasa.ini': '[[invalid'
    })
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
    should(meta).have.properties({
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
    should(meta).have.properties({
      caption: 'dots'
    })
  })
  it('returns <null> if a file has no metadata', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    const picasa = new Picasa()
    const meta = picasa.file('holidays/IMG_0002.jpg')
    should(meta).eql(null)
  })
  it('only reads the file from disk once', function () {
    mock({
      'holidays/picasa.ini': PICASA_INI
    })
    sinon.spy(fs, 'readFileSync')
    const picasa = new Picasa()
    picasa.album('holidays')
    picasa.album('holidays')
    picasa.file('holidays/IMG_0001.jpg')
    picasa.file('holidays/IMG_0002.jpg')
    should(fs.readFileSync.callCount).eql(1)
  })
})
