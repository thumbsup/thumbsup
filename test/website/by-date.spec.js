var should   = require('should/as-function');
var Album    = require('../../src/output-website/album.js');
var bydate   = require('../../src/output-website/by-date.js');
var fixtures = require('../fixtures');

describe('ByDate', function() {

  it('creates top-level albums grouped by month', function () {
    // create files from different dates
    var a_2016_06 = fixtures.photo({date: fixtures.date('2016-06-01')});
    var b_2016_06 = fixtures.photo({date: fixtures.date('2016-06-10')});
    var c_2016_07 = fixtures.photo({date: fixtures.date('2016-07-23')});
    var d_2016_07 = fixtures.video({date: fixtures.date('2016-07-18')});
    // group them per month
    var collection = { files: [a_2016_06, b_2016_06, c_2016_07, d_2016_07] };
    var albums = bydate.albums(collection, {
      grouping: 'YYYY-MM'
    });
    // assert on the result
    should(albums).eql([
      new Album({
        'title': '2016-06',
        files: [a_2016_06, b_2016_06]
      }),
      new Album({
        title: '2016-07',
        files: [c_2016_07, d_2016_07]
      })
    ]);
  });

  it('creates albums using a date hierarchy', function () {
    // create files from different dates
    var a_2015_06 = fixtures.photo({date: fixtures.date('2015-06-01')});
    var b_2015_06 = fixtures.photo({date: fixtures.date('2015-06-10')});
    var c_2016_07 = fixtures.photo({date: fixtures.date('2016-07-23')});
    var d_2016_08 = fixtures.video({date: fixtures.date('2016-08-18')});
    // group them per year, and nested month
    var collection = { files: [a_2015_06, b_2015_06, c_2016_07, d_2016_08] };
    var albums = bydate.albums(collection, {
      grouping: 'YYYY/MM'
    });
    // assert on the result
    should(albums).eql([
      new Album({
        'title': '2015',
        files: [],
        albums: [
          new Album({
            title: '06',
            files: [a_2015_06, b_2015_06]
          })
        ]
      }),
      new Album({
        title: '2016',
        files: [],
        albums: [
          new Album({
            title: '07',
            files: [c_2016_07]
          }),
          new Album({
            title: '08',
            files: [d_2016_08]
          })
        ]
      })
    ]);
  });

});
