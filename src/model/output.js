const debug = require('debug')('thumbsup')
const path = require('path')
const urljoin = require('url-join')

exports.paths = function (filepath, mediaType, opts) {
  if (mediaType === 'image') {
    const items = imageOutput(filepath)
    items.download = download(filepath, opts['downloadPhotos'], opts['downloadLinkPrefix'], items.large)
    return items
  } else if (mediaType === 'video') {
    const items = videoOutput(filepath)
    items.download = download(filepath, opts['downloadVideos'], opts['downloadLinkPrefix'], items.video)
    return items
  } else {
    debug(`Unsupported file type: ${mediaType}`)
    return {}
  }
}

function imageOutput (filepath) {
  return {
    thumbnail: {
      path: 'media/thumbs/' + filepath,
      rel: 'photo:thumbnail'
    },
    large: {
      path: 'media/large/' + filepath,
      rel: 'photo:large'
    }
  }
}

function videoOutput (filepath) {
  return {
    thumbnail: {
      path: 'media/thumbs/' + ext(filepath, 'jpg'),
      rel: 'video:thumbnail'
    },
    large: {
      path: 'media/large/' + ext(filepath, 'jpg'),
      rel: 'video:poster'
    },
    video: {
      path: 'media/large/' + ext(filepath, 'mp4'),
      rel: 'video:resized'
    }
  }
}

function download (filepath, downloadConfig, linkPrefix, largeVersion) {
  switch (downloadConfig) {
    case 'copy':
      return {
        path: path.join('media', 'original', filepath),
        rel: 'fs:copy'
      }
    case 'symlink':
      return {
        path: path.join('media', 'original', filepath),
        rel: 'fs:symlink'
      }
    case 'link':
      return {
        path: join(linkPrefix, filepath),
        rel: 'fs:link'
      }
    case 'large':
    default:
      return largeVersion
  }
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
