var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');

var galleries   = require('./galleries');
var render      = require('./render');
var thumbs      = require('./thumbs');
var files       = require('./files');
var make        = require('./make');

exports.build = function(opts) {

  if (opts.thumbSize) thumbs.sizes.thumb = opts.thumbSize;
  if (opts.largeSize) thumbs.sizes.large = opts.largeSize;

  fs.mkdirp(opts.output);
  var media = path.join(opts.output, 'media');

  function website(callback) {
    galleries.fromDisk(opts.input, thumbs.sizes.thumb, function(err, list) {
      if (err) return callback(err);

      var rendered = render.gallery(list, list[0]);
      var outputPath = path.join(opts.output, 'index.html');
      fs.writeFileSync(outputPath, rendered);
    
      list.forEach(function(folder) {
        var rendered = render.gallery(list, folder);
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

  function copyMedia(callback) {
    var dest = path.join(opts.output, 'media', 'original');
    copyFolder(opts.input, dest, callback);
  }

  function photoLarge(callback) {
    make({
      source: opts.input,
      filter: '**/*.{jpg,jpeg,png}',
      dest: media + '/large/$path/$name.$ext',
      process: thumbs.photoLarge
    }, callback);
  }

  function photoThumbs(callback) {
    make({
      source: opts.input,
      filter: '**/*.{jpg,jpeg,png}',
      dest: media + '/thumbs/$path/$name.$ext',
      process: thumbs.photoSquare
    }, callback);
  }

  function videoLarge(callback) {
    make({
      source: opts.input,
      filter: '**/*.{mp4,mov}',
      dest: media + '/large/$path/$name.jpg',
      process: thumbs.videoLarge
    }, callback);
  }

  function videoThumbs(callback) {
    make({
      source: opts.input,
      filter: '**/*.{mp4,mov}',
      dest: media + '/thumbs/$path/$name.jpg',
      process: thumbs.videoSquare
    }, callback);
  }

  async.series([
    step('Website',           website),
    step('Support',           support),
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
