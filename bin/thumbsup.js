#!/usr/bin/env node

var program = require('commander');
var index = require('../src/index');

program
  .version('0.0.1')
  .option('--input <path>', 'Path to the folder with all photos/videos')
  .option('--output <path>', 'Output path for the static website')
  .option('--title <text>', 'Website title')
  .option('--css <file>', 'Extra CSS file for styling')
  .option('--thumb-size [pixels]', 'Thumbnail size in pixels (square)')
  .option('--large-size [pixels]', 'Fullscreen size in pixels (height)')
  .parse(process.argv);

index.build({
  input: program.input,
  output: program.output,
  title: program.title,
  css: program.css,
  thumbSize: program.thumbSize,
  largeSize: program.largeSize
});
