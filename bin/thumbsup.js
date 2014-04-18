#!/usr/bin/env node

var program = require('commander');
var index = require('../src/index');

program
  .version('0.0.1')
  .option('-i, --input [path]', 'Path to the folder with all photos/videos')
  .option('-o, --output [path]', 'Output path for the static website')
  .option('-p, --media-prefix [url]', 'URL prefix for all media')
  .option('-s, --size [pixels]', 'Thumbnail size in pixels (square)', '100')
  .parse(process.argv);

index.build({
  input: program.input,
  output: program.output,
  mediaPrefix: program.prefix,
  size: program.size
});
