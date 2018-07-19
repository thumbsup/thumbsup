const date = require('../../../src/website/theme-base/helpers/date')
const handlebars = require('handlebars')
const moment = require('moment')
const should = require('should/as-function')

describe('Handlebars helpers: date', () => {
  handlebars.registerHelper('date', date)

  it('renders a date as DD MMM YYYY by default', () => {
    const template = handlebars.compile(`<p>{{date taken}}</p>`)
    const res = template({taken: new Date(2017, 10, 27)}) // month is 0-based
    should(res).eql('<p>27 Nov 2017</p>')
  })

  it('renders a date with a custom format', () => {
    const template = handlebars.compile(`<p>{{date taken "MMMM YYYY"}}</p>`)
    const res = template({taken: new Date(2017, 10, 27)}) // month is 0-based
    should(res).eql('<p>November 2017</p>')
  })

  it('renders a date as <time ago>', () => {
    const template = handlebars.compile(`<p>{{date taken "ago"}}</p>`)
    const data = {taken: new Date(2017, 10, 27)} // month is 0-based
    const res = template(data)
    const expected = moment(data.taken).fromNow()
    should(res).match(/<p>(.*) ago<\/p>/)
    should(res).eql(`<p>${expected}</p>`)
  })
})
