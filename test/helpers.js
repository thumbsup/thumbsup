const tmp = require('tmp')

// capture all unhandled rejected promises
// and ensure the current test fails
process.on('unhandledRejection', err => {
  throw err
})

// Automatically delete temporary files/folders
// Created during the tests
tmp.setGracefulCleanup()
