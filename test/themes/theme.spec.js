const should = require('should/as-function')
const Theme = require('../../src/website/theme')

describe('Theme', () => {
  it('supports not having custom styles', () => {
    const theme = new Theme('./mytheme', './dest', {
      customStylesPath: null
    })
    const include = theme.customStylesInclude()
    should(include).eql('')
  })

  it('adds an inline @import for CSS files', () => {
    // to ensure we support any type of CSS
    // since not all CSS is valid LESS
    const theme = new Theme('./mytheme', './dest', {
      customStylesPath: 'path/to/style.css'
    })
    const include = theme.customStylesInclude()
    should(include).eql("\n@import (inline) 'path/to/style.css';")
  })

  it('adds a standard @import for LESS files', () => {
    // to ensure the LESS file is processed normally
    // including overriding any variables
    const theme = new Theme('./mytheme', './dest', {
      customStylesPath: 'path/to/style.less'
    })
    const include = theme.customStylesInclude()
    should(include).eql("\n@import 'path/to/style.less';")
  })
})
