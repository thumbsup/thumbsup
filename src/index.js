var _           = require('lodash');
var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var regen       = require('regen');
var metadata    = require('./metadata');
var website     = require('./website');
var thumbs      = require('./thumbs');

exports.build = function(opts) {

  opts = _.defaults(opts, {
    title: 'Photo gallery',
    thumbSize: 120,
    largeSize: 1000
  });

  opts.input = path.resolve(opts.input);
  opts.output = path.resolve(opts.output);

  thumbs.sizes.thumb = opts.thumbSize;
  thumbs.sizes.large = opts.largeSize;

  fs.mkdirpSync(opts.output);
  var media = path.join(opts.output, 'media');

  async.series([

    buildStep('Original media', {
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png,mp4,mov}',
      dest: media + '/original/$path/$name.$ext',
      process: fs.copy
    }),

    buildStep('Photos (large)', {
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png}',
      dest: media + '/large/$path/$name.$ext',
      process: thumbs.photoLarge,
    }),

    buildStep('Photos (thumbs)', {
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png}',
      dest: media + '/thumbs/$path/$name.$ext',
      process: thumbs.photoSquare,
    }),

    buildStep('Videos (web)', {
      cwd: opts.input,
      src: '**/*.{mp4,mov}',
      dest: media + '/large/$path/$name.mp4',
      process: thumbs.videoWeb,
    }),

    buildStep('Videos (poster)', {
      cwd: opts.input,
      src: '**/*.{mp4,mov}',
      dest: media + '/large/$path/$name.jpg',
      process: thumbs.videoLarge,
    }),

    buildStep('Videos (thumbs)', {
      cwd: opts.input,
      src: '**/*.{mp4,mov}',
      dest: media + '/thumbs/$path/$name.jpg',
      process: thumbs.videoSquare,
    }),

    // buildStep('Read EXIF data', {
    //   cwd: opts.input,
    //   src: '**/*.{jpg,jpeg}',
    //   dest: metaFile,
    //   process: function(src, dest, callback) {
    //     fs.readFile(src, function(err, buffer) {
    //       var result = exif.create(buffer).parse();
    //       var filePath = path.relative(opts.input, src);
    //       metadata.exif[filePath] = {
    //         date: result.tags.DateTimeOriginal
    //       };
    //       callback();
    //     });
    //   }
    // }),

    function updateMetadata(callback) {
      metadata.update(opts, callback);
    },

    function staticWebsite(callback) {
      website.build(opts, callback);
    }

  ], finish);

};


function buildStep(message, opts) {
  return function(callback) {
    regen(_.extend(opts, {
      report: pad(message, 20) + '$progress'
    }), callback);
  }
}

function finish(err) {
  console.log();
  console.log(err || 'Gallery generated successfully');
  console.log();
  process.exit(err ? 1 : 0)
}
