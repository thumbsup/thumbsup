var _           = require('lodash');
var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var files       = require('../utils/files');
var template    = require('./template');
var model       = require('./model');
var pages       = require('./pages');

exports.build = function(metadata, opts, callback) {

  var common = pages.common(opts);

  function render(filename, templateName, data) {
    var fullPath = path.join(opts.output, filename);
    var pageData = _.extend(data, common);
    var contents = template.render(templateName, pageData);
    return function(next) {
      fs.writeFile(fullPath, contents, next);
    };
  }

  function website(callback) {
    var structure = model.create(metadata, opts);
    var homepage  = pages.homepage(structure);

    var items = [
      render('index.html', 'homepage', homepage)
    ];

    structure.forEach(function(folder, index) {
      var gallery = pages.gallery(structure, index);
      var page = render(folder.name + '.html', 'gallery', gallery);
      items.push(page);
    });

    async.parallel(items, callback);
  }

  function lightGallery(callback) {
    // note: this module might be deduped
    // so we can't assume it's in the local node_modules
    var lgPackage = require.resolve('lightgallery/package.json');
    var src = path.join(path.dirname(lgPackage), 'dist');
    var dest = path.join(opts.output, 'public', 'light-gallery');
    fs.copy(src, dest, callback);
  }

  function support(callback) {
    var src = path.join(__dirname, '..', '..', 'public');
    var dest = path.join(opts.output, 'public');
    fs.copy(src, dest, callback);
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
    lightGallery,
    support,
    customStyle
  ], function(err) {
    console.log('[====================] done');
    callback(err);
  });

};
