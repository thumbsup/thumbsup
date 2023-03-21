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
    // memory cache of all Picasa files read so far
    this.folders = {}
  }

  album (dir) {
    const entry = this.folderMetadata(dir)
    // album metadata is stored in a section called [Picasa]
    return entry.Picasa || null
  }

  file (filepath) {
    const dir = path.dirname(filepath)
    const entry = this.folderMetadata(dir)
    // file metadata is stored in a section called [FileName.ext]
    const filename = path.basename(filepath)
    const fileParts = filename.split('.')
    return getIniValue(entry, fileParts)
  }

  folderMetadata (dirname) {
    // try reading from cache first
    if (this.folders[dirname]) {
      return this.folders[dirname]
    }
    // otherwise try to read the file from disk
    const inipath = path.join(dirname, 'picasa.ini')
    const content = loadIfExists(inipath)
    this.folders[dirname] = content ? ini.parse(content) : {}
    return this.folders[dirname]
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
