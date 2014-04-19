var exec    = require('child_process').exec;
var fs      = require('fs-extra');
var path    = require('path');
var async   = require('async');
var gm      = require('gm');


// default thumbnail size (square)
exports.size = 100;

// opts = input, thumbnail
exports.photo = function(opts, callback) {

  fs.mkdirpSync(path.dirname(opts.thumbnail));

  gm(path.resolve(opts.input))
    .resize(exports.size, exports.size, "^")
    .gravity('Center')
    .crop(exports.size, exports.size)
    .write(path.resolve(opts.thumbnail), callback);

};

// opts = input, thumbnail, poster
exports.video = function(opts, callback) {

  var fnVideo = function(next) {
    var ffmpeg = 'ffmpeg -itsoffset -1 -i "' + opts.input + '" -ss 0.1 -vframes 1 -y "' + opts.poster + '"';
    exec(ffmpeg, next);
  };

  var fnPhoto = function(next) {
    exports.photo({
      input: opts.poster,
      thumbnail: opts.thumbnail
    }, next);
  };

  fs.mkdirpSync(path.dirname(opts.thumbnail));
  async.series([fnVideo, fnPhoto], callback);

};
