const moment = require('moment')
const path = require('path')
const should = require('should/as-function')
const Album = require('../../src/model/album')
const fixtures = require('../fixtures')

// Common fixtures
const fileA = fixtures.photo({ path: 'a' })
const fileB = fixtures.photo({ path: 'b' })
const fileC = fixtures.photo({ path: 'c' })
const file2010 = fixtures.photo({ date: '2010-01-01' })
const file2011 = fixtures.photo({ path: '2011-01-01' })

describe('Album', function () {
  describe('options', function () {
    it('can pass the title as a single argument', function () {
      const a = new Album('Holidays')
      should(a.title).eql('Holidays')
    })

    it('can pass a full hash of options', function () {
      const a = new Album({ id: 12, title: 'Holidays' })
      should(a.id).eql(12)
      should(a.title).eql('Holidays')
    })
  })

  describe('output paths', function () {
    it('sanitises album titles for the file name', function () {
      const a = new Album('& déjà vu')
      should(a.basename).eql('and-deja-vu')
    })

    it('sanitises more special characters than the slugify() default', function () {
      const a = new Album(`hello*+~.()'"!:@world`)
      should(a.basename).eql('helloworld')
    })

    it('doesn\'t use a dash if the words have no space', function () {
      // not ideal but that's how slugify() works
      const a = new Album("aujourd'hui")
      should(a.basename).eql('aujourdhui')
    })

    it('concatenates nested filenames for uniqueness', function () {
      // to avoid having two nested albums called "October" overwrite each other
      // note: doesn't use the root title to avoid "home-" or "index-"
      const root = new Album({
        title: 'home',
        albums: [
          new Album({
            title: '2010',
            albums: [
              new Album({ title: 'October' })
            ]
          }),
          new Album({
            title: '2011',
            albums: [
              new Album({ title: 'October' })
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
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '2010' })]
      })
      root.finalize({ index: 'index.html' })
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql('2010.html')
    })

    it('calculates the URL for the browser', function () {
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '2010' })]
      })
      root.finalize({ index: 'index.html' })
      should(root.url).eql('index.html')
      should(root.albums[0].url).eql('2010.html')
    })

    it('encodes # characters when calculating the URL for the browser', function () {
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '#2010#' })]
      })
      root.finalize({ index: 'index.html' })
      should(root.albums[0].url).eql('%232010%23.html')
    })

    it('encodes ? characters when calculating the URL for the browser', function () {
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '?2010?' })]
      })
      root.finalize({ index: 'index.html' })
      should(root.albums[0].url).eql('%3F2010%3F.html')
    })

    it('calculates the output path with a target folder (slashes match the OS)', function () {
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '2010' })]
      })
      root.finalize({ index: 'index.html', albumsOutputFolder: 'albums' })
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql(path.join('albums', '2010.html'))
    })

    it('calculates the URL with a target folder (always forward slashes)', function () {
      const root = new Album({
        title: 'home',
        albums: [new Album({ title: '2010' })]
      })
      root.finalize({ index: 'index.html', albumsOutputFolder: 'albums' })
      should(root.path).eql('index.html')
      should(root.albums[0].path).eql('albums/2010.html')
    })
  })

  describe('sorting', function () {
    it('can sort albums by title', function () {
      const a = new Album('A')
      const b = new Album('B')
      const c = new Album('C')
      const root = new Album({ albums: [c, a, b] })
      root.finalize({ sortAlbumsBy: 'title' })
      should(root.albums).eql([a, b, c])
    })

    it('can sort albums by start date', function () {
      const startJan = albumWithFileDates(['2010-01-01', '2010-05-01'])
      const startFeb = albumWithFileDates(['2010-02-01', '2010-04-01'])
      const startMar = albumWithFileDates(['2010-03-01', '2010-03-01'])
      const root = new Album({ albums: [startFeb, startMar, startJan] })
      root.finalize({ sortAlbumsBy: 'start-date' })
      should(root.albums).eql([startJan, startFeb, startMar])
    })

    it('can sort albums by end date', function () {
      const endMay = albumWithFileDates(['2010-01-01', '2010-05-01'])
      const endApr = albumWithFileDates(['2010-02-01', '2010-04-01'])
      const endMar = albumWithFileDates(['2010-03-01', '2010-03-01'])
      const root = new Album({ albums: [endMay, endMar, endApr] })
      root.finalize({ sortAlbumsBy: 'end-date' })
      should(root.albums).eql([endMar, endApr, endMay])
    })

    it('can sort media by filename', function () {
      const album = new Album({ files: [fileC, fileA, fileB] })
      album.finalize({ sortMediaBy: 'filename' })
      should(album.files).eql([fileA, fileB, fileC])
    })

    it('can sort media by reverse filename', function () {
      const album = new Album({ files: [fileC, fileA, fileB] })
      album.finalize({ sortMediaBy: 'filename', sortMediaDirection: 'desc' })
      should(album.files).eql([fileC, fileB, fileA])
    })

    it('can sort media by date', function () {
      const album = albumWithFileDates(['2010-10-15', '2010-01-01', '2010-03-24'])
      album.finalize({ sortMediaBy: 'date' })
      const datesInAlbum = album.files.map(f => {
        return moment(f.meta.date).format('YYYY-MM-DD')
      })
      should(datesInAlbum).eql(['2010-01-01', '2010-03-24', '2010-10-15'])
    })

    it('sorts nested albums too', function () {
      const nested = new Album({ title: 'nested',
        files: [fileB, fileA]
      })
      const root = new Album({ title: 'home', albums: [nested] })
      root.finalize({ sortMediaBy: 'filename' })
      should(nested.files).eql([fileA, fileB])
    })
  })

  describe('nested albums basic logic', function () {
    it('calculates the depth of every album', function () {
      const a = new Album('single')
      const b = new Album('single')
      const c = new Album('single')
      const d = new Album('single')
      a.albums = [b, c]
      c.albums = [d]
      a.finalize()
      should(a.depth).eql(0)
      should(b.depth).eql(1)
      should(c.depth).eql(1)
      should(d.depth).eql(2)
    })

    it('sets the home flag on the top-level album', function () {
      const a = new Album('single')
      const b = new Album('single')
      const c = new Album('single')
      const d = new Album('single')
      a.albums = [b, c]
      c.albums = [d]
      a.finalize()
      should(a.home).eql(true)
      should(b.home).eql(false)
      should(c.home).eql(false)
      should(d.home).eql(false)
    })

    it('passes finalising options to all nested albums (e.g. sorting)', function () {
      const nested = new Album({
        title: 'nested',
        files: [fileB, fileA]
      })
      const root = new Album({ title: 'home', albums: [nested] })
      root.finalize({ sortMediaBy: 'filename' })
      should(nested.files).eql([fileA, fileB])
    })
  })

  describe('nested sorting', function () {
    it('can specify nested album sorting method', function () {
      const a1 = new Album({ files: [file2011] })
      const a2 = new Album({ files: [file2010] })
      const a = new Album({ title: 'A', albums: [a1, a2] })
      const b = new Album('B')
      const root = new Album({ albums: [b, a] })
      root.finalize({
        sortAlbumsBy: ['title', 'start-date'],
        sortAlbumsDirection: 'asc'
      })
      should(root.albums).eql([a, b])
      should(a.albums).eql([a2, a1])
    })
    it('can specify nested album sorting direction', function () {
      const a1 = new Album('A1')
      const a2 = new Album('A2')
      const a = new Album({ albums: [a1, a2] })
      const b = new Album('B')
      const root = new Album({ albums: [a, b] })
      root.finalize({
        sortAlbumsBy: 'title',
        sortAlbumsDirection: ['asc', 'desc']
      })
      should(root.albums).eql([a, b])
      should(a.albums).eql([a2, a1])
    })
    it('can specify nested media sorting method', function () {
      const nested = new Album({
        files: [fileB, fileA]
      })
      const root = new Album({
        albums: [nested],
        files: [file2011, file2010]
      })
      root.finalize({
        sortMediaBy: ['date', 'filename'],
        sortMediaDirection: 'asc'
      })
      should(root.files).eql([file2010, file2011])
      should(nested.files).eql([fileA, fileB])
    })
    it('can specify nested media sorting direction', function () {
      const nested = new Album({
        files: [fileA, fileB]
      })
      const root = new Album({
        albums: [nested],
        files: [fileB, fileA]
      })
      root.finalize({
        sortMediaBy: 'filename',
        sortMediaDirection: ['asc', 'desc']
      })
      should(root.files).eql([fileA, fileB])
      should(nested.files).eql([fileB, fileA])
    })
  })

  describe('zip', function () {
    it('is undefined if the option is not set', function () {
      const a = new Album('Holidays')
      should(a.zip).eql(undefined)
    })

    it('is undefined if the album has no direct files', function () {
      const a = new Album('Holidays')
      a.finalize({ albumZipFiles: true })
      should(a.zip).eql(undefined)
    })

    it('points to a valid path if the album has direct files', function () {
      const a = new Album({
        title: 'Holidays',
        files: [
          fixtures.photo({ path: 'a' }),
          fixtures.photo({ path: 'b' })
        ]
      })
      a.finalize({ albumZipFiles: true })
      should(a.zip).eql('index.zip')
    })

    it('is set for sub-albums as well', function () {
      const london = new Album({
        title: 'London',
        files: [
          fixtures.photo({ path: 'a' }),
          fixtures.photo({ path: 'b' })
        ]
      })
      const root = new Album({
        title: 'Holidays',
        albums: [london]
      })
      root.finalize({ albumZipFiles: true })
      should(london.zip).eql('London.zip')
    })
  })
})

function albumWithFileDates (dates) {
  const files = dates.map(function (d) {
    return fixtures.photo({ date: d })
  })
  return new Album({ files: files })
}
