const debug = require('debug')
const util = require('util')

debug.recorded = []

// enable all logs while running the tests
debug.enable('thumbsup:*')

// don't format the logs to avoid any extra ANSI codes
debug.formatArgs = function (args) {
}

// capture the logs instead of displaying them
debug.log = function () {
  const message = util.format.apply(null, arguments)
  debug.recorded.push(`${this.namespace} ${message}`)
}

debug.reset = function () {
  debug.recorded = []
}

debug.assertContains = function (expected) {
  const matches = debug.recorded.filter(message => {
    return message.includes(expected)
  })
  if (matches.length === 0) {
    throw new Error(`Expected log to contain: ${expected}`)
  }
}
