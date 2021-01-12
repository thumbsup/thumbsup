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
      const func = pattern.create('%keywords', {})
      const file = fixtures.photo({
        keywords: ['beach']
      }, {})
      should(func(file)).eql(['beach'])
    })
    it('can return multiple keyword', () => {
      const func = pattern.create('%keywords', {})
      const file = fixtures.photo({
        keywords: ['beach', 'sunset']
      }, {})
      should(func(file)).eql(['beach', 'sunset'])
    })
    it('can use plain text around the keywords', () => {
      const func = pattern.create('Tags/%keywords', {})
      const file = fixtures.photo({
        keywords: ['beach', 'sunset']
      }, {})
      should(func(file)).eql(['Tags/beach', 'Tags/sunset'])
    })
    it('can find keywords in a specified tag', () => {
      const func = pattern.create('%keywords')
      const file = fixtures.photo({
        subjects: ['sunny beach']
      }, {})
      should(func(file)).eql(['sunny beach'])
    })
    it('can deal with keyword includes and excludes', () => {
      const opts = {
        includeKeywords: ['sunny beach', 'sandy shore', 'waves'],
        excludeKeywords: ['sandy shore']
      }
      const func = pattern.create('%keywords', opts)
      const file = fixtures.photo({
        subjects: ['beach', 'sunny beach', 'sandy shore', 'waves']
      }, opts)
      should(func(file)).eql(['sunny beach', 'waves'])
    })
    it('does not return any albums if the photo does not have keywords', () => {
      const func = pattern.create('{YYYY}/tags/%keywords')
      const file = fixtures.photo()
      should(func(file)).eql([])
    })
  })
  describe('people', () => {
    it('can return a single person', () => {
      const func = pattern.create('%people')
      const file = fixtures.photo({
        people: ['john doe']
      })
      should(func(file)).eql(['john doe'])
    })
    it('can return multiple people', () => {
      const func = pattern.create('%people')
      const file = fixtures.photo({
        people: ['john doe', 'jane doe']
      }, {
        peopleFields: ['XMP.PersonInImage']
      })
      should(func(file)).eql(['john doe', 'jane doe'])
    })
    it('can use plain text around the people', () => {
      const func = pattern.create('Tags/%people')
      const file = fixtures.photo({
        people: ['john doe', 'jane doe']
      }, {
        peopleFields: ['XMP.PersonInImage']
      })
      should(func(file)).eql(['Tags/john doe', 'Tags/jane doe'])
    })
    it('can deal with people includes and excludes', () => {
      const opts = {
        peopleFields: ['XMP.PersonInImage'],
        includePeople: ['jane doe', 'john lennon', 'paul mccartney'],
        excludePeople: ['john lennon']
      }
      const func = pattern.create('%people', opts)
      const file = fixtures.photo({
        people: ['john doe', 'jane doe', 'john lennon', 'paul mccartney']
      }, opts)
      should(func(file)).eql(['jane doe', 'paul mccartney'])
    })
    it('does not return any albums if the photo does not have people', () => {
      const func = pattern.create('{YYYY}/tags/%people')
      const file = fixtures.photo()
      should(func(file)).eql([])
    })
  })
  describe('Complex patterns', () => {
    it('can mix several tokens inside a complex pattern', () => {
      const func = pattern.create('{YYYY}/%path/%keywords', {})
      const file = fixtures.photo({
        path: 'Holidays/IMG_0001.jpg',
        date: '2016:07:14 12:07:41',
        keywords: ['beach', 'sunset']
      }, {})
      should(func(file)).eql(['2016/Holidays/beach', '2016/Holidays/sunset'])
    })
  })
})
