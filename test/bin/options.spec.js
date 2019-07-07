const path = require('path')
const should = require('should/as-function')
const options = require('../../bin/options.js')

const BASE_ARGS = ['--input', 'photos', '--output', 'website']

describe('options', function () {
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
