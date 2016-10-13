var _           = require('lodash');
var fs          = require('fs-extra');
var path        = require('path');
var async       = require('async');
var pad         = require('pad');
var less        = require('less');
var files       = require('../utils/files');
var template    = require('./template');
var Album       = require('./album');
var byFolder    = require('./by-folder');

var DIR_PUBLIC = path.join(__dirname, '..', '..', 'public');
var DIR_TEMPLATES = path.join(__dirname, '..', '..', 'templates');

exports.build = function(collection, opts, callback) {

  // set the download link to the right place
  var renderer = template.create(opts);

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
    var contents = renderer.render(templateName, data);
    return function(next) {
      fs.writeFile(fullPath, contents, next);
    };
  }

  function support(callback) {
    var dest = path.join(opts.output, 'public');
    fs.copy(DIR_PUBLIC, dest, callback);
  }

  function lightGallery(callback) {
    // note: this module might be deduped
    // so we can't assume it's in the local node_modules
    var lgPackage = require.resolve('lightgallery/package.json');
    var src = path.join(path.dirname(lgPackage), 'dist');
    var dest = path.join(opts.output, 'public', 'light-gallery');
    fs.copy(src, dest, callback);
  }

  function renderStyles(callback) {
    var themeFile = path.join(DIR_TEMPLATES, 'themes', opts.theme, 'theme.less');
    var themeLess = fs.readFileSync(themeFile, 'utf-8');
    if (opts.css) {
      themeLess += '\n' + fs.readFileSync(opts.css, 'utf-8');
    }
    less.render(themeLess, function (err, output) {
      if (err) return callback(err);
      var dest = path.join(opts.output, 'public', 'style.css');
      fs.writeFile(dest, output.css, callback);
    });
  }

  process.stdout.write(pad('Static website', 20));
  async.series([
    website,
    support,
    lightGallery,
    renderStyles
  ], function(err) {
    console.log('[====================] done');
    callback(err);
  });

};
