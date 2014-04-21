var thumbsup = require('../src/index');


thumbsup.build({

  // the input folder
  // with all photos/videos
  input: 'example/media',

  // the output folder
  // for the thumbnails and static pages
  output: 'example/website',

  // size of the square thumbnails
  // in pixels
  thumbSize: 120,

  // size of the "fullscreen" view
  // in pixels
  largeSize: 400

});
