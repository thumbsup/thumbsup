const fs = require('fs')
const path = require('path')
const async = require('async')
const resolvePkg = require('resolve-pkg')
const Theme = require('./theme')

exports.build = function (rootAlbum, opts, callback) {
  // create the base layer assets
  // such as shared JS libs, common handlebars helpers, CSS reset...
  const baseDir = path.join(__dirname, 'theme-base')
  const base = new Theme(baseDir, opts.output, {
    stylesheetName: 'core.css'
  })

  // then create the actual theme assets
  const themeDir = opts.themePath || localThemePath(opts.theme)
  const theme = new Theme(themeDir, opts.output, {
    stylesheetName: 'theme.css',
    customStylesPath: opts.themeStyle
  })

  // custom theme settings
  const settings = readThemeSettings(opts.themeSettings)

  // and finally render each page
  const gallery = galleryModel(rootAlbum, opts)
  const tasks = createRenderingTasks(theme, rootAlbum, gallery, settings, [])

  // now build everything
  async.series([
    next => base.prepare(next),
    next => theme.prepare(next),
    next => async.parallel(tasks, next)
  ], callback)
}

function galleryModel (rootAlbum, opts) {
  return {
    home: rootAlbum,
    title: opts.title,
    footer: opts.footer,
    thumbSize: opts.thumbSize,
    largeSize: opts.largeSize,
    googleAnalytics: opts.googleAnalytics
  }
}

function createRenderingTasks (theme, album, gallery, settings, breadcrumbs) {
  // a function to render this album
  const thisAlbumTask = next => {
    theme.render(album.path, {
      settings: settings,
      gallery: gallery,
      breadcrumbs: breadcrumbs,
      album: album
    }, next)
  }
  const tasks = [thisAlbumTask]
  // and all nested albums
  album.albums.forEach(function (nested) {
    const nestedTasks = createRenderingTasks(theme, nested, gallery, settings, breadcrumbs.concat([album]))
    Array.prototype.push.apply(tasks, nestedTasks)
  })
  return tasks
}

function localThemePath (themeName) {
  const local = resolvePkg(`@thumbsup/theme-${themeName}`, { cwd: __dirname })
  if (!local) {
    throw new Error(`Could not find a built-in theme called ${themeName}`)
  }
  return local
}

function readThemeSettings (filepath) {
  if (!filepath) {
    return {}
  }
  const content = fs.readFileSync(filepath).toString()
  try {
    return JSON.parse(content)
  } catch (ex) {
    throw new Error('Failed to parse JSON theme settings file: ' + filepath)
  }
}
