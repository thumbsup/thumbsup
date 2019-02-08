/*
---------------------------------
Provides Instagram metadata
Read the media.json file provided
---------------------------------
*/

const fs = require('fs')
const path = require('path')
const moment = require('moment')

/*
{
  "photos|videos" : [
    {
      "path" : "photos/201812/3e02b2be0d7abbdb7c2bae1fee544665.jpg",
      "caption" : "text",
      "taken_at" : "2018-12-31T08:05:13",
      "location" : "West End, Vancouver"
    },
    ...
*/

class Instagram {
  constructor (mediaFile) {
    // This could be cached (static?) as it needs to be read only once
    const content = JSON.parse(fs.readFileSync(mediaFile, 'utf-8'))
    this.data = {}
    if (content.photos) {
      for (let entry of content.photos) {
        this.data[path.basename(entry.path)] = entry
      }
    }
    if (content.videos) {
      for (let entry of content.videos) {
        this.data[path.basename(entry.path)] = entry
      }
    }
  }
  get (filePath, key) {
    return this.data[path.basename(filePath)][key] || null
  }
  getDate (filePath) {
    return moment(this.get(filePath, 'taken_at'), 'YYYY-MM-DDTHH:mm:ss').valueOf()
  }
  getCaption (filePath) {
    return this.get(filePath, 'caption')
  }
  getKeywords (_) {
    return null
  }
  getFavorite (_) {
    return null
  }
  getLike (_) {
    return null
  }
}

module.exports = Instagram
