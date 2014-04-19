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

  fs.mkdirp(opts.output);
  thumbs.size = opts.size || 100;

  photos(opts);
  videos(opts);
  website(opts);
  support(opts);

};


function photos(opts) {
  var thumbsFolder = path.join(path.resolve(opts.output), 'thumbs');
  glob('**/*.{jpg,png}', {cwd: opts.input, nonull:false}, function (err, files) {
    var fns = files.map(function(file) {
      return thumbs.photo.bind(this, {
        input: path.join(opts.input, file),
        thumbnail: path.join(thumbsFolder, file)
      });
    });
    async.parallel(fns, log('Photos'));
  });
}

function videos(opts) {
  var thumbsFolder = path.join(path.resolve(opts.output), 'thumbs');
  glob('**/*.{mp4,mov}', {cwd: opts.input, nonull:false}, function (err, files) {
    var fns = files.map(function(file) {
      return thumbs.video.bind(this, {
        input: path.join(opts.input, file),
        thumbnail: path.join(thumbsFolder, ext(file, '.jpg')),
        poster: path.join(thumbsFolder, ext(file, '_poster.jpg'))
      });
    });
    async.parallel(fns, log('Videos'));
  });
}

function website(opts) {
  galleries.fromDisk(opts.input, opts.mediaPrefix, function(err, list) {
    var rendered = render.gallery(list, list[0]);
    var outputPath = path.join(opts.output, 'index.html');
    fs.writeFileSync(outputPath, rendered);
  
    list.forEach(function(folder) {
      var rendered = render.gallery(list, folder);
      var outputPath = path.join(opts.output, folder.url);
      fs.writeFileSync(outputPath, rendered);
    });
  
    log('Website')();
  });
}

function support(opts) {
  var pub = path.join(__dirname, '..', 'public');
  var out = path.join(path.resolve(opts.output), 'public');
  fs.copy(pub, out, log('Supporting files'));
}

function ext(file, newExtension) {
  return file.replace(/\.[a-z0-9]+$/, newExtension);
}

function log(message) {
  return function(err) {
    var tag = pad(message + ': ', 25);
    console.log(tag + (err || '[OK]'));
  }
}
