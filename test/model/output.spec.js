const should = require('should/as-function')
const output = require('../../src/model/output')

describe('Output paths', function () {
  describe('Images', function () {
    it('generates a thumbnail', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {})
      should(o.thumbnail).eql({
        path: 'media/thumbs/holidays/beach.jpg',
        rel: 'photo:thumbnail'
      })
    })

    it('generates a large "web" version', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {})
      should(o.large).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can point downloads to the large version', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'resize'
      })
      should(o.download).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can point previews to a copy in the output folder', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoPreview: 'copy'
      })
      should(o.large).eql({
        path: 'media/original/holidays/beach.jpg',
        rel: 'fs:copy'
      })
    })

    it('can point downloads to a copy in the output folder', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'copy'
      })
      should(o.download).eql({
        path: 'media/original/holidays/beach.jpg',
        rel: 'fs:copy'
      })
    })

    it('can point downloads to a symlink to the originals', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'symlink'
      })
      should(o.download).eql({
        path: 'media/original/holidays/beach.jpg',
        rel: 'fs:symlink'
      })
    })

    it('can point downloads to an existing link', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('keeps the original image format if the browser supports it', function () {
      ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'].forEach(ext => {
        const o = output.paths(`holidays/beach.${ext}`, 'image', {})
        should(o.thumbnail.path).eql(`media/thumbs/holidays/beach.${ext}`)
      })
    })

    it('converts images to JPEG if not supported', function () {
      // some of these formats are supported on certain browser, but we aim for maximum compatibility
      ['bmp', 'tiff', 'webp'].forEach(ext => {
        const o = output.paths(`holidays/beach.${ext}`, 'image', {})
        should(o.thumbnail.path).eql(`media/thumbs/holidays/beach.jpg`)
      })
    })
  })

  describe('Videos', function () {
    it('generates a thumbnail', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {})
      should(o.thumbnail).eql({
        path: 'media/thumbs/holidays/seagull.jpg',
        rel: 'video:thumbnail'
      })
    })

    it('generates a poster image', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {})
      should(o.large).eql({
        path: 'media/large/holidays/seagull.jpg',
        rel: 'video:poster'
      })
    })

    it('generates a resized "web" video', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', { videoFormat: 'mp4' })
      should(o.video).eql({
        path: 'media/large/holidays/seagull.mp4',
        rel: 'video:resized'
      })
    })

    it('can point downloads to the large version', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {
        videoDownload: 'resize',
        videoFormat: 'mp4'
      })
      should(o.download).eql({
        path: 'media/large/holidays/seagull.mp4',
        rel: 'video:resized'
      })
    })

    it('can point downloads to a copy in the output folder', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {
        videoDownload: 'copy'
      })
      should(o.download).eql({
        path: 'media/original/holidays/seagull.mp4',
        rel: 'fs:copy'
      })
    })

    it('can point previews to a copy in the output folder', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {
        videoPreview: 'copy'
      })
      should(o.video).eql({
        path: 'media/original/holidays/seagull.mp4',
        rel: 'fs:copy'
      })
    })

    it('can point downloads to a symlink to the originals', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {
        videoDownload: 'symlink'
      })
      should(o.download).eql({
        path: 'media/original/holidays/seagull.mp4',
        rel: 'fs:symlink'
      })
    })

    it('can point downloads to an existing link', function () {
      const o = output.paths('holidays/seagull.mp4', 'video', {
        videoDownload: 'link',
        linkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/seagull.mp4',
        rel: 'fs:link'
      })
    })
  })

  describe('Download links', function () {
    it('can use a relative link prefix', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: '../myphotos'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a relative link prefix ending with a slash', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: '../myphotos/'
      })
      should(o.download).eql({
        path: '../myphotos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use an absolute link prefix', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: '/Photos'
      })
      should(o.download).eql({
        path: '/Photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use an absolute link prefix ending with a slash', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: '/Photos/'
      })
      should(o.download).eql({
        path: '/Photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a URL prefix', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: 'http://mygallery.com/photos'
      })
      should(o.download).eql({
        path: 'http://mygallery.com/photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })

    it('can use a URL prefix ending with a slash', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        photoDownload: 'link',
        linkPrefix: 'http://mygallery.com/photos/'
      })
      should(o.download).eql({
        path: 'http://mygallery.com/photos/holidays/beach.jpg',
        rel: 'fs:link'
      })
    })
  })

  describe('Output structure', function () {
    it('defaults to the <folders> structure', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {})
      should(o.download).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can explicitely choose the <folders> structure', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        outputStructure: 'folders'
      })
      should(o.download).eql({
        path: 'media/large/holidays/beach.jpg',
        rel: 'photo:large'
      })
    })

    it('can choose the <suffix> structure', function () {
      const o = output.paths('holidays/beach.jpg', 'image', {
        outputStructure: 'suffix'
      })
      should(o.download).eql({
        path: 'media/holidays/beach_jpg_large.jpg',
        rel: 'photo:large'
      })
    })

    it('throws an error for invalid values', function () {
      should.throws(function () {
        output.paths('holidays/beach.jpg', 'image', {
          outputStructure: 'unknown'
        })
      }, /Invalid output structure: unknown/)
    })
  })
})
