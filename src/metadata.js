var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var glob  = require('glob');
var pad   = require('pad');
var exif  = require('exif-parser');

exports.update = function(opts, callback) {

  var metadataPath = path.join(opts.output, 'metadata.json');
  var existing = null;

  try {
    existing = require(metadataPath);
  } catch (ex) {
    existing = {};
  }

  function findFiles(callback) {
    var globOptions = {
      cwd: opts.input,
      nonull: false,
      nocase: true
    };
    glob('**/*.{jpg,jpeg,png,mp4,mov}', globOptions, callback);
  }
  
  function newer(filePath) {
    var found = existing[filePath];
    if (!found) return true;
    var absolute = path.join(opts.input, filePath);
    var stats = fs.statSync(absolute);
    var latest = Math.max(stats.ctime.getTime(), stats.mtime.getTime());
    return latest > (found.processed * 1000);
  }
  
  function metadata(filePath, callback) {
    var absolute = path.join(opts.input, filePath);
    return {
      path: filePath,
      type: mediaType(absolute),
      date: mediaDate(absolute),
      processed: Math.floor(new Date().getTime() / 1000)
    };
  }
  
  function mediaType(filePath) {
    return filePath.match(/\.(mp4|mov)$/) ? 'video' : 'photo';
  }

  function mediaDate(filePath) {
    // timestamp in UNIX format
    var timestamp = fs.statSync(filePath).ctime.getTime() / 1000;
    if (filePath.match(/\.(jpg|jpeg)$/)) {
      var contents = fs.readFileSync(filePath);
      var result = exif.create(contents).parse();
      var exifDate = result.tags.DateTimeOriginal;
      return exifDate || timestamp;
    } else {
      return timestamp;
    }
  }

  findFiles(function(err, files) {
    var toProcess = files.filter(newer);
    var count = toProcess.length;
    if (count > 0) {
      process.stdout.write(pad('Update metadata', 20));
      var data = toProcess.map(metadata);
      data.forEach(function(file) {
        existing[file.path] = _.omit(file, 'path');
      });
      fs.writeFileSync(metadataPath, JSON.stringify(existing, null, '  '));
      console.log('[===================] ' + count + '/' + count + ' files');
      callback();
    } else {
      callback();
    }
  });

};
