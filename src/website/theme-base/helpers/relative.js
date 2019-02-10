const path = require('path')

module.exports = (target, escape, options) => {
  // Allow escape to be an optional parameter
  if (typeof escape !== 'boolean') {
    options = escape
    escape = false
  }

  const albumPath = options.data.root.album.path
  var relative = path.relative(path.dirname(albumPath), target)

  // Escape single quotes
  if (escape) {
    var escaped = relative.replace(/'/g, '%27')
    escaped = escaped.replace(/"/g, '%22')
    return escaped
  } else {
    return relative
  }
}
