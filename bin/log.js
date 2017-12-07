
exports.init = (logLevel) => {
  // enable particular debug() prefixes
  if (logLevel === 'trace') process.env['DEBUG'] = '*'
  if (logLevel === 'debug') process.env['DEBUG'] = 'thumbsup:error,thumbsup:warn,thumbsup:info,thumbsup:debug'
  if (logLevel === 'info') process.env['DEBUG'] = 'thumbsup:error,thumbsup:warn,thumbsup:info'

  // when running in text-mode, make sure all console.log() calls go through debug()
  // don't touch them in normal-mode, since it would affect Listr's dnyamic rendering
  if (typeof logLevel === 'string') {
    console.log = require('debug')('thumbsup:info')
    console.info = require('debug')('thumbsup:info')
    console.warn = require('debug')('thumbsup:warn')
    console.error = require('debug')('thumbsup:error')
  }
}
