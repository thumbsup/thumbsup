var should = require('should/as-function')
var Media = require('../../src/model/media')
var fixtures = require('../fixtures')

describe('Media', function () {
  describe('date taken', function () {
    it('reads the EXIF date if present', function () {
      const file = fixtures.file()
      file.meta.EXIF.DateTimeOriginal = '2016:10:28 17:34:58' // EXIF date format
      const media = new Media(file)
      should(media.date).eql(fixtures.date('2016-10-28 17:34:58').getTime())
    })

    it('defaults to the file date if there is no EXIF date', function () {
      const file = fixtures.file({date: '2016-10-28 17:34:58'})
      const media = new Media(file)
      should(media.date).eql(fixtures.date('2016-10-28 17:34:58').getTime())
    })
  })

  describe('photos and videos', function () {
    it('can tell if a file is a regular photo', function () {
      const file = fixtures.file({type: 'image'})
      file.meta.File.MIMEType = 'image/jpeg'
      const media = new Media(file)
      should(media.isVideo).eql(false)
      should(media.isAnimated).eql(false)
    })

    it('can tell if a file is a non-animated gif', function () {
      const file = fixtures.file({type: 'image'})
      file.meta.File.MIMEType = 'image/gif'
      const media = new Media(file)
      should(media.isVideo).eql(false)
      should(media.isAnimated).eql(false)
    })

    it('can tell if a file is an animated gif', function () {
      const file = fixtures.file({type: 'image'})
      file.meta.File.MIMEType = 'image/gif'
      file.meta.GIF = {FrameCount: 10}
      const media = new Media(file)
      should(media.isVideo).eql(false)
      should(media.isAnimated).eql(true)
    })

    it('can tell if a file is a video', function () {
      const file = fixtures.file({type: 'video'})
      const media = new Media(file)
      should(media.isVideo).eql(true)
      should(media.isAnimated).eql(false)
    })
  })

  describe('caption', function () {
    it('is read from all standard EXIF/IPTC/XMP tags', function () {
      const tags = [
        { type: 'EXIF', tag: 'ImageDescription' },
        { type: 'IPTC', tag: 'Caption-Abstract' },
        { type: 'IPTC', tag: 'Headline' },
        { type: 'XMP', tag: 'Description' },
        { type: 'XMP', tag: 'Title' },
        { type: 'XMP', tag: 'Label' }
      ]
      tags.forEach(t => {
        const file = fixtures.file()
        file.meta[t.type][t.tag] = 'some caption'
        const media = new Media(file)
        should(media.caption).eql('some caption')
      })
    })
  })

  describe('rating', function () {
    it('defaults to a rating of 0', function () {
      const file = fixtures.file()
      const media = new Media(file)
      should(media.rating).eql(0)
    })
    it('reads the rating from the XMP tags', function () {
      const file = fixtures.file()
      file.meta.XMP['Rating'] = 3
      const media = new Media(file)
      should(media.rating).eql(3)
    })
  })
})
