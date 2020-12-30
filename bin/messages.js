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

exports.BINARIES_REQUIRED = (list) => `
Error: the following programs are required to run thumbsup.
Please make sure they are installed and available in the system path.\n
${list.join('\n')}
`

exports.SUCCESS = (stats) => box(`
Gallery generated successfully!
${stats.albums} albums, ${stats.photos} photos, ${stats.videos} videos
`)

exports.PROBLEMS = (count) => chalk.yellow(`
 Warning: there was an issue with ${count} file${count > 1 ? 's' : ''}.
 Please check the full log for more detail.
`)

exports.GREETING = () => box(`
Thanks for using thumbsup!

Don't forget to check out the docs at ${DOCS_URL}.

When building a gallery, thumbsup reports anonymous stats such as the
OS and gallery size. This is used to understand usage patterns & guide
development effort. You can disable this by specifying --no-usage-stats.

This welcome message will not be shown again for this gallery.
Enjoy!
`)

exports.SORRY = (logFile) => box(`
Something went wrong!

An unexpected error occurred and the gallery didn't build successfully.
This is most likely an edge-case that hasn't been tested before.

Please check the logs at ${chalk.green(logFile)}.
To help improve thumbsup and hopefully resolve your problem,
you can raise an issue at ${ISSUES_URL}.
`)
