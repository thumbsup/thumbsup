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
  // execute a block if a condition matches
  // ideally we want to use unit-testable models instead
  // however this lets theme authors be more creative without changing the core model
  // THANKS TO http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
  handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
      var operators, result;
      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }
      if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
      }
      operators = {
        '==':  function (l, r) { return l == r;  },
        '===': function (l, r) { return l === r; },
        '!=':  function (l, r) { return l != r;  },
        '!==': function (l, r) { return l !== r; },
        '<':   function (l, r) { return l < r;   },
        '>':   function (l, r) { return l > r;   },
        '<=':  function (l, r) { return l <= r;  },
        '>=':  function (l, r) { return l >= r;  }
      };
      if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
      }
      result = operators[operator](lvalue, rvalue);
      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
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

  // utility helper
  // return the relative path from the current folder to the argument
  var currentFolder = '.';
  handlebars.registerHelper('relative', function(target, options) {
    return path.relative(currentFolder, target);
  });

  return {
    render: function(template, data, folder) {
      currentFolder = folder;
      return templates[template](data);
    }
  };

};
