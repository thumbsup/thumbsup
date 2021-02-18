const chalk = require('chalk')
const commandExists = require('command-exists')
const warn = require('debug')('thumbsup:warn')
const messages = require('./messages')

const BINARIES = [
  {
    // required to build the database
    mandatory: true,
    cmd: 'exiftool',
    url: 'https://www.sno.phy.queensu.ca/~phil/exiftool',
    msg: ''
  },
  {
    // required to build thumbnails, even if we're only processing videos
    mandatory: true,
    cmd: 'gm',
    url: 'http://www.graphicsmagick.org',
    msg: ''
  },
  {
    // optional to process videos
    mandatory: false,
    cmd: 'ffmpeg',
    url: 'https://www.ffmpeg.org',
    msg: 'You will not be able to process videos.'
  },
  {
    // optional to process animated GIFs
    mandatory: false,
    cmd: 'gifsicle',
    url: 'http://www.lcdf.org/gifsicle',
    msg: 'You will not be able to process animated GIFs.'
  },
  {
    // optional to process RAW photos
    mandatory: false,
    cmd: 'dcraw',
    url: 'https://www.cybercom.net/~dcoffin/dcraw/',
    msg: 'You will not be able to process RAW photos.'
  },
  {
    // optional to create album ZIP files
    mandatory: false,
    cmd: 'zip',
    url: 'https://linux.die.net/man/1/zip',
    msg: 'You will not be able to create ZIP files.'
  }
]

exports.checkRequired = () => {
  const missing = BINARIES.filter(bin => bin.mandatory).reduce(addToArrayIfMissing, [])
  if (missing.length > 0) {
    const list = missing.map(bin => `- ${bin.cmd} (${chalk.green(bin.url)})`)
    return messages.BINARIES_REQUIRED(list)
  }
  return null
}

exports.checkOptional = () => {
  const missing = BINARIES.filter(bin => !bin.mandatory).reduce(addToArrayIfMissing, [])
  if (missing.length > 0) {
    missing.forEach(bin => {
      warn(`${bin.cmd} (${bin.url}) is not installed. ${bin.msg}`)
    })
  }
}

function addToArrayIfMissing (acc, binary) {
  if (!commandExists.sync(binary.cmd)) {
    acc.push(binary)
  }
  return acc
}
