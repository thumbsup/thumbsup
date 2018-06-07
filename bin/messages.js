const chalk = require('chalk')
const boxen = require('boxen')

const DOCS_URL = chalk.green('https://thumbsup.github.io/docs')
const ISSUES_URL = chalk.green('https://github.com/thumbsup/thumbsup/issues')

function box (str) {
  const lines = str.split('\n').map(s => `  ${s}  `).join('\n')
  return boxen(lines)
}

exports.USAGE = () => `
Usages:
  thumbsup [required] [options]
  thumbsup --config config.json
`

exports.CONFIG_USAGE = () => `
The optional JSON config should contain a single object with one key
per argument, not including the leading "--". For example:
{ "sort-albums-by": "start-date" }
`

exports.SUCCESS = (stats) => box(`
Gallery generated successfully!
${stats.albums} albums, ${stats.photos} photos, ${stats.videos} videos
`)

exports.GREETING = () => box(`
Thanks for using thumbsup!

Don't forget to check out the docs at ${DOCS_URL}.

When building a gallery, thumbsup reports anonymous stats such as the OS and
gallery size. This is used to understand usage patterns & guide development
effort. You can disable usage reporting by specifying --no-usage-stats.

This welcome message will not be shown again for this gallery.
Enjoy!
`)

exports.SORRY = () => box(`
Something went wrong!

An unexpected error occurred and the gallery didn't build successfully.
This is most likely an edge-case that hasn't been tested before.

To help improve thumbsup and hopefully resolve your problem,
please raise an issue at ${ISSUES_URL}.
`)
