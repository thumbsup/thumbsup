const IntegrationTest = require('./integration-test')
const fixtures = require('../fixtures')

describe('Integration: media files', function () {
  this.slow(5000)
  this.timeout(5000)

  beforeEach(IntegrationTest.before)
  afterEach(IntegrationTest.after)

  const image = fixtures.fromDisk('photo.jpg')
  const integration = new IntegrationTest({
    'input/london/IMG_0001.jpg': image,
    'input/london/IMG_0002.jpg': image,
    'input/newyork/day 1/IMG_0003.jpg': image,
    'input/newyork/day 2/IMG_0004.jpg': image
  })

  it('builds the gallery from scratch', function (done) {
    const customOpts = []
    integration.run(customOpts, () => {
      // Database
      integration.assertExist([
        'thumbsup.db'
      ])
      // Albums
      integration.assertExist([
        'index.html',
        'london.html',
        'newyork-day-1.html',
        'newyork-day-2.html'
      ])
      // Thumbnails
      integration.assertExist([
        'media/thumbs/london/IMG_0001.jpg',
        'media/thumbs/london/IMG_0002.jpg',
        'media/thumbs/newyork/day 1/IMG_0003.jpg',
        'media/thumbs/newyork/day 2/IMG_0004.jpg'
      ])
      // Large versions
      integration.assertExist([
        'media/large/london/IMG_0001.jpg',
        'media/large/london/IMG_0002.jpg',
        'media/large/newyork/day 1/IMG_0003.jpg',
        'media/large/newyork/day 2/IMG_0004.jpg'
      ])
      done()
    })
  })

  it('builds the gallery a second time', function (done) {
    const customOpts = []
    integration.run(customOpts, () => {
      done()
    })
  })
})
