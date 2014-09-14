var _           = require('lodash');
var fs          = require('fs');
var path        = require('path');
var glob        = require('glob');
var async       = require('async');
var pad         = require('pad');
var exif        = require('exif-parser');
var ProgressBar = require('progress');

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
    glob('**/*.{jpg,jpeg,png,mp4,mov}', globOptions, callback);
  }

  function pathAndDate(filePath, next) {
    var absolute = path.join(opts.input, filePath);
    fs.stat(absolute, function(err, stats) {
      next(null, {
        absolute: absolute,
        relative: filePath,
        fileDate: Math.max(stats.ctime.getTime(), stats.mtime.getTime())
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
    var actualPaths   = _.pluck(allFiles, 'relative');
    var deleted = _.difference(existingPaths, actualPaths);
    deleted.forEach(function(key) {
      delete existing[key];
    });
    return deleted.length > 0;
  }

  function metadata(fileInfo) {
    return {
      path: fileInfo.relative,
      fileDate: fileInfo.fileDate,
      mediaDate: mediaDate(fileInfo),
      mediaType: mediaType(fileInfo)
    };
  }

  function mediaDate(fileInfo) {
    if (fileInfo.relative.match(/\.(jpg|jpeg)$/i)) {
      var contents = fs.readFileSync(fileInfo.absolute);
      var result = exif.create(contents).parse();
      var exifDate = result.tags.DateTimeOriginal * 1000;
      return exifDate || fileInfo.fileDate;
    } else {
      return fileInfo.fileDate;
    }
  }

  function mediaType(fileInfo) {
    return fileInfo.relative.match(/\.(mp4|mov)$/i) ? 'video' : 'photo';
  }

  findFiles(function(err, files) {
    process.stdout.write(pad('List all files', 20));
    async.map(files, pathAndDate, function (err, allFiles) {
      console.log('[===================] done');
      var deleted = removeDeletedFiles(allFiles);
      var toProcess = allFiles.filter(newer);
      var count = toProcess.length;
      if (count > 0) {
        var format = pad('Update metadata', 20) + '[:bar] :current/:total files';
        var bar = new ProgressBar(format, { total: count, width: 20 });
        var update = toProcess.map(function(fileInfo) {
          bar.tick();
          return metadata(fileInfo);
        });
        update.forEach(function(fileInfo) {
          existing[fileInfo.path] = _.omit(fileInfo, 'path');
        });
      }
      if (deleted || (count > 0)) {
        fs.writeFileSync(metadataPath, JSON.stringify(existing, null, '  '));
      }
      callback(null, existing);
    });
  });

};
