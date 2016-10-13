var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');
var moment      = require('moment');

var options = {};
var templates = {
  'album': compileTemplate('album.hbs')
};

function compileTemplate(hbsFile) {
  var src = fs.readFileSync(path.join(__dirname, '..', '..', 'templates', hbsFile));
  return handlebars.compile(src.toString());
}

handlebars.registerPartial('analytics', compileTemplate('analytics.hbs'));
handlebars.registerPartial('sidebar-album', compileTemplate('sidebar-album.hbs'));

handlebars.registerHelper('date', function(date) {
  return moment(date).format('DD MMM YYYY');
});

/*
* Repeat given markup with given times
* provides @index for the repeated iteraction
*/
handlebars.registerHelper("times", function (times, opts) {
  var out = "";
  var i;
  var data = {};
  if (times) {
    for ( i = 0; i < times; i += 1 ) {
      data.index = i;
      out += opts.fn(this, {data: data});
    }
  } else {
    out = opts.inverse(this);
  }
  return out;
});

handlebars.registerHelper('download', function(file) {
  if (file.mediaType === 'video') {
    return options.originalVideos ? file.urls.original : file.urls.video;
  } else {
    return options.originalPhotos ? file.urls.original : file.urls.large;
  }
});

exports.setOptions = function(opts) {
  options = opts;
};

exports.render = function(template, data) {
  return templates[template](data);
};
