const path = require('path')
const process = require('process')

exports.fromPath = function (filepath) {
  // already a URL (typically provided as a CLI argument, e.g. link prefix)
  if (filepath.match(/^(http|https|file):\/\//)) {
    return filepath
  }
  // absolute paths should start with file://
  const prefix = path.isAbsolute(filepath) ? 'file://' : ''
  // convert \ to / but only on Windows
  if (process.platform === 'win32') {
    filepath = filepath.replace(/\\/g, '/')
  }
  // encode URLs, but decode overly-encoded slashes
  filepath = encodeURIComponent(filepath).replace(/%2F/g, '/')
  // prepend the prefix if needed
  return prefix + filepath
}
