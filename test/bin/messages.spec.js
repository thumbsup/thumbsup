const should = require('should/as-function')
const messages = require('../../bin/messages.js')

describe('messages', function () {
  ['SUCCESS', 'GREETING', 'SORRY'].forEach(type => {
    it(`wraps ${type} messages in a box`, () => {
      const success = messages[type]({})
      should(success.indexOf('┌───')).above(-1)
      should(success.indexOf('───┐')).above(-1)
      should(success.indexOf('└───')).above(-1)
      should(success.indexOf('───┘')).above(-1)
      should(success.split('\n').length).above(4)
    })
  })

  it('lists mandatory binary dependencies', () => {
    const required = messages.BINARIES_REQUIRED(['bin1', 'bin2'])
    should(required.indexOf('bin1\n')).above(-1)
    should(required.indexOf('bin2\n')).above(-1)
  })
})
