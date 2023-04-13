const should = require('should/as-function')
const IntegrationTest = require('./integration-test')
const fixtures = require('../fixtures')

describe('Integration: scan modes', function () {
  this.slow(5000)
  this.timeout(5000)

  const image = fixtures.fromDisk('photo.jpg')

  beforeEach(IntegrationTest.before)
  afterEach(IntegrationTest.after)

  function newIntegrationTest () {
    return new IntegrationTest({
      'input/london/IMG_0001.jpg': image,
      'input/london/IMG_0002.jpg': image,
      'input/newyork/day 1/IMG_0003.jpg': image,
      'input/newyork/day 2/IMG_0004.jpg': image
    })
  }

  describe('Full', () => {
    it('removes files that no longer exist in the source', function (done) {
      const integration = newIntegrationTest()
      integration.run(['--scan-mode', 'full'], () => {
        const london1 = integration.parseYaml('london.html')
        should(london1.files).have.length(2)
        // delete a file and run again
        integration.deleteInputFile('input/london/IMG_0002.jpg')
        integration.run(['--scan-mode', 'full', '--cleanup', 'true'], () => {
          const london2 = integration.parseYaml('london.html')
          // the deleted file was removed
          should(london2.files).have.length(1)
          integration.assertNotExist(['media/thumbs/london/IMG_0002.jpg'])
          done()
        })
      })
    })

    it("removes files that don't match the include filter", function (done) {
      const integration = newIntegrationTest()
      integration.run(['--scan-mode', 'full'], () => {
        // first run, there's 2 albums (London + New York)
        const index1 = integration.parseYaml('index.html')
        should(index1.albums).have.length(2)
        // run again, only including New York
        integration.run(['--scan-mode', 'full', '--include', 'newyork/**', '--cleanup', 'true'], () => {
          const index2 = integration.parseYaml('index.html')
          // the London album is no longer there
          should(index2.albums).have.length(1)
          should(index2.albums[0].title).eql('newyork')
          integration.assertNotExist(['media/thumbs/london/IMG_0001.jpg'])
          done()
        })
      })
    })
  })

  describe('Partial', () => {
    it('ignores changes outside the include pattern', function (done) {
      const integration = newIntegrationTest()
      integration.run(['--scan-mode', 'full'], () => {
        const london1 = integration.parseYaml('london.html')
        should(london1.files).have.length(2)
        integration.deleteInputFile('input/london/IMG_0002.jpg')
        // run again, with only processing New York
        integration.run(['--scan-mode', 'partial', '--include', 'newyork/**', '--cleanup', 'true'], () => {
          // the London album still exists
          const index2 = integration.parseYaml('index.html')
          should(index2.albums).have.length(2)
          // and it still has 2 files
          const london2 = integration.parseYaml('london.html')
          should(london2.files).have.length(2)
          // and the excluded thumbnails are not deleted
          integration.assertExist(['media/thumbs/london/IMG_0002.jpg'])
          done()
        })
      })
    })
  })

  describe('Incremental', () => {
    it('does not remove deleted files', function (done) {
      const integration = newIntegrationTest()
      integration.run(['--scan-mode', 'full'], () => {
        const london1 = integration.parseYaml('london.html')
        should(london1.files).have.length(2)
        // run again after deleting a file
        integration.deleteInputFile('input/london/IMG_0002.jpg')
        integration.run(['--scan-mode', 'incremental'], () => {
          const london2 = integration.parseYaml('london.html')
          should(london2.files).have.length(2)
          integration.assertExist(['media/thumbs/london/IMG_0002.jpg'])
          done()
        })
      })
    })
  })
})
