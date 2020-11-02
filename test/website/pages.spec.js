const _ = require('lodash')
const should = require('should/as-function')
const pages = require('../../src/website/pages')
const Album = require('../../src/model/album')
const fixtures = require('../fixtures')

const opts = {
  input: '/source',
  output: '/dest'
}

const themeSettings = {
  some: 'value'
}

function pageSize (pageSize) {
  return Object.assign({}, opts, { albumPageSize: pageSize })
}

function albumWithFiles (count) {
  const file = fixtures.photo({ path: 'photo.jpg' })
  const files = new Array(count).fill(file)
  const album = new Album({ files: files })
  album.finalize({})
  return album
}

describe('Pages', function () {
  describe('Single album', function () {
    it('has a default page structure', function () {
      const album = new Album('Album')
      album.finalize(opts)
      const model = pages.create(album, opts, themeSettings)
      should(model.length).eql(1)
      should(model[0].path).eql('index.html')
      should(model[0].gallery.input).eql('/source')
      should(model[0].settings).eql(themeSettings)
      should(model[0].home).eql(album)
      should(model[0].album).eql(album)
    })
  })

  describe('Nested albums', function () {
    it('generates 1 page per album', function () {
      const b = new Album('B')
      const c = new Album('C')
      const a = new Album({ title: 'A', albums: [b, c] })
      const model = pages.create(a, opts, themeSettings)
      should(model.length).eql(3)
      should(model[0].album).eql(a)
      should(model[1].album).eql(b)
      should(model[2].album).eql(c)
    })

    it('supports deep nesting', function () {
      const c = new Album('C')
      const b = new Album({ title: 'B', albums: [c] })
      const a = new Album({ title: 'A', albums: [b] })
      const model = pages.create(a, opts, themeSettings)
      should(model.length).eql(3)
      should(model[0].album).eql(a)
      should(model[1].album).eql(b)
      should(model[2].album).eql(c)
    })
  })

  describe('Breadcrumbs', function () {
    it('does not include the current album', function () {
      const album = new Album('A')
      const model = pages.create(album, opts, themeSettings)
      should(model[0].breadcrumbs).eql([])
    })

    // TODO: only keep the relevant Breadcrumb properties (title, url)
    // To avoid serializing the entire albums again
    // (could be a breaking change for custom themes)
    it('includes all parent albums, in order', function () {
      const c = new Album('C')
      const b = new Album({ title: 'B', albums: [c] })
      const a = new Album({ title: 'A', albums: [b] })
      const model = pages.create(a, opts, themeSettings)
      should(model[2].breadcrumbs).eql([a, b])
    })
  })

  describe('pagination', function () {
    describe('navigation array', function () {
      it('has an empty array if the album size is not specified', function () {
        const album = albumWithFiles(2)
        const models = pages.create(album, pageSize(null), themeSettings)
        should(models[0].pagination.length).eql(0)
      })

      it('has a single item if all files fit in the page size', function () {
        const album = albumWithFiles(5)
        const models = pages.create(album, pageSize(10), themeSettings)
        should(models[0].pagination.length).eql(1)
      })

      it('has multiple item if several pages are required', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models[0].pagination.length).eql(3)
      })

      it('uses one-based indexes for easy rendering', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        const indexes = _.map(models[0].pagination, 'index')
        should(indexes).eql([1, 2, 3])
      })

      it('includes links to all pages', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        const urls = _.map(models[0].pagination, 'url')
        should(urls).eql(['index.html', 'index2.html', 'index3.html'])
      })

      it('highlights the current page', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        album.finalize()
        should(_.map(models[0].pagination, 'current')).eql([true, false, false])
        should(_.map(models[1].pagination, 'current')).eql([false, true, false])
        should(_.map(models[2].pagination, 'current')).eql([false, false, true])
      })
    })

    describe('page view-models', function () {
      it('handles an even number of files', function () {
        const album = albumWithFiles(4)
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models.length).eql(2)
      })

      it('handles an odd number of files', function () {
        const album = albumWithFiles(5)
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models.length).eql(3)
      })

      it('uses the normal album path for the first page', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models[0].path).eql('index.html')
      })

      it('uses the page index as a suffix for other pages', function () {
        const album = albumWithFiles(6)
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models[0].path).eql('index.html')
        should(models[1].path).eql('index2.html')
        should(models[2].path).eql('index3.html')
      })

      it('renders 1 album per page, with a subset of the files', function () {
        const fileA = fixtures.photo({ path: 'A' })
        const fileB = fixtures.photo({ path: 'B' })
        const album = new Album({ files: [fileA, fileA, fileB, fileB] })
        album.finalize()
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models[0].album.files).eql([fileA, fileA])
        should(models[1].album.files).eql([fileB, fileB])
      })

      it('is compatible with nested albums', function () {
        const file = fixtures.photo({ path: 'A' })
        const album = new Album({
          files: [file, file, file, file],
          albums: [new Album({
            title: 'nested',
            files: [file, file, file, file]
          })]
        })
        album.finalize({})
        const models = pages.create(album, pageSize(2), themeSettings)
        should(models[0].path).eql('index.html')
        should(models[1].path).eql('index2.html')
        should(models[2].path).eql('nested.html')
        should(models[3].path).eql('nested2.html')
      })
    })
  })
})
