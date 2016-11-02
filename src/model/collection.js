var File = require('./file');

exports.fromMetadata = function(metadata) {
  return {
    files: Object.keys(metadata).map(function(filepath) {
      return new File(filepath, metadata[filepath]);
    })
  }
};
