#!/usr/bin/env node

var yargs = require('yargs');
var path  = require('path');
var index = require('../src/index');

console.log('');
var opts = yargs
  .usage('Usages:\n' +
         '  $0 [required] [options]\n' +
         '  $0 --config config.json')
  .wrap(null)
  .group('input', 'Required:')
  .group('output', 'Required:')
  .options({

    // ------------------------------------
    // Required arguments
    // ------------------------------------

    'input': {
      description: 'Path to the folder with all photos/videos',
      normalize: true,
      demand: true
    },
    'output': {
      description: 'Output path for the static website',
      normalize: true,
      demand: true
    },

    // ------------------------------------
    // Optional arguments
    // ------------------------------------

    'index': {
      description: 'Filename of the home page, without extension',
      default: 'index'
    },
    'title': {
      description: 'Website title',
      default: 'Photo album'
    },
    'thumb-size': {
      description: 'Pixel size of the square thumbnails',
      type: 'number',
      default: 120
    },
    'large-size': {
      description: 'Pixel height of the fullscreen photos',
      type: 'number',
      default: 1000
    },
    'original-photos': {
      description: 'Allow download of full-size photos',
      type: 'boolean',
      default: false
    },
    'original-videos': {
      description: 'Allow download of full-size videos',
      type: 'boolean',
      default: false
    },
    'albums-from': {
      description: 'How to group media into albums',
      choices: ['folders', 'date'],
      default: 'folders'
    },
    'albums-date-format': {
      description: 'How albums are named in <date> mode [moment.js pattern]',
      default: 'YYYY-MM'
    },
    // Deprecated for <sort-albums>
    'sort-folders': {
      description: 'How to sort gallery folders',
      choices: ['name', 'date']
    },
    'sort-albums': {
      description: 'How to sort albums',
      choices: ['name', 'date'],
      default: 'date'
    },
    'sort-media': {
      description: 'How to sort photos and videos',
      choices: ['name', 'date'],
      default: 'date'
    },
    'theme': {
      description: 'Name of the gallery theme to apply',
      choices: ['classic', 'cards', 'mosaic'],
      default: 'classic'
    },
    'css': {
      description: 'Path to a CSS/LESS file for styling',
      normalize: true
    },
    'config': {
      description: 'Optional JSON config file (one key per argument)',
      normalize: true
    },
    'google-analytics': {
      description: 'Code for Google Analytics tracking',
      type: 'string'
    }
  })
  .config('config')
  .epilogue('The optional JSON config should contain a single object with one key ' +
            'per argument, not including the trailing "--". For example:\n\n' +
            '{ "sort-albums": "date" }')
  .argv;

index.build({
  input:             path.resolve(opts['input']),
  output:            path.resolve(opts['output']),
  title:             opts['title'],
  thumbSize:         opts['thumb-size'],
  largeSize:         opts['large-size'],
  originalPhotos:    opts['original-photos'],
  originalVideos:    opts['original-videos'],
  sortAlbums:        opts['sort-folders'] || opts['sort-albums'],
  sortMedia:         opts['sort-media'],
  albumsFrom:        opts['albums-from'],
  albumsDateFormat:  opts['albums-date-format'],
  theme:             opts['theme'],
  css:               opts['css'],
  googleAnalytics:   opts['google-analytics'],
  index:             opts['index']
});
