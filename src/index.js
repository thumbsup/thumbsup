var _           = require('lodash');
var fs          = require('fs-extra');
var os          = require('os');
var path        = require('path');
var wrench      = require('wrench');
var gulp        = require('gulp');
var newer       = require('gulp-newer');
var rename      = require("gulp-rename");
var imageResize = require('gulp-image-resize');
var parallel    = require('concurrent-transform');
var thumbler    = require('video-thumb');

var galleries   = require('./galleries');
var render      = require('./render');

exports.build = function(opts) {

  opts.size = opts.size || 100;

  fs.mkdirp(opts.output);
  var list = galleries.fromDisk(opts.input, opts.mediaPrefix);
  
  gulp.task('thumbs-photos', function() {
    var dest = opts.output + '/thumbs';
    gulp
    .src(opts.input + '/**/*.{jpg,png}')
    .pipe(newer(dest))
    .pipe(parallel(imageResize({width: opts.size, height: opts.size, crop: true}), os.cpus().length))
    .pipe(gulp.dest(dest));
  });

  gulp.task('thumbs-videos', function() {
    var files = wrench.readdirSyncRecursive(opts.input);
    var videos = files.filter(function(f) { return f.match(/\.mp4$/); });
    
    videos.forEach(function(videoPath) {
      var input = path.join(opts.input, videoPath);
      var output = path.join(opts.output, 'thumbs', videoPath.replace('.mp4', '.jpg'));
      thumbler.extract(input, output, '00:00:00', '100x100', function() {});
    });
  });

  gulp.task('index', function() {
    var rendered = render.gallery(list, list[0]);
    var outputPath = path.join(opts.output, 'index.html');
    fs.writeFileSync(outputPath, rendered);
  });
  
  gulp.task('public', function() {
    var dest = opts.output + '/public';
    gulp
    .src('public/**')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
  });
  
  gulp.task('galleries', function() {
    list.forEach(function(folder) {
      var rendered = render.gallery(list, folder);
      var outputPath = path.join(opts.output, folder.url);
      fs.writeFileSync(outputPath, rendered);
    });
  });
  
  gulp.run('thumbs-photos', 'thumbs-videos', 'public', 'index', 'galleries');

};
