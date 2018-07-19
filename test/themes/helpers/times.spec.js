const handlebars = require('handlebars')
const should = require('should/as-function')
const times = require('../../../src/website/theme-base/helpers/times')

describe('Handlebars helpers: times', () => {
  handlebars.registerHelper('times', times)

  it('executes a block several times', () => {
    const template = handlebars.compile(`{{#times 3}}Hello{{/times}}`)
    const res = template({})
    should(res).eql('HelloHelloHello')
  })

  it('skips the block when count is 0', () => {
    const template = handlebars.compile(`{{#times 0}}Hello{{/times}}`)
    const res = template({})
    should(res).eql('')
  })

  it('passes the context to the block', () => {
    const template = handlebars.compile(`{{#times 3}}{{hello}}{{/times}}`)
    const res = template({hello: 'world'})
    should(res).eql('worldworldworld')
  })

  it('passes the @index to the block', () => {
    const template = handlebars.compile(`{{#times 3}}{{@index}}{{/times}}`)
    const res = template({})
    should(res).eql('012')
  })
})
