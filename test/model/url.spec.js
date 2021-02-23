const _ = require('lodash')
const process = require('process')
const should = require('should/as-function')
const url = require('../../src/model/url')

const realPlatform = process.platform

describe('URLs', () => {
  it('escapes non-URL-friendly characters', () => {
    const chars = {
      '%': '%25',
      '#': '%23',
      '?': '%3F'
    }
    _.each(chars, (encoded, character) => {
      const res = url.fromPath(`photos/image${character}.jpg`)
      should(res).eql(`photos/image${encoded}.jpg`)
    })
  })

  describe('Linux', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'linux' })
    })
    after(() => {
      Object.defineProperty(process, 'platform', { value: realPlatform })
    })

    it('converts standard Linux paths', function () {
      const res = url.fromPath('photos/holidays/IMG_001.jpg')
      should(res).eql('photos/holidays/IMG_001.jpg')
    })

    it('encodes backslash in Linux paths', function () {
      const res = url.fromPath('photos/my\\holidays.jpg')
      should(res).eql('photos/my%5Cholidays.jpg')
    })
  })

  describe('Windows', () => {
    before(() => {
      Object.defineProperty(process, 'platform', { value: 'win32' })
    })
    after(() => {
      Object.defineProperty(process, 'platform', { value: realPlatform })
    })

    it('converts standard Windows paths', function () {
      const res = url.fromPath('photos\\holidays\\IMG_001.jpg')
      should(res).eql('photos/holidays/IMG_001.jpg')
    })

    it('slashes are also valid path separators on Windows', function () {
      const res = url.fromPath('photos/holidays/IMG_001.jpg')
      should(res).eql('photos/holidays/IMG_001.jpg')
    })
  })
})
