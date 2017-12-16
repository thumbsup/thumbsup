const path = require('path')
const Album = require('../model/album')

exports.createAlbums = function (collection, mapper, opts) {
  // returns a top-level album for the home page
  // under which all files are grouped into sub-albums
  // and finalised recursively (calculate stats, etc...)
  const home = group(collection, mapper)
  home.finalize(opts)
  return home
}

function group (collection, mapper) {
  // this hashtable will contain all albums, with the full path as key
  // e.g. groups['holidays/tokyo']
  var groups = {
    // the home album is indexed as '.'
    // the value of '.' is local to this function, and doesn't appear anywhere else
    '.': new Album('Home')
  }
  // put all files in the right albums
  collection.forEach(function (file) {
    var groupName = mapper(file)
    if (!groupName || groupName === '/') {
      groupName = '.'
    }
    createAlbumHierarchy(groups, groupName)
    groups[groupName].files.push(file)
  })
  // return the top-level album
  return groups['.']
}

function createAlbumHierarchy (allGroupNames, segment) {
  if (!allGroupNames.hasOwnProperty(segment)) {
    // create parent albums first
    var parent = path.dirname(segment)
    if (parent !== '.') {
      createAlbumHierarchy(allGroupNames, parent)
    }
    // then create album if it doesn't exist
    // and attach it to its parent
    var lastSegment = path.basename(segment)
    allGroupNames[segment] = new Album({title: lastSegment})
    allGroupNames[parent].albums.push(allGroupNames[segment])
  }
}
