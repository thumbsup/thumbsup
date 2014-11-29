var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var metadata    = require('./metadata');
var website     = require('./website');
var thumbs      = require('./thumbs');
var make        = require('./make');

exports.build = function(opts) {

  thumbs.sizes.thumb = opts.thumbSize;
  thumbs.sizes.large = opts.largeSize;

  fs.mkdirpSync(opts.output);
  var media = path.join(opts.output, 'media');
  var meta  = null;

  function buildStep(options) {
    return function(callback) {
      if (options.condition !== false) {
        make.exec(opts.input, media, meta, options, callback);
      } else {
        callback();
      }
    }
  }

  function copyFile(task, callback) {
    fs.copy(task.src, task.dest, callback);
  }

  async.series([

    function updateMetadata(callback) {
      metadata.update(opts, function(err, data) {
        meta = data;
        callback(err);
      });
    },

    buildStep({
      condition: opts.originalPhotos,
      message: 'Original photos',
      ext:     'jpg|jpeg|png',
      dest:    '/original/$path/$name.$ext',
      func:    copyFile
    }),

    buildStep({
      condition: opts.originalVideos,
      message: 'Original videos',
      ext:     'mp4|mov|mts',
      dest:    '/original/$path/$name.$ext',
      func:    copyFile
    }),

    buildStep({
      message: 'Photos (large)',
      ext:     'jpg|jpeg|png',
      dest:    '/large/$path/$name.$ext',
      func:    thumbs.photoLarge
    }),

    buildStep({
      message: 'Photos (thumbs)',
      ext:     'jpg|jpeg|png',
      dest:    '/thumbs/$path/$name.$ext',
      func:    thumbs.photoSquare
    }),

    buildStep({
      message: 'Videos (resized)',
      ext:     'mp4|mov|mts',
      dest:    '/large/$path/$name.mp4',
      func:    thumbs.videoWeb
    }),

    buildStep({
      message: 'Videos (poster)',
      ext:     'mp4|mov|mts',
      dest:    '/large/$path/$name.jpg',
      func:    thumbs.videoLarge
    }),

    buildStep({
      message: 'Videos (thumbs)',
      ext:     'mp4|mov|mts',
      dest:    '/thumbs/$path/$name.jpg',
      func:    thumbs.videoSquare
    }),

    function staticWebsite(callback) {
      website.build(meta, opts, callback);
    }

  ], finish);

};

function finish(err) {
  console.log();
  console.log(err || 'Gallery generated successfully');
  console.log();
  process.exit(err ? 1 : 0)
}
