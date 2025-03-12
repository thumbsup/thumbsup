const _ = require('lodash')
const should = require('should/as-function')
const structure = require('../../src/model/structure')
const fixtures = require('../fixtures.js')

const folders = structure.folders
const suffix = structure.suffix
const ospath = fixtures.ospath

describe('Structure', () => {
  describe('folders', () => {
    it('starts with <media>', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.jpg', 'photo:large')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.mp4', 'video:resized')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).startWith(ospath('media/'))
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).startWith(ospath('media/'))
    })

    it('can be at the root', () => {
      should(folders('IMG_0001.jpg', 'photo:thumbnail')).eql(ospath('media/thumbs/IMG_0001.jpg'))
    })

    it('adds thumbnails to a <thumbs> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith(ospath('media/thumbs/holidays/'))
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith(ospath('media/thumbs/holidays/'))
    })

    it('adds large versions to a <large> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'photo:large')).startWith(ospath('media/large/holidays/'))
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).startWith(ospath('media/large/holidays/'))
      should(folders('holidays/IMG_0001.mp4', 'video:resized')).startWith(ospath('media/large/holidays/'))
    })

    it('adds copies and links to an <original> folder', () => {
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).startWith(ospath('media/original/holidays/'))
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).startWith(ospath('media/original/holidays/'))
    })

    it('keeps the full original name for copies and links', () => {
      should(folders('holidays/IMG_0001.jpg', 'fs:copy')).endWith(ospath('IMG_0001.jpg'))
      should(folders('holidays/IMG_0001.jpg', 'fs:symlink')).endWith(ospath('IMG_0001.jpg'))
    })

    it('preserves the photo thumbnail extension if supported', () => {
      // lower case
      should(folders('holidays/IMG_0001.jpg', 'photo:thumbnail')).endWith(ospath('IMG_0001.jpg'))
      should(folders('holidays/IMG_0001.jpeg', 'photo:thumbnail')).endWith(ospath('IMG_0001.jpeg'))
      should(folders('holidays/IMG_0001.png', 'photo:thumbnail')).endWith(ospath('IMG_0001.png'))
      should(folders('holidays/IMG_0001.gif', 'photo:thumbnail')).endWith(ospath('IMG_0001.gif'))
      // upper case
      should(folders('holidays/IMG_0001.JPG', 'photo:thumbnail')).endWith(ospath(ospath('IMG_0001.JPG')))
      should(folders('holidays/IMG_0001.JPEG', 'photo:thumbnail')).endWith(ospath(ospath('IMG_0001.JPEG')))
      should(folders('holidays/IMG_0001.PNG', 'photo:thumbnail')).endWith(ospath(ospath('IMG_0001.PNG')))
      should(folders('holidays/IMG_0001.GIF', 'photo:thumbnail')).endWith(ospath(ospath('IMG_0001.GIF')))
    })

    it('changes the photo thumbnail extension to jpg if not supported', () => {
      should(folders('holidays/IMG_0001.tiff', 'photo:thumbnail')).endWith(ospath(ospath('IMG_0001.jpg')))
    })

    it('supports two different resized video extensions', () => {
      should(folders('holidays/IMG_0001.mov', 'video:resized', { videoFormat: 'mp4' })).endWith(ospath('IMG_0001.mp4'))
      should(folders('holidays/IMG_0001.mov', 'video:resized', { videoFormat: 'webm' })).endWith(ospath('IMG_0001.webm'))
    })

    it('always uses jpg for video thumbnails and posters', () => {
      should(folders('holidays/IMG_0001.mp4', 'video:thumbnail')).endWith(ospath('IMG_0001.jpg'))
      should(folders('holidays/IMG_0001.mp4', 'video:poster')).endWith(ospath('IMG_0001.jpg'))
    })

    it('can use a relative file system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: '../..' })
      should(res).eql(ospath('../../holidays/IMG_0001.jpg'))
    })

    it('can use a relative file system link ending with a slash', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: '../../' })
      should(res).eql(ospath('../../holidays/IMG_0001.jpg'))
    })

    itLinux('can use an absolute file system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: '/media' })
      should(res).eql('/media/holidays/IMG_0001.jpg')
    })

    itLinux('can use a file:// system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'file:///media' })
      should(res).eql('file:///media/holidays/IMG_0001.jpg')
    })

    itWindows('can use an absolute file system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'C:\\media' })
      should(res).eql('C:\\media\\holidays\\IMG_0001.jpg')
    })

    itWindows('can use an absolute file system link ending with a backslash', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'C:\\media\\' })
      should(res).eql('C:\\media\\holidays\\IMG_0001.jpg')
    })

    itWindows('can use a file:// system link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'file://C:/media' })
      should(res).eql('file://C:/media/holidays/IMG_0001.jpg')
    })

    it('can use a remote HTTP link', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com' })
      should(res).eql('http://test.com/holidays/IMG_0001.jpg')
    })

    it('can use a remote HTTP link with a subfolder', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com/folder' })
      should(res).eql('http://test.com/folder/holidays/IMG_0001.jpg')
    })

    it('can use a remote HTTP link ending with a slash', () => {
      const res = folders('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com/folder/' })
      should(res).eql('http://test.com/folder/holidays/IMG_0001.jpg')
    })
  })

  describe('suffix', () => {
    it('starts with <media>', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:thumbnail')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.jpg', 'photo:large')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.mp4', 'video:thumbnail')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.mp4', 'video:poster')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.mp4', 'video:resized')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.jpg', 'fs:copy')).startWith(ospath('media/'))
      should(suffix('holidays/IMG_0001.jpg', 'fs:symlink')).startWith(ospath('media/'))
    })

    it('can be at the root', () => {
      should(suffix('IMG_0001.jpg', 'photo:thumbnail')).eql(ospath('media/IMG_0001_jpg_thumb.jpg'))
    })

    it('uses an _thumb suffix to denote thumbnails', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:thumbnail')).endWith(ospath('holidays/IMG_0001_jpg_thumb.jpg'))
      should(suffix('holidays/IMG_0001.mp4', 'video:thumbnail')).endWith(ospath('holidays/IMG_0001_mp4_thumb.jpg'))
    })

    it('uses a _large suffix to resized versions', () => {
      should(suffix('holidays/IMG_0001.jpg', 'photo:large')).endWith(ospath('holidays/IMG_0001_jpg_large.jpg'))
      should(suffix('holidays/IMG_0001.mp4', 'video:resized')).endWith(ospath('holidays/IMG_0001_mp4_large.mp4'))
    })

    it('uses a _poster suffix for the video poster', () => {
      should(suffix('holidays/IMG_0001.jpg', 'video:poster')).endWith(ospath('holidays/IMG_0001_jpg_poster.jpg'))
    })

    it('uses the original filenames for copies and symlinks', () => {
      should(suffix('holidays/IMG_0001.jpg', 'fs:copy')).endWith(ospath('holidays/IMG_0001.jpg'))
      should(suffix('holidays/IMG_0001.jpg', 'fs:symlink')).endWith(ospath('holidays/IMG_0001.jpg'))
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
      should(res).eql(ospath('../../holidays/IMG_0001.jpg'))
    })

    it('can use a remote HTTP link', () => {
      const res = suffix('holidays/IMG_0001.jpg', 'fs:link', { linkPrefix: 'http://test.com' })
      should(res).eql('http://test.com/holidays/IMG_0001.jpg')
    })
  })
})
