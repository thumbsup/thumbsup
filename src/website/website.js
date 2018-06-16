const path = require('path')
const async = require('async')
const Theme = require('./theme')

var THEMES_DIR = path.join(__dirname, '..', '..', 'themes')

exports.build = function (rootAlbum, opts, callback) {
  // create the base layer assets
  // such as shared JS libs, common handlebars helpers, CSS reset...
  const baseDir = path.join(THEMES_DIR, 'base')
  const base = new Theme(baseDir, opts.output, {
    stylesheetName: 'core.css'
  })

  // then create the actual theme assets
  const themeDir = opts.themePath || path.join(THEMES_DIR, opts.theme)
  const theme = new Theme(themeDir, opts.output, {
    stylesheetName: 'theme.css',
    customStylesPath: opts.themeStyle
  })

  // and finally render each page
  const gallery = galleryModel(rootAlbum, opts)
  const tasks = createRenderingTasks(theme, rootAlbum, gallery, [])

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

function createRenderingTasks (theme, album, gallery, breadcrumbs) {
  // a function to render this album
  const thisAlbumTask = next => {
    theme.render(album, {
      gallery: gallery,
      breadcrumbs: breadcrumbs
    }, next)
  }
  const tasks = [thisAlbumTask]
  // and all nested albums
  album.albums.forEach(function (nested) {
    const nestedTasks = createRenderingTasks(theme, nested, gallery, breadcrumbs.concat([album]))
    Array.prototype.push.apply(tasks, nestedTasks)
  })
  return tasks
}
