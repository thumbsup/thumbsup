var exec    = require('child_process').exec;
var path    = require('path');
var async   = require('async');
var mkdirp  = require('mkdirp');
var gm      = require('gm');


/* opts = input, thumbnail, size */
exports.photo = function(opts, callback) {

  mkdirp(path.dirname(opts.thumbnail));

  gm(path.resolve(opts.input))
    .resize(opts.size, opts.size, "^")
    .gravity('Center')
    .crop(opts.size, opts.size)
    .write(path.resolve(opts.thumbnail), callback);

};

/* opts = input, thumbnail, poster, size */
exports.video = function(opts, callback) {

  var fnVideo = function(next) {
    var ffmpeg = 'ffmpeg -itsoffset -1 -i "' + opts.input + '" -ss 0.1 -vframes 1 -y "' + opts.poster + '"';
    exec(ffmpeg, next);
  };

  var fnPhoto = function(next) {
    exports.photo({
      input: opts.poster,
      thumbnail: opts.thumbnail,
      size: opts.size
    }, next);
  };

  mkdirp(path.dirname(opts.thumbnail));
  async.series([fnVideo, fnPhoto], callback);

};
