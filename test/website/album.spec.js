var should   = require('should/as-function');
var Album    = require('../../src/output-website/album');
var fixtures = require('../fixtures');

describe('Album', function() {

  it('sanitises album titles for the file name', function() {
    var a = new Album('hello & world');
    should(a.filename).eql('helloworld');
  });

  describe('stats', function() {

    describe('single level', function() {

      it('has no nested albums', function() {
        var a = new Album('single');
        a.finalize();
        should(a.stats.albums).eql(0);
      })

      it('calculates counts for a single level', function() {
        var a = new Album('single');
        a.files = [
          fixtures.photo(), fixtures.photo(),
          fixtures.photo(), fixtures.photo(),
          fixtures.video(), fixtures.video(),
        ];
        a.finalize();
        should(a.stats.photos).eql(4);
        should(a.stats.videos).eql(2);
      });

      it('calculates dates', function() {
        var a = new Album('single');
        a.files = [
          fixtures.photo({date: '2016-09-14'}),
          fixtures.photo({date: '2016-09-02'}),
          fixtures.photo({date: '2016-10-21'}),
        ];
        a.finalize();
        should(a.stats.fromDate).eql(fixtures.date('2016-09-02'));
        should(a.stats.toDate).eql(fixtures.date('2016-10-21'));
      });

    });

    describe('nested albums', function() {

    });

    describe('summary', function() {

      it('creates a summary with a single photos', function() {
        var a = new Album('single');
        a.files = [
          fixtures.photo()
        ];
        a.finalize();
        should(a.summary).eql('1 photo')
      });

      it('creates a summary with a single video', function() {
        var a = new Album('single');
        a.files = [
          fixtures.video()
        ];
        a.finalize();
        should(a.summary).eql('1 video')
      });

      it('creates a summary with several photos', function() {
        var a = new Album('single');
        a.files = [
          fixtures.photo(), fixtures.photo(),
        ];
        a.finalize();
        should(a.summary).eql('2 photos')
      });

      it('creates a summary with several videos', function() {
        var a = new Album('single');
        a.files = [
          fixtures.video(), fixtures.video(),
        ];
        a.finalize();
        should(a.summary).eql('2 videos')
      });

      it('creates a summary with several photos and videos', function() {
        var a = new Album('single');
        a.files = [
          fixtures.photo(), fixtures.photo(),
          fixtures.video(), fixtures.video(),
        ];
        a.finalize();
        should(a.summary).eql('2 photos, 2 videos')
      });

    });

    describe('previews', function() {

      it('adds <missing> thumbnails to fill the 2x2 grid', function() {
        var a = new Album({files: [
          fixtures.photo(), fixtures.photo(),
        ]});
        a.finalize();
        should(a.previews).have.length(4);
        should(a.previews[2].urls.thumb).eql('public/missing.png');
        should(a.previews[3].urls.thumb).eql('public/missing.png');
      });

    });

  });

});
