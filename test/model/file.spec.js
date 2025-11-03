const should = require('should/as-function')
const File = require('../../src/model/file')

describe('File', function () {
  it('reads the relative file path', function () {
    const file = new File(dbFile({
      SourceFile: 'holidays/beach.jpg'
    }))
    should(file.path).eql('holidays/beach.jpg')
  })

  it('parses the file modification date', function () {
    const file = new File(dbFile({
      File: {
        FileModifyDate: '2017:01:27 14:38:29+05:00'
      }
    }))
    should(file.date).eql(1485509909000)
  })

  it('can guess the media type for photos', function () {
    const file = new File(dbFile({
      File: {
        MIMEType: 'image/jpeg'
      }
    }))
    should(file.type).eql('image')
  })

  it('can guess the media type for videos', function () {
    const file = new File(dbFile({
      File: {
        MIMEType: 'video/quicktime'
      }
    }))
    should(file.type).eql('video')
  })

  it('marks all other data types as unknown', function () {
    const file = new File(dbFile({
      File: {
        MIMEType: 'text/html'
      }
    }))
    should(file.type).eql('unknown')
  })

  it('has a boolean flag for videos to simplify templates', function () {
    const photo = new File(dbFile({ File: { MIMEType: 'image/jpeg' } }))
    should(photo.isVideo).eql(false)
    const video = new File(dbFile({ File: { MIMEType: 'video/quicktime' } }))
    should(video.isVideo).eql(true)
  })

  it('exposes the URL for each output file', function () {
    const file = new File(dbFile({ File: { MIMEType: 'image/jpeg' } }))
    should(file.urls.thumbnail).eql('media/thumbs/photo.jpg')
    should(file.urls.small).eql('media/small/photo.jpg')
    should(file.urls.large).eql('media/large/photo.jpg')
    should(file.urls.download).eql('media/large/photo.jpg')
  })

  it('can prepend an absolute media URL', function () {
    const file = new File(
      dbFile({ File: { MIMEType: 'image/jpeg' } }),
      undefined,
      { mediaUrl: 'https://cdn.example.com/gallery' }
    )
    should(file.urls.thumbnail).eql('https://cdn.example.com/gallery/media/thumbs/photo.jpg')
  })

  it('supports HTTP protocol for media URL', function () {
    const file = new File(
      dbFile({ File: { MIMEType: 'image/jpeg' } }),
      undefined,
      { mediaUrl: 'http://cdn.example.com' }
    )
    should(file.urls.thumbnail).eql('http://cdn.example.com/media/thumbs/photo.jpg')
  })

  it('supports protocol-relative URLs for media URL', function () {
    const file = new File(
      dbFile({ File: { MIMEType: 'image/jpeg' } }),
      undefined,
      { mediaUrl: '//cdn.example.com' }
    )
    should(file.urls.thumbnail).eql('//cdn.example.com/media/thumbs/photo.jpg')
  })

  it('supports media URL without protocol (creates relative URL)', function () {
    const file = new File(
      dbFile({ File: { MIMEType: 'image/jpeg' } }),
      undefined,
      { mediaUrl: 'cdn.example.com' }
    )
    should(file.urls.thumbnail).eql('cdn.example.com/media/thumbs/photo.jpg')
  })

  it('encodes the URLs to cater for special characters', function () {
    const file = new File(dbFile({
      SourceFile: 'test%22folder/photo.jpg',
      File: { MIMEType: 'image/jpeg' }
    }))
    should(file.urls.small).eql('media/small/test%2522folder/photo.jpg')
  })
})

function dbFile (data) {
  // some required data
  if (!data.SourceFile) data.SourceFile = 'photo.jpg'
  if (!data.File) data.File = {}
  if (!data.File.FileModifyDate) data.File.FileModifyDate = '1999:12:31 23:59:59+00:00'
  return data
}
