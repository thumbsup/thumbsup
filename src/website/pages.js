
exports.create = function (album, opts, themeSettings) {
  const baseModel = {
    gallery: Object.assign({}, opts, { home: album }),
    settings: themeSettings,
    home: album
  }
  return createPages(baseModel, album, [])
}

function createPages (baseModel, album, breadcrumbs) {
  // page for the current album
  const page = Object.assign({}, baseModel, {
    breadcrumbs: breadcrumbs,
    album: album,
    path: album.path
  })
  const pages = [page]
  // and all nested albums
  album.albums.forEach(function (nested) {
    const crumbs = breadcrumbs.concat([album])
    const nestedPages = createPages(baseModel, nested, crumbs)
    Array.prototype.push.apply(pages, nestedPages)
  })
  return pages
}
