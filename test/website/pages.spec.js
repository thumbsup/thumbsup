const should = require('should/as-function')
const pages = require('../../src/website/pages')
const Album = require('../../src/model/album')

const opts = {
  input: '/source',
  output: '/dest'
}

const themeSettings = {
  some: 'value'
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
})
