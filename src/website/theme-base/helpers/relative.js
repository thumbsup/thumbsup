const path = require('path')

module.exports = (target, options) => {
  const albumPath = options.data.root.album.path
  var relative = path.relative(path.dirname(albumPath), target)

  // Escape single/double quotes
  var escaped = relative.replace(/'/g, '%27')
  escaped = escaped.replace(/"/g, '%22')
  return escaped
}
