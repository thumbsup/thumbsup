const path = require('node:path')
const URL = require('url').URL
const url = require('./url')

const BROWSER_SUPPORTED_EXT = /(jpg|jpeg|png|gif)$/i

exports.folders = function (filepath, rel, options = {}) {
  const dir = path.dirname(filepath)
  const name = path.basename(filepath, path.extname(filepath))
  const ext = path.extname(filepath).substr(1)
  const photoExt = photoExtension(filepath)
  const videoExt = options.videoFormat || 'mp4'
  switch (rel) {
    case 'photo:thumbnail': return path.normalize(`media/thumbs/${dir}/${name}.${photoExt}`)
    case 'photo:small': return path.normalize(`media/small/${dir}/${name}.${photoExt}`)
    case 'photo:large': return path.normalize(`media/large/${dir}/${name}.${photoExt}`)
    case 'video:thumbnail': return path.normalize(`media/thumbs/${dir}/${name}.jpg`)
    case 'video:small': return path.normalize(`media/small/${dir}/${name}.jpg`)
    case 'video:poster': return path.normalize(`media/large/${dir}/${name}.jpg`)
    case 'video:resized': return path.normalize(`media/large/${dir}/${name}.${videoExt}`)
    case 'fs:copy': return path.normalize(`media/original/${dir}/${name}.${ext}`)
    case 'fs:symlink': return path.normalize(`media/original/${dir}/${name}.${ext}`)
    case 'fs:link': return join(options.linkPrefix, filepath)
    default: throw new Error(`Invalid relationship: ${rel}`)
  }
}

exports.suffix = function (filepath, rel, options = {}) {
  const dir = path.dirname(filepath)
  const name = path.basename(filepath, path.extname(filepath))
  const ext = path.extname(filepath).substr(1)
  const photoExt = photoExtension(filepath)
  const videoExt = options.videoFormat || 'mp4'
  switch (rel) {
    case 'photo:thumbnail': return path.normalize(`media/${dir}/${name}_${ext}_thumb.${photoExt}`)
    case 'photo:small': return path.normalize(`media/${dir}/${name}_${ext}_small.${photoExt}`)
    case 'photo:large': return path.normalize(`media/${dir}/${name}_${ext}_large.${photoExt}`)
    case 'video:thumbnail': return path.normalize(`media/${dir}/${name}_${ext}_thumb.jpg`)
    case 'video:small': return path.normalize(`media/${dir}/${name}_${ext}_small.jpg`)
    case 'video:poster': return path.normalize(`media/${dir}/${name}_${ext}_poster.jpg`)
    case 'video:resized': return path.normalize(`media/${dir}/${name}_${ext}_large.${videoExt}`)
    case 'fs:copy': return path.normalize(`media/${dir}/${name}.${ext}`)
    case 'fs:symlink': return path.normalize(`media/${dir}/${name}.${ext}`)
    case 'fs:link': return join(options.linkPrefix, filepath)
    default: throw new Error(`Invalid relationship: ${rel}`)
  }
}

function photoExtension (filepath) {
  const extension = path.extname(filepath).substr(1)
  return extension.match(BROWSER_SUPPORTED_EXT) ? extension : 'jpg'
}

function join (prefix, filepath) {
  if (prefix.match(/^(http|https|file):\/\//)) {
    const safePrefix = prefix.endsWith('/') ? prefix : (prefix + '/')
    return new URL(url.fromPath(filepath), safePrefix).href
  } else {
    return path.join(prefix, filepath)
  }
}
