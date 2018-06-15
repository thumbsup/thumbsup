const should = require('should/as-function')
const Problems = require('../src/problems.js')
const debug = require('debug')
const sinon = require('sinon')

describe('Problems', function () {
  beforeEach(() => {
    console.warnOld = console.log
    console.warn = sinon.spy()
    debug.reset()
  })

  afterEach(() => {
    console.warn = console.warnOld
  })

  it('prints a summary with the number of errors', () => {
    const problems = new Problems()
    problems.addFile('holidays/IMG_0001.jpg')
    problems.addFile('holidays/IMG_0002.jpg')
    problems.print()
    should(console.warn.args.length).above(0)
    const message = console.warn.args[0][0]
    should(message.indexOf('an issue with 2 files')).above(-1)
    console.warn = console.warnOld
  })

  it('prints the list of files with errors', () => {
    const problems = new Problems()
    problems.addFile('holidays/IMG_0001.jpg')
    problems.addFile('holidays/IMG_0002.jpg')
    problems.print()
    debug.assertContains('were not processed')
    debug.assertContains('holidays/IMG_0001.jpg')
    debug.assertContains('holidays/IMG_0002.jpg')
    console.warn = console.warnOld
  })

  it('does not print the summary if there are no errors', () => {
    const problems = new Problems()
    problems.print()
    should(console.warn.args).eql([])
    console.warn = console.warnOld
  })

  it('does not print the detailed log if there are no errors', () => {
    const problems = new Problems()
    problems.print()
    debug.assertNotContains('were not processed')
    console.warn = console.warnOld
  })
})
