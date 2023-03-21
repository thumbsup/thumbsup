const should = require('should/as-function')
const Album = require('../../src/model/album')
const fixtures = require('../fixtures')

describe('Album', function () {
  describe('stats', function () {
    describe('single level stats', function () {
      it('has no nested albums', function () {
        const a = new Album({})
        a.finalize()
        should(a.stats.albums).eql(0)
      })

      it('calculates counts for a single level', function () {
        const a = new Album({
          files: [
            fixtures.photo(), fixtures.photo(),
            fixtures.photo(), fixtures.photo(),
            fixtures.video(), fixtures.video()
          ]
        })
        a.finalize()
        should(a.stats.photos).eql(4)
        should(a.stats.videos).eql(2)
      })

      it('calculates from/to dates', function () {
        const a = new Album({
          files: [
            fixtures.photo({ date: '2016-09-14' }),
            fixtures.photo({ date: '2016-09-02' }),
            fixtures.photo({ date: '2016-10-21' })
          ]
        })
        a.finalize()
        should(a.stats.fromDate).eql(fixtures.date('2016-09-02').getTime())
        should(a.stats.toDate).eql(fixtures.date('2016-10-21').getTime())
      })
    })

    describe('nested albums stats', function () {
      it('counts all nested albums', function () {
        const root = new Album({
          albums: [new Album('a'), new Album('b')]
        })
        root.finalize()
        should(root.stats.albums).eql(2)
      })

      it('counts all nested photos', function () {
        const root = new Album({
          files: [fixtures.photo()],
          albums: [
            new Album({
              files: [fixtures.photo(), fixtures.photo()]
            })
          ]
        })
        root.finalize()
        should(root.stats.photos).eql(3)
      })

      it('counts all nested photos', function () {
        const root = new Album({
          files: [fixtures.video()],
          albums: [
            new Album({
              files: [fixtures.video(), fixtures.video()]
            })
          ]
        })
        root.finalize()
        should(root.stats.videos).eql(3)
      })

      it('calculates from/to dates across all albums', function () {
        const a = new Album({
          files: [fixtures.photo({ date: '2016-09-14' })],
          albums: [
            new Album({
              files: [fixtures.photo({ date: '2016-09-02' })],
              albums: [new Album({
                files: [fixtures.photo({ date: '2016-10-21' })]
              })]
            })
          ]
        })
        a.finalize()
        should(a.stats.fromDate).eql(fixtures.date('2016-09-02').getTime())
        should(a.stats.toDate).eql(fixtures.date('2016-10-21').getTime())
      })
    })
  })

  describe('summary', function () {
    it('creates a summary with a single photo', function () {
      const a = new Album('single')
      a.files = [
        fixtures.photo()
      ]
      a.finalize()
      should(a.summary).eql('1 photo')
    })

    it('creates a summary with a single video', function () {
      const a = new Album('single')
      a.files = [
        fixtures.video()
      ]
      a.finalize()
      should(a.summary).eql('1 video')
    })

    it('creates a summary with a single album', function () {
      const a = new Album('single')
      a.albums = [new Album('nested')]
      a.finalize()
      should(a.summary).eql('1 album')
    })

    it('creates a summary with several photos', function () {
      const a = new Album('single')
      a.files = [
        fixtures.photo(), fixtures.photo()
      ]
      a.finalize()
      should(a.summary).eql('2 photos')
    })

    it('creates a summary with several videos', function () {
      const a = new Album('single')
      a.files = [
        fixtures.video(), fixtures.video()
      ]
      a.finalize()
      should(a.summary).eql('2 videos')
    })

    it('creates a summary with several albums', function () {
      const a = new Album('single')
      a.albums = [new Album('nested 1'), new Album('nested 2')]
      a.finalize()
      should(a.summary).eql('2 albums')
    })

    it('creates a summary with a mix of albums, photos and videos', function () {
      const a = new Album('single')
      a.albums = [new Album('nested')]
      a.files = [
        fixtures.photo(), fixtures.photo(),
        fixtures.video(), fixtures.video()
      ]
      a.finalize()
      should(a.summary).eql('1 album, 2 photos, 2 videos')
    })
  })
})
