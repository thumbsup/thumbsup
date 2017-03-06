
exports.paths = function (filepath, mediaType, config) {
  if (mediaType === 'video') {
    var originals = config ? config.originalVideos : false
    return videoOutput(filepath, original)
  } else {
    var originals = config ? config.originalPhotos : false
    return imageOutput(filepath)
  }
}

function videoOutput (filepath, originals) {
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
  if (originals) {
    output.download = {
      path: 'media/original/' + filepath,
      rel: 'original'
    }
  } else {
    output.download = output.video
  }
  return output;
}

function imageOutput (filepath, originals) {
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
  if (originals) {
    output.download = {
      path: 'media/original/' + filepath,
      rel: 'original'
    }
  } else {
    output.download = output.large
  }
  return output
}

function ext(file, ext) {
  return file.replace(/\.[a-z0-9]+$/i, '.' + ext)
}
