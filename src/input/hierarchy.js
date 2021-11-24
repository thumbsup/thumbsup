const _ = require('lodash')
const path = require('path')
const Album = require('../model/album')

exports.createAlbums = function (collection, mapper, opts, picasaReader) {
  // returns a top-level album for the home page
  // under which all files are grouped into sub-albums
  // and finalised recursively (calculate stats, etc...)
  const home = group(collection, mapper, opts, picasaReader)
  home.finalize(opts)
  return home
}

function group (collection, mapper, opts, picasaReader) {
  // this hashtable will contain all albums, with the full path as key
  // e.g. groups['holidays/tokyo']
  var groups = {
    // the home album is indexed as '.'
    // the value of '.' is local to this function, and doesn't appear anywhere else
    '.': new Album(opts.homeAlbumName)
  }
  // put all files in the right albums
  // a file can be in multiple albums
  collection.forEach(function (file) {
    const albums = _.chain(mapper.getAlbums(file))
      // All special names map to the same home
      .map(albumPath => !albumPath || ['', '.', '/'].includes(albumPath) ? '.' : albumPath)
      // no duplicate albums
      .uniq()
      .value()
    albums.forEach(albumPath => {
      createAlbumHierarchy(groups, albumPath, opts, picasaReader)
      groups[albumPath].files.push(file)
    })
  })
  // return the top-level album
  return groups['.']
}

function createAlbumHierarchy (allGroupNames, segment, opts, picasaReader) {
  if (!allGroupNames.hasOwnProperty(segment)) {
    // create parent albums first
    const parent = path.dirname(segment)
    if (parent !== '.') {
      createAlbumHierarchy(allGroupNames, parent, opts, picasaReader)
    }

    const picasaName = getPicasaName(segment, opts, picasaReader)
    const lastSegment = path.basename(segment)
    const title = picasaName || lastSegment

    // then create album if it doesn't exist
    // and attach it to its parent
    allGroupNames[segment] = new Album({ title })
    allGroupNames[parent].albums.push(allGroupNames[segment])
  }
}

function getPicasaName (segment, opts, picasaReader) {
  const fullPath = path.join(opts.input, segment)
  const picasaFile = picasaReader.album(fullPath)
  return picasaFile != null ? picasaFile.name : null
}
