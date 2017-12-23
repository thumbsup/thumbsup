const should = require('should/as-function')
const AlbumMapper = require('../../src/input/album-mapper.js')
const fixtures = require('../fixtures.js')

const TEST_FILE = fixtures.photo({
  path: 'Holidays/IMG_0001.jpg',
  date: '2016:07:14 12:07:41'
})

describe('Album mapper', function () {
  it('can use a single string pattern', function () {
    const mapper = new AlbumMapper({
      albumsFrom: ['%path']
    })
    should(mapper.getAlbums(TEST_FILE)).eql(['Holidays'])
  })
  it('can use a single function (for testing)', function () {
    const custom = file => 'hello'
    const mapper = new AlbumMapper({
      albumsFrom: [custom]
    })
    should(mapper.getAlbums(TEST_FILE)).eql(['hello'])
  })
  it('can provide multiple string patterns', function () {
    const mapper = new AlbumMapper({
      albumsFrom: ['%path', '{YYYY}']
    })
    should(mapper.getAlbums(TEST_FILE)).eql(['Holidays', '2016'])
  })
  it('merges all albums into a single array', function () {
    const custom1 = file => ['one']
    const custom2 = file => ['two', 'three']
    const mapper = new AlbumMapper({
      albumsFrom: [custom1, custom2]
    })
    should(mapper.getAlbums(TEST_FILE)).eql(['one', 'two', 'three'])
  })
  describe('deprecated options', () => {
    it('can use <folders> to mean %path', () => {
      const mapper = new AlbumMapper({
        albumsFrom: ['folders']
      })
      should(mapper.getAlbums(TEST_FILE)).eql(['Holidays'])
    })
    it('can use <date> to mean {date}', () => {
      const mapper = new AlbumMapper({
        albumsFrom: ['date'],
        albumsDateFormat: 'YYYY MM'
      })
      should(mapper.getAlbums(TEST_FILE)).eql(['2016 07'])
    })
  })
})
