# exiftool-batch

> Process a batch of files through [exiftool](http://www.sno.phy.queensu.ca/~phil/exiftool/) and stream the results

## Usage

```js
const exiftool = require('./exiftool-batch/parallel')
const stream = exiftool.parse('./photos', [
  'IMG_000001.jpg',
  'IMG_000002.jpg',
  'IMG_000003.jpg'
])
stream.on('data', entry => console.log(`Processed ${entry.SourceFile}`))
stream.on('end', () => console.log('Finished'))
```

The number of parallel `exiftool` processes defaults to the CPU count.
It can be overridden by `exiftool.parse(root, files, count)`.

Each stream entry will be an object in the following format.

```js
{
  SourceFile: 'NewYork/IMG_5364.jpg',
  File: {
    FileSize: '449 kB',
    MIMEType: 'image/jpeg',
    /* ... */
  },
  EXIF: {
    Orientation: 'Horizontal (normal)',
    DateTimeOriginal: '2017:01:07 13:59:56',
    /* ... */
  },
  Composite: {
    GPSLatitude: '+51.5285578',
    GPSLongitude: -0.2420248,
    /* ... */
  }
}
```

## Stream structure

Some notes on the structure:

- the `SourceFile` property is a relative path to the root folder given to `parse()`
- the format is identical to the raw JSON `exiftool` output
  * the name of the groups and tags are exactly as documented at  http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/index.html
  * it doesn't try to parse date strings, and doesn't assume timezones when absent
  * it doesn't fix GPS format oddities, like `-10.000` (number) and `"+10.000"` (string)
  * it doesn't merge similar fields together, like `EXIF:ImageDescription` and `IPTC:Caption-Abstract`

## Performance

- uses `exiftool` in batch mode, instead of spawning 1 instance per file
- runs 1 `exiftool` process per core to speed-up parsing

The following stats were captured while processing a large number of photos stored on an SSD drive:

| Metric | Value |
|--------|-------|
| Number of photos | 10,000 |
| Total time | 30 sec |
| Peak throughput | 300 photos / sec |

| Process | CPU (4 cores) | RAM |
|---------|-----|-----|
| Node    | 25% | 70 MB  |
| Exiftool | 85% per instance | 20 MB per instance |
| Total | 365% | 150 MB |
