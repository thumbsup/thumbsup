const GlobPattern = require('../../../src/components/index/pattern')
const should = require('should/as-function')

describe('Index: pattern', function () {
  describe('matching files', () => {
    it('matches files with the valid extension', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(true)
    })

    it('matches files with one of the valid extensions', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: ['jpg', 'png']
      })
      should(pattern.match('holidays/IMG_0001.png')).eql(true)
    })

    it('rejects files with an invalid extension', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.foo')).eql(false)
    })

    it('matches files that meet the include pattern', () => {
      const pattern = new GlobPattern({
        include: ['holidays/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(true)
      should(pattern.match('holidays/venice/IMG_0001.jpg')).eql(true)
    })

    it('matches files that meet one of the include patterns', () => {
      const pattern = new GlobPattern({
        include: ['work/**', 'holidays/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(true)
    })

    it('can include deep sub-directory patterns', () => {
      const pattern = new GlobPattern({
        include: ['**/london/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/london/IMG_0001.jpg')).eql(true)
    })

    it('can use a partial filename as an include', () => {
      const pattern = new GlobPattern({
        include: ['**/IMG_*'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(true)
      should(pattern.match('holidays/venice/IMG_0001.jpg')).eql(true)
    })

    it('rejects files that dont meet any of the include patterns', () => {
      const pattern = new GlobPattern({
        include: ['work/**', 'home/**'],
        exclude: [],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(false)
    })

    it('matches files that dont meet any exclude patterns', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['home/**', 'work/**'],
        extensions: ['jpg']
      })
      should(pattern.match('holidays/IMG_0001.jpg')).eql(true)
    })

    it('rejects files that meet an exclude pattern', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['home/**', 'work/**'],
        extensions: ['jpg']
      })
      should(pattern.match('home/IMG_0001.jpg')).eql(false)
    })

    it('exclude are stronger than include', () => {
      const pattern = new GlobPattern({
        include: ['home/**'],
        exclude: ['**/2016/**'],
        extensions: ['jpg']
      })
      should(pattern.match('home/2016/IMG_0001.jpg')).eql(false)
    })
  })

  describe('calculating sub-folders for traversal', () => {
    it('includes all sub-folders', () => {
      const pattern = new GlobPattern({
        include: ['holidays/venice/IMG001.jpg'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql(['holidays/venice/', 'holidays/'])
    })

    it('keeps the required include if it ends with a wildcard', () => {
      // to ensure sub-sub folders can be traversed as expected
      const pattern = new GlobPattern({
        include: ['holidays/venice/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql(['holidays/venice/**', 'holidays/venice/', 'holidays/'])
    })

    it('keeps the required include if it ends with a /', () => {
      const pattern = new GlobPattern({
        include: ['holidays/venice/'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql(['holidays/venice/', 'holidays/'])
    })

    it('combines all include paths (no repetitions)', () => {
      const pattern = new GlobPattern({
        include: ['holidays/venice/IMG_001.jpg', 'holidays/milan/IMG_002.jpg'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql([
        'holidays/venice/',
        'holidays/',
        'holidays/milan/'
      ])
    })

    it('works with a root wildcard', () => {
      const pattern = new GlobPattern({
        include: ['**'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql(['**'])
    })

    it('works with a root double wildcard', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.includeFolders).eql(['**/**', '**/'])
    })
  })

  describe('traversing folders', () => {
    it('traverses folders that meet an include pattern', () => {
      const pattern = new GlobPattern({
        include: ['holidays/**', 'home/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(true)
    })

    it('traverses nested folders that meet a deep wildcard (**)', () => {
      const pattern = new GlobPattern({
        include: ['holidays/**', 'home/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays/2016')).eql(true)
      should(pattern.canTraverse('holidays/2016/venice')).eql(true)
    })

    it('traverses folders that meet a nested deep wildcard', () => {
      const pattern = new GlobPattern({
        include: ['holidays/2016/**', 'home/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(true)
      should(pattern.canTraverse('holidays/2016')).eql(true)
      should(pattern.canTraverse('holidays/2016/venice')).eql(true)
    })

    it('traverses a single folder (no children)', () => {
      const pattern = new GlobPattern({
        include: ['holidays/'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(true)
      // only traverses a single level since '/**' wasn't specified
      should(pattern.canTraverse('holidays/2016')).eql(false)
    })

    it('traverses a nested folder (no children)', () => {
      const pattern = new GlobPattern({
        include: ['holidays/2016/'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(true)
      should(pattern.canTraverse('holidays/2016')).eql(true)
      // not beyond since '/**' wasn't specified
      should(pattern.canTraverse('holidays/2016/venice')).eql(false)
    })

    it('traverses folders that meet an full-path include pattern', () => {
      const pattern = new GlobPattern({
        include: ['holidays/venice/IMG_001.jpg'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(true)
      should(pattern.canTraverse('holidays/venice')).eql(true)
    })

    it('ignores folders that meet an exclude pattern', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['holidays/**'],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(false)
    })

    it('ignores folders that meet an excluded directory name', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['holidays/'],
        extensions: []
      })
      should(pattern.canTraverse('holidays')).eql(false)
    })

    it('ignores folders that meet a nested exclude pattern', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['holidays/2016/**'],
        extensions: []
      })
      should(pattern.canTraverse('holidays/2016')).eql(false)
    })

    it('ignores folders that meet a wildcard exclude pattern', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: ['**/2016/**'],
        extensions: []
      })
      should(pattern.canTraverse('holidays/2016')).eql(false)
    })

    it('ignores folders starting with a dot', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('.git')).eql(false)
    })

    it('ignores nested folders starting with a dot', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('test/.git')).eql(false)
    })

    it('ignores nested Synology @eaDir thumbnail folders', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('photos/@eaDir')).eql(false)
    })

    it('ignores the Synology recycle bin', () => {
      const pattern = new GlobPattern({
        include: ['**/**'],
        exclude: [],
        extensions: []
      })
      should(pattern.canTraverse('#recycle')).eql(false)
    })
  })
})
