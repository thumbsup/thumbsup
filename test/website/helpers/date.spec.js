const date = require('../../../src/website/helpers/date')
const handlebars = require('handlebars')
const should = require('should/as-function')

describe('Handlebars helpers: date', () => {
  handlebars.registerHelper('date', date)

  it('renders a date as DD MMM YYYY', () => {
    const template = handlebars.compile(`<p>{{date taken}}</p>`)
    const res = template({taken: new Date(2017, 10, 27)}) // month is 0-based
    should(res).eql('<p>27 Nov 2017</p>')
  })
})
