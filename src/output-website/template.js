var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');

function compileTemplate(hbsFile) {
  var src = fs.readFileSync(path.join(__dirname, '..', '..', 'templates', hbsFile));
  return handlebars.compile(src.toString());
}

handlebars.registerPartial('analytics', compileTemplate('analytics.hbs'));

var templates = {
  'homepage': compileTemplate('homepage.hbs'),
  'gallery':  compileTemplate('gallery.hbs')
};

exports.render = function(template, data) {
  return templates[template](data);
};
