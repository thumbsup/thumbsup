const _ = require('lodash')

/*
  Calculate the difference between files on disk and already indexed
  - databaseMap = hashmap of {path, timestamp}
  - diskMap = hashmap of {path, timestamp}
*/
exports.calculate = (databaseMap, diskMap) => {
  const delta = {
    unchanged: [],
    added: [],
    modified: [],
    deleted: []
  }
  _.each(databaseMap, (dbTime, dbPath) => {
    if (diskMap.hasOwnProperty(dbPath)) {
      const modified = Math.abs(dbTime - diskMap[dbPath]) > 1000
      if (modified) {
        delta.modified.push(dbPath)
      } else {
        delta.unchanged.push(dbPath)
      }
    } else {
      delta.deleted.push(dbPath)
    }
  })
  _.each(diskMap, (diskTime, diskPath) => {
    if (!databaseMap.hasOwnProperty(diskPath)) {
      delta.added.push(diskPath)
    }
  })
  return delta
}
