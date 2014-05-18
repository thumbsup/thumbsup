var exec    = require('child_process').exec;
var gm      = require('gm');
var async   = require('async');

exports.sizes = {
  thumb: 120,
  large: 1000,
};

// Small square photo thumbnail
exports.photoSquare = function(src, dest, callback) {
  gm(src)
    .resize(exports.sizes.thumb, exports.sizes.thumb, '^')
    .gravity('Center')
    .crop(exports.sizes.thumb, exports.sizes.thumb)
    .quality(90)
    .write(dest, callback);
};

// Large photo
exports.photoLarge = function(src, dest, callback) {
  gm(src)
    .resize(null, exports.sizes.large, '>')
    .quality(90)
    .write(dest, callback);
};

// Web-streaming friendly video
exports.videoWeb = function(src, dest, callback) {
  var ffmpeg = 'ffmpeg -i "' + src + '" -vcodec libx264 -ab 96k -vb 1200k -y "'+ dest +'"';
  exec(ffmpeg, callback);
};

// Large video preview (before you click play)
exports.videoLarge = function(src, dest, callback) {
  var ffmpeg = 'ffmpeg -itsoffset -1 -i "' + src + '" -ss 0.1 -vframes 1 -y "' + dest + '"';
  exec(ffmpeg, callback);
};

// Small square video preview
exports.videoSquare = function(src, dest, callback) {
  async.series([
    exports.videoLarge.bind(this, src, dest),
    exports.photoSquare.bind(this, dest, dest)
  ], callback);
};
