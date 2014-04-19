var exec  = require('child_process').exec;
var async = require('async');
var gm    = require('gm');


/* opts = input, thumbnail, size */
exports.photo = function(opts, callback) {

  gm(opts.input)
    .resize(opts.size, opts.size, "^")
    .gravity('Center')
    .crop(opts.size, opts.size)
    .write(opts.thumbnail, callback);

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

  async.series([fnVideo, fnPhoto], callback);

};
