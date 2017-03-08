const _ = require('lodash')
const path = require('path')
const Album = require('./album')

exports.createAlbums = function (collection, mapper, opts) {
  // returns a top-level album for the home page
  // under which all files are grouped into sub-albums
  // and finalised recursively (calculate stats, etc...)
  var home = new Album('Home')
  home.albums = group(collection, mapper)
  home.finalize(opts)
  return home
}

function group (collection, mapper) {
  var groups = {}
  // put all files in the right albums
  collection.forEach(function (media) {
    var groupName = mapper(media)
    createAlbumHierarchy(groups, groupName)
    groups[groupName].files.push(media)
  })
  // only return top-level albums
  var topLevel = _.keys(groups).filter(function (dir) {
    return path.dirname(dir) === '.'
  })
  return _.values(_.pick(groups, topLevel))
}

function createAlbumHierarchy (allGroupNames, segment) {
  if (!allGroupNames.hasOwnProperty(segment)) {
    // create parent albums first
    var parent = path.dirname(segment)
    if (parent !== '.') {
      createAlbumHierarchy(allGroupNames, parent)
    }
    // then create album if it doesn't exist
    var lastSegment = path.basename(segment)
    allGroupNames[segment] = new Album({title: lastSegment})
    // then attach to parent
    if (parent !== '.') {
      allGroupNames[parent].albums.push(allGroupNames[segment])
    }
  }
}
