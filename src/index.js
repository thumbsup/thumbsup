var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var make        = require('./utils/make');
var metadata    = require('./input/metadata');
var thumbs      = require('./output-media/thumbs');
var website     = require('./output-website/website');
var collection  = require('./collection');

exports.build = function(opts) {

  thumbs.sizes.thumb = opts.thumbSize;
  thumbs.sizes.large = opts.largeSize;

  fs.mkdirpSync(opts.output);
  var media = path.join(opts.output, 'media');
  var meta = null;
  var allFiles = collection.fromMetadata({});

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
        allFiles = collection.fromMetadata(data);
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
      ext:     'mp4|mov|mts|m2ts',
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
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/large/$path/$name.mp4',
      func:    thumbs.videoWeb
    }),

    buildStep({
      message: 'Videos (poster)',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/large/$path/$name.jpg',
      func:    thumbs.videoLarge
    }),

    buildStep({
      message: 'Videos (thumbs)',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/thumbs/$path/$name.jpg',
      func:    thumbs.videoSquare
    }),

    function staticWebsite(callback) {
      website.build(allFiles, opts, callback);
    }

  ], finish);

};

function finish(err) {
  console.log();
  console.log(err || 'Gallery generated successfully');
  console.log();
  process.exit(err ? 1 : 0)
}
