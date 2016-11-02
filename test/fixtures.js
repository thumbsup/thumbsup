var File = require('../src/model/file');

exports.metadata = function() {
  return {
    fileDate: new Date(),
    mediaType: 'photo',
    exif: {
      date: null,
      orientation: 1,
      caption: ''
    }
  };
};

exports.date = function(str) {
  return new Date(Date.parse(str));
};

exports.photo = function(opts) {
  opts = opts || {};
  var date = opts.date ? new Date(Date.parse(opts.date)) : new Date();
  return new File(opts.path || 'tmp', {
    fileDate: date,
    mediaType: 'photo',
    exif: {
      date: null,
      orientation: 1,
      caption: ''
    }
  });
};

exports.video = function(opts) {
  opts = opts || {};
  var date = opts.date ? new Date(Date.parse(opts.date)) : new Date();
  return new File(opts.path || 'tmp', {
    fileDate: date,
    mediaType: 'video',
    exif: {
      date: null,
      orientation: 1,
      caption: ''
    }
  });
};
