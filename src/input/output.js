const debug = require('debug')('thumbsup')
const path = require('path')
const urljoin = require('url-join')

exports.paths = function (filepath, mediaType, config) {
  if (mediaType === 'image') {
    // originals = config ? config.originalPhotos : false
    return imageOutput(filepath, config)
  } else if (mediaType === 'video') {
    // originals = config ? config.originalVideos : false
    return videoOutput(filepath, config)
  } else {
    debug(`Unsupported file type: ${mediaType}`)
    return {}
  }
}

function imageOutput (filepath, config) {
  const output = {
    thumbnail: {
      path: 'media/thumbs/' + filepath,
      rel: 'photo:thumbnail'
    },
    large: {
      path: 'media/large/' + filepath,
      rel: 'photo:large'
    }
  }
  setDownload(filepath, config, 'image', output)
  return output
}

function videoOutput (filepath, config) {
  var output = {
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
  setDownload(filepath, config, 'video', output)
  return output
}

function setDownload (filepath, config, type, output) {
  const configKey = (type === 'image' ? 'downloadPhotos' : 'downloadVideos')
  const largeVersion = (type === 'image' ? output.large : output.video)
  switch (config[configKey]) {
    case 'large':
      output.download = largeVersion
      break
    case 'copy':
      output.download = {
        path: path.join('media', 'original', filepath),
        rel: 'fs:copy'
      }
      break
    case 'symlink':
      output.download = {
        path: path.join('media', 'original', filepath),
        rel: 'fs:symlink'
      }
      break
    case 'link':
      output.download = {
        path: join(config.downloadLinkPrefix, filepath),
        rel: 'fs:link'
      }
      break
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
