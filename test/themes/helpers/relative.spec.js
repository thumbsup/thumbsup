const relative = require('../../../src/website/theme-base/helpers/relative')
const handlebars = require('handlebars')
const should = require('should/as-function')

describe('Handlebars helpers: relative', () => {
  handlebars.registerHelper('relative', relative)

  describe('theme assets', () => {
    it('returns a path in the same folder', () => {
      const template = handlebars.compile('<link rel="stylesheet" href="{{relative \'public/theme.css\'}}" />')
      const res = template({
        album: {
          path: 'index.html'
        }
      })
      should(res).eql('<link rel="stylesheet" href="public/theme.css" />')
    })

    it('returns a relative path for albums in nested folders', () => {
      const template = handlebars.compile('<link rel="stylesheet" href="{{relative \'public/theme.css\'}}" />')
      const res = template({
        album: {
          path: 'albums/holidays.html'
        }
      })
      should(res).eql('<link rel="stylesheet" href="../public/theme.css" />')
    })
  })

  describe('images and videos', () => {
    it('returns a path from the root album', () => {
      const template = handlebars.compile('<img src="{{relative \'media/thumbs/img.jpg\'}}" />')
      const res = template({
        album: {
          path: 'index.html'
        }
      })
      should(res).eql('<img src="media/thumbs/img.jpg" />')
    })

    it('returns a path from a nested album', () => {
      const template = handlebars.compile('<img src="{{relative \'media/thumbs/img.jpg\'}}" />')
      const res = template({
        album: {
          path: 'albums/holidays.html'
        }
      })
      should(res).eql('<img src="../media/thumbs/img.jpg" />')
    })

    it('does not do anything if the path is an absolute URL', () => {
      // This can happen when using --link-prefix
      const url = 'http://example.com/photo.jpg'
      const template = handlebars.compile(`<img src="{{relative '${url}'}}" />`)
      const res = template({})
      should(res).eql(`<img src="${url}" />`)
    })
  })

  describe('escaping', () => {
    // TODO: this should not be needed anymore because all URLs are already escaped
    it('escapes single quotes so they can be used in CSS background-image', () => {
      const template = handlebars.compile("background-image('{{relative url}}')")
      const res = template({
        url: "l'histoire.jpg",
        album: {
          path: 'index.html'
        }
      })
      should(res).eql("background-image('l%27histoire.jpg')")
    })

    // TODO: this should not be needed anymore because all URLs are already escaped
    it('escapes double quotes so they can be used in <img> tags', () => {
      const template = handlebars.compile('<img src="{{relative url}}" />')
      const res = template({
        url: 'l"histoire.jpg',
        album: {
          path: 'index.html'
        }
      })
      should(res).eql('<img src="l%22histoire.jpg" />')
    })
  })
})
