var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var viewModel   = require('./view-model');
var render      = require('./render');
var files       = require('./files');


exports.build = function(metadata, opts, callback) {

  function website(callback) {

    var galleries = viewModel.build(metadata, opts.thumbSize);

    var style = opts.css ? path.basename(opts.css) : null;

    var rendered = render.gallery(galleries, galleries[0], opts.title, style);
    var outputPath = path.join(opts.output, 'index.html');
    fs.writeFileSync(outputPath, rendered);
  
    galleries.forEach(function(folder) {
      var rendered = render.gallery(galleries, folder, opts.title, style);
      var outputPath = path.join(opts.output, folder.url);
      fs.writeFileSync(outputPath, rendered);
    });

    callback();

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
  async.series([
    website,
    support,
    customStyle
  ], function(err) {
    process.stdout
    console.log('[===================] done');
    callback(err);
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
