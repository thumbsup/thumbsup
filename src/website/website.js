const fs = require('fs')
const path = require('path')
const async = require('async')
const resolvePkg = require('resolve-pkg')
const Theme = require('./theme')
const SEO = require('./seo')
const pages = require('./pages')

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

  // data passed to the template
  const themeSettings = readThemeSettings(opts.themeSettings)

  // create the rendering tasks
  const viewModels = pages.create(rootAlbum, opts, themeSettings)
  const tasks = viewModels.map(model => {
    return next => theme.render(model.path, model, next)
  })

  // now build everything
  async.series([
    next => base.prepare(next),
    next => theme.prepare(next),
    next => async.series(tasks, next)
  ], callback)

  // add robots & sitemap if needed
  if (opts.seoLocation) {
    const seo = new SEO(opts.output, opts.seoLocation, rootAlbum)
    seo.writeFiles()
  }
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
