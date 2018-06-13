const path = require('path')
const requireAll = require('require-all')

// require all source code
// so that the coverage report is accurate
requireAll(path.join(__dirname, '..', 'src'))
