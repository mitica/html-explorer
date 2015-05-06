var external = module.exports;
var utils = require('./utils');
var Promise = utils.Promise;
var internal = {};
var pageExplorer = require('./page_explorer');
var imagesExplorer = require('./images_explorer');

external.explore = function(url, options) {
  options = options || {};

  return pageExplorer.explore(url, options.page).then(function(page) {
    return internal.getImages(page, options.images).then(function() {
      delete page.dom;
      return page;
    });
  });
};

internal.getImages = function(page, options) {
  if (options === false) return Promise.resolve();

  return imagesExplorer.explore(page, options);
};
