const path = require('node:path')
const should = require('should/as-function')
const sinon = require('sinon')
const hierarchy = require('../../src/input/hierarchy.js')
const Album = require('../../src/model/album.js')
const fixtures = require('../fixtures')
const Picasa = require('../../src/input/picasa')

const DEFAULT_OPTS = { homeAlbumName: 'Home', input: '' }
const picasaReader = new Picasa()

describe('hierarchy', function () {
  beforeEach(function () {
    Album.resetIds()
  })

  describe('root album', function () {
    it('creates a root album (homepage) to put all sub-albums', function () {
      const mapper = mockMapper(file => ['all'])
      const home = hierarchy.createAlbums([], mapper, DEFAULT_OPTS, picasaReader)
      should(home.title).eql('Home')
    })

    it('can configure the top-level album name', function () {
      const mapper = mockMapper(file => ['all'])
      const home = hierarchy.createAlbums([], mapper, { homeAlbumName: 'Holidays' })
      should(home.title).eql('Holidays')
    })

    it('defaults the homepage to index.html', function () {
      const mapper = mockMapper(file => ['all'])
      const home = hierarchy.createAlbums([], mapper, DEFAULT_OPTS, picasaReader)
      should(home.path).eql('index.html')
      should(home.url).eql('index.html')
    })

    it('can configure the homepage path', function () {
      const mapper = mockMapper(file => ['all'])
      const home = hierarchy.createAlbums([], mapper, { homeAlbumName: 'Home', index: 'default.html' })
      should(home.path).eql('default.html')
      should(home.url).eql('default.html')
    })
  })

  describe('empty mappers', function () {
    const emptyMappers = ['', '.', '/', null]
    emptyMappers.forEach(value => {
      it(`adds any photos mapped to <${value}> to the root gallery`, function () {
        const files = [
          fixtures.photo({ path: 'IMG_000001.jpg' }),
          fixtures.photo({ path: 'IMG_000002.jpg' })
        ]
        const mapper = mockMapper(file => [value])
        const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
        should(home.albums.length).eql(0)
        should(home.files.length).eql(2)
        should(home.files[0].filename).eql('IMG_000001.jpg')
        should(home.files[1].filename).eql('IMG_000002.jpg')
      })
    })
  })

  describe('nested albums', function () {
    it('uses album title from Picasa file if available', function () {
      const files = [
        fixtures.photo({ path: 'IMG_000001.jpg' })
      ]
      const mapper = mockMapper(file => ['all'])

      const opts = { ...DEFAULT_OPTS, input: '/root' }

      const expectedPath = path.join(opts.input, 'all')

      const picasa = new Picasa()
      sinon.stub(picasa, 'album').withArgs(expectedPath)
        .returns({ name: 'picasa-name' })

      const home = hierarchy.createAlbums(files, mapper, opts, picasa)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('picasa-name')
      should(home.albums[0].files).eql([files[0]])
    })

    it('can group media into a single folder', function () {
      const files = [
        fixtures.photo({ path: 'IMG_000001.jpg' }),
        fixtures.photo({ path: 'IMG_000002.jpg' })
      ]
      const mapper = mockMapper(file => ['all'])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('all')
      should(home.albums[0].files).eql([files[0], files[1]])
    })

    it('can group media into several folders', function () {
      const files = [
        fixtures.photo({ path: 'one/IMG_000001.jpg' }),
        fixtures.photo({ path: 'two/IMG_000002.jpg' })
      ]
      const mapper = mockMapper(file => [path.dirname(file.path)])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.albums.length).eql(2)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql([files[0]])
      should(home.albums[1].title).eql('two')
      should(home.albums[1].files).eql([files[1]])
    })

    it('can group media into one nested folder', function () {
      const files = [
        fixtures.photo({ path: 'IMG_000001.jpg' }),
        fixtures.photo({ path: 'IMG_000002.jpg' })
      ]
      const mapper = mockMapper(file => ['one/two'])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].albums.length).eql(1)
      should(home.albums[0].albums[0].title).eql('two')
      should(home.albums[0].albums[0].files).eql([files[0], files[1]])
    })

    it('can group media at different levels', function () {
      const files = [
        fixtures.photo({ path: 'one/IMG_000001.jpg' }),
        fixtures.photo({ path: 'one/two/IMG_000002.jpg' })
      ]
      const mapper = mockMapper(file => [path.dirname(file.path)])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql([files[0]])
      should(home.albums[0].albums.length).eql(1)
      should(home.albums[0].albums[0].title).eql('two')
      should(home.albums[0].albums[0].files).eql([files[1]])
    })

    it('does not duplicate home album', function () {
      const files = [
        fixtures.photo({ path: 'one/IMG_000001.jpg' })
      ]
      const mapper = mockMapper(file => ['.', '/', path.dirname(file.path)])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.files.length).eql(1)
      should(home.files[0].filename).eql(files[0].filename)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql(files)
      should(home.albums[0].albums.length).eql(0)
    })

    it('does not duplicate sub albums', function () {
      const files = [
        fixtures.photo({ path: 'one/IMG_000001.jpg' })
      ]
      const mapper = mockMapper(file => ['one', path.dirname(file.path)])
      const home = hierarchy.createAlbums(files, mapper, DEFAULT_OPTS, picasaReader)
      should(home.albums.length).eql(1)
      should(home.albums[0].title).eql('one')
      should(home.albums[0].files).eql(files)
      should(home.albums[0].albums.length).eql(0)
    })
  })
})

function mockMapper (fn) {
  return {
    getAlbums: fn
  }
}
