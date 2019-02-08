/*
------------------------------
Provides google photo metadata
------------------------------
*/

const fs = require('fs')

/*
photo filename: IMG_20190111_181110.jpg
json filename: IMG_20190111_181110.jpg.json
{
  "title": "IMG_20190111_181110.jpg",
  "description": "",
  "url": "https://xxx/s0-d/IMG_20190111_181110.jpg",
  "imageViews": "0",
  "creationTime": {
    "timestamp": "1547308025",
    "formatted": "12 Jan 2019, 15:47:05 UTC"
  },
  "modificationTime": {
    "timestamp": "1547308230",
    "formatted": "12 Jan 2019, 15:50:30 UTC"
  },
  "geoData": {
    "latitude": 40,
    "longitude": -70,
    "altitude": 40.59,
    "latitudeSpan": 0.0,
    "longitudeSpan": 0.0
  },
  "geoDataExif": {
    "latitude": 40,
    "longitude": -70,
    "altitude": 40.59,
    "latitudeSpan": 0.0,
    "longitudeSpan": 0.0
  },
  "sharedAlbumComments": [{
    "text": "This is a comment",
    "creationTime": {
      "timestamp": "1547308055",
      "formatted": "12 Jan 2019, 15:47:35 UTC"
    },
    "contentOwnerName": "Jerôme Gangneux",
    "contentOwnerProfileUrl": "https://plus.google.com/+JerômeGangneux"
  }],
  "photoTakenTime": {
    "timestamp": "1547248270",
    "formatted": "11 Jan 2019, 23:11:10 UTC"
  }
}
*/
class GooglePhoto {
  constructor () {
  }
  get (filePath, key) {
    // This could be cached (props?) as it will be used multiple time for each getXXX methods
    const content = loadIfExists(filePath + '.json')
    if (!content) return
    const data = JSON.parse(content)
    return data[key] || null
  }
  getDate (filePath) {
    const value = this.get(filePath, 'creationTime')
    if (!value) return null
    return value.timestamp * 1000
  }
  getCaption (filePath) {
    return get(filePath, 'description')
  }
  getCaptionJrmgx(filePath) {
    const value = get(filePath, 'sharedAlbumComments')
    if (!value) return
    if (value.length <= 0) return
    return value[0].text
  }
  getKeywords (filePath) {
    return null
  }
  getFavorite (filePath) {
    return null
  }
  getLike (filePath) {
    return null
  }
}

function loadIfExists (filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (ex) {
    return null
  }
}

module.exports = GooglePhoto
