const path = require('path')
const glob = require('../../../src/components/index/glob')
const should = require('should/as-function')

describe('Index: glob', function () {
  this.slow(1000)
  this.timeout(1000)
  it('finds all files', (done) => {
    const fixtures = path.join(__dirname, '..', '..', '..', 'fixtures')
    glob.find(fixtures, (err, map) => {
      if (err) {
        return done(err)
      }
      const keys = Object.keys(map).sort()
      should(keys).eql([
        'holidays/beach.jpg',
        'holidays/tower.jpg',
        'home/desk.jpg',
        'home/fruit.jpg'
      ])
      done()
    })
  })
})
