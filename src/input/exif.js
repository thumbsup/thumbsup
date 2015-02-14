var fs      = require('fs');
var async   = require('async');
var exif    = require('exif-parser');
var exec    = require('child_process').exec;

// convert video rotation in degrees
// to the standard EXIF rotation number
var ROTATION_TABLE = {
  '0': 1,
  '90': 6,
  '180': 3,
  '270': 8
};

var FFPROBE_DATE   = /creation_time\s*:\s*(.*)\n/;
var FFPROBE_ROTATE = /rotate\s*:\s*(.*)\n/;

exports.read = function(filePath, callback) {
  if (filePath.match(/\.(jpg|jpeg)$/i)) {
    photo(filePath, callback);
  } else if (filePath.match(/\.(mp4|mov|mts)$/i)) {
    video(filePath, callback);
  } else {
    callback(new Error('Unknown format'));
  }
};

function photo(filePath, callback) {
  fs.readFile(filePath, function(err, contents) {
    if (err) return callback(new Error('Failed to read file ' + filePath));
    try {
      var result = exif.create(contents).parse();
    } catch (ex) {
      return callback(new Error('Failed to read EXIF from ' + filePath));
    }
    callback(null, {
      date: result.tags.DateTimeOriginal ? (result.tags.DateTimeOriginal * 1000) : null,
      orientation: result.tags.Orientation || null
    });
  });
}

function video(filePath, callback) {
  var ffprobe = 'ffprobe "' + filePath + '"';
  exec(ffprobe, function(err, stdout, stderr) {
    var dateMatch = FFPROBE_DATE.exec(stderr);
    var rotateMatch = FFPROBE_ROTATE.exec(stderr);
    callback(null, {
      date: dateMatch ? Date.parse(dateMatch[1]) : null,
      orientation: rotateMatch ? ROTATION_TABLE[rotateMatch[1]] : null
    });
  });
}
