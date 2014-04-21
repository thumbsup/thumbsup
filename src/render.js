var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');

function compileTemplate(hbsFile) {
  var src = fs.readFileSync(path.join(__dirname, '..', 'templates', hbsFile));
  return handlebars.compile(src.toString());
}

var galleryTemplate = compileTemplate('gallery.hbs');

exports.gallery = function(list, active, title, css) {

  var links = list.map(function(item) {
    return {
      name: item.name,
      url: item.name + '.html',
      active: (item === active)
    };
  });

  var titleParts = title.split(' ');

  return galleryTemplate({
    css: css,
    links: links,
    gallery: active,
    title: titleParts[0],
    subtitle: titleParts.slice(1)
  });

};
