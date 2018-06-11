const fs = require('fs')
const should = require('should/as-function')
const Theme = require('../../src/website/theme')

describe('Theme', () => {
  // we require "mock-fs" inside the tests, otherwise it also affects other tests
  var mock = null
  before(() => {
    mock = require('mock-fs')
  })

  afterEach(() => {
    mock.restore()
  })

  it('renders the main HTML file', testEnd => {
    mock({
      'dest': mock.directory(),
      'theme/theme.less': '',
      'theme/album.hbs': 'Welcome to {{album.title}}'
    })
    const album = { path: 'albums/holidays.html', title: 'my album' }
    const theme = new Theme('theme', 'dest', {})
    renderTheme(theme, album, () => {
      const html = fs.readFileSync('dest/albums/holidays.html', 'utf-8')
      should(html).equal('Welcome to my album')
      testEnd()
    })
  })

  it('renders the main CSS file', testEnd => {
    mock({
      'dest': mock.directory(),
      'theme/theme.less': '@color: #abc; body { color: @color; }',
      'theme/album.hbs': ''
    })
    const album = { path: 'index.html' }
    const theme = new Theme('theme', 'dest', {})
    renderTheme(theme, album, () => {
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: #abc;\n}\n')
      testEnd()
    })
  })

  it('can include an extra CSS files (unprocessed)', testEnd => {
    mock({
      'dest': mock.directory(),
      'theme/theme.less': 'body { color: red; }',
      'theme/other.css': 'h1 { color: blue; }',
      'theme/album.hbs': ''
    })
    const album = { path: 'index.html' }
    const theme = new Theme('theme', 'dest', {
      customStylesPath: 'other.css'
    })
    renderTheme(theme, album, () => {
      // Note the CSS file was not re-indented
      // It's important it's not processed since not all CSS is valid LESS
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: red;\n}\nh1 { color: blue; }\n')
      testEnd()
    })
  })

  it('can include an extra LESS file', testEnd => {
    mock({
      'dest': mock.directory(),
      'theme/theme.less': 'body { color: red; }',
      'theme/other.less': 'h1 { color: blue; }',
      'theme/album.hbs': ''
    })
    const album = { path: 'index.html' }
    const theme = new Theme('theme', 'dest', {
      customStylesPath: 'other.less'
    })
    renderTheme(theme, album, () => {
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: red;\n}\nh1 {\n  color: blue;\n}\n')
      testEnd()
    })
  })
})

process.on('unhandledRejection', err => console.log('err', err))

function renderTheme (theme, album, next) {
  theme.validateStructure()
  theme.prepare(err => {
    should(err).be.null()
    theme.render(album, {}, err => {
      should(err).be.null()
      next()
    })
  })
}
