var _           = require('lodash');
var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var regen       = require('regen');

var galleries   = require('./galleries');
var render      = require('./render');
var thumbs      = require('./thumbs');
var files       = require('./files');

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

  fs.mkdirp(opts.output);
  var media = path.join(opts.output, 'media');

  function website(callback) {
    galleries.fromDisk(opts.input, opts.thumbSize, function(err, list) {
      if (err) return callback(err);

      var style = opts.css ? path.basename(opts.css) : null;

      var rendered = render.gallery(list, list[0], opts.title, style);
      var outputPath = path.join(opts.output, 'index.html');
      fs.writeFileSync(outputPath, rendered);
    
      list.forEach(function(folder) {
        var rendered = render.gallery(list, folder, opts.title, style);
        var outputPath = path.join(opts.output, folder.url);
        fs.writeFileSync(outputPath, rendered);
      });
    
      callback();
    });
  }

  function support(callback) {
    var src = path.join(__dirname, '..', 'public');
    var dest = path.join(opts.output, 'public');
    copyFolder(src, dest, callback);
  }

  function customStyle(callback) {
    if (opts.css) {
      var dest = path.join(opts.output, 'public', path.basename(opts.css));
      fs.copy(opts.css, dest, callback);
    } else {
      callback();
    }
  }

  function copyMedia(callback) {
    regen({
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png,mp4,mov}',
      dest: media + '/original/$path/$name.$ext',
      process: fs.copy
    }, callback);
  }

  function photoLarge(callback) {
    regen({
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png}',
      dest: media + '/large/$path/$name.$ext',
      process: thumbs.photoLarge
    }, callback);
  }

  function photoThumbs(callback) {
    regen({
      cwd: opts.input,
      src: '**/*.{jpg,jpeg,png}',
      dest: media + '/thumbs/$path/$name.$ext',
      process: thumbs.photoSquare
    }, callback);
  }

  function videoLarge(callback) {
    regen({
      cwd: opts.input,
      src: '**/*.{mp4,mov}',
      dest: media + '/large/$path/$name.jpg',
      process: thumbs.videoLarge
    }, callback);
  }

  function videoThumbs(callback) {
    regen({
      cwd: opts.input,
      src: '**/*.{mp4,mov}',
      dest: media + '/thumbs/$path/$name.jpg',
      process: thumbs.videoSquare
    }, callback);
  }

  async.series([
    step('Website',           website),
    step('Support',           support),
    step('Custom styles',     customStyle),
    step('Original media',    copyMedia),
    step('Photos (large)',    photoLarge),
    step('Photos (thumbs)',   photoThumbs),
    step('Videos (large)',    videoLarge),
    step('Videos (thumbs)',   videoThumbs)
  ], finish);

};

function copyFolder(src, dest, callback) {
  var src = path.resolve(src);
  var dest = path.resolve(dest);
  if (files.newer(src, dest)) {
    fs.copy(src, dest, callback);
  } else {
    callback();
  }
}

function step(msg, fn) {
  return function(callback) {
    console.log(pad(msg, 20) + '[STARTED]')
    fn(function(err) {
      console.log(pad(msg, 20) + (err ? '[FAILED]\n' : '[OK]'));
      callback(err);
    });
  };
}

function finish(err) {
  console.log(err || 'Done');
  console.log();
  process.exit(err ? 1 : 0)
}
