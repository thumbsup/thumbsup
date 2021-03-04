const path = require('path')

module.exports = (target, options) => {
  // if already an absolute URL, do nothing
  if (target.match(/^(http|https|file):\/\//)) {
    return target
  }
  const albumPath = options.data.root.album.path
  const relative = path.relative(path.dirname(albumPath), target)
  const url = relative.replace(/\\/g, '/')
  // Escape single/double quotes
  return url.replace(/'/g, '%27').replace(/"/g, '%22')
}
