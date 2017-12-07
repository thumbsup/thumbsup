
exports.USAGE = () => `
Usages:
  thumbsup [required] [options]
  thumbsup --config config.json'
`

exports.CONFIG_USAGE = () => `
The optional JSON config should contain a single object with one key
per argument, not including the leading "--". For example:
{ "sort-albums-by": "start-date" }
`

exports.SUCCESS = (stats) => `
Gallery generated successfully
${stats.albums} albums, ${stats.photos} photos, ${stats.videos} videos
`

exports.GREETING = () => `
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│ Thanks for using thumbsup!                                                   │
│                                                                              │
│ We hope it works exactly as you expect. If you have any issues or feature    │
│ ideas please raise an issue at https://github.com/thumbsup/thumbsup/issues.  │
│                                                                              │
│ When building a gallery, thumbsup reports anonymous stats such as the OS and │
│ gallery size. This is used to understand usage patterns & guide development  │
│ effort. You can disable usage reporting by specifying --no-usage-report.     │
│                                                                              │
│ This welcome message will not be shown again for this gallery.               │
│ Enjoy!                                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
`

exports.SORRY = () => `
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│ Something went wrong!                                                        │
│                                                                              │
│ An unexpected error occurred and the gallery didn't build successfully.      │
│ This is most likely an edge-case that hasn't been tested before.             │
│                                                                              │
│ To help improve thumbsup and hopefully resolve your problem,                 │
│ please raise an issue at https://github.com/thumbsup/thumbsup/issues.        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
`
