var pad         = require('pad');
var ProgressBar = require('progress');

exports.create = function(message, count) {
  if (count > 0) {
    var format = pad(message, 20) + '[:bar] :current/:total files';
    return new ProgressBar(format, { total: count, width: 20 });
  } else {
    var format = pad(message, 20) + '[:bar] up to date';
    return new ProgressBar(format, { total: 1, width: 20 });
  }
};
