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
  });

  it('can tell if a file is a photo', function() {
    var file = new File('test.jpg', fixtures.metadata());
    should(file.isVideo).eql(false);
    should(file.isAnimated).eql(false);
  });

  it('can tell if a file is a video', function() {
    var meta = fixtures.metadata();
    meta.mediaType = 'video';
    var file = new File('test.mp4', meta);
    should(file.isVideo).eql(true);
    should(file.isAnimated).eql(false);
  });

  it('can tell if a file is an animated GIF', function() {
    var meta = fixtures.metadata();
    meta.mediaType = 'image';
    var file = new File('test.gif', meta);
    should(file.isVideo).eql(false);
    should(file.isAnimated).eql(true);
  });


});
