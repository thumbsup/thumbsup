const path = require('path')

module.exports = (target, options) => {
  const albumPath = options.data.root.album.path
  const relative = path.relative(path.dirname(albumPath), target)
  const url = relative.replace(/\\/g, '/')
  // Escape single/double quotes
  return url.replace(/'/g, '%27').replace(/"/g, '%22')
}
