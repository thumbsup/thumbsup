/* eslint-disable no-prototype-builtins */
const _ = require('lodash')
const GlobPattern = require('./pattern')

/*
  Calculate the difference between files on disk and already indexed
  - databaseMap = hashmap of {path, timestamp}
  - diskMap = hashmap of {path, timestamp}
*/
exports.calculate = (databaseMap, diskMap, { scanMode = 'full', include, exclude }) => {
  const delta = {
    unchanged: [],
    added: [],
    modified: [],
    deleted: [],
    skipped: []
  }
  // TODO: the glob pattern should be passed in
  // It should be identical to the one used by the Glob object that scans the disk
  // For now, partial scans only uses the include/exclude filter
  // If we pass it it, other filters would apply as well (e.g. photo/video/raw...)
  const pattern = new GlobPattern({ include, exclude, extensions: [] })
  _.each(databaseMap, (dbTime, dbPath) => {
    const shouldProcessDBEntry = (scanMode === 'full') ? true : pattern.match(dbPath)
    if (shouldProcessDBEntry) {
      if (diskMap.hasOwnProperty(dbPath)) {
        const modified = Math.abs(dbTime - diskMap[dbPath]) > 1000
        if (modified) {
          delta.modified.push(dbPath)
        } else {
          delta.unchanged.push(dbPath)
        }
      } else {
        if (scanMode === 'incremental') {
          delta.skipped.push(dbPath)
        } else {
          delta.deleted.push(dbPath)
        }
      }
    } else {
      delta.skipped.push(dbPath)
    }
  })
  _.each(diskMap, (diskTime, diskPath) => {
    if (!databaseMap.hasOwnProperty(diskPath)) {
      delta.added.push(diskPath)
    }
  })
  return delta
}
/* eslint-enable no-prototype-builtins */
