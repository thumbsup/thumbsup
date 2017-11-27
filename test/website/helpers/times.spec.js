const handlebars = require('handlebars')
const should = require('should/as-function')
const times = require('../../../src/website/helpers/times')

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
})
