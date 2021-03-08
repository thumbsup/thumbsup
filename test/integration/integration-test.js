const fs = require('fs')
const debug = require('debug')
const glob = require('glob')
const path = require('path')
const YAML = require('yaml')
const should = require('should/as-function')
const fixtures = require('../fixtures')
const options = require('../../src/cli/options')
const index = require('../../src/index')

class IntegrationTest {
  constructor (structure) {
    this.tmpdir = fixtures.createTempStructure(structure)
    this.input = path.join(this.tmpdir, 'input')
    this.output = path.join(this.tmpdir, 'output')
    this.actualFiles = []
  }

  run (customOptions, done) {
    const defaultOptions = [
      '--input', this.input,
      '--output', this.output,
      '--theme-path', 'test-fixtures/theme',
      '--log', 'info'
    ]
    const allOptions = defaultOptions.concat(customOptions)
    const opts = options.get(allOptions)
    index.build(opts, err => {
      // Reset the logger ASAP to print the test status
      console.log = console.logOld
      should(err).eql(null)
      debug.assertNotContains('thumbsup:error')
      this.actualFiles = glob.sync('**/*', {
        cwd: this.output,
        nodir: true,
        nonull: false
      })
      setImmediate(done)
    })
  }

  assertExist (expected) {
    const missing = expected.filter(f => this.actualFiles.indexOf(f) === -1)
    should(missing).eql([])
  }

  parse (filepath) {
    const fullpath = path.join(this.output, filepath)
    return fs.readFileSync(fullpath, { encoding: 'utf8' })
  }

  parseYaml (filepath) {
    const contents = this.parse(filepath)
    return YAML.parse(contents)
  }

  getPath (structurePath) {
    return path.join(this.tmpdir, structurePath)
  }
}

IntegrationTest.before = function () {
  // Listr uses control.log() to print progress
  // But so does Mocha to print test results
  // So we override it for the duration of the integration test
  console.logOld = console.log
  console.log = debug('thumbsup:info')
  debug.reset()
}

IntegrationTest.after = function () {
  console.log = console.logOld
}

module.exports = IntegrationTest
