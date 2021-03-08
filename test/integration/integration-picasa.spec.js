const should = require('should/as-function')
const IntegrationTest = require('./integration-test')
const fixtures = require('../fixtures')

describe('Integration: picasa', function () {
  this.slow(5000)
  this.timeout(5000)

  beforeEach(IntegrationTest.before)
  afterEach(IntegrationTest.after)

  it('reads a picasa.ini file', function (done) {
    const integration = new IntegrationTest({
      'input/folder/IMG_0001.jpg': fixtures.fromDisk('photo.jpg'),
      'input/folder/picasa.ini': '[IMG_0001.jpg]\ncaption=Beach'
    })
    const customOpts = []
    integration.run(customOpts, () => {
      integration.assertExist(['index.html', 'folder.html'])
      const res = integration.parseYaml('folder.html')
      should(res.files[0].caption).eql('Beach')
      done()
    })
  })
})
