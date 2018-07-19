const handlebars = require('handlebars')
const should = require('should/as-function')
const slice = require('../../../src/website/theme-base/helpers/slice')

describe('Handlebars helpers: slice', () => {
  handlebars.registerHelper('slice', slice)
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('renders the first N items of an array', () => {
    const template = handlebars.compile(`{{#slice list count=3}}{{.}}{{/slice}}`)
    const res = template({list: list})
    should(res).eql('123')
  })

  it('renders nothing if count=0', () => {
    const template = handlebars.compile(`{{#slice list count=0}}{{.}}{{/slice}}`)
    const res = template({list: list})
    should(res).eql('')
  })

  it('renders the whole array if count > length', () => {
    const template = handlebars.compile(`{{#slice list count=20}}{{.}}{{/slice}}`)
    const res = template({list: list})
    should(res).eql('123456789')
  })

  it('renders 1 item if count is not specified', () => {
    const template = handlebars.compile(`{{#slice list}}{{.}}{{/slice}}`)
    const res = template({list: list})
    should(res).eql('1')
  })
})
