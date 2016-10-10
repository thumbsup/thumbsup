var should   = require('should/as-function');
var Album    = require('../../src/output-website/album.js');
var bydate   = require('../../src/output-website/by-date.js');
var fixtures = require('../fixtures');

describe('ByDate', function() {

  describe('date format', function() {

    it('formats a date as YYYY-MM', function() {
      should(bydate.format(fixtures.date('2016-06-13T16:43:19'))).eql('2016-06')
    });

    it('formats based on the local timezone', function() {
      // TODO: why doesn't 23:59:59 work? Seems to be converted
      should(bydate.format(fixtures.date('1999-01-01T00:00:00'))).eql('1999-01')
      should(bydate.format(fixtures.date('1999-12-31T00:00:00'))).eql('1999-12')
    });

  });

  it('creates albums by date', function () {
    // create files from different dates
    var june1 = fixtures.photo({path: 'some/IMG_000001.jpg', date: fixtures.date('2016-06-01')});
    var june2 = fixtures.photo({path: 'folders/IMG_000003.jpg', date: fixtures.date('2016-06-10')});
    var july1 = fixtures.photo({path: 'random/IMG_000002.jpg', date: fixtures.date('2016-07-23')});
    var july2 = fixtures.video({path: 'and/subfolders/IMG_000004.mp4', date: fixtures.date('2016-07-18')});
    // group them per month
    var collection = { files: [june1, june2, july1, july2] };
    var albums = bydate.albums(collection, {});
    // assert on the result
    should(albums).eql([
      new Album({
        'title': '2016-06',
        files: [june1, june2]
      }),
      new Album({
        title: '2016-07',
        files: [july1, july2]
      })
    ]);
  });

});
