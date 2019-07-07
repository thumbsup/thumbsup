const messages = require('./messages')
const path = require('path')
const yargs = require('yargs')
const os = require('os')
const _ = require('lodash')

const OPTIONS = {

  // ------------------------------------
  // Required arguments
  // ------------------------------------

  'input': {
    group: 'Required:',
    description: 'Path to the folder with all photos/videos',
    type: 'string',
    normalize: true,
    demand: true
  },
  'output': {
    group: 'Required:',
    description: 'Output path for the static website',
    type: 'string',
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
    type: 'string',
    normalize: true
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
  'home-album-name': {
    group: 'Album options:',
    description: 'Name of the top-level album',
    type: 'string',
    'default': 'Home'
  },
  'album-zip-files': {
    group: 'Album options:',
    description: 'Create a ZIP file per album',
    type: 'boolean',
    'default': false
  },

  // ------------------------------------
  // Website options
  // ------------------------------------

  'index': {
    group: 'Website options:',
    description: 'Filename of the home page',
    type: 'string',
    'default': 'index.html'
  },
  'albums-output-folder': {
    group: 'Website options:',
    description: 'Output subfolder for HTML albums (default: website root)',
    type: 'string',
    'default': '.'
  },
  'theme': {
    group: 'Website options:',
    description: 'Name of a built-in gallery theme',
    choices: ['classic', 'cards', 'mosaic', 'flow'],
    'default': 'classic'
  },
  'theme-path': {
    group: 'Website options:',
    description: 'Path to a custom theme',
    type: 'string',
    normalize: true
  },
  'theme-style': {
    group: 'Website options:',
    description: 'Path to a custom LESS/CSS file for additional styles',
    type: 'string',
    normalize: true
  },
  'theme-settings': {
    group: 'Website options:',
    description: 'Path to a JSON file with theme settings',
    type: 'string',
    normalize: true
  },
  'title': {
    group: 'Website options:',
    description: 'Website title',
    type: 'string',
    'default': 'Photo album'
  },
  'footer': {
    group: 'Website options:',
    description: 'Text or HTML footer',
    type: 'string',
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
    choices: ['default', 'info', 'debug', 'trace'],
    'default': 'default'
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
  const parsedOptions = yargs(args)
    .usage(messages.USAGE())
    .wrap(null)
    .help('help')
    .config('config')
    .options(OPTIONS)
    .epilogue(messages.CONFIG_USAGE())
    .argv

  // Warn users when they use deprecated options
  const deprecated = Object.keys(OPTIONS).filter(name => OPTIONS[name].group === 'Deprecated:')
  const specified = deprecated.filter(name => typeof parsedOptions[name] !== 'undefined')
  if (specified.length > 0) {
    const warnings = specified.map(name => `Warning: --${name} is deprecated`)
    console.error(warnings.join('\n') + '\n')
  }

  // Delete all options containing dashes, because yargs already aliases them as camelCase
  // This means we can process the camelCase version only after that
  const opts = _.omitBy(parsedOptions, (value, key) => key.indexOf('-') >= 0)

  // Make input/output folder absolute paths
  opts.input = path.resolve(opts.input)
  opts.output = path.resolve(opts.output)

  // By default, use relative links to the input folder
  if (opts.downloadLinkPrefix) opts.linkPrefix = opts.downloadLinkPrefix
  if (!opts.linkPrefix) {
    opts.linkPrefix = path.relative(opts.output, opts.input)
  }

  // Convert deprecated --download
  if (opts.originalPhotos) opts.downloadPhotos = 'copy'
  if (opts.originalVideos) opts.downloadVideos = 'copy'
  if (opts.downloadPhotos) opts.photoDownload = opts.downloadPhotos
  if (opts.downloadVideos) opts.videoDownload = opts.downloadVideos
  if (opts.photoDownload === 'large') opts.photoDownload = 'resize'
  if (opts.videoDownload === 'large') opts.videoDownload = 'resize'

  // Convert deprecated --albums-from
  replaceInArray(opts.albumsFrom, 'folders', '%path')
  replaceInArray(opts.albumsFrom, 'date', `{${opts.albumsDateFormat}}`)

  // Convert deprecated --css
  if (opts.css) opts.themeStyle = opts.css

  // Add a dash prefix to any --gm-args value
  // We can't specify the prefix on the CLI otherwise the parser thinks it's a thumbsup arg
  if (opts.gmArgs) {
    opts.gmArgs = opts.gmArgs.map(val => `-${val}`)
  }

  return opts
}

function replaceInArray (list, match, replacement) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i] === match) {
      list[i] = replacement
    }
  }
}
