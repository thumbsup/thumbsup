const micromatch = require('micromatch')
const readdir = require('readdir-enhanced')
const warn = require('debug')('thumbsup:warn')

const PHOTO_EXT = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp']
const VIDEO_EXT = ['3gp', 'flv', 'm2ts', 'm4v', 'mkv', 'mp4', 'mov', 'mts', 'ogg', 'ogv', 'webm']
const MEDIA_GLOB = '**/*.{' + PHOTO_EXT.join(',') + ',' + VIDEO_EXT.join(',') + '}'

/*
  Return a hashmap of {path, timestamp}
  for all the media files in the target folder
*/
exports.find = function (rootFolder, callback) {
  const entries = {}
  const stream = readdir.readdirStreamStat(rootFolder, {
    filter: entry => micromatch.match(entry.path, MEDIA_GLOB, {nocase: true}).length !== 0,
    deep: stats => canTraverse(stats.path),
    basePath: '',
    sep: '/'
  })
  stream.on('data', stats => { entries[stats.path] = stats.mtime.getTime() })
  stream.on('error', err => warn(err.message))
  stream.on('end', () => callback(null, entries))
}

function canTraverse (folder) {
  // ignore folders starting with '.'
  // and thumbnail folders from Synology NAS
  // it's better to skip them in the "traverse phase" than to remove them at the end
  const match = micromatch.match(folder, '**/**', {
    dot: false,
    ignore: ['**/@eaDir', '#recycle']
  })
  return match.length > 0
}
