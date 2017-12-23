/*
--------------------------------------------------------------------------------
Returns all albums that a file should belong to,
based on the --albums-from array of patterns provided
--------------------------------------------------------------------------------
*/

const _ = require('lodash')
const albumPattern = require('./album-pattern')

class AlbumMapper {
  constructor (opts) {
    const patterns = opts.albumsFrom || '%path'
    this.patterns = patterns.map(pattern => load(pattern, opts.albumsDateFormat))
  }
  getAlbums (file) {
    return _.flatMap(this.patterns, pattern => pattern(file))
  }
}

function load (pattern, dateFormat) {
  // legacy short-hand names (deprecated)
  if (pattern === 'folders') {
    return albumPattern.create('%path')
  }
  if (pattern === 'date') {
    return albumPattern.create(`{${dateFormat}}`)
  }
  // custom mapper file
  if (typeof pattern === 'string' && pattern.startsWith('file://')) {
    const filepath = pattern.slice('file://'.length)
    return require(filepath)
  }
  if (typeof pattern === 'string') {
    return albumPattern.create(pattern)
  }
  // already a function
  return pattern
}

module.exports = AlbumMapper
