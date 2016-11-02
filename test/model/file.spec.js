var should = require('should/as-function');
var File = require('../../src/model/file');
var fixtures = require('../fixtures');

describe('File', function() {

  it('stores the file name', function(){
    var f = new File('holidays/newyork/IMG_000001.jpg', fixtures.metadata());
    should(f.filename).eql('IMG_000001.jpg');
  });

  it('reads the date from the file <mdate>', function() {
    var meta = fixtures.metadata();
    meta.fileDate = fixtures.date('2016-09-23');
    meta.exif.date = null;
    var f = new File('IMG_000001.jpg', meta);
    should(f.date).eql(fixtures.date('2016-09-23'));
  })

});
