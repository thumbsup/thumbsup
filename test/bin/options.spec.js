const path = require('path')
const process = require('process')
const should = require('should/as-function')
const sinon = require('sinon')
const options = require('../../bin/options.js')

const BASE_ARGS = ['--input', 'photos', '--output', 'website']

describe('options', function () {
  before(() => {
    // all other modules use debug() which is already captured during tests
    // but options are parsed before log management so they use console.error
    sinon.stub(console, 'error')
  })

  after(() => {
    console.error.restore()
  })

  describe('parsing', () => {
    it('parses a single basic option', () => {
      const opts = options.get(BASE_ARGS)
      should(opts.input.endsWith('photos')).eql(true)
    })
    it('options with dashes are converted to camel case', () => {
      const opts = options.get(BASE_ARGS.concat(['--theme-path', 'foobar']))
      should(opts['theme-path']).eql(undefined)
      should(opts.themePath).eql('foobar')
    })
    it('can use --no to reverse a boolean', () => {
      const opts = options.get(BASE_ARGS.concat(['--no-usage-stats']))
      should(opts.usageStats).eql(false)
    })
    it('is case-sensitive for booleans', () => {
      const opts1 = options.get(BASE_ARGS.concat(['--include-videos', 'false']))
      should(opts1.includeVideos).eql(false)
      const opts2 = options.get(BASE_ARGS.concat(['--include-videos', 'FALSE']))
      should(opts2.includeVideos).eql(true)
    })
  })
  describe('paths', () => {
    it('--input is converted to an absolute path', () => {
      const opts = options.get(BASE_ARGS)
      should(opts.input).eql(path.join(process.cwd(), 'photos'))
    })
    it('--output is converted to an absolute path', () => {
      const opts = options.get(BASE_ARGS)
      should(opts.output).eql(path.join(process.cwd(), 'website'))
    })
  })
  describe('--albums-from', () => {
    it('can be specified once', () => {
      const args = BASE_ARGS.concat(['--albums-from', '%path'])
      const opts = options.get(args)
      should(opts.albumsFrom).eql(['%path'])
    })
    it('can be specified multiple times', () => {
      const args = BASE_ARGS.concat([
        '--albums-from', '%path',
        '--albums-from', '%keywords'
      ])
      const opts = options.get(args)
      should(opts.albumsFrom).eql(['%path', '%keywords'])
    })
  })
  describe('--sort-albums-direction', () => {
    it('can be specified with multiple arguments', () => {
      const args = BASE_ARGS.concat([
        '--sort-albums-direction', 'asc',
        '--sort-albums-direction', 'desc'
      ])
      const opts = options.get(args)
      should(opts.sortAlbumsDirection).eql(['asc', 'desc'])
    })
    it('can be specified multiple times  with a comma', () => {
      const args = BASE_ARGS.concat([
        '--sort-albums-direction', 'asc,desc'
      ])
      const opts = options.get(args)
      should(opts.sortAlbumsDirection).eql(['asc', 'desc'])
    })
  })
  describe('--gm-args', () => {
    it('is optional', () => {
      const opts = options.get(BASE_ARGS)
      should(opts.gmArgs).undefined()
    })
    it('prefixes with the required dash', () => {
      // we don't use the dash on the command line to avoid ambiguity
      // i.e. so the parser doesn't think "-modulate" is a thumbsup argument
      const args = BASE_ARGS.concat(['--gm-args', 'modulate 120'])
      const opts = options.get(args)
      should(opts.gmArgs).eql(['-modulate 120'])
    })
    it('can be specified multiple times', () => {
      const args = BASE_ARGS.concat([
        '--gm-args', 'equalize',
        '--gm-args', 'modulate 120'
      ])
      const opts = options.get(args)
      should(opts.gmArgs).eql(['-equalize', '-modulate 120'])
    })
  })
  describe('misc', () => {
    describe('database file path', () => {
      it('defaults to the output folder', () => {
        const opts = options.get(BASE_ARGS)
        should(opts.databaseFile).eql(path.resolve('website/thumbsup.db'))
      })
      it('can overridde with a relative url', () => {
        const args = BASE_ARGS.concat(['--database-file', 'album.db'])
        const opts = options.get(args)
        should(opts.databaseFile).eql(path.join(process.cwd(), 'album.db'))
      })
      it('can be overridden with an absolute url', () => {
        const args = BASE_ARGS.concat(['--database-file', '/media/album.db'])
        const opts = options.get(args)
        should(opts.databaseFile).eql('/media/album.db')
      })
    })
    describe('log file path', () => {
      it('defaults to the output folder', () => {
        const opts = options.get(BASE_ARGS)
        should(opts.logFile).eql(path.resolve('website/thumbsup.log'))
      })
      it('is written next to the database file if specified', () => {
        const args = BASE_ARGS.concat(['--database-file', 'album.db'])
        const opts = options.get(args)
        should(opts.logFile).eql(path.join(process.cwd(), 'album.log'))
      })
      it('can be specified explicitely', () => {
        const args = BASE_ARGS.concat(['--log-file', 'custom.log'])
        const opts = options.get(args)
        should(opts.logFile).eql(path.join(process.cwd(), 'custom.log'))
      })
    })
  })
  describe('deprecated', () => {
    it('--original-photos false', () => {
      const args = BASE_ARGS.concat(['--original-photos false'])
      const opts = options.get(args)
      should(opts.photoDownload).eql('resize')
    })
    it('--original-photos true', () => {
      const args = BASE_ARGS.concat(['--original-photos'])
      const opts = options.get(args)
      should(opts.photoDownload).eql('copy')
    })
    it('--original-videos false', () => {
      const args = BASE_ARGS.concat(['--original-videos false'])
      const opts = options.get(args)
      should(opts.videoDownload).eql('resize')
    })
    it('--original-videos true', () => {
      const args = BASE_ARGS.concat(['--original-videos'])
      const opts = options.get(args)
      should(opts.videoDownload).eql('copy')
    })
    it('--download-photos copy', () => {
      const args = BASE_ARGS.concat(['--download-photos', 'copy'])
      const opts = options.get(args)
      should(opts.photoDownload).eql('copy')
    })
    it('--download-videos copy', () => {
      const args = BASE_ARGS.concat(['--download-videos', 'copy'])
      const opts = options.get(args)
      should(opts.videoDownload).eql('copy')
    })
    it('--download-photos large', () => {
      const args = BASE_ARGS.concat(['--download-photos', 'large'])
      const opts = options.get(args)
      should(opts.photoDownload).eql('resize')
    })
    it('--download-videos large', () => {
      const args = BASE_ARGS.concat(['--download-videos', 'large'])
      const opts = options.get(args)
      should(opts.videoDownload).eql('resize')
    })
    it('--download-link-prefix url', () => {
      const args = BASE_ARGS.concat(['--download-link-prefix', 'url'])
      const opts = options.get(args)
      should(opts.linkPrefix).eql('url')
    })
    it('--albums-from folders', () => {
      const args = BASE_ARGS.concat(['--albums-from', 'folders'])
      const opts = options.get(args)
      should(opts.albumsFrom).eql(['%path'])
    })
    it('--albums-from folders (when several patterns)', () => {
      const args = BASE_ARGS.concat([
        '--albums-from', 'folders',
        '--albums-from', '%keywords'
      ])
      const opts = options.get(args)
      should(opts.albumsFrom).eql(['%path', '%keywords'])
    })
    it('--albums-from date', () => {
      const args = BASE_ARGS.concat([
        '--albums-from', 'date',
        '--albums-date-format', 'YYYY MMM'
      ])
      const opts = options.get(args)
      should(opts.albumsFrom).eql(['{YYYY MMM}'])
    })
    it('--css', () => {
      const args = BASE_ARGS.concat([
        '--css', 'path/to/custom.css'
      ])
      const opts = options.get(args)
      should(opts.themeStyle).eql('path/to/custom.css')
    })
  })
})
