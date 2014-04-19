var fs          = require('fs-extra');
var path        = require('path');
var glob        = require('glob');
var async       = require('async');
var pad         = require('pad');

var galleries   = require('./galleries');
var render      = require('./render');
var thumbs      = require('./thumbs');

exports.build = function(opts) {

  console.log('Building galleries...\n')

  opts.size = opts.size || 100;
  fs.mkdirp(opts.output);

  photos(opts);
  videos(opts);
  website(opts);
  support(opts);

};


function photos(opts) {
  var thumbsFolder = path.join(path.resolve(opts.output), 'thumbs');
  glob('**/*.{jpg,png}', {cwd: opts.input, nonull:false}, function (er, files) {
    var fns = files.map(function(file) {
      return function(next) {
        thumbs.photo({
          input: path.resolve(path.join(opts.input, file)),
          thumbnail: path.join(thumbsFolder, file),
          size: opts.size
        }, next);
      };
    });
    async.parallel(fns, log('Photos'));
  });
}

function videos(opts) {
  var thumbsFolder = path.join(path.resolve(opts.output), 'thumbs');
  glob('**/*.{mp4,mov}', {cwd: opts.input, nonull:false}, function (er, files) {
    var fns = files.map(function(file) {
      return function(next) {
        thumbs.video({
          input: path.resolve(path.join(opts.input, file)),
          thumbnail: path.join(thumbsFolder, file.replace(/\.[a-z0-9]+$/, '.jpg')),
          poster: path.join(thumbsFolder, file.replace(/\.[a-z0-9]+$/, '_poster.jpg')),
          size: opts.size
        }, next);
      };
    });
    async.parallel(fns, log('Videos'));
  });
}

function website(opts) {
  var list = galleries.fromDisk(opts.input, opts.mediaPrefix);

  var rendered = render.gallery(list, list[0]);
  var outputPath = path.join(opts.output, 'index.html');
  fs.writeFileSync(outputPath, rendered);

  list.forEach(function(folder) {
    var rendered = render.gallery(list, folder);
    var outputPath = path.join(opts.output, folder.url);
    fs.writeFileSync(outputPath, rendered);
  });

  log('Website')();
}

function support(opts) {
  var pub = path.join(__dirname, '..', 'public');
  var out = path.join(path.resolve(opts.output), 'public');
  fs.copy(pub, out, log('Supporting files'));
}

function log(message) {
  return function(err) {
    var tag = pad(message + ': ', 25);
    console.log(tag + (err || '[OK]'));
  }
}
