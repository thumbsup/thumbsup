/*
--------------------------------------------------------------------------------
Returns all albums that a file should belong to,
based on the --albums-from array of patterns provided
--------------------------------------------------------------------------------
*/

const _ = require('lodash')
const path = require('path')
const albumPattern = require('./album-pattern')

class AlbumMapper {
  constructor (patterns) {
    const defaulted = (patterns && patterns.length > 0) ? patterns : ['%path']
    this.patterns = defaulted.map(load)
  }
  getAlbums (file) {
    return _.flatMap(this.patterns, pattern => pattern(file))
  }
}

function load (pattern) {
  // custom mapper file
  if (typeof pattern === 'string' && pattern.startsWith('file://')) {
    const filepath = pattern.slice('file://'.length)
    return require(path.resolve(filepath))
  }
  // string pattern
  if (typeof pattern === 'string') {
    return albumPattern.create(pattern)
  }
  // already a function
  return pattern
}

module.exports = AlbumMapper
