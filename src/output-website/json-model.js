const _ = require('lodash')
const pkg = require('../../package.json')

exports.from = function (album) {
  return JSON.stringify({
    version: pkg.version,
    album: cleanAlbum(album)
  }, null, 2)
}

function cleanAlbum (album) {
  const copy = _.extend({}, album)
  copy.albums = copy.albums.map(cleanAlbum)
  copy.files = copy.files.map(cleanMedia)
  return copy
}

function cleanMedia (media) {
  return _.omit(media, 'file')
}
