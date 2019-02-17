const date = require('../../../src/website/theme-base/helpers/relative')
const handlebars = require('handlebars')
const should = require('should/as-function')

describe('Handlebars helpers: relative', () => {
  handlebars.registerHelper('relative', date)

  it('returns a path in the same folder', () => {
    const template = handlebars.compile(`<link rel="stylesheet" href="{{relative 'public/theme.css'}}" />`)
    const res = template({
      album: {
        path: 'index.html'
      }
    })
    should(res).eql('<link rel="stylesheet" href="public/theme.css" />')
  })

  it('returns a relative path for albums in nested folders', () => {
    const template = handlebars.compile(`<link rel="stylesheet" href="{{relative 'public/theme.css'}}" />`)
    const res = template({
      album: {
        path: 'albums/holidays.html'
      }
    })
    should(res).eql('<link rel="stylesheet" href="../public/theme.css" />')
  })

  it('escapes single quotes so they can be used in CSS background-image', () => {
    const template = handlebars.compile(`background-image('{{relative url}}')`)
    const res = template({
      url: "l'histoire.jpg",
      album: {
        path: 'index.html'
      }
    })
    should(res).eql("background-image('l%27histoire.jpg')")
  })

  it('escapes double quotes so they can be used in <img> tags', () => {
    const template = handlebars.compile(`<img src="{{relative url}}" />`)
    const res = template({
      url: 'l"histoire.jpg',
      album: {
        path: 'index.html'
      }
    })
    should(res).eql('<img src="l%22histoire.jpg" />')
  })
})
