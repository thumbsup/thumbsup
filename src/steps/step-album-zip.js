const async = require('async')
const childProcess = require('child_process')
const Observable = require('zen-observable')
const path = require('path')
const trace = require('debug')('thumbsup:trace')
const debug = require('debug')('thumbsup:debug')
const error = require('debug')('thumbsup:error')

exports.run = function (rootAlbum, outputFolder) {
  return new Observable(observer => {
    const albums = flattenAlbums([rootAlbum])
    const zippers = albums.filter(a => a.zip).map(album => {
      return (done) => {
        debug(`Zipping album ${album.zip} (${album.files.length} files)`)
        const zipPath = path.join(outputFolder, album.zip)
        const filenames = album.files.map(f => f.output.download.path)
        createZip(zipPath, outputFolder, filenames, done)
      }
    })
    async.series(zippers, err => {
      if (err) {
        observer.error(err)
      } else {
        observer.complete(err)
      }
    })
  })
}

function flattenAlbums (albums, result) {
  return albums.reduce((acc, album) => {
    acc.push(album)
    return flattenAlbums(album.albums, acc)
  }, result || [])
}

// This function uses the Unix ZIP command, which supports "updating" a ZIP file
// In the future it could also delegate to 7zip on Windows
function createZip (targetZipPath, currentFolder, filesToInclude, done) {
  const args = ['-FS', targetZipPath].concat(filesToInclude)
  const startTime = Date.now()
  trace(`Calling: zip ${args.join(' ')}`)
  const child = childProcess.spawn('zip', args, {
    cwd: currentFolder,
    stdio: [ 'ignore', 'ignore', 'ignore' ]
  })
  child.on('error', (err) => {
    error(`Error: please verify that <zip> is installed on your system`)
    error(err.toString())
  })
  child.on('close', (code, signal) => {
    const elapsed = Math.floor(Date.now() - startTime)
    debug(`Zip exited with code ${code} in ${elapsed}ms`)
    done(code === 0 ? null : new Error(`Error creating ZIP file ${targetZipPath}`))
  })
}
