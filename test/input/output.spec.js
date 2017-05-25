const should = require('should/as-function')
const output = require('../../src/input/output')

describe('Output paths', function () {
  describe('Images', function () {
    it('generates a thumbnail', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {})
      should(o.thumbnail).eql({
        path: 'media/thumbs/holidays/beach.jpg',
        rel: 'photo:thumbnail'
      })
    })

    it('generates a large "web" version', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {})
      should(o.large).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can point downloads to the large version', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'large'
      })
      should(o.download).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can point downloads to a copy in the output folder', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'copy'
      })
      should(o.download).eql({
        path: 'media/original/holidays/beach.jpg',
        rel: 'fs:copy'
      })
    })

    it('can point downloads to a symlink to the originals', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'symlink'
      })
      should(o.download).eql({
        path: 'media/original/holidays/beach.jpg',
        rel: 'fs:symlink'
      })
    })

    it('can point downloads to an existing link', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })
  })

  describe('Videos', function () {
    it('generates a thumbnail', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {})
      should(o.thumbnail).eql({
        path: 'media/thumbs/holidays/seagull.jpg',
        rel: 'video:thumbnail'
      })
    })

    it('generates a poster image', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {})
      should(o.large).eql({
        path: 'media/large/holidays/seagull.jpg',
        rel: 'video:poster'
      })
    })

    it('generates a resized "web" video', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {})
      should(o.video).eql({
        path: 'media/large/holidays/seagull.mp4',
        rel: 'video:resized'
      })
    })

    it('can point downloads to the large version', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {
        downloadVideos: 'large'
      })
      should(o.download).eql({
        path: 'media/large/holidays/seagull.mp4',
        rel: 'video:resized'
      })
    })

    it('can point downloads to a copy in the output folder', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {
        downloadVideos: 'copy'
      })
      should(o.download).eql({
        path: 'media/original/holidays/seagull.mp4',
        rel: 'fs:copy'
      })
    })

    it('can point downloads to a symlink to the originals', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {
        downloadVideos: 'symlink'
      })
      should(o.download).eql({
        path: 'media/original/holidays/seagull.mp4',
        rel: 'fs:symlink'
      })
    })

    it('can point downloads to an existing link', function () {
      var o = output.paths('holidays/seagull.mp4', 'video', {
        downloadVideos: 'link',
        downloadLinkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/seagull.mp4',
        rel: 'fs:link'
      })
    })
  })

  describe('Download links', function () {
    it('can use a relative link prefix', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a relative link prefix ending with a slash', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: '../myphotos/'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use an absolute link prefix', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: '/Photos'
      })
      should(o.download).eql({
        path: '/Photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use an absolute link prefix ending with a slash', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: '/Photos/'
      })
      should(o.download).eql({
        path: '/Photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a URL prefix', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: 'http://mygallery.com/photos'
      })
      should(o.download).eql({
        path: 'http://mygallery.com/photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a URL prefix ending with a slash', function () {
      var o = output.paths('holidays/beach.jpg', 'image', {
        downloadPhotos: 'link',
        downloadLinkPrefix: 'http://mygallery.com/photos/'
      })
      should(o.download).eql({
        path: 'http://mygallery.com/photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })
  })
})
