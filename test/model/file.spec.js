const should = require('should/as-function')
const File = require('../../src/model/file')

describe('File', function () {
  it('reads the relative file path', function () {
    var file = new File(dbFile({
      SourceFile: 'holidays/beach.jpg'
    }))
    should(file.path).eql('holidays/beach.jpg')
  })

  it('parses the file modification date', function () {
    var file = new File(dbFile({
      File: {
        FileModifyDate: '2017:01:27 14:38:29+05:00'
      }
    }))
    should(file.date).eql(1485509909000)
  })

  it('can guess the media type for photos', function () {
    var file = new File(dbFile({
      File: {
        MIMEType: 'image/jpeg'
      }
    }))
    should(file.type).eql('image')
  })

  it('can guess the media type for videos', function () {
    var file = new File(dbFile({
      File: {
        MIMEType: 'video/quicktime'
      }
    }))
    should(file.type).eql('video')
  })

  it('marks all other data types as unknown', function () {
    var file = new File(dbFile({
      File: {
        MIMEType: 'text/html'
      }
    }))
    should(file.type).eql('unknown')
  })

  it('has a boolean flag for videos to simplify templates', function () {
    var photo = new File(dbFile({File: {MIMEType: 'image/jpeg'}}))
    should(photo.isVideo).eql(false)
    var video = new File(dbFile({File: {MIMEType: 'video/quicktime'}}))
    should(video.isVideo).eql(true)
  })
})

function dbFile (data) {
  // some required data
  if (!data.SourceFile) data.SourceFile = 'photo.jpg'
  if (!data.File) data.File = {}
  if (!data.File.FileModifyDate) data.File.FileModifyDate = '1999:12:31 23:59:59+00:00'
  return data
}
