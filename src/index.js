var _           = require('lodash');
var fs          = require('fs-extra');
var os          = require('os');
var path        = require('path');
var gulp        = require('gulp');
var newer       = require('gulp-newer');
var imageResize = require('gulp-image-resize');
var parallel    = require('concurrent-transform');

var galleries   = require('./galleries');
var render      = require('./render');

exports.build = function(opts) {

  fs.mkdirp(opts.output);
  var list = galleries.fromDisk(opts.input, opts.mediaPrefix);
  console.log(require('util').inspect(list, {depth:6, color:true}))
  
  gulp.task('thumbs', function () {
    var dest = opts.output + '/thumbs';
    gulp
    .src(opts.input + '/**/*.{jpg,png}')
    .pipe(newer(dest))
    .pipe(parallel(imageResize({width: 100, height: 100, crop: true}), os.cpus().length))
    .pipe(gulp.dest(dest));
  });
  
  gulp.task('index', function() {
    // render('index.hbs', {salt: SALT}, 'index.html');
  });
  
  gulp.task('public', function() {
    var dest = opts.output + '/public';
    gulp
    .src('public/**')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
  });
  
  gulp.task('galleries', function() {
    // var dest = opts.output + '/galleries';
    // wrench.rmdirSyncRecursive(dest, true);
    // fs.mkdirp(dest);
    list.forEach(function(folder) {
      var rendered = render.gallery(list, folder);
      var outputPath = path.join(opts.output, folder.url);
      fs.writeFileSync(outputPath, rendered);
    });
  });
  
  gulp.run('thumbs', 'public', 'index', 'galleries');

};
