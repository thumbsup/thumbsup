const path = require('path')
const should = require('should/as-function')
const hierarchy = require('../../src/model/hierarchy.js')
const Album = require('../../src/model/album.js')
const fixtures = require('../fixtures')

describe('hierarchy', function () {
  beforeEach(function () {
    Album.resetIds()
  })

  describe('root album', function () {
    it('creates a root album (homepage) to put all sub-albums', function () {
      const mapper = (media) => 'all'
      const home = hierarchy.createAlbums([], mapper, {})
      should(home.title).eql('Home')
    })

    it('defaults the homepage to index.html', function () {
      const mapper = (media) => 'all'
      const home = hierarchy.createAlbums([], mapper, {})
      should(home.path).eql('index.html')
      should(home.url).eql('index.html')
    })

    it('can configure the homepage path', function () {
      const mapper = (media) => 'all'
      const home = hierarchy.createAlbums([], mapper, {index: 'default.html'})
      should(home.path).eql('default.html')
      should(home.url).eql('default.html')
    })
  })

  describe('empty mappers', function () {
    const emptyMappers = ['', '.', null]
    emptyMappers.forEach(value => {
      it(`adds any photos mapped to <${value}> to the root gallery`, function () {
        const media = [
          fixtures.photo({path: 'IMG_000001.jpg'}),
          fixtures.photo({path: 'IMG_000002.jpg'})
        ]
        const mapper = media => value
        const home = hierarchy.createAlbums(media, mapper)
        should(home.albums.length).eql(0)
        should(home.files.length).eql(2)
        should(home.files[0].filename).eql('IMG_000001.jpg')
        should(home.files[1].filename).eql('IMG_000002.jpg')
      })
    })
  })

  describe('nested albums', function () {
    it('can group media into a single folder', function () {
      const media = [
        fixtures.photo({path: 'IMG_000001.jpg'}),
        fixtures.photo({path: 'IMG_000002.jpg'})
      ]
      const mapper = (media) => 'all'
      const home = hierarchy.createAlbums(media, mapper)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('all')
      should(home.albums[0].files).eql([media[0], media[1]])
    })

    it('can group media into several folders', function () {
      const media = [
        fixtures.photo({path: 'one/IMG_000001.jpg'}),
        fixtures.photo({path: 'two/IMG_000002.jpg'})
      ]
      const mapper = (media) => path.dirname(media.file.path)
      const home = hierarchy.createAlbums(media, mapper)
      should(home.albums.length).eql(2)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql([media[0]])
      should(home.albums[1].title).eql('two')
      should(home.albums[1].files).eql([media[1]])
    })

    it('can group media into one nested folder', function () {
      const media = [
        fixtures.photo({path: 'IMG_000001.jpg'}),
        fixtures.photo({path: 'IMG_000002.jpg'})
      ]
      const mapper = (media) => 'one/two'
      const home = hierarchy.createAlbums(media, mapper)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].albums.length).eql(1)
      should(home.albums[0].albums[0].title).eql('two')
      should(home.albums[0].albums[0].files).eql([media[0], media[1]])
    })

    it('can group media at different levels', function () {
      const media = [
        fixtures.photo({path: 'one/IMG_000001.jpg'}),
        fixtures.photo({path: 'one/two/IMG_000002.jpg'})
      ]
      const mapper = (media) => path.dirname(media.file.path)
      const home = hierarchy.createAlbums(media, mapper)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql([media[0]])
      should(home.albums[0].albums.length).eql(1)
      should(home.albums[0].albums[0].title).eql('two')
      should(home.albums[0].albums[0].files).eql([media[1]])
    })
  })
})
