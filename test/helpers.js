const tmp = require('tmp')

// capture all unhandled rejected promises
// and ensure the current test fails
process.on('unhandledRejection', err => {
  throw err
})

// Automatically delete temporary files/folders
// Created during the tests
tmp.setGracefulCleanup()

// Helpers for Linux and Windows-only tests
function test (title, fn) {
  it(title, fn)
}

global.itLinux = (process.platform !== 'win32') ? test : () => {}
global.itWindows = (process.platform === 'win32') ? test : () => {}
