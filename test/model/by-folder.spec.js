var should   = require('should/as-function');
var Album    = require('../../src/model/album.js');
var byfolder = require('../../src/model/by-folder.js');
var fixtures = require('../fixtures');

describe('ByFolder', function() {

  beforeEach(function() {
    Album.resetIds();
  });

  it('creates albums by folders', function () {
    // create files in different folders
    var london1 = fixtures.photo({path: 'london/IMG_000001.jpg'});
    var london2 = fixtures.photo({path: 'london/IMG_000002.jpg'});
    var newyork1 = fixtures.photo({path: 'newyork/IMG_000003.jpg'});
    var newyork2 = fixtures.video({path: 'newyork/IMG_000004.mp4'});
    // group them per folder
    var collection = {files: [london1, london2, newyork1, newyork2]};
    var albums = byfolder.albums(collection, {});
    // assert on the result
    should(albums).eql([
      new Album({
        id: 1,
        title: 'london',
        files: [london1, london2]
      }),
      new Album({
        id: 2,
        title: 'newyork',
        files: [newyork1, newyork2]
      })
    ]);
  });

  it('creates nested albums for nested folders', function () {
    // create files in nested folders
    var photo1 = fixtures.photo({path: 'a/b/c/IMG_000001.jpg'});
    var photo2 = fixtures.photo({path: 'a/d/IMG_000002.jpg'});
    // group them per folder
    var collection = {files: [photo1, photo2]};
    var albums = byfolder.albums(collection, {});
    // assert on the result
    should(albums).eql([
      new Album({
        id: 1,
        title: 'a',
        files: [],
        albums: [
          new Album({
            id: 2,
            title: 'b',
            files: [],
            albums: [
              new Album({
                id: 3,
                title: 'c',
                files: [photo1]
              })
            ]
          }),
          new Album({
            id: 4,
            title: 'd',
            files: [photo2]
          })
        ]
      })
    ]);
  });

});
