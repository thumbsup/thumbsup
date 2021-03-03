const _ = require('lodash')
const should = require('should/as-function')
const url = require('../../src/model/url')

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

  itLinux('converts standard Linux paths', function () {
    const res = url.fromPath('photos/holidays/IMG_001.jpg')
    should(res).eql('photos/holidays/IMG_001.jpg')
  })

  itLinux('encodes backslash in Linux paths', function () {
    const res = url.fromPath('photos/my\\holidays.jpg')
    should(res).eql('photos/my%5Cholidays.jpg')
  })

  itWindows('converts standard Windows paths', function () {
    const res = url.fromPath('photos\\holidays\\IMG_001.jpg')
    should(res).eql('photos/holidays/IMG_001.jpg')
  })

  itWindows('slashes are also valid path separators on Windows', function () {
    const res = url.fromPath('photos/holidays/IMG_001.jpg')
    should(res).eql('photos/holidays/IMG_001.jpg')
  })
})
