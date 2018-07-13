const path = require('path')

module.exports = (target, options) => {
  const albumPath = options.data.root.album.path
  return path.relative(path.dirname(albumPath), target)
}
