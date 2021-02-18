const warn = require('debug')('thumbsup:warn')
const messages = require('./cli/messages')

/*
  Keeps track of which source files we failed to process
*/
module.exports = class Problems {
  constructor () {
    this.files = {}
  }

  addFile (path) {
    this.files[path] = true
  }

  print () {
    // only print the number of failed files in the standard output
    const paths = Object.keys(this.files)
    if (paths.length > 0) {
      // print a short summary on stdout
      console.warn(messages.PROBLEMS(paths.length))
      // and a full log to the log file
      warn('The following sources files were not processed:\n' + paths.join(','))
    }
  }
}
