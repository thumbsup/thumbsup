const fs = require('node:fs')
const child = require('node:child_process')

// get latest CLI help text
const output = child.execSync('node bin/thumbsup.js --help')
const codeblock = '```' + output + '```'

// update README file
const readme = fs.readFileSync('README.md', 'utf-8')
const updated = readme.replace(/<!--STARTCLI-->[\s\S]*?<!--ENDCLI-->/, `<!--STARTCLI-->\n${codeblock}\n<!--ENDCLI-->`)
fs.writeFileSync('README.md', updated)
