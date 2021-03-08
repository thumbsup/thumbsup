const should = require('should/as-function')
const IntegrationTest = require('./integration-test')
const fixtures = require('../fixtures')

describe('Integration: urls', function () {
  this.slow(5000)
  this.timeout(5000)

  beforeEach(IntegrationTest.before)
  afterEach(IntegrationTest.after)

  const integration = new IntegrationTest({
    'input/IMG_0001.jpg': fixtures.fromDisk('photo.jpg')
  })

  it('uses relative URLs by default', function (done) {
    const customOpts = []
    integration.run(customOpts, () => {
      integration.assertExist(['index.html'])
      const res = integration.parseYaml('index.html')
      should(res.files[0].thumbnail).eql('media/thumbs/IMG_0001.jpg')
      done()
    })
  })

  it('can use an external link prefix', function (done) {
    const customOpts = [
      '--photo-preview', 'link',
      '--link-prefix', 'http://example.com'
    ]
    integration.run(customOpts, () => {
      integration.assertExist(['index.html'])
      const res = integration.parseYaml('index.html')
      should(res.files[0].preview).eql('http://example.com/IMG_0001.jpg')
      done()
    })
  })
})
