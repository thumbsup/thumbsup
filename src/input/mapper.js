/*
--------------------------------------------------------------------------------
Returns the target album path for a single file.
Can be based on anything, e.g. directory name, date, metadata keywords...
e.g. `Holidays/London/IMG_00001.jpg` -> `Holidays/London`
--------------------------------------------------------------------------------
*/

const moment = require('moment')
const path = require('path')

exports.create = function (opts) {
  var mapper = null
  if (opts.albumsFrom === 'folders') {
    mapper = (file) => path.dirname(file.path)
  } else if (opts.albumsFrom === 'date') {
    var dateFormat = opts.albumsDateFormat || 'YYYY MMMM'
    mapper = (file) => moment(file.meta.date).format(dateFormat)
  } else {
    throw new Error('Invalid <albumsFrom> option')
  }
  return mapper
}
