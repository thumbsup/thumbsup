var _           = require('lodash');
var fs          = require('fs');
var path        = require('path');
var glob        = require('glob');
var async       = require('async');
var pad         = require('pad');
var progress    = require('../utils/progress');
var exif        = require('./exif');

exports.update = function(opts, callback) {

  var metadataPath = path.join(opts.output, 'metadata.json');
  var existing = null;
  var existingDate = null;

  try {
    existing = require(metadataPath);
    existingDate = fs.statSync(metadataPath).mtime;
  } catch (ex) {
    existing = {};
    existingDate = 0;
  }

  function findFiles(callback) {
    var globOptions = {
      cwd: opts.input,
      nonull: false,
      nocase: true
    };
    glob('**/*.{jpg,jpeg,png,mp4,mov,mts,m2ts}', globOptions, callback);
  }

  function pathAndDate(filePath, next) {
    var absolute = path.join(opts.input, filePath);
    fs.stat(absolute, function(err, stats) {
      next(null, {
        absolute: absolute,
        relative: filePath,
        fileDate: stats.mtime.getTime()
      });
    });
  }

  function newer(fileInfo) {
    var found = existing[fileInfo.relative];
    if (!found) return true;
    return fileInfo.fileDate > existingDate;
  }

  function removeDeletedFiles(allFiles) {
    var existingPaths = _.keys(existing);
    var actualPaths   = _.map(allFiles, 'relative');
    var deleted = _.difference(existingPaths, actualPaths);
    deleted.forEach(function(key) {
      delete existing[key];
    });
    return deleted.length > 0;
  }

  function metadata(fileInfo, callback) {
    exif.read(fileInfo.absolute, function(err, exifData) {
      callback(null, {
        path: fileInfo.relative,
        fileDate: fileInfo.fileDate,
        mediaType: mediaType(fileInfo),
        exif: {
          date: exifData ? exifData.date : null,
          orientation: exifData ? exifData.orientation : null,
          caption: exifData ? exifData.caption: null
        }
      });
    });
  }

  function mediaType(fileInfo) {
    return fileInfo.relative.match(/\.(mp4|mov|mts|m2ts)$/i) ? 'video' : 'photo';
  }

  function writeToDisk() {
    fs.writeFileSync(metadataPath, JSON.stringify(existing, null, '  '));
  }

  findFiles(function(err, files) {
    var bar = progress.create('List all files', files.length);
    bar.tick(files.length);
    async.map(files, pathAndDate, function (err, allFiles) {
      var deleted = removeDeletedFiles(allFiles);
      var toProcess = allFiles.filter(newer);
      var count = toProcess.length;
      var bar = progress.create('Update metadata', count);
      if (count > 0) {
        bar.tick(0);
        async.mapLimit(toProcess, 100, function(fileInfo, next) {
          bar.tick();
          metadata(fileInfo, next);
        }, function(err, update) {
          update.forEach(function(fileInfo) {
            existing[fileInfo.path] = _.omit(fileInfo, 'path');
          });
          writeToDisk();
          callback(null, existing);
        });
      } else {
        bar.tick(1);
        if (deleted) writeToDisk();
        callback(null, existing);
      }
    });
  });

};
