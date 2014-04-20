var fs   = require('fs-extra');
var glob = require('glob');

exports.find = function(folder, ext, callback) {
  var opts = {
    cwd: folder,
    nonull: false,
    nocase: true
  };
  glob('**/*.{' + ext + '}', opts, callback);
};

exports.newer = function(src, dest) {
  var srcTime = 0;
  try {
    var srcTime  = fs.statSync(src).ctime.getTime();
  } catch (ex) {
    return false;
  }
  try {
    var destTime = fs.statSync(dest).ctime.getTime();
    return srcTime > destTime;
  } catch (ex) {
    return true;
  }
};
