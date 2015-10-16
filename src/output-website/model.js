var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var glob   = require('glob');

/*
  In-memory structure of the galleries organised in folders
  with relative links to the media, thumbnails, etc...
*/

exports.create = function(metadata, opts) {

  var index = 0;

  function fileInfo(data, file) {
    return {
      id: ++index,
      date: data.exif.date || data.fileDate,
      path: file,
      name: path.basename(file),
      video: data.mediaType === 'video',
      size: opts.thumbSize,
      urls: urls(file, data),
      caption: data.exif.caption
    }
  }

  function urls(file, data) {
    if (data.mediaType === 'video') {
      var urls = videoUrls(file);
      urls.download = opts.originalVideos ? urls.original : urls.video;
      return urls;
    } else {
      var urls = photoUrls(file);
      urls.download = opts.originalPhotos ? urls.original : urls.large;
      return urls;
    }
  }

  function videoUrls(file) {
    return {
      thumb:     'media/thumbs/' + ext(file, 'jpg'),
      poster:    'media/large/' + ext(file, 'jpg'),
      video:     'media/large/' + ext(file, 'mp4'),
      original:  'media/original/' + file
    };
  }

  function photoUrls(file) {
    return {
      thumb:     'media/thumbs/' + file,
      large:     'media/large/' + file,
      original:  'media/original/' + file
    };
  }

  function ext(file, ext) {
    return file.replace(/\.[a-z0-9]+$/i, '.' + ext);
  }

  function byFolder(file) {
    return path.dirname(file.path);
  }

  function folderInfo(files, name) {
    return {
      name: name,
      media: files,
      url: name + '.html'
    };
  }

  var sortFunctions = {
    'name': function(folder) {
      return folder.name;
    },
    'date': function(folder) {
      return _(folder.media).sortBy('date').first().date;
    }
  };

  var chosenSort = sortFunctions[opts.sortAlbumsBy];

  var orderFunctions = {
    'asc': function(data) {
      return data;
    },
    'desc': function(data) {
        return _.map(data).reverse();
    }
  };

  var orderSort = orderFunctions[opts.sortAlbumsOrder];


  return _(metadata).map(fileInfo)
                   .sortBy('date')
                   .groupBy(byFolder)
                   .map(folderInfo)
                   .sortBy(chosenSort)
                   .sortBy(orderSort)
                   .value();

};
