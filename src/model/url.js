const process = require('process')

exports.fromPath = function (filepath) {
  if (process.platform === 'win32') {
    filepath = filepath.replace(/\\/g, '/')
  }
  const encoded = encodeURIComponent(filepath)
  return encoded.replace(/%2F/g, '/')
}
