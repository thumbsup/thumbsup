const _ = require('lodash')
const should = require('should/as-function')
const structure = require('../../src/model/structure')

const folders = structure.folders
const suffix = structure.suffix

describe('Structure', () => {
  describe('folders', () => {
    it('starts with <media>', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith('media/')
      should(folders('holidays/IMG_0001.jpg', 'photo:large')).startWith('media/')
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith('media/')
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).startWith('media/')
      should(folders('holidays/IMG_0001.mp4', 'video:resized')).startWith('media/')
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).startWith('media/')
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).startWith('media/')
    })

    it('adds thumbnails to a <thumbs> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith('media/thumbs/holidays/')
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith('media/thumbs/holidays/')
    })

    it('adds large versions to a <large> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:large')).startWith('media/large/holidays/')
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).startWith('media/large/holidays/')
      should(folders('holidays/IMG_0001.mp4', 'video:resized')).startWith('media/large/holidays/')
    })

    it('adds copies and links to an <original> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).startWith('media/original/holidays/')
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).startWith('media/original/holidays/')
    })

    it('keeps the full original name for copies and links', () => {
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).endWith('IMG_0001.jpg')
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).endWith('IMG_0001.jpg')
    })

    it('preserves the photo thumbnail extension if supported', () => {
      // lower case
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).endWith('IMG_0001.jpg')
      should(folders('holidays/IMG_0001.jpeg', 'photo:thumbnail')).endWith('IMG_0001.jpeg')
      should(folders('holidays/IMG_0001.png', 'photo:thumbnail')).endWith('IMG_0001.png')
      should(folders('holidays/IMG_0001.gif', 'photo:thumbnail')).endWith('IMG_0001.gif')
      // upper case
      should(folders('holidays/IMG_0001.JPG', 'photo:thumbnail')).endWith('IMG_0001.JPG')
      should(folders('holidays/IMG_0001.JPEG', 'photo:thumbnail')).endWith('IMG_0001.JPEG')
      should(folders('holidays/IMG_0001.PNG', 'photo:thumbnail')).endWith('IMG_0001.PNG')
      should(folders('holidays/IMG_0001.GIF', 'photo:thumbnail')).endWith('IMG_0001.GIF')
    })

    it('changes the photo thumbnail extension to jpg if not supported', () => {
      should(folders('holidays/IMG_0001.tiff', 'photo:thumbnail')).endWith('IMG_0001.jpg')
    })

    it('supports two different resized video extensions', () => {
      should(folders('holidays/IMG_0001.mov', 'video:resized', { videoFormat: 'mp4' })).endWith('IMG_0001.mp4')
      should(folders('holidays/IMG_0001.mov', 'video:resized', { videoFormat: 'webm' })).endWith('IMG_0001.webm')
    })

    it('always uses jpg for video thumbnails and posters', () => {
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).endWith('IMG_0001.jpg')
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).endWith('IMG_0001.jpg')
    })

    it('can use a file system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: '../..' })
      should(res).eql('../../holidays/IMG_0001.jpg')
    })

    it('can use a remote HTTP link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com' })
      should(res).eql('http://test.com/holidays/IMG_0001.jpg')
    })
  })

  describe('suffix', () => {
    it('starts with <media>', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith('media/')
      should(suffix('holidays/IMG_0001.jpg', 'photo:large')).startWith('media/')
      should(suffix('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith('media/')
      should(suffix('holidays/IMG_0001.mp4', 'video:poster')).startWith('media/')
      should(suffix('holidays/IMG_0001.mp4', 'video:resized')).startWith('media/')
      should(suffix('holidays/IMG_0001.jpg', 'fs:copy')).startWith('media/')
      should(suffix('holidays/IMG_0001.jpg', 'fs:symlink')).startWith('media/')
    })

    it('uses an _thumb suffix to denote thumbnails', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:thumbnail')).endWith('holidays/IMG_0001_jpg_thumb.jpg')
      should(suffix('holidays/IMG_0001.mp4', 'video:thumbnail')).endWith('holidays/IMG_0001_mp4_thumb.jpg')
    })

    it('uses a _large suffix to resized versions', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:large')).endWith('holidays/IMG_0001_jpg_large.jpg')
      should(suffix('holidays/IMG_0001.mp4', 'video:resized')).endWith('holidays/IMG_0001_mp4_large.mp4')
    })

    it('uses a _poster suffix for the video poster', () => {
      should(suffix('holidays/IMG_0001.jpg', 'video:poster')).endWith('holidays/IMG_0001_jpg_poster.jpg')
    })

    it('uses the original filenames for copies and symlinks', () => {
      should(suffix('holidays/IMG_0001.jpg', 'fs:copy')).endWith('holidays/IMG_0001.jpg')
      should(suffix('holidays/IMG_0001.jpg', 'fs:symlink')).endWith('holidays/IMG_0001.jpg')
    })

    it('does not have conflicts between generated photo and video files', () => {
      // photos
      const photoRels = ['photo:thumbnail', 'photo:large', 'fs:copy']
      const photos = photoRels.map(rel => suffix('holidays/IMG_0001.jpg', rel))
      // videos
      const videoRels = ['video:thumbnail', 'video:poster', 'video:resized', 'fs:copy']
      const videos = videoRels.map(rel => suffix('holidays/IMG_0001.mp4', rel, { videoFormat: 'mp4' }))
      // check
      const all = _.union(photos, videos)
      should(_.uniq(all).length).eql(all.length)
    })

    it('can use a file system link', () => {
      const res = suffix('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: '../..' })
      should(res).eql('../../holidays/IMG_0001.jpg')
    })

    it('can use a remote HTTP link', () => {
      const res = suffix('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com' })
      should(res).eql('http://test.com/holidays/IMG_0001.jpg')
    })
  })
})
