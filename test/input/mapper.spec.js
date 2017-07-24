var should = require('should/as-function')
var mapper = require('../../src/input/mapper.js')
var fixtures = require('../fixtures.js')

describe('mapper', function () {
  it('can create a path mapper', function () {
    const map = mapper.create({albumsFrom: 'folders'})
    const entry = fixtures.photo({
      path: 'holidays/canada/IMG_0001.jpg'
    })
    should(map(entry)).eql('holidays/canada')
  })
  it('can create a default date mapper', function () {
    const map = mapper.create({albumsFrom: 'date'})
    const entry = fixtures.photo({
      path: 'holidays/canada/IMG_0001.jpg',
      date: '2016:07:14 12:07:41'
    })
    should(map(entry)).eql('2016 July')
  })
  it('can create a custom date mapper', function () {
    const map = mapper.create({
      albumsFrom: 'date',
      albumsDateFormat: 'YYYY/MM'
    })
    const entry = fixtures.photo({
      path: 'holidays/canada/IMG_0001.jpg',
      date: '2016:07:14 12:07:41'
    })
    should(map(entry)).eql('2016/07')
  })
})
