var should   = require('should/as-function');
var Album    = require('../../src/model/album');
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

      it('calculates the depth of every album', function() {
        var a = new Album('single');
        var b = new Album('single');
        var c = new Album('single');
        var d = new Album('single');
        a.albums = [b, c];
        c.albums = [d];
        a.finalize();
        should(a.depth).eql(0);
        should(b.depth).eql(1);
        should(c.depth).eql(1);
        should(d.depth).eql(2);
      });

      it('sets the home flag on the top-level album', function() {
        var a = new Album('single');
        var b = new Album('single');
        var c = new Album('single');
        var d = new Album('single');
        a.albums = [b, c];
        c.albums = [d];
        a.finalize();
        should(a.home).eql(true);
        should(b.home).eql(false);
        should(c.home).eql(false);
        should(d.home).eql(false);
      });

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

    it('uses files from nested albums too', function() {
      var a = new Album({
        title: 'a',
        albums: [
          new Album({
            title: 'b',
            files: [fixtures.photo(), fixtures.photo()]
          }),
          new Album({
            title: 'c',
            files: [fixtures.photo(), fixtures.photo()]
          })
        ]
      });
      a.finalize();
      should(a.previews).have.length(4);
      for (var i = 0; i < 4; ++i) {
        should(a.previews[i].urls.thumb).not.eql('public/missing.png');
      }
    });

  });

});
