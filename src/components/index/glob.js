const readdir = require('readdir-enhanced')
const warn = require('debug')('thumbsup:warn')
const GlobPattern = require('./pattern')

const PHOTO_EXT = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'webp']
const VIDEO_EXT = ['3gp', 'avi', 'flv', 'm2ts', 'm4v', 'mkv', 'mp4', 'mov', 'mts', 'ogg', 'ogv', 'webm', 'wmv']
const RAW_PHOTO_EXT = [
  '3fr', 'arw', 'cr2', 'crw', 'dcr', 'dng', 'erf', 'k25', 'kdc',
  'mef', 'mrw', 'nef', 'orf', 'pef', 'raf', 'sr2', 'srf', 'x3f'
]

/*
  Return a hashmap of {path, timestamp}
  for all the media files in the target folder
*/
exports.find = function (rootFolder, options, callback) {
  const entries = {}
  const pattern = new GlobPattern({
    include: (options.include && options.include.length > 0) ? options.include : '**/**',
    exclude: options.exclude || [],
    extensions: exports.supportedExtensions(options)
  })
  const stream = readdir.readdirStreamStat(rootFolder, {
    filter: file => pattern.match(file.path),
    deep: dir => pattern.canTraverse(dir.path),
    basePath: '',
    sep: '/'
  })
  stream.on('data', stats => { entries[stats.path] = stats.mtime.getTime() })
  stream.on('error', err => warn(err.message))
  stream.on('end', () => callback(null, entries))
}

exports.supportedExtensions = function (options) {
  const extensions = []
  if (options.includePhotos !== false) Array.prototype.push.apply(extensions, PHOTO_EXT)
  if (options.includeVideos !== false) Array.prototype.push.apply(extensions, VIDEO_EXT)
  if (options.includeRawPhotos) Array.prototype.push.apply(extensions, RAW_PHOTO_EXT)
  return extensions
}
