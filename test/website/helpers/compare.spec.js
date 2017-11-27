const compare = require('../../../src/website/helpers/compare')
const handlebars = require('handlebars')
const should = require('should/as-function')

describe('Handlebars helpers: compare', () => {
  handlebars.registerHelper('compare', compare)

  it('executes the block if the condition is true', () => {
    const template = handlebars.compile(`{{#compare value '==' 3}}TRUE{{/compare}}`)
    const res = template({value: 3})
    should(res).eql('TRUE')
  })

  it('does not execute the block if the condition is false', () => {
    const template = handlebars.compile(`{{#compare value '==' 3}}{{/compare}}`)
    const res = template({value: 4})
    should(res).eql('')
  })

  it('executes the {{else}} block if the condition is false', () => {
    const template = handlebars.compile(`{{#compare value '==' 3}}TRUE{{else}}FALSE{{/compare}}`)
    const res = template({value: 4})
    should(res).eql('FALSE')
  })

  it('defaults to a strict equality', () => {
    const template = handlebars.compile(`{{#compare value 3}}TRUE{{/compare}}`)
    const res = template({value: 3})
    should(res).eql('TRUE')
  })

  it('throws an error if the operator is not known', () => {
    const template = handlebars.compile(`{{#compare value '~~' 3}}TRUE{{/compare}}`)
    should(() => {
      template({value: 3})
    }).throw(/operator/)
  })

  describe('operators', () => {
    it('equal', () => {
      const template = handlebars.compile(`{{#compare value '==' 3}}TRUE{{/compare}}`)
      should(template({value: 3})).eql('TRUE')
      should(template({value: '3'})).eql('TRUE')
      should(template({value: 4})).eql('')
    })

    it('strict equal', () => {
      const template = handlebars.compile(`{{#compare value '===' 3}}TRUE{{/compare}}`)
      should(template({value: 3})).eql('TRUE')
      should(template({value: '3'})).eql('')
      should(template({value: 4})).eql('')
    })

    it('different', () => {
      const template = handlebars.compile(`{{#compare value '!=' 3}}TRUE{{/compare}}`)
      should(template({value: 3})).eql('')
      should(template({value: '3'})).eql('')
      should(template({value: 4})).eql('TRUE')
    })

    it('strict different', () => {
      const template = handlebars.compile(`{{#compare value '!==' 3}}TRUE{{/compare}}`)
      should(template({value: 3})).eql('')
      should(template({value: '3'})).eql('TRUE')
      should(template({value: 4})).eql('TRUE')
    })

    it('less than', () => {
      const template = handlebars.compile(`{{#compare value '<' 3}}TRUE{{/compare}}`)
      should(template({value: 2})).eql('TRUE')
      should(template({value: 3})).eql('')
      should(template({value: 4})).eql('')
    })

    it('greater than', () => {
      const template = handlebars.compile(`{{#compare value '>' 3}}TRUE{{/compare}}`)
      should(template({value: 2})).eql('')
      should(template({value: 3})).eql('')
      should(template({value: 4})).eql('TRUE')
    })

    it('less or equal', () => {
      const template = handlebars.compile(`{{#compare value '<=' 3}}TRUE{{/compare}}`)
      should(template({value: 2})).eql('TRUE')
      should(template({value: 3})).eql('TRUE')
      should(template({value: 4})).eql('')
    })

    it('greater or equal', () => {
      const template = handlebars.compile(`{{#compare value '>=' 3}}TRUE{{/compare}}`)
      should(template({value: 2})).eql('')
      should(template({value: 3})).eql('TRUE')
      should(template({value: 4})).eql('TRUE')
    })
  })
})
