const should = require('should/as-function')
const File = require('../../src/input/file')

describe('Input file', function () {

  it('reads the relative file path', function () {
    var file = new File({
      SourceFile: 'holidays/beach.jpg',
      File: {FileModifyDate: 'irrelevant'}
    })
    should(file.path).eql('holidays/beach.jpg')
  })

  it('parses the file modification date', function () {
    var file = new File({
      File: {
        FileModifyDate: '2017:01:27 14:38:29+05:00'
      }
    })
    should(file.fileDate).eql(1485509909000)
  })

  it('uses the EXIF caption if present', function () {
    var file = new File({
      File: {FileModifyDate: 'irrelevant'},
      EXIF: {ImageDescription: 'some caption'}
    })
    should(file.exif.caption).eql('some caption')
  })

  it('uses the IPTC caption if present', function () {
    var file = new File({
      File: {FileModifyDate: 'irrelevant'},
      IPTC: {'Caption-Abstract': 'some caption'}
    })
    should(file.exif.caption).eql('some caption')
  })

  it('uses the EXIF caption if both EXIF and IPTC exist', function () {
    var file = new File({
      File: {FileModifyDate: 'irrelevant'},
      EXIF: {ImageDescription: 'exif caption'},
      IPTC: {'Caption-Abstract': 'iptc caption'}
    })
    should(file.exif.caption).eql('exif caption')
  })

})
