#!/usr/bin/env node

var yargs = require('yargs');
var path  = require('path');
var index = require('../src/index');

var opts = yargs
  .usage('Usage: $0 [options]')
  .options({
    'input': {
      description: 'Path to the folder with all photos/videos',
    },
    'output': {
      description: 'Output path for the static website',
    },
    'index': {
      description: 'Filename of the home page, without extension. Defaults to <index>',
      default: 'index'
    },
    'title': {
      description: 'Website title',
      default: 'Photo album'
    },
    'thumb-size': {
      description: 'Thumbnail size in pixels (square)',
      default: 120
    },
    'large-size': {
      description: 'Fullscreen size in pixels (height)',
      default: 1000
    },
    'original-photos': {
      description: 'Allow download of full-size photos (true|false)',
      default: false
    },
    'original-videos': {
      description: 'Allow download of full-size videos (true|false)',
      default: false
    },
    'albums-from': {
      description: 'How to group media into albums (folders|date)',
      default: 'folders'
    },
    'albums-date-format': {
      description: 'How albums are named in <date> mode (moment.js pattern)',
      default: 'YYYY-MM'
    },
    // Deprecated for <sort-albums>
    'sort-folders': {
      description: 'How to sort gallery folders (name | date)'
    },
    'sort-albums': {
      description: 'How to sort albums (name | date)',
      default: 'date'
    },
    'sort-media': {
      description: 'How to sort photos and videos (name | date)',
      default: 'date'
    },
    'theme': {
      description: 'Name of the gallery theme to apply',
      default: 'cards'
    },
    'css': {
      description: 'Extra CSS/LESS file for styling'
    },
    'config': {
      description: 'Optional JSON config file (one key per argument)'
    },
    'google-analytics': {
      description: 'Code for Google Analytics tracking'
    }
  })
  .config('config')
  .demand(['input', 'output'])
  .argv;

index.build({
  input:             path.resolve(opts['input']),
  output:            path.resolve(opts['output']),
  title:             opts['title'],
  thumbSize:         opts['thumb-size'],
  largeSize:         opts['large-size'],
  originalPhotos:    opts['original-photos'] + '' === 'true',
  originalVideos:    opts['original-videos'] + '' === 'true',
  sortAlbums:        opts['sort-folders'] || opts['sort-albums'],
  sortMedia:         opts['sort-media'],
  albumsFrom:        opts['albums-from'],
  albumsDateFormat:  opts['albums-date-format'],
  theme:             opts['theme'],
  css:               opts['css'],
  googleAnalytics:   opts['google-analytics'],
  index:             opts['index']
});
