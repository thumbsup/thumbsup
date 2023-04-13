const _ = require('lodash')
const path = require('path')
const micromatch = require('micromatch')

class GlobPattern {
  constructor ({ include, exclude, extensions }) {
    this.includeList = (include && include.length > 0) ? include : ['**/**']
    this.excludeList = exclude || []
    this.includeFolders = _.uniq(_.flatMap(this.includeList, this.subFolders))
    this.directoryExcludeList = this.excludeList.concat(['**/@eaDir/**', '#recycle/**'])
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
    return micromatch.any(withSlash, this.includeFolders, opts) &&
           micromatch.any(withSlash, this.directoryExcludeList, opts) === false
  }

  // returns the list of all folder names in a path
  // so they can be included in traversal
  subFolders (filepath) {
    // keep the required path if it allows traversal (thing/ or thing/**)
    const list = filepath.match(/(\/$)|(\*\*$)/) ? [filepath] : []
    // then find all parent folders
    let dir = path.dirname(filepath)
    while (dir !== '.' && dir !== '/') {
      list.push(dir + '/')
      dir = path.dirname(dir)
    }
    return list
  }
}

function extPattern (extensions) {
  if (extensions.length === 0) {
    return '**/*'
  } else if (extensions.length === 1) {
    return '**/*.' + extensions[0]
  } else {
    return '**/*.{' + extensions.join(',') + '}'
  }
}

module.exports = GlobPattern
