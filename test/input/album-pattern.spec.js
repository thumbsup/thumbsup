const should = require('should/as-function')
const pattern = require('../../src/input/album-pattern.js')
const fixtures = require('../fixtures.js')

describe('AlbumPattern', function () {
  describe('text', () => {
    it('can return a plain text album name', function () {
      const func = pattern.create('Holidays/Canada')
      const file = fixtures.photo()
      should(func(file)).eql(['Holidays/Canada'])
    })
    it('can have extra text around keywords', function () {
      const func = pattern.create('Holidays/%path')
      const file = fixtures.photo({
        path: 'Canada/IMG_0001.jpg'
      })
      should(func(file)).eql(['Holidays/Canada'])
    })
  })
  describe('path', () => {
    it('%path returns the relative path of the photo', function () {
      const func = pattern.create('%path')
      const file = fixtures.photo({
        path: 'Holidays/IMG_0001.jpg'
      })
      should(func(file)).eql(['Holidays'])
    })
    it('%path includes all subfolders', function () {
      const func = pattern.create('%path')
      const file = fixtures.photo({
        path: 'Holidays/Canada/IMG_0001.jpg'
      })
      should(func(file)).eql(['Holidays/Canada'])
    })
  })
  describe('creation date', () => {
    it('can use a moment.js format: {YYYY MM}', function () {
      const func = pattern.create('{YYYY MM}')
      const file = fixtures.photo({
        date: '2016:07:14 12:07:41'
      })
      should(func(file)).eql(['2016 07'])
    })
    it('can include slashes in the format: {YYYY/MM}', function () {
      const func = pattern.create('{YYYY/MM}')
      const file = fixtures.photo({
        date: '2016:07:14 12:07:41'
      })
      should(func(file)).eql(['2016/07'])
    })
    it('can have multiple dates in the same pattern: {YYYY}/{MM}', function () {
      const func = pattern.create('{YYYY}/{MM}')
      const file = fixtures.photo({
        date: '2016:07:14 12:07:41'
      })
      should(func(file)).eql(['2016/07'])
    })
  })
  describe('keywords', () => {
    it('can return a single keyword', () => {
      const func = pattern.create('%keywords')
      const file = fixtures.photo({
        keywords: ['beach']
      })
      should(func(file)).eql(['beach'])
    })
    it('can return multiple keyword', () => {
      const func = pattern.create('%keywords')
      const file = fixtures.photo({
        keywords: ['beach', 'sunset']
      })
      should(func(file)).eql(['beach', 'sunset'])
    })
    it('can use plain text around the keywords', () => {
      const func = pattern.create('Tags/%keywords')
      const file = fixtures.photo({
        keywords: ['beach', 'sunset']
      })
      should(func(file)).eql(['Tags/beach', 'Tags/sunset'])
    })
    it('does not return any albums if the photo does not have keywords', () => {
      const func = pattern.create('{YYYY}/tags/%keywords')
      const file = fixtures.photo()
      should(func(file)).eql([])
    })
  })
  describe('Complex patterns', () => {
    it('can mix several tokens inside a complex pattern', () => {
      const func = pattern.create('{YYYY}/%path/%keywords')
      const file = fixtures.photo({
        path: 'Holidays/IMG_0001.jpg',
        date: '2016:07:14 12:07:41',
        keywords: ['beach', 'sunset']
      })
      should(func(file)).eql(['2016/Holidays/beach', '2016/Holidays/sunset'])
    })
  })
})
