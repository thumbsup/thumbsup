
exports.create = function (ctx) {
  const stats = contextStats(ctx)
  const messages = [
    ' Gallery generated successfully',
    ` ${stats.albums} albums, ${stats.photos} photos, ${stats.videos} videos`
  ]
  return messages.join('\n')
}

function contextStats (ctx) {
  return {
    albums: countAlbums(0, ctx.album) - 1,
    photos: ctx.files.filter(f => f.type === 'image').length,
    videos: ctx.files.filter(f => f.type === 'video').length
  }
}

function countAlbums (total, album) {
  return 1 + album.albums.reduce(countAlbums, total)
}
