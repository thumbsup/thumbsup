/*
--------------------------------------------------------------------------------
Returns a list of album names for every file.
Can be based on anything, e.g. directory name, date, metadata keywords...
e.g. `Holidays/London/IMG_00001.jpg` -> `Holidays/London`
--------------------------------------------------------------------------------
*/
const moment = require('moment')
const path = require('path')

const TOKEN_REGEX = /%[a-z]+/g
const DATE_REGEX = /{[^}]+}/g

const TOKEN_FUNC = {
  '%path': file => path.dirname(file.path)
}

exports.create = pattern => {
  const cache = {
    usesTokens: TOKEN_REGEX.test(pattern),
    usesDates: DATE_REGEX.test(pattern),
    usesKeywords: pattern.indexOf('%keywords') > -1
  }
  // return a standard mapper function (file => album names)
  return file => {
    var album = pattern
    // replace known tokens
    if (cache.usesTokens) {
      album = album.replace(TOKEN_REGEX, token => replaceToken(file, token))
    }
    if (cache.usesDates) {
      album = album.replace(DATE_REGEX, format => replaceDate(file, format))
    }
    // create one album per keyword if required
    if (cache.usesKeywords) {
      return file.meta.keywords.map(k => album.replace('%keywords', k))
    } else {
      return [album]
    }
  }
}

function replaceToken (file, token) {
  const fn = TOKEN_FUNC[token]
  return fn ? fn(file) : token
}

function replaceDate (file, format) {
  const fmt = format.slice(1, -1)
  return moment(file.meta.date).format(fmt)
}
