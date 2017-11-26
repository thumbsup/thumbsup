const micromatch = require('micromatch')
const readdir = require('readdir-enhanced')

const PHOTO_EXT = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp']
const VIDEO_EXT = ['3gp', 'flv', 'm2ts', 'mkv', 'mp4', 'mov', 'mts', 'ogg', 'ogv', 'webm']
const MEDIA_GLOB = '**/*.{' + PHOTO_EXT.join(',') + ',' + VIDEO_EXT.join(',') + '}'

/*
  Return a hashmap of {path, timestamp}
  for all the media files in the target folder
*/
exports.find = function (rootFolder, callback) {
  const entries = {}
  const stream = readdir.readdirStreamStat(rootFolder, {
    filter: entry => micromatch(entry.path, MEDIA_GLOB, {nocase: true}).length !== 0,
    deep: stats => stats.path.charAt(0) !== '.',
    basePath: '',
    sep: '/'
  })
  stream.on('data', stats => { entries[stats.path] = stats.mtime.getTime() })
  stream.on('error', err => isEnoentCodeError(err) ? callback(null, {}) : callback(err))
  stream.on('end', () => callback(null, entries))
}

function isEnoentCodeError (err) {
  return err.code === 'ENOENT'
}
