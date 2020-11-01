const should = require('should/as-function')
const SEO = require('../../src/website/seo')
const Album = require('../../src/model/album')

describe('SEO', function () {
  it('normalises the SEO location path (no slash)', function () {
    const location = 'https://example.com'
    const seo = new SEO('output', location, new Album('test'))
    should(seo.seoPrefix).eql('https://example.com/')
  })

  it('normalises the SEO location path (slash)', function () {
    const location = 'https://example.com/'
    const seo = new SEO('output', location, new Album('test'))
    should(seo.seoPrefix).eql('https://example.com/')
  })

  describe('robots.txt', function () {
    it('allows all user agents', function () {
      const seo = new SEO('output', 'https://example.com', new Album('test'))
      const robots = seo.robots()
      should(robots.includes('User-Agent: *')).eql(true)
    })

    it('points to the Sitemap', function () {
      const seo = new SEO('output', 'https://example.com', new Album('test'))
      const robots = seo.robots()
      should(robots.includes('Sitemap: https://example.com/sitemap.xml')).eql(true)
    })
  })

  describe('sitemap.xml', function () {
    it('includes the root album', function () {
      const album = new Album('test')
      album.finalize()
      const seo = new SEO('output', 'https://example.com', album)
      const sitemap = seo.sitemap()
      should(sitemap.includes('<loc>https://example.com/index.html</loc>')).eql(true)
    })

    it('includes nested albums', function () {
      const album = new Album({
        albums: [new Album('a'), new Album('b')]
      })
      album.finalize()
      const seo = new SEO('output', 'https://example.com', album)
      const sitemap = seo.sitemap()
      should(sitemap.includes('<loc>https://example.com/index.html</loc>')).eql(true)
      should(sitemap.includes('<loc>https://example.com/a.html</loc>')).eql(true)
      should(sitemap.includes('<loc>https://example.com/b.html</loc>')).eql(true)
    })
  })
})
