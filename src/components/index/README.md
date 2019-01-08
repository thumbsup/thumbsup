# index

> Index a folder of photos and videos, and cache all their metadata for fast retrieval.

## Usage

```js
const Index = require('./index/index')

// index the contents of a folder
const index = new Index('thumbsup.db')
const emitter = index.update('/Volumes/photos', {
  concurrency: 2,
  includePhotos: true,
  includeVideos: true,
  includeRawPhotos: false,
})

// indexing stats
// this happens before any new files are parsed for metadata
emitter.on('stats', stats => {
  assert(stats, {
    total: 14710,
    unchanged: 14561,
    added: 135,
    modified: 14,
    deleted: 2
  })
})

// parsing progress, emitted for every new or modified file
emitter.on('progress', progress => {
  assert(progress, {
    path: 'holidays/IMG_5725.jpg',
    completed: 17,
    total: 149
  })
})

// every file which has been indexed
// these are emitted after all parsing has been done
// files are emitted one by one so you can process them however you need
// without accumulating a large array of metadata in memory if you don't need it
emitter.on('file', file => {
  assert(file, {
    path: 'holidays/IMG_5831.jpg',
    timestamp: new Date(1510410524753),
    metadata: { /* parsed metadata */ }
  })
})

// finished
emitter.on('done', () => {
  console.log('Finished indexing')
})
```

## Metadata format

The `metadata` object contains all metadata embedded inside the image or video files, in the raw `exiftool` format.
See the [exiftool component](../exiftool) for more detail.

For example:

```js
{
  "SourceFile": "NewYork/IMG_5364.jpg",
  "File": {
    "FileSize": "449 kB",
    "MIMEType": "image/jpeg",
    /* ... */
  },
  "EXIF": {
    "Orientation": "Horizontal (normal)",
    "DateTimeOriginal": "2017:01:07 13:59:56",
    /* ... */
  },
  "Composite": {
    "GPSLatitude": "+51.5285578",
    "GPSLongitude": -0.2420248,
    /* ... */
  }
}
```

## Database size

The SQLite database will grow proportionally with the number of files indexed.
However it doesn't shrink automatically when files are deleted.
If applicable you should shrink the database periodically using:

```js
const index = new Index('thumbsup.db')
index.vacuum()
```

## Technical design

The index's roles is to
- keep a local [SQLite](https://sqlite.org) database of known files and their metadata
- compare it with the current files on disk
- process any new/updated files so the database is up to date

The SQLite database includes a `files` table with the following columns:

- `path`: the path to every photo & video file, relative to the source folder
- `timestamp`: the file modification date (milliseconds since Epoch)
- `metadata`: the file's raw metadata stored as a blob (JSON format)
