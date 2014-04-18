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
var exec        = require('exec-sync');
var gm          = require('gm');

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
    var videos = files.filter(function(f) {
      return f.match(/\.(mp4|mov)$/);
    });
    
    videos.forEach(function(videoPath) {

      var input  = path.join(opts.input, videoPath);
      var thumb  = path.join(opts.output, 'thumbs', videoPath.replace(/\.[a-z0-9]+$/, '.jpg'));
      var poster = path.join(opts.output, 'thumbs', videoPath.replace(/\.[a-z0-9]+$/, '_poster.jpg'));

      var ffmpeg = 'ffmpeg -itsoffset -1 -i "' + input + '" -ss 0.1 -vframes 1 -y "' + poster + '"';

      var exec = require('child_process').exec
      exec(ffmpeg, function(err, stdout, stderr) {
        if (err) {
          console.error('ffmpeg:', err);
        }
        gm(poster)
        .resize(opts.size, opts.size, "^")
        .gravity('Center')
        .crop(opts.size, opts.size)
        .write(thumb, function (err) {
          if (err) console.error(err);
        });
      });

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
    .src(path.join(__dirname, '..', 'public', '**'))
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
