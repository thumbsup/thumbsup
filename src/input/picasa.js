/*
--------------------------------------------------------------------------------
Provides Picasa metadata based on <picasa.ini> files in the input folder
--------------------------------------------------------------------------------
*/

const ini = require('ini')
const fs = require('fs')
const path = require('path')

class Picasa {
  constructor () {
    this.folders = {}
  }
  album (dir) {
    if (!this.folders[dir]) {
      this.folders[dir] = loadPicasa(dir)
    }
    // album metadata is stored in a section called [Picasa]
    const entry = this.folders[dir]
    return entry.Picasa || null
  }
  file (filepath) {
    const dir = path.dirname(filepath)
    if (!this.folders[dir]) {
      this.folders[dir] = loadPicasa(dir)
    }
    // file metadata is stored in a section called [FileName.ext]
    const entry = this.folders[dir]
    const filename = path.basename(filepath)
    const fileParts = filename.split('.')
    return getIniValue(entry, fileParts)
  }
}

function loadPicasa (dirname) {
  const inipath = path.join(dirname, 'picasa.ini')
  const content = loadIfExists(inipath)
  if (!content) {
    // return an empty hash, as if the picasa.ini file existed but was empty
    return {}
  } else {
    return ini.parse(content)
  }
}

function loadIfExists (filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8')
  } catch (ex) {
    return null
  }
}

// the INI parser creates nested objects when the key contains a '.'
// this is a problem for sections like [IMG_0001.jpg]
// this might get fixed with https://github.com/npm/ini/issues/60
// but for now we have to recursively get the value
function getIniValue (iniObject, keyParts) {
  const current = iniObject[keyParts[0]]
  if (!current) {
    return null
  } else if (keyParts.length === 1) {
    return current
  } else {
    return getIniValue(current, keyParts.slice(1))
  }
}

module.exports = Picasa
