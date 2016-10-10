var _           = require('lodash');
var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var files       = require('../utils/files');
var template    = require('./template');
var Album       = require('./album');
var byFolder    = require('./by-folder');

exports.build = function(collection, opts, callback) {

  // set the download link to the right place
  template.setOptions({
    originalPhotos: opts.originalPhotos,
    originalVideos: opts.originalVideos
  });

  function website(callback) {
    // top-level album for the home page
    var home = new Album('Home');
    home.filename = opts.index || 'index';
    // create folder albums
    home.albums = byFolder.albums(collection, {});
    home.finalize();
    // create top level gallery
    var gallery = {
      home: home,
      css: opts.css ? path.basename(opts.css) : null,
      title: opts.title,
      titleWords: opts.title.split(' '),
      thumbSize: opts.thumbSize,
      largeSize: opts.largeSize,
      googleAnalytics: opts.googleAnalytics
    };
    // render entire album hierarchy
    var tasks = renderAlbum(gallery, [], home);
    async.parallel(tasks, callback);
  }

  function renderAlbum(gallery, breadcrumbs, album) {
    // render this album
    var thisAlbumTask = renderTemplate(album.filename + '.html', 'album', {
      gallery: gallery,
      breadcrumbs: breadcrumbs,
      album: album
    });
    var tasks = [thisAlbumTask];
    // and all nested albums
    album.albums.forEach(function(nested) {
      var nestedAlbumsTasks = renderAlbum(gallery, breadcrumbs.concat([album]), nested);
      Array.prototype.push.apply(tasks, nestedAlbumsTasks);
    });
    return tasks;
  }

  function renderTemplate(filename, templateName, data) {
    // render a given HBS template
    var fullPath = path.join(opts.output, filename);
    var contents = template.render(templateName, data);
    return function(next) {
      fs.writeFile(fullPath, contents, next);
    };
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
