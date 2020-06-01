const path = require('path')
const requireAll = require('require-all')
const tmp = require('tmp')

// require all source code
// so that the coverage report is accurate
requireAll(path.join(__dirname, '..', 'src'))

// capture all unhandled rejected promises
// and ensure the current test fails
process.on('unhandledRejection', err => {
  throw err
})

// Automatically delete temporary files/folders
// Created during the tests
tmp.setGracefulCleanup()
