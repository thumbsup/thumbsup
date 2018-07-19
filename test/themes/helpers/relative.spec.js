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
})
