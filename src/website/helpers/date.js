const moment = require('moment')

/*
  Render a date in a legible format
  Usage:
    {{date taken}}
*/
module.exports = (date) => {
  return moment(date).format('DD MMM YYYY')
}
