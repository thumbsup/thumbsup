const exiftool = require('../../../src/components/exiftool/parallel')
const path = require('path')
const readdir = require('readdir-enhanced')
const should = require('should/as-function')

// Find all test photos
const folder = path.join(__dirname, '..', '..', '..', 'fixtures')
const files = readdir.sync(folder, {
  filter: stats => stats.isFile() && stats.path.charAt(0) !== '.',
  deep: true
})

describe('exiftool', () => {
  it('processes all files', (done) => {
    const processed = []
    const stream = exiftool.parse(folder, files)
    stream.on('data', entry => {
      processed.push(entry.SourceFile)
    })
    .on('end', () => {
      files.sort()
      processed.sort()
      should(processed).eql(files)
      done()
    })
  })
})
