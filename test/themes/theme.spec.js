const fs = require('fs-extra')
const path = require('path')
const should = require('should/as-function')
const fixtures = require('../fixtures')
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

  it('uses the target theme folder by default', () => {
    mock({
      'theme/album.hbs': '',
      'theme/theme.less': ''
    })
    const theme = new Theme('theme', 'dest', {})
    theme.prepare(err => {
      should(err).eql(null)
      should(theme.dir).eql(path.resolve('theme'))
    })
  })

  it('can use a sub-folder specified in package.json', () => {
    // 1. this is useful when a packaged theme uses a build process
    // since the build result will be in a subfolder, and npm only allows publishing the root folder
    // 2. it's also useful if someone just wants to keep the theme repo clean using folders
    mock({
      'theme/package.json': `{
        "thumbsup": {
          "themeRoot": "dist"
        }
      }`,
      'theme/dist/album.hbs': '',
      'theme/dist/theme.less': ''
    })
    const theme = new Theme('theme', 'dest', {})
    theme.prepare(err => {
      should(err).eql(null)
      should(theme.dir).eql(path.resolve('theme/dist'))
    })
  })

  it('can have an empty themeRoot', () => {
    // 1. this is useful when a packaged theme uses a build process
    // since the build result will be in a subfolder, and npm only allows publishing the root folder
    // 2. it's also useful if someone just wants to keep the theme repo clean using folders
    mock({
      'theme/package.json': `{
        "thumbsup": {
          "themeRoot": ""
        }
      }`,
      'theme/album.hbs': '',
      'theme/theme.less': ''
    })
    const theme = new Theme('theme', 'dest', {})
    theme.prepare(err => {
      should(err).eql(null)
      should(theme.dir).eql(path.resolve('theme'))
    })
  })

  it('throws an error if it doesnt have the mandatory HBS template', () => {
    mock({
      'theme/theme.less': ''
    })
    const theme = new Theme('theme', 'dest', {})
    should(() => theme.validateStructure()).throw(/Invalid theme structure/)
  })

  it('throws an error if it doesnt have the mandatory LESS stylesheet', () => {
    mock({
      'theme/album.hbs': ''
    })
    const theme = new Theme('theme', 'dest', {})
    should(() => theme.validateStructure()).throw(/Invalid theme structure/)
  })

  it('renders the main CSS file', testEnd => {
    mock({
      'theme/theme.less': '@color: #abc; body { color: @color; }',
      'theme/album.hbs': ''
    })
    const theme = new Theme('theme', 'dest', {})
    theme.prepare(err => {
      should(err).be.null()
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: #abc;\n}\n')
      testEnd()
    })
  })

  it('returns an error if the main LESS file is invalid', testEnd => {
    mock({
      'theme/theme.less': 'body color = red',
      'theme/album.hbs': ''
    })
    const theme = new Theme('theme', 'dest', {})
    theme.validateStructure()
    theme.prepare(err => {
      should(err).property('message').eql('Unrecognised input')
      testEnd()
    })
  })

  it('can include an extra CSS files (unprocessed)', testEnd => {
    mock({
      'theme/theme.less': 'body { color: red; }',
      'theme/other.css': 'h1 { color: blue; }',
      'theme/album.hbs': ''
    })
    const theme = new Theme('theme', 'dest', {
      customStylesPath: 'other.css'
    })
    theme.prepare(err => {
      should(err).be.null()
      // Note the CSS file was not re-indented
      // It's important it's not processed since not all CSS is valid LESS
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: red;\n}\nh1 { color: blue; }\n')
      testEnd()
    })
  })

  it('can include an extra LESS file', testEnd => {
    mock({
      'theme/theme.less': 'body { color: red; }',
      'theme/other.less': 'h1 { color: blue; }',
      'theme/album.hbs': ''
    })
    const theme = new Theme('theme', 'dest', {
      customStylesPath: 'other.less'
    })
    theme.prepare(err => {
      should(err).be.null()
      const css = fs.readFileSync('dest/public/theme.css', 'utf-8')
      should(css).equal('body {\n  color: red;\n}\nh1 {\n  color: blue;\n}\n')
      testEnd()
    })
  })

  it('renders the main HTML file', testEnd => {
    mock({
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

  it('loads all partials', testEnd => {
    mock({
      'theme/theme.less': '',
      'theme/album.hbs': 'Partial says {{>hello}}',
      'theme/partials/hello.hbs': 'hello world'
    })
    const album = { path: 'index.html', title: 'my album' }
    const theme = new Theme('theme', 'dest', {})
    renderTheme(theme, album, () => {
      const html = fs.readFileSync('dest/index.html', 'utf-8')
      should(html).equal('Partial says hello world')
      testEnd()
    })
  })

  it('loads all helpers', testEnd => {
    // because helpers use require(...) we cannot use a mock filesystem
    const tmpdir = fixtures.createTempStructure({
      'theme/theme.less': '',
      'theme/album.hbs': 'Partial says {{hello "world"}}',
      'theme/helpers/hello.js': 'module.exports = args => "hello " + args'
    })
    const album = { path: 'index.html', title: 'my album' }
    const theme = new Theme(`${tmpdir}/theme`, `${tmpdir}/dest`, {})
    renderTheme(theme, album, () => {
      const html = fs.readFileSync(`${tmpdir}/dest/index.html`, 'utf-8')
      should(html).equal('Partial says hello world')
      testEnd()
    })
  })

  it('loads require() statements relative to the theme folder', testEnd => {
    // because helpers use require(...) we cannot use a mock filesystem
    const tmpdir = fixtures.createTempStructure({
      'theme/theme.less': '',
      'theme/album.hbs': 'Partial says {{hello "world"}}',
      'theme/node_modules/foo/package.json': '{"name": "foo", "main": "index.js"}',
      'theme/node_modules/foo/index.js': 'module.exports = () => "bar"',
      'theme/helpers/hello.js': `
        const foo = require('foo')
        module.exports = args => "hello " + foo()
      `
    })
    const album = { path: 'index.html', title: 'my album' }
    const theme = new Theme(`${tmpdir}/theme`, `${tmpdir}/dest`, {})
    renderTheme(theme, album, () => {
      const html = fs.readFileSync(`${tmpdir}/dest/index.html`, 'utf-8')
      should(html).equal('Partial says hello bar')
      testEnd()
    })
  })

  it('copies public files', testEnd => {
    // fs.copy() doesn't seem compatible with mock-fs either
    const tmpdir = fixtures.createTempStructure({
      'theme/theme.less': '',
      'theme/album.hbs': '',
      'theme/public/logo.jpg': 'LOGO'
    })
    const album = { path: 'index.html', title: 'my album' }
    const theme = new Theme(`${tmpdir}/theme`, `${tmpdir}/dest`, {})
    renderTheme(theme, album, () => {
      const html = fs.readFileSync(`${tmpdir}/dest/public/logo.jpg`, 'utf-8')
      should(html).equal('LOGO')
      testEnd()
    })
  })
})

function renderTheme (theme, album, next) {
  theme.validateStructure()
  theme.prepare(err => {
    should(err).be.null()
    theme.render(album.path, { album: album }, err => {
      should(err).be.null()
      next()
    })
  })
}
