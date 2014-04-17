var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');

function compileTemplate(hbsFile) {
  var src = fs.readFileSync(path.join('templates', hbsFile));
  return handlebars.compile(src.toString());
}

var indexTemplate  = compileTemplate('index.hbs');
var galleryTemplate = compileTemplate('gallery.hbs');


exports.index = function(list) {
};

exports.gallery = function(list, active) {

  var links = list.map(function(item) {
    return {
      name: item.name,
      url: item.name + '.html',
      active: (item === active)
    };
  });

  return galleryTemplate({
    links: links,
    gallery: active
  });

};
