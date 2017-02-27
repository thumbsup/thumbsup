const async = require('async')
const fs = require('fs-extra')
const make = require('./utils/make')
const pad = require('pad')
const path = require('path')
const database = require('./input/database')
const File = require('./input/file')
const MediaFile = require('./model/file')
const hierarchy = require('./model/hierarchy.js')
const thumbs = require('./output-media/thumbs')
const website = require('./output-website/website')

exports.build = function(opts) {

  thumbs.sizes.thumb = opts.thumbSize;
  thumbs.sizes.large = opts.largeSize;

  fs.mkdirpSync(opts.output);
  var media = path.join(opts.output, 'media');
  var databaseFile = path.join(opts.output, 'metadata.json');

  // ---------------------
  // These variables are set later during the async phase
  // ---------------------
  var album = null        // root album with nested albums
  var collection = null   // all files in the database

  function buildStep(options) {
    return function(callback) {
      if (options.condition !== false) {
        make.exec(opts.input, media, collection, options, callback);
      } else {
        callback();
      }
    }
  }

  function callbackStep(name, fn) {
    return function(next) {
      process.stdout.write(pad(name, 20));
      fn(function(err) {
        if (err) {
          console.log('[====================] error');
          next(err);
        } else {
          console.log('[====================] done');
          next();
        }
      });
    }
  }

  function copyFile(task, callback) {
    fs.copy(task.src, task.dest, callback);
  }

  async.series([

    function updateDatabase(callback) {
      database.update(opts.input, databaseFile, (err, dbFiles) => {
        collection = dbFiles.map(f => new File(f))
        callback(err)
      })
    },

    buildStep({
      condition: opts.originalPhotos,
      message: 'Photos: original',
      ext:     'jpg|jpeg|png|gif',
      dest:    '/original/$path/$name.$ext',
      func:    copyFile
    }),

    buildStep({
      message: 'Photos: large',
      ext:     'jpg|jpeg|png|gif',
      dest:    '/large/$path/$name.$ext',
      func:    thumbs.photoLarge
    }),

    buildStep({
      message: 'Photos: thumbnails',
      ext:     'jpg|jpeg|png|gif',
      dest:    '/thumbs/$path/$name.jpg',
      func:    thumbs.photoSquare
    }),

    buildStep({
      condition: opts.originalVideos,
      message: 'Videos: original',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/original/$path/$name.$ext',
      func:    copyFile
    }),

    buildStep({
      message: 'Videos: resized',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/large/$path/$name.mp4',
      func:    thumbs.videoWeb
    }),

    buildStep({
      message: 'Videos: poster',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/large/$path/$name.jpg',
      func:    thumbs.videoLarge
    }),

    buildStep({
      message: 'Videos: thumbnails',
      ext:     'mp4|mov|mts|m2ts',
      dest:    '/thumbs/$path/$name.jpg',
      func:    thumbs.videoSquare
    }),

    callbackStep('Album hierarchy', function(next) {
      const mediaCollection = collection.map(f => new MediaFile(f.path, f))
      albums = hierarchy.createAlbums(mediaCollection, opts);
      next();
    }),

    callbackStep('Static website', function(next) {
      website.build(albums, opts, next);
    })

  ], finish);

};

function finish(err) {
  console.log();
  console.log(err || 'Gallery generated successfully');
  console.log();
  process.exit(err ? 1 : 0)
}
