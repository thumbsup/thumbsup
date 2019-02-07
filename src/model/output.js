const warn = require('debug')('thumbsup:warn')
const path = require('path')
const urljoin = require('url-join')

const BROWSER_SUPPORTED_EXT = /\.(jpg|jpeg|png|gif)$/i

exports.paths = function (filepath, mediaType, opts) {
  if (mediaType === 'image') {
    return image(filepath, opts)
  } else if (mediaType === 'video') {
    return video(filepath, opts)
  } else {
    warn(`Unsupported file type <${mediaType}> for ${filepath}`)
    return {}
  }
}

function image (filepath, opts) {
  return {
    thumbnail: relationship(filepath, 'photo:thumbnail'),
    large: relationship(filepath, shortRel('image', opts.photoPreview), opts),
    download: relationship(filepath, shortRel('image', opts.photoDownload), opts)
  }
}

function video (filepath, opts) {
  return {
    thumbnail: relationship(filepath, 'video:thumbnail'),
    large: relationship(filepath, 'video:poster'),
    video: relationship(filepath, shortRel('video', opts.videoPreview), opts),
    download: relationship(filepath, shortRel('video', opts.videoDownload), opts)
  }
}

function shortRel (mediaType, shorthand) {
  shorthand = shorthand || 'resize'
  switch (shorthand) {
    case 'resize': return mediaType === 'image' ? 'photo:large' : 'video:resized'
    case 'copy': return 'fs:copy'
    case 'symlink': return 'fs:symlink'
    case 'link': return 'fs:link'
    default: return null
  }
}

function relationship (filepath, rel, options) {
  return {
    path: pathForRelationship(filepath, rel, options),
    rel: rel
  }
}

function pathForRelationship (filepath, rel, options) {
  switch (rel) {
    case 'photo:thumbnail': return 'media/thumbs/' + supportedPhotoFilename(filepath)
    case 'photo:large': return 'media/large/' + supportedPhotoFilename(filepath)
    case 'video:thumbnail': return 'media/thumbs/' + ext(filepath, 'jpg')
    case 'video:poster': return 'media/large/' + ext(filepath, 'jpg')
    case 'video:resized': return 'media/large/' + ext(filepath, options.videoFormat)
    case 'fs:copy': return path.join('media', 'original', filepath)
    case 'fs:symlink': return path.join('media', 'original', filepath)
    case 'fs:link': return join(options.linkPrefix, filepath)
    default: return null
  }
}

function supportedPhotoFilename (filepath) {
  const extension = path.extname(filepath)
  return extension.match(BROWSER_SUPPORTED_EXT) ? filepath : ext(filepath, 'jpg')
}

function ext (file, ext) {
  return file.replace(/\.[a-z0-9]+$/i, '.' + ext)
}

function join (prefix, filepath) {
  if (prefix.match(/^https?:\/\//)) {
    return urljoin(prefix, filepath)
  } else {
    return path.join(prefix, filepath)
  }
}
