const debug = require('debug')
const fs = require('fs')
const path = require('path')
const util = require('util')
const tty = require('tty')

/*
  Thumbsup uses the <debug> package for logging.
  It supports two main ways of logging:

  1. when --log is not specified
     - This ignores all detailed logging calls
     - It simply renders progress using Listr on <stdout>
     - Warning and error are sent to <thumbsup.log> in the output folder for troubleshooting

  2. when --log is specified
     - This switches Listr to text mode, e.g. "Task XYZ [completed]"
     - It renders log messages to <stdout>
     - The logging level can be configured between info|debug|trace
     - Warnings and errors are always shown, because level is > info|debug|trace
     - <thumbsup.log> is not created by default
     - You can always redirect or tee the output to a file if needed

  If --log is not specified, but the output doesn't support ANSI (e.g. non-TTY terminal, or file redirection)
  then the mode is automatically switched to "--log info"
*/
exports.init = (logLevel, outputFolder) => {
  // if the output doesn't support ANSI codes (e.g. pipe, redirect to file)
  // then switch to full-text mode, because Listr's output won't make much sense
  if (logLevel === 'default' && !tty.isatty(process.stdout.fd)) {
    logLevel = 'info'
  }

  // Configure the loggers
  if (logLevel === 'default') {
    configureDefaultMode(outputFolder)
  } else {
    configureDebugMode(logLevel)
  }
}

/*
  The <debug> package repeats the date + prefix for every log line, but only when using colors
  This fix adds the same behaviour in non-color mode
  It's important so the log files are easy to grep
*/
function overrideDebugFormat () {
  debug.formatArgs = function (args) {
    const prefix = new Date().toISOString() + ' ' + this.namespace + ' '
    args[0] = prefix + args[0].split('\n').join('\n' + prefix)
  }
}

/*
  If --log is not specified, we won't show any detailed log on stdout
  Instead we send all errors to a file for troubleshooting
*/
function configureDefaultMode (outputFolder) {
  const logfile = path.join(outputFolder, 'thumbsup.log')
  const stream = fs.createWriteStream(logfile, { flags: 'a' })
  overrideDebugFormat()
  debug.enable('thumbsup:error,thumbsup:warn')
  debug.useColors = () => false
  debug.log = function () {
    const line = util.format.apply(util, arguments) + '\n'
    stream.write(line)
  }
}

/*
  --log mode configuration
*/
function configureDebugMode (logLevel) {
  // because Listr logs to stdout (not configurable), make debug() do the same
  // otherwise file redirection gets very confusing
  debug.log = function () {
    const line = util.format.apply(util, arguments) + '\n'
    process.stdout.write(line)
  }

  // TTY-related configuration
  const supportsANSI = tty.isatty(process.stdout.fd)
  debug.useColors = () => supportsANSI
  if (!supportsANSI) {
    overrideDebugFormat()
  }

  // enable the right log levels
  if (logLevel === 'trace') debug.enable('*')
  if (logLevel === 'debug') debug.enable('thumbsup:error,thumbsup:warn,thumbsup:info,thumbsup:debug')
  if (logLevel === 'info') debug.enable('thumbsup:error,thumbsup:warn,thumbsup:info')

  // capture any additional console.log() calls, including Listr task updates
  console.log = require('debug')('thumbsup:info')
  console.info = require('debug')('thumbsup:info')
  console.warn = require('debug')('thumbsup:warn')
  console.error = require('debug')('thumbsup:error')
}
