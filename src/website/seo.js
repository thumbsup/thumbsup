const fs = require('fs')
const path = require('path')

class SEO {
  constructor (output, seoLocation, rootAlbum) {
    this.output = output
    this.seoPrefix = seoLocation + (seoLocation.endsWith('/') ? '' : '/')
    this.album = rootAlbum
  }

  robots () {
    return `User-Agent: *\nDisallow:\nSitemap: ${this.seoPrefix}sitemap.xml\n`
  }

  sitemap () {
    const now = new Date().toISOString()
    const prefix = this.seoPrefix
    // gather all album pages
    const urls = []
    addAlbumUrls(urls, this.album)
    // create one <url> section per album
    const xml = urls.map(url => `
  <url>
    <loc>${prefix}${url}</loc>
    <lastmod>${now}</lastmod>
  </url>`)
    // return the full document
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml.join('')}
</urlset>
`
  }

  writeFiles () {
    const robotsFile = path.join(this.output, 'robots.txt')
    const sitemapFile = path.join(this.output, 'sitemap.xml')
    fs.writeFileSync(robotsFile, this.robots())
    fs.writeFileSync(sitemapFile, this.sitemap())
  }
}

function addAlbumUrls (list, album) {
  list.push(album.url)
  album.albums.forEach(subAlbum => addAlbumUrls(list, subAlbum))
}

module.exports = SEO
