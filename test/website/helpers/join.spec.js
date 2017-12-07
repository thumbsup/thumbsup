const handlebars = require('handlebars')
const should = require('should/as-function')
const join = require('../../../src/website/helpers/join')

describe('Handlebars helpers: join', () => {
  handlebars.registerHelper('join', join)

  it('joins items with the separator', () => {
    const template = handlebars.compile(`{{#join list ","}}{{.}}{{/join}}`)
    const res = template({list: [1, 2, 3]})
    should(res).eql('1,2,3')
  })

  it('renders the child block for each item', () => {
    const template = handlebars.compile(`{{#join list ","}}{{value}}{{/join}}`)
    const res = template({list: [
      { value: 1 },
      { value: 2 },
      { value: 3 }
    ]})
    should(res).eql('1,2,3')
  })

  it('passes the @index to the block', () => {
    const template = handlebars.compile(`{{#join list ","}}{{@index}}{{/join}}`)
    const res = template({list: [1, 2, 3]})
    should(res).eql('0,1,2')
  })
})
