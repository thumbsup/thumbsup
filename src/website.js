var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var galleries   = require('./galleries');
var render      = require('./render');
var files       = require('./files');


exports.build = function(opts, callback) {

  function website(callback) {
    galleries.fromDisk(opts.input, opts.thumbSize, function(err, list) {
      if (err) return callback(err);

      var style = opts.css ? path.basename(opts.css) : null;

      var rendered = render.gallery(list, list[0], opts.title, style);
      var outputPath = path.join(opts.output, 'index.html');
      fs.writeFileSync(outputPath, rendered);
    
      list.forEach(function(folder) {
        var rendered = render.gallery(list, folder, opts.title, style);
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

  function customStyle(callback) {
    if (opts.css) {
      var dest = path.join(opts.output, 'public', path.basename(opts.css));
      fs.copy(opts.css, dest, callback);
    } else {
      callback();
    }
  }

  process.stdout.write(pad('Static website', 20));
  async.series([], function(err) {
    process.stdout
    callback(err);
    console.log('[===================] done');
  });

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
