const chalk = require('chalk')
const commandExists = require('command-exists')

const COMMANDS = {
  'gm': 'http://www.graphicsmagick.org',
  'exiftool': 'https://www.sno.phy.queensu.ca/~phil/exiftool',
  'ffmpeg': 'https://www.ffmpeg.org'
}

exports.verify = function () {
  const missing = Object.keys(COMMANDS).reduce(addToArrayIfMissing, [])
  if (missing.length > 0) {
    const list = missing.map(nameAndURL).join('\n')
    return `The following programs are required to run thumbsup:\n
${list}\n
Please make sure they are installed and available in the system path.`
  }
  return null
}

function addToArrayIfMissing (acc, cmd) {
  if (!commandExists.sync(cmd)) {
    acc.push(cmd)
  }
  return acc
}

function nameAndURL (cmd) {
  const url = chalk.green(COMMANDS[cmd])
  return `- ${cmd} (${url})`
}
