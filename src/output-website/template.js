var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');
var moment      = require('moment');

exports.create = function(options) {

  var DIR_TEMPLATES = path.join(__dirname, '..', '..', 'templates');
  var DIR_THEME = path.join(DIR_TEMPLATES, 'themes', options.theme);

  function isTemplate(filepath) {
    return path.extname(filepath) === '.hbs';
  }

  function compileTemplate(hbsFile) {
    var src = fs.readFileSync(hbsFile);
    return handlebars.compile(src.toString());
  }

  // main entry points
  var templates = {
    'album': compileTemplate(path.join(DIR_TEMPLATES, 'album.hbs'))
  };

  // common partials
  handlebars.registerPartial('analytics', compileTemplate(path.join(DIR_TEMPLATES, 'analytics.hbs')));

  // theme partials
  var files = fs.readdirSync(DIR_THEME);
  files.filter(isTemplate).forEach(function(filename) {
    var templateName = path.basename(filename, path.extname(filename));
    handlebars.registerPartial(templateName, compileTemplate(path.join(DIR_THEME, filename)));
  })

  // utility helper
  // render a date in a legible format
  handlebars.registerHelper('date', function(date) {
    return moment(date).format('DD MMM YYYY');
  });

  // utility helper
  // render the first X items in an array
  handlebars.registerHelper('slice', function(context, block) {
    var ret = "";
    var count = parseInt(block.hash.count) || 1;
    var i = 0;
    var j = (count < context.length) ? count : context.length;
    for(i,j; i<j; i++) {
      ret += block.fn(context[i]);
    }
    return ret;
  });

  // utility helper
  // execute the child block N times
  handlebars.registerHelper('times', function(n, block) {
      var accum = '';
      for(var i = 0; i < n; ++i)
          accum += block.fn(i);
      return accum;
  });

  // utility helper
  // render the correct download path based on user options
  handlebars.registerHelper('download', function(file) {
    if (file.mediaType === 'video') {
      return options.originalVideos ? file.urls.original : file.urls.video;
    } else {
      return options.originalPhotos ? file.urls.original : file.urls.large;
    }
  });

  return {
    render: function(template, data) {
      return templates[template](data);
    }
  };

};
