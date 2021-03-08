const should = require('should/as-function')
const IntegrationTest = require('./integration-test')
const fixtures = require('../fixtures')

describe('Integration: themes', function () {
  this.slow(5000)
  this.timeout(5000)

  beforeEach(IntegrationTest.before)
  afterEach(IntegrationTest.after)

  const integration = new IntegrationTest({
    'input/IMG_0001.jpg': fixtures.fromDisk('photo.jpg'),
    'custom.less': '@color: #444;'
  })

  it('processes LESS variables', function (done) {
    const customOpts = []
    integration.run(customOpts, () => {
      integration.assertExist(['public/theme.css'])
      const res = integration.parse('public/theme.css')
      should(res.includes('border: #333')).eql(true)
      done()
    })
  })

  it('can customise LESS variables', function (done) {
    const customOpts = [
      '--theme-style', integration.getPath('custom.less')
    ]
    integration.run(customOpts, () => {
      integration.assertExist(['public/theme.css'])
      const res = integration.parse('public/theme.css')
      should(res.includes('border: #444')).eql(true)
      done()
    })
  })
})
