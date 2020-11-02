const _ = require('lodash')

exports.create = function (album, opts, themeSettings) {
  const baseModel = {
    gallery: Object.assign({}, opts, { home: album }),
    settings: themeSettings,
    home: album
  }
  return createPages(baseModel, album, opts.albumPageSize, [])
}

function createPages (baseModel, album, pageSize, breadcrumbs) {
  // HTML pages for the current album
  const slicedAlbums = createSlicedAlbums(album, pageSize)
  const pages = slicedAlbums.map((album, index) => {
    const pagination = createPagination(slicedAlbums, index)
    const model = Object.assign({}, baseModel, {
      path: pagination[index].path,
      breadcrumbs: breadcrumbs,
      album: album,
      pagination: (pageSize ? pagination : [])
    })
    return model
  })
  // and all nested albums
  album.albums.forEach(function (nested) {
    const crumbs = breadcrumbs.concat([album])
    const nestedPages = createPages(baseModel, nested, pageSize, crumbs)
    Array.prototype.push.apply(pages, nestedPages)
  })
  return pages
}

function createSlicedAlbums (album, pageSize) {
  if (!pageSize) return [album]
  if (album.files.length < pageSize) return [album]
  const pagedFiles = _.chunk(album.files, pageSize)
  return pagedFiles.map(page => {
    return Object.assign({}, album, { files: page })
  })
}

function createPagination (albums, currentIndex) {
  return albums.map((album, index) => {
    return {
      index: index + 1,
      current: (index === currentIndex),
      path: injectPageNumber(album.path, index),
      url: injectPageNumber(album.url, index)
    }
  })
}

function injectPageNumber (filepath, index) {
  if (index === 0) return filepath
  const base = filepath.slice(0, -5)
  return `${base}${index + 1}.html`
}
