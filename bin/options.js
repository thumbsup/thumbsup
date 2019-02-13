const messages = require('./messages')
const path = require('path')
const yargs = require('yargs')
const os = require('os')

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
  // Input options
  // ------------------------------------
  'include-photos': {
    group: 'Input options:',
    description: 'Include photos in the gallery',
    type: 'boolean',
    'default': true
  },
  'include-videos': {
    group: 'Input options:',
    description: 'Include videos in the gallery',
    type: 'boolean',
    'default': true
  },
  'include-raw-photos': {
    group: 'Input options:',
    description: 'Include raw photos in the gallery',
    type: 'boolean',
    'default': false
  },
  'include': {
    group: 'Input options:',
    description: 'Glob pattern of files to include',
    type: 'array'
  },
  'exclude': {
    group: 'Input options:',
    description: 'Glob pattern of files to exclude',
    type: 'array'
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
  'photo-quality': {
    group: 'Output options:',
    description: 'Quality of the resized/converted photos',
    type: 'number',
    'default': 90
  },
  'video-quality': {
    group: 'Output options:',
    description: 'Quality of the converted video (percent)',
    type: 'number',
    'default': 75
  },
  'video-bitrate': {
    group: 'Output options:',
    description: 'Bitrate of the converted videos (e.g. 120k)',
    type: 'string',
    'default': null
  },
  'video-format': {
    group: 'Output options:',
    description: 'Video output format',
    choices: ['mp4', 'webm'],
    'default': 'mp4'
  },
  'photo-preview': {
    group: 'Output options:',
    description: 'How lightbox photos are generated',
    choices: ['resize', 'copy', 'symlink', 'link'],
    'default': 'resize'
  },
  'video-preview': {
    group: 'Output options:',
    description: 'How lightbox videos are generated',
    choices: ['resize', 'copy', 'symlink', 'link'],
    'default': 'resize'
  },
  'photo-download': {
    group: 'Output options:',
    description: 'How downloadable photos are generated',
    choices: ['resize', 'copy', 'symlink', 'link'],
    'default': 'resize'
  },
  'video-download': {
    group: 'Output options:',
    description: 'How downloadable videos are generated',
    choices: ['resize', 'copy', 'symlink', 'link'],
    'default': 'resize'
  },
  'link-prefix': {
    group: 'Output options:',
    description: 'Path or URL prefix for "linked" photos and videos',
    type: 'string'
  },
  'cleanup': {
    group: 'Output options:',
    description: 'Remove any output file that\'s no longer needed',
    type: 'boolean',
    'default': false
  },
  'concurrency': {
    group: 'Output options:',
    description: 'Number of parallel parsing/processing operations',
    type: 'number',
    'default': os.cpus().length
  },
  'output-structure': {
    group: 'Output options:',
    description: 'File and folder structure for output media',
    choices: ['folders', 'suffix'],
    'default': 'folders'
  },
  'gm-args': {
    group: 'Output options:',
    description: 'Custom image processing arguments for GraphicsMagick',
    type: 'array'
  },
  'watermark': {
    group: 'Output options:',
    description: 'Path to a transparent PNG to be overlaid on all images',
    type: 'string'
  },
  'watermark-position': {
    group: 'Output options:',
    description: 'Position of the watermark',
    choices: [
      'Repeat', 'Center', 'NorthWest', 'North', 'NorthEast',
      'West', 'East', 'SouthWest', 'South', 'SouthEast'
    ]
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
    description: 'Name of a built-in gallery theme',
    choices: ['classic', 'cards', 'mosaic'],
    'default': 'classic'
  },
  'theme-path': {
    group: 'Website options:',
    description: 'Path to a custom theme',
    normalize: true
  },
  'theme-style': {
    group: 'Website options:',
    description: 'Path to a custom LESS/CSS file for additional styles',
    normalize: true
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
  'google-analytics': {
    group: 'Website options:',
    description: 'Code for Google Analytics tracking',
    type: 'string'
  },
  'embed-exif': {
    group: 'Website options:',
    description: 'Embed the exif metadata for each image into the gallery page',
    type: 'boolean',
    'default': false
  },

  // ------------------------------------
  // Misc options
  // ------------------------------------

  'config': {
    group: 'Misc options:',
    description: 'JSON config file (one key per argument)',
    normalize: true
  },

  'log': {
    group: 'Misc options:',
    description: 'Print a detailed text log',
    choices: [null, 'info', 'debug', 'trace'],
    'default': null
  },

  'usage-stats': {
    group: 'Misc options:',
    description: 'Enable anonymous usage statistics',
    type: 'boolean',
    'default': true
  },

  'dry-run': {
    group: 'Misc options:',
    description: "Update the index, but don't create the media files / website",
    type: 'boolean',
    'default': false
  },

  // ------------------------------------
  // Deprecated options
  // ------------------------------------

  'original-photos': {
    group: 'Deprecated:',
    description: 'Copy and allow download of full-size photos',
    type: 'boolean'
  },
  'original-videos': {
    group: 'Deprecated:',
    description: 'Copy and allow download of full-size videos',
    type: 'boolean'
  },
  'albums-date-format': {
    group: 'Deprecated:',
    description: 'How albums are named in <date> mode [moment.js pattern]'
  },
  'css': {
    group: 'Deprecated:',
    description: 'Path to a custom provided CSS/LESS file for styling',
    normalize: true
  },
  'download-photos': {
    group: 'Deprecated:',
    description: 'Target of the photo download links',
    choices: ['large', 'copy', 'symlink', 'link']
  },
  'download-videos': {
    group: 'Deprecated:',
    description: 'Target of the video download links',
    choices: ['large', 'copy', 'symlink', 'link']
  },
  'download-link-prefix': {
    group: 'Deprecated:',
    description: 'Path or URL prefix for linked downloads',
    type: 'string'
  }

}

// explicitly pass <process.argv> so we can unit test this logic
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

  // Warn users when they use deprecated options
  const deprecated = Object.keys(OPTIONS).filter(name => OPTIONS[name].group === 'Deprecated:')
  const specified = deprecated.filter(name => typeof opts[name] !== 'undefined')
  if (specified.length > 0) {
    const warnings = specified.map(name => `Warning: --${name} is deprecated`)
    console.error(warnings.join('\n') + '\n')
  }

  // Make input/output folder absolute paths
  opts['input'] = path.resolve(opts['input'])
  opts['output'] = path.resolve(opts['output'])

  // By default, use relative links to the input folder
  if (opts['download-link-prefix']) opts['link-prefix'] = opts['download-link-prefix']
  if (!opts['link-prefix']) {
    opts['link-prefix'] = path.relative(opts['output'], opts['input'])
  }

  // Convert deprecated --download
  if (opts['original-photos']) opts['download-photos'] = 'copy'
  if (opts['original-videos']) opts['download-videos'] = 'copy'
  if (opts['download-photos']) opts['photo-download'] = opts['download-photos']
  if (opts['download-videos']) opts['video-download'] = opts['download-videos']
  if (opts['photo-download'] === 'large') opts['photo-download'] = 'resize'
  if (opts['video-download'] === 'large') opts['video-download'] = 'resize'

  // Convert deprecated --albums-from
  replaceInArray(opts['albums-from'], 'folders', '%path')
  replaceInArray(opts['albums-from'], 'date', `{${opts['albums-date-format']}}`)

  // Convert deprecated --css
  if (opts['css']) opts['theme-style'] = opts['css']

  // Add a dash prefix to any --gm-args value
  // We can't specify the prefix on the CLI otherwise the parser thinks it's a thumbsup arg
  if (opts['gm-args']) {
    opts['gm-args'] = opts['gm-args'].map(val => `-${val}`)
  }

  // All options as an object
  return {
    input: opts['input'],
    output: opts['output'],
    includePhotos: opts['include-photos'],
    includeVideos: opts['include-videos'],
    includeRawPhotos: opts['include-raw-photos'],
    include: opts['include'],
    exclude: opts['exclude'],
    cleanup: opts['cleanup'],
    title: opts['title'],
    thumbSize: opts['thumb-size'],
    largeSize: opts['large-size'],
    photoQuality: opts['photo-quality'],
    videoQuality: opts['video-quality'],
    videoBitrate: opts['video-bitrate'],
    videoFormat: opts['video-format'],
    photoPreview: opts['photo-preview'],
    videoPreview: opts['video-preview'],
    photoDownload: opts['photo-download'],
    videoDownload: opts['video-download'],
    linkPrefix: opts['link-prefix'],
    albumsFrom: opts['albums-from'],
    albumsDateFormat: opts['albums-date-format'],
    sortAlbumsBy: opts['sort-albums-by'],
    sortAlbumsDirection: opts['sort-albums-direction'],
    sortMediaBy: opts['sort-media-by'],
    sortMediaDirection: opts['sort-media-direction'],
    theme: opts['theme'],
    themePath: opts['theme-path'],
    themeStyle: opts['theme-style'],
    css: opts['css'],
    googleAnalytics: opts['google-analytics'],
    index: opts['index'],
    footer: opts['footer'],
    albumsOutputFolder: opts['albums-output-folder'],
    usageStats: opts['usage-stats'],
    log: opts['log'],
    dryRun: opts['dry-run'],
    concurrency: opts['concurrency'],
    outputStructure: opts['output-structure'],
    gmArgs: opts['gm-args'],
    watermark: opts['watermark'],
    watermarkPosition: opts['watermark-position'],
    embedExif: opts['embed-exif']
  }
}

function replaceInArray (list, match, replacement) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === match) {
      list[i] = replacement
    }
  }
}
