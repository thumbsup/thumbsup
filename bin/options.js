const messages = require('./messages')
const path = require('path')
const yargs = require('yargs')

const OPTIONS = {

  // ------------------------------------
  // Required arguments
  // ------------------------------------

  'input': {
    group: 'Required:',
    description: 'Path to the folder with all photos/videos',
    normalize: true,
    demand: true
  },
  'output': {
    group: 'Required:',
    description: 'Output path for the static website',
    normalize: true,
    demand: true
  },

  // ------------------------------------
  // Output options
  // ------------------------------------

  'thumb-size': {
    group: 'Output options:',
    description: 'Pixel size of the square thumbnails',
    type: 'number',
    'default': 120
  },
  'large-size': {
    group: 'Output options:',
    description: 'Pixel height of the fullscreen photos',
    type: 'number',
    'default': 1000
  },
  'download-photos': {
    group: 'Output options:',
    description: 'Target of the photo download links',
    choices: ['large', 'copy', 'symlink', 'link'],
    'default': 'large'
  },
  'download-videos': {
    group: 'Output options:',
    description: 'Target of the video download links',
    choices: ['large', 'copy', 'symlink', 'link'],
    'default': 'large'
  },
  'download-link-prefix': {
    group: 'Output options:',
    description: 'Path or URL prefix for linked downloads',
    type: 'string'
  },
  'cleanup': {
    group: 'Output options:',
    description: 'Remove any output file that\'s no longer needed',
    type: 'boolean',
    'default': false
  },

  // ------------------------------------
  // Album options
  // ------------------------------------

  'albums-from': {
    group: 'Album options:',
    description: 'How files are grouped into albums',
    type: 'array',
    'default': ['%path']
  },
  'sort-albums-by': {
    group: 'Album options:',
    description: 'How to sort albums',
    choices: ['title', 'start-date', 'end-date'],
    'default': 'start-date'
  },
  'sort-albums-direction': {
    group: 'Album options:',
    description: 'Album sorting direction',
    choices: ['asc', 'desc'],
    'default': 'asc'
  },
  'sort-media-by': {
    group: 'Album options:',
    description: 'How to sort photos and videos',
    choices: ['filename', 'date'],
    'default': 'date'
  },
  'sort-media-direction': {
    group: 'Album options:',
    description: 'Media sorting direction',
    choices: ['asc', 'desc'],
    'default': 'asc'
  },

  // ------------------------------------
  // Website options
  // ------------------------------------

  'index': {
    group: 'Website options:',
    description: 'Filename of the home page',
    'default': 'index.html'
  },
  'albums-output-folder': {
    group: 'Website options:',
    description: 'Output subfolder for HTML albums (default: website root)',
    'default': '.'
  },
  'theme': {
    group: 'Website options:',
    description: 'Name of the gallery theme to apply',
    choices: ['classic', 'cards', 'mosaic'],
    'default': 'classic'
  },
  'title': {
    group: 'Website options:',
    description: 'Website title',
    'default': 'Photo album'
  },
  'footer': {
    group: 'Website options:',
    description: 'Text or HTML footer',
    'default': null
  },
  'css': {
    group: 'Website options:',
    description: 'Path to a custom provided CSS/LESS file for styling',
    normalize: true
  },
  'google-analytics': {
    group: 'Website options:',
    description: 'Code for Google Analytics tracking',
    type: 'string'
  },

  // ------------------------------------
  // Misc options
  // ------------------------------------

  'config': {
    description: 'JSON config file (one key per argument)',
    normalize: true
  },

  'log': {
    description: 'Print a detailed text log',
    choices: [null, 'info', 'debug', 'trace'],
    'default': null
  },

  'usage-stats': {
    description: 'Enable anonymous usage statistics',
    type: 'boolean',
    'default': true
  },

  // ------------------------------------
  // Deprecated options
  // ------------------------------------

  'original-photos': {
    group: 'Deprecated:',
    description: 'Copy and allow download of full-size photos',
    type: 'boolean',
    'default': false
  },
  'original-videos': {
    group: 'Deprecated:',
    description: 'Copy and allow download of full-size videos',
    type: 'boolean',
    'default': false
  },
  'albums-date-format': {
    group: 'Album options:',
    description: 'How albums are named in <date> mode [moment.js pattern]',
    'default': 'YYYY-MM'
  }

}

// explicity pass <process.argv> so we can unit test this logic
// otherwise it pre-loads all process arguments on require()
exports.get = (args) => {
  const opts = yargs(args)
    .usage(messages.USAGE())
    .wrap(null)
    .help('help')
    .config('config')
    .options(OPTIONS)
    .epilogue(messages.CONFIG_USAGE())
    .argv

  // Make input/output folder absolute paths
  opts['input'] = path.resolve(opts['input'])
  opts['output'] = path.resolve(opts['output'])

  // By default, use relative links to the input folder
  if (!opts['download-link-prefix']) {
    opts['download-link-prefix'] = path.relative(opts['output'], opts['input'])
  }

  // Convert deprecated options to the new replacement
  if (opts['original-photos']) opts['download-photos'] = 'copy'
  if (opts['original-videos']) opts['download-videos'] = 'copy'

  // Convert deprecated --albums-from values
  replaceInArray(opts['albums-from'], 'folders', '%path')
  replaceInArray(opts['albums-from'], 'date', `{${opts['albums-date-format']}}`)

  // All options as an object
  return {
    input: opts['input'],
    output: opts['output'],
    cleanup: opts['cleanup'],
    title: opts['title'],
    thumbSize: opts['thumb-size'],
    largeSize: opts['large-size'],
    downloadPhotos: opts['download-photos'],
    downloadVideos: opts['download-videos'],
    downloadLinkPrefix: opts['download-link-prefix'],
    albumsFrom: opts['albums-from'],
    albumsDateFormat: opts['albums-date-format'],
    sortAlbumsBy: opts['sort-albums-by'],
    sortAlbumsDirection: opts['sort-albums-direction'],
    sortMediaBy: opts['sort-media-by'],
    sortMediaDirection: opts['sort-media-direction'],
    theme: opts['theme'],
    css: opts['css'],
    googleAnalytics: opts['google-analytics'],
    index: opts['index'],
    footer: opts['footer'],
    albumsOutputFolder: opts['albums-output-folder'],
    usageStats: opts['usage-stats'],
    log: opts['log']
  }
}

function replaceInArray (list, match, replacement) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === match) {
      list[i] = replacement
    }
  }
}
