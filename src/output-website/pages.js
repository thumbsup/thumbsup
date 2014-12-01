var _ = require('lodash');
var path = require('path');

/*
  Common page data shared by all models
*/
exports.common = function(opts) {
  var titleParts = opts.title.split(' ');
  return {
    css: opts.css ? path.basename(opts.css) : null,
    title: titleParts[0],
    subtitle: titleParts.slice(1).join(' '),
    googleAnalytics: opts.googleAnalytics
  };

};

/*
  Homepage data
*/
exports.homepage = function(structure) {
  return {};
};

/*
  Single gallery page
*/
exports.gallery = function(structure, index) {
  var links = structure.map(function(folder, i) {
    return {
      name: folder.name,
      url: folder.name + '.html',
      active: (i === index)
    };
  });
  return {
    links: links,
    gallery: structure[index]
  };
};
