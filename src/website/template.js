const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')

exports.create = function (options) {
  var DIR_TEMPLATES = path.join(__dirname, '..', '..', 'templates')
  var DIR_THEME = path.join(DIR_TEMPLATES, 'themes', options.theme)

  function isHelper (filepath) {
    return path.extname(filepath) === '.js'
  }

  function isTemplate (filepath) {
    return path.extname(filepath) === '.hbs'
  }

  function compileTemplate (hbsFile) {
    var src = fs.readFileSync(hbsFile)
    return handlebars.compile(src.toString())
  }

  // main entry points
  var templates = {
    'album': compileTemplate(path.join(DIR_TEMPLATES, 'album.hbs'))
  }

  // common partials
  handlebars.registerPartial('analytics', compileTemplate(path.join(DIR_TEMPLATES, 'analytics.hbs')))
  handlebars.registerPartial('thumbnail', compileTemplate(path.join(DIR_TEMPLATES, 'thumbnail.hbs')))

  // theme partials
  const partials = fs.readdirSync(DIR_THEME)
  partials.filter(isTemplate).forEach(function (filename) {
    const templateName = path.basename(filename, path.extname(filename))
    handlebars.registerPartial(templateName, compileTemplate(path.join(DIR_THEME, filename)))
  })

  // load all helpers
  const helpers = fs.readdirSync(path.join(__dirname, 'helpers'))
  helpers.filter(isHelper).forEach(function (filename) {
    const name = path.basename(filename, path.extname(filename))
    const fullPath = path.join(__dirname, 'helpers', filename)
    handlebars.registerHelper(name, require(fullPath))
  })

  // utility helper
  // return the relative path from the current folder to the argument
  var currentFolder = '.'
  handlebars.registerHelper('relative', function (target, options) {
    return path.relative(currentFolder, target)
  })

  return {
    render: function (template, data, folder) {
      currentFolder = folder
      return templates[template](data)
    }
  }
}
