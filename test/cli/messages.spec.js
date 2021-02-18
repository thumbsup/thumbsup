const should = require('should/as-function')
const messages = require('../../src/cli/messages.js')

describe('messages', function () {
  it('shows SUCCESS in a box', () => {
    const stats = { albums: 1, photos: 1, videos: 1 }
    const success = messages.SUCCESS(stats)
    assertInABox(success)
  })

  it('shows GREETING in a box', () => {
    const greeting = messages.GREETING()
    assertInABox(greeting)
  })

  it('shows SORRY in a box', () => {
    const sorry = messages.SORRY('thumbsup.log')
    assertInABox(sorry)
  })

  it('lists mandatory binary dependencies', () => {
    const required = messages.BINARIES_REQUIRED(['bin1', 'bin2'])
    should(required.indexOf('bin1\n')).above(-1)
    should(required.indexOf('bin2\n')).above(-1)
  })

  it('can print one or more problem', () => {
    should(messages.PROBLEMS(1).indexOf('with 1 file.')).above(-1)
    should(messages.PROBLEMS(2).indexOf('with 2 files.')).above(-1)
  })
})

function assertInABox (result) {
  should(result.indexOf('┌───')).above(-1)
  should(result.indexOf('───┐')).above(-1)
  should(result.indexOf('└───')).above(-1)
  should(result.indexOf('───┘')).above(-1)
  should(result.split('\n').length).above(4)
}
