const async = require('async')
const debug = require('debug')('thumbsup:debug')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const less = require('less')
const path = require('path')

class Theme {
  constructor (themeDir, destDir, opts) {
    // directory that contains the theme
    this.dir = path.resolve(themeDir)
    // target directory
    this.dest = path.resolve(destDir)
    // used to keep track of relative paths while rendering
    this.currentFolder = '.'
    // custom options
    this.opts = opts
  }

  // load all theme helpers
  // and copy assets into the output folder (static files, CSS...)
  prepare (done) {
    // compiled template
    this.template = compileTemplate(path.join(this.dir, 'album.hbs'))
    this.loadPartials()
    this.loadHelpers()
    async.series([
      next => this.copyPublic(next),
      next => this.renderStyles(next)
    ], done)
  }

  // return a function that renders the given album HTML page
  // this is used so that all pages can be created in parallel
  render (album, data) {
    this.currentFolder = path.dirname(album.path)
    const fullPath = path.join(this.dest, album.path)
    return (next) => {
      debug(`Theme rendering ${album.path}`)
      const contents = this.template(Object.assign({album: album}, data))
      fs.mkdirpSync(path.dirname(fullPath))
      fs.writeFile(fullPath, contents, next)
    }
  }

  // ------------------------
  // private methods
  // ------------------------

  loadPartials () {
    const partials = fs.readdirSync(path.join(this.dir, 'partials'))
    const isTemplate = filepath => path.extname(filepath) === '.hbs'
    partials.filter(isTemplate).forEach(filename => {
      debug(`Loading partial ${filename}`)
      const templateName = path.basename(filename, path.extname(filename))
      handlebars.registerPartial(templateName, compileTemplate(path.join(this.dir, 'partials', filename)))
    })
  }

  loadHelpers () {
    const helpers = fs.readdirSync(path.join(this.dir, 'helpers'))
    const isHelper = filepath => path.extname(filepath) === '.js'
    helpers.filter(isHelper).forEach(filename => {
      debug(`Loading helper ${filename}`)
      const name = path.basename(filename, path.extname(filename))
      const fullPath = path.join(this.dir, 'helpers', filename)
      handlebars.registerHelper(name, require(fullPath))
    })

    // render a relative path
    handlebars.registerHelper('relative', (target, options) => {
      return path.relative(this.currentFolder, target)
    })
  }

  renderStyles (done) {
    debug('Rendering theme styles')
    // full LESS content
    const themeFile = path.join(this.dir, 'theme.less')
    const themeLess = fs.readFileSync(themeFile, 'utf-8')
    // optional custom LESS file
    const customInclude = this.customStylesInclude()
    // now render both together
    const lessOptions = {
      paths: [this.dir]
    }
    less.render(themeLess + customInclude, lessOptions, (err, output) => {
      if (err) return done(err)
      const filename = this.opts.stylesheetName || 'theme.css'
      console.log('theme:', filename)
      const dest = path.join(this.dest, 'public', filename)
      fs.mkdirpSync(path.join(this.dest, 'public'))
      fs.writeFile(dest, output.css, done)
    })
  }

  customStylesInclude () {
    const customPath = this.opts.customStylesPath
    if (customPath) {
      const includeType = path.extname(customPath) === '.css' ? '(inline) ' : ''
      return `\n@import ${includeType}'${customPath}';`
    }
    return ''
  }

  copyPublic (done) {
    const src = path.join(this.dir, 'public')
    const dest = path.join(this.dest, 'public')
    fs.copy(src, dest, done)
  }
}

function compileTemplate (hbsFile) {
  var src = fs.readFileSync(hbsFile)
  return handlebars.compile(src.toString())
}

module.exports = Theme
