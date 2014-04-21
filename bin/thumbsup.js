#!/usr/bin/env node

var program = require('commander');
var index = require('../src/index');

program
  .version('0.0.1')
  .option('-i, --input <path>', 'Path to the folder with all photos/videos')
  .option('-o, --output <path>', 'Output path for the static website')
  .option('-t, --thumb-size [pixels]', 'Thumbnail size in pixels (square)')
  .option('-l, --large-size [pixels]', 'Fullscreen size in pixels (square)')
  .parse(process.argv);

index.build({
  input: program.input,
  output: program.output,
  thumbSize: program.thumbSize,
  largeSize: program.largeSize
});
