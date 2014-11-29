var fs          = require('fs-extra');
var path        = require('path');
var pad         = require('pad');
var async       = require('async');
var ProgressBar = require('progress');

exports.exec = function(input, output, metadata, options, callback) {
  var message = pad(options.message, 20)
  var paths = Object.keys(metadata).filter(extension(options.ext));
  var tasks = paths.map(function(relativePath) {
    return {
      src: path.join(input, relativePath),
      dest: path.join(output, transform(relativePath, options.dest)),
      metadata: metadata[relativePath]
    };
  });
  var process = tasks.filter(function(task) {
    try {
      var destDate = fs.statSync(task.dest).ctime.getTime();
      return task.metadata.fileDate > destDate;
    } catch (ex) {
      return true;
    }
  });
  if (process.length > 0) {
    var format = pad(options.message, 20) + '[:bar] :current/:total files';
    var bar = new ProgressBar(format, { total: process.length, width: 20 });
    var ops = process.map(function(task) {
      return function(next) {
        fs.mkdirpSync(path.dirname(task.dest));
        options.func(task, function(err) {
          bar.tick();
          next(err);
        });
      };
    });
    bar.tick(0);
    async.series(ops, callback);
  } else {
    callback();
  }
}

function extension(regex) {
  return function(p) {
    return p.match(new RegExp('\.(' + regex + ')$', 'i'));
  }
}

function transform(file, pattern) {
  var absolutePrefix = (pattern[0] === '/') ? '/' : '';
  var parts = pattern.split('/');
  var full = path.join.apply(this, parts);
  return absolutePrefix +
         full.replace('$path', path.dirname(file))
             .replace('$name', path.basename(file, path.extname(file)))
             .replace('$ext',  path.extname(file).substr(1));
}
