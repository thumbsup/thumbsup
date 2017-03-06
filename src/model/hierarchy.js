var Album = require('./album')
var byFolder = require('./by-folder')
var byDate = require('./by-date')

exports.createAlbums = function (collection, opts) {
  // top-level album for the home page
  var home = new Album('Home')
  home.filename = opts.index || 'index'

  // create albums
  if (opts.albumsFrom === 'folders') {
    home.albums = byFolder.albums(collection, opts)
  } else if (opts.albumsFrom === 'date') {
    home.albums = byDate.albums(collection, opts)
  } else {
    throw new Error('Invalid <albumsFrom> option')
  }

  // finalize all albums recursively (calculate stats, etc...)
  home.finalize(opts)
  return home
}
