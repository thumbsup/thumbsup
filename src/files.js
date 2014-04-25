var fs   = require('fs');

exports.newer = function(src, dest) {
  var srcTime = 0;
  try {
    var srcTime  = fs.statSync(src).mtime.getTime();
  } catch (ex) {
    return false;
  }
  try {
    var destTime = fs.statSync(dest).mtime.getTime();
    return srcTime > destTime;
  } catch (ex) {
    return true;
  }
};
