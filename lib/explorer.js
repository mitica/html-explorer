var external = module.exports;
var utils = require('./utils');
var internal = {};
var pageExplorer = require('./page_explorer');

external.explore = function(url, options) {
  options = options || {};

  return pageExplorer.explore(url, options.page).then(function(page) {
    delete page.dom;
    return page;
  });
};
