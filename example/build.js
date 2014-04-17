var thumbsup = require('../src/index');


thumbsup.build({

  // the input folder
  // with all photos/videos
  input: 'example/media',

  // the output folder
  // for the thumbnails and static pages
  output: 'example/website',

  // relative path to the media
  // a local path for testing
  // but this could be the URL to an S3 bucket
  mediaPrefix: '../media'

});
