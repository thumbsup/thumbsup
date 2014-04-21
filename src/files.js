var fs   = require('fs-extra');

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
