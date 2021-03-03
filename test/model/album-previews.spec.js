const _ = require('lodash')
const should = require('should/as-function')
const Album = require('../../src/model/album')
const fixtures = require('../fixtures')

function arrayOfFiles (count) {
  const base = new Array(count)
  return Array.from(base, (_, index) => fixtures.photo(`${index}`))
}

function outputName (file) {
  const thumb = file.urls.thumbnail
  return thumb.substring(thumb.lastIndexOf('/') + 1, thumb.lastIndexOf('.'))
}

describe('Album', function () {
  this.slow(200)

  describe('previews', function () {
    it('picks the first 10 photos by default', function () {
      const album = new Album({ files: arrayOfFiles(100) })
      album.finalize()
      should(album.previews).have.length(10)
      const thumbs = album.previews.map(outputName)
      should(thumbs).eql(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    })

    it('adds <missing> thumbnails to fill', function () {
      const album = new Album({ files: arrayOfFiles(5) })
      album.finalize()
      const thumbs = album.previews.map(outputName)
      should(thumbs.slice(0, 5)).eql(['0', '1', '2', '3', '4'])
      for (var i = 5; i < 10; ++i) {
        should(album.previews[i].urls.thumbnail).eql('public/missing.png')
      }
    })

    it('uses files from nested albums too', function () {
      const album = new Album({
        title: 'a',
        files: [fixtures.photo('a1'), fixtures.photo('a2')],
        albums: [
          new Album({
            title: 'b',
            files: [fixtures.photo('b1'), fixtures.photo('b2')]
          }),
          new Album({
            title: 'c',
            files: [fixtures.photo('c1'), fixtures.photo('c2')]
          })
        ]
      })
      album.finalize()
      should(album.previews).have.length(10)
      const thumbs = album.previews.map(outputName)
      should(thumbs.slice(0, 6)).eql(['a1', 'a2', 'b1', 'b2', 'c1', 'c2'])
      for (var i = 6; i < 10; ++i) {
        should(album.previews[i].urls.thumbnail).eql('public/missing.png')
      }
    })

    describe('preview modes', () => {
      it('can pick the first 10 photos', function () {
        const album = new Album({ files: arrayOfFiles(100) })
        album.finalize({ albumPreviews: 'first' })
        should(album.previews).have.length(10)
        const thumbs = album.previews.map(outputName)
        should(thumbs).eql(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
      })

      it('can randomize the previews', function () {
        const album = new Album({ files: arrayOfFiles(100) })
        album.finalize({ albumPreviews: 'random' })
        should(album.previews).have.length(10)
        should(_.uniq(album.previews)).have.length(10)
      })

      it('can spread the previews', function () {
        const album = new Album({ files: arrayOfFiles(50) })
        album.finalize({ albumPreviews: 'spread' })
        should(album.previews).have.length(10)
        const thumbs = album.previews.map(outputName)
        should(thumbs).eql(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'])
      })

      it('ignores the extra photos when spreading on un-even counts', function () {
        const album = new Album({ files: arrayOfFiles(58) })
        album.finalize({ albumPreviews: 'spread' })
        should(album.previews).have.length(10)
        const thumbs = album.previews.map(outputName)
        should(thumbs).eql(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'])
      })

      it('picks the first 10 when trying to spread under 10 photos', function () {
        const album = new Album({ files: arrayOfFiles(5) })
        album.finalize({ albumPreviews: 'spread' })
        should(album.previews).have.length(10)
        const thumbs = album.previews.map(outputName)
        should(thumbs.slice(0, 5)).eql(['0', '1', '2', '3', '4'])
        for (var i = 5; i < 10; ++i) {
          should(album.previews[i].urls.thumbnail).eql('public/missing.png')
        }
      })

      it('throws an error if the preview type is not supported', function () {
        const album = new Album({ files: arrayOfFiles(5) })
        should.throws(function () {
          album.finalize({ albumPreviews: 'test' })
        })
      })
    })
  })
})
