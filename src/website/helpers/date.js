const moment = require('moment')

/*
  Render a date in a legible format
  Usage:
    {{date taken}}
    {{date taken "MMMM YYYY"}}
    {{date taken "ago"}}
*/
module.exports = (date, format) => {
  if (typeof format !== 'string') {
    // default format
    return moment(date).format('DD MMM YYYY')
  } else if (format === 'ago') {
    // some time ago
    return moment(date).fromNow()
  } else {
    // custom format
    return moment(date).format(format)
  }
}
