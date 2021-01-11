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

exports.create = (pattern, opts) => {
  const cache = {
    usesTokens: TOKEN_REGEX.test(pattern),
    usesDates: DATE_REGEX.test(pattern),
    usesKeywords: pattern.indexOf('%keywords') > -1,
    usesPeople: pattern.indexOf('%people') > -1
  }
  // return a standard mapper function (file => album names)
  return mapperFunction(pattern, cache, opts)
}

function mapperFunction (pattern, cache, opts) {
  if (opts === undefined) { opts = {} }
  return file => {
    var album = pattern
    // replace known tokens
    if (cache.usesTokens) {
      album = album.replace(TOKEN_REGEX, token => replaceToken(file, token))
    }
    if (cache.usesDates) {
      album = album.replace(DATE_REGEX, format => replaceDate(file, format))
    }
    if (cache.usesKeywords) {
      // create one album per keyword
      return replaceTags(file.meta.keywords, opts.includeKeywords, opts.excludeKeywords, album, '%keywords')
    } else if (cache.usesPeople) {
      // create one album per person
      return replaceTags(file.meta.people, opts.includePeople, opts.excludePeople, album, '%people')
    } else {
      return [album]
    }
  }
}

function replaceTags (words, includes, excludes, album, tag) {
  words = filterWords(words, includes, excludes)
  return words.map(k => album.replace(tag, k))
}

function replaceToken (file, token) {
  const fn = TOKEN_FUNC[token]
  return fn ? fn(file) : token
}

function replaceDate (file, format) {
  const fmt = format.slice(1, -1)
  return moment(file.meta.date).format(fmt)
}

function filterWords (words, includeWords, excludeWords) {
  if (includeWords && includeWords.length > 0) words = setIntersection(words, includeWords)
  if (excludeWords && excludeWords.length > 0) words = setDifference(words, excludeWords)
  return words
}

function setDifference (words, excludeWords) {
  return words.filter(x => !excludeWords.includes(x))
}

function setIntersection (words, includeWords) {
  return words.filter(x => includeWords.includes(x))
}
