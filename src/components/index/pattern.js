const micromatch = require('micromatch')

class GlobPattern {
  constructor ({ include, exclude, extensions }) {
    this.includeList = include
    this.excludeList = exclude
    this.directoryExcludeList = exclude.concat(['**/@eaDir/**', '#recycle/**'])
    this.extensions = extPattern(extensions)
  }

  match (filePath) {
    const opts = { nocase: true }
    return micromatch.any(filePath, this.includeList, opts) &&
           micromatch.any(filePath, this.excludeList, opts) === false &&
           micromatch.isMatch(filePath, this.extensions, opts)
  }

  // this is used to cull folders early
  // instead of traversing them but discard all their files later
  canTraverse (folderPath) {
    const opts = { dot: false, nocase: true }
    const withSlash = `${folderPath}/`
    return micromatch.any(withSlash, this.includeList, opts) &&
           micromatch.any(withSlash, this.directoryExcludeList, opts) === false
  }
}

function extPattern (extensions) {
  if (extensions.length === 1) {
    return '**/*.' + extensions[0]
  } else {
    return '**/*.{' + extensions.join(',') + '}'
  }
}

module.exports = GlobPattern
