const moment = require('moment')
const path = require('path')

exports.create = function (opts) {
  var mapper = null
  if (opts.albumsFrom === 'folders') {
    mapper = (media) => path.dirname(media.file.path)
  } else if (opts.albumsFrom === 'date') {
    var dateFormat = opts.albumsDateFormat || 'YYYY MMMM'
    mapper = (media) => moment(media.date).format(dateFormat)
  } else {
    throw new Error('Invalid <albumsFrom> option')
  }
  return mapper
}
