var should = require('should/as-function')
var Album = require('../../src/model/album')
var fixtures = require('../fixtures')
var path = require('path')

describe('Album', function () {
  describe('options', function () {
    it('can pass the title as a single argument', function () {
      var a = new Album('Holidays')
      should(a.title).eql('Holidays')
    })

    it('can pass a full hash of options', function () {
      var a = new Album({id: 12, title: 'Holidays'})
      should(a.id).eql(12)
      should(a.title).eql('Holidays')
    })
  })

  describe('output paths', function () {
    it('sanitises album titles for the file name', function () {
      var a = new Album('hello & world')
      should(a.basename).eql('helloworld')
    })

    it('concatenates nested filenames for uniqueness', function () {
      // to avoid having two nested albums called "October" overwrite each other
      // note: doesn't use the root title to avoid "home-" or "index-"
      var root = new Album({
        title: 'home',
        albums: [
          new Album({
            title: '2010',
            albums: [
              new Album({title: 'October'})
            ]
          }),
          new Album({
            title: '2011',
            albums: [
              new Album({title: 'October'})
            ]
          })
        ]
      })
      root.finalize()
      should(root.basename).eql('home')
      should(root.albums[0].basename).eql('2010')
      should(root.albums[1].basename).eql('2011')
      should(root.albums[0].albums[0].basename).eql('2010-October')
      should(root.albums[1].albums[0].basename).eql('2011-October')
    })

    it('calculates the output file path', function () {
      var root = new Album({
        title: 'home',
        albums: [new Album({title: '2010'})]
      })
      root.finalize({index: 'index.html'})
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql('2010.html')
    })

    it('calculates the URL for the browser', function () {
      var root = new Album({
        title: 'home',
        albums: [new Album({title: '2010'})]
      })
      root.finalize({index: 'index.html'})
      should(root.url).eql('index.html')
      should(root.albums[0].url).eql('2010.html')
    })

    it('calculates the output path with a target folder (slashes match the OS)', function () {
      var root = new Album({
        title: 'home',
        albums: [new Album({title: '2010'})]
      })
      root.finalize({index: 'index.html', albumsOutputFolder: 'albums'})
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql(path.join('albums', '2010.html'))
    })

    it('calculates the URL with a target folder (always forward slashes)', function () {
      var root = new Album({
        title: 'home',
        albums: [new Album({title: '2010'})]
      })
      root.finalize({index: 'index.html', albumsOutputFolder: 'albums'})
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql('albums/2010.html')
    })
  })

  describe('previews', function () {
    it('picks the first 10 files as previews', function () {
      var a = new Album({files: [
        fixtures.photo(), fixtures.photo(), fixtures.photo(), fixtures.photo(),
        fixtures.photo(), fixtures.photo(), fixtures.photo(), fixtures.photo(),
        fixtures.photo(), fixtures.photo(), fixtures.photo(), fixtures.photo()
      ]})
      a.finalize()
      should(a.previews).have.length(10)
    })

    it('adds <missing> thumbnails to fill', function () {
      var a = new Album({files: [
        fixtures.photo(), fixtures.photo()
      ]})
      a.finalize()
      should(a.previews[2].urls.thumbnail).eql('public/missing.png')
      should(a.previews[9].urls.thumbnail).eql('public/missing.png')
    })

    it('uses files from nested albums too', function () {
      var a = new Album({
        title: 'a',
        albums: [
          new Album({
            title: 'b',
            files: [fixtures.photo(), fixtures.photo()]
          }),
          new Album({
            title: 'c',
            files: [fixtures.photo(), fixtures.photo()]
          })
        ]
      })
      a.finalize()
      should(a.previews).have.length(10)
      for (var i = 0; i < 4; ++i) {
        should(a.previews[i].urls.thumbnail).not.eql('public/missing.png')
      }
    })
  })

  describe('sorting', function () {
    it('can sort albums by title', function () {
      var a = new Album('A')
      var b = new Album('B')
      var c = new Album('C')
      var root = new Album({albums: [c, a, b]})
      root.finalize({sortAlbumsBy: 'title'})
      should(root.albums).eql([a, b, c])
    })

    it('can sort albums by start date', function () {
      var startJan = albumWithFileDates(['2010-01-01', '2010-05-01'])
      var startFeb = albumWithFileDates(['2010-02-01', '2010-04-01'])
      var startMar = albumWithFileDates(['2010-03-01', '2010-03-01'])
      var root = new Album({albums: [startFeb, startMar, startJan]})
      root.finalize({sortAlbumsBy: 'start-date'})
      should(root.albums).eql([startJan, startFeb, startMar])
    })

    it('can sort albums by end date', function () {
      var endMay = albumWithFileDates(['2010-01-01', '2010-05-01'])
      var endApr = albumWithFileDates(['2010-02-01', '2010-04-01'])
      var endMar = albumWithFileDates(['2010-03-01', '2010-03-01'])
      var root = new Album({albums: [endMay, endMar, endApr]})
      root.finalize({sortAlbumsBy: 'end-date'})
      should(root.albums).eql([endMar, endApr, endMay])
    })

    it('can sort media by filename', function () {
      var a = fixtures.photo({path: 'a'})
      var b = fixtures.photo({path: 'b'})
      var c = fixtures.photo({path: 'c'})
      var album = new Album({files: [c, a, b]})
      album.finalize({sortMediaBy: 'filename'})
      should(album.files).eql([a, b, c])
    })

    it('can sort media by reverse filename', function () {
      var a = fixtures.photo({path: 'a'})
      var b = fixtures.photo({path: 'b'})
      var c = fixtures.photo({path: 'c'})
      var album = new Album({files: [c, a, b]})
      album.finalize({sortMediaBy: 'filename', sortMediaDirection: 'desc'})
      should(album.files).eql([c, b, a])
    })

    it('sorts nested albums too', function () {
      var nested = new Album({title: 'nested',
        files: [
          fixtures.photo({path: 'b'}),
          fixtures.photo({path: 'a'})
        ]})
      var root = new Album({title: 'home', albums: [nested]})
      root.finalize({sortMediaBy: 'filename'})
      should(nested.files[0].path).eql('a')
      should(nested.files[1].path).eql('b')
    })
  })

  describe('nested albums basic logic', function () {
    it('calculates the depth of every album', function () {
      var a = new Album('single')
      var b = new Album('single')
      var c = new Album('single')
      var d = new Album('single')
      a.albums = [b, c]
      c.albums = [d]
      a.finalize()
      should(a.depth).eql(0)
      should(b.depth).eql(1)
      should(c.depth).eql(1)
      should(d.depth).eql(2)
    })

    it('sets the home flag on the top-level album', function () {
      var a = new Album('single')
      var b = new Album('single')
      var c = new Album('single')
      var d = new Album('single')
      a.albums = [b, c]
      c.albums = [d]
      a.finalize()
      should(a.home).eql(true)
      should(b.home).eql(false)
      should(c.home).eql(false)
      should(d.home).eql(false)
    })

    it('passes finalising options to all nested albums (e.g. sorting)', function () {
      var nested = new Album({title: 'nested',
        files: [
          fixtures.photo({path: 'b'}),
          fixtures.photo({path: 'a'})
        ]})
      var root = new Album({title: 'home', albums: [nested]})
      root.finalize({sortMediaBy: 'filename'})
      should(nested.files[0].path).eql('a')
      should(nested.files[1].path).eql('b')
    })
  })
})

function albumWithFileDates (dates) {
  var files = dates.map(function (d) {
    return fixtures.photo({date: d})
  })
  return new Album({files: files})
}
