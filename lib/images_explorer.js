var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var cheerio = require('cheerio');
var imageFilter = require('./filters/image_filter');
var internal = {};

var OPTIONS = {
  filter: null,
  limit: 5
};

external.explore = function(page, options) {
  options = _.defaults(options || {}, OPTIONS);

  return Promise.resolve().then(function() {
    try {
      return internal.explore(page, options);
    } catch (e) {
      return Promise.reject(e);
    }
  });
};

internal.explore = function(page, options) {
  page.images = [];
  var nodes = page.dom('img', 'body');

  var imagesKeys = {};

  function addImage(image) {
    if (!image || imagesKeys[image.src] || page.images.length >= options.limit) return false;
    image.rating = internal.getImageRating(image, page.title);
    if (imageFilter.filter(image, options.filter)) {
      imagesKeys[image.src] = true;
      page.images.push(image);
    }
  }

  nodes.each(function() {
    if (page.images.length >= options.limit) return false;

    var node = page.dom(this);
    try {
      node = internal.exploreNode(node);
    } catch(e) {
      return;
    }
    if (node) {
      node.src = utils.url.resolve(page.href, node.src);
      addImage(node);
    }
  });
  try {
    addImage(internal.exploreHeadImage(page));
  } catch(e) {}
  page.images = _.sortByAll(page.images, [function(image) {
    return parseInt(image.rating / 3);
  }, 'width', 'rating']).reverse();
};

internal.exploreHeadImage = function(page) {
  var nodes = page.dom('meta[property="og:image"],meta[property="twitter:image:src"],meta[name="og:image"],meta[name="twitter:image:src"],meta[name="twitter:image"]', 'head');
  if (nodes.length === 0) return;

  var src = nodes.attr('content');

  if (!src) return;

  var image = {
    src: utils.url.resolve(page.href, src),
    width: parseInt(page.dom('meta[property="og:image:width"]', 'head').attr('content')) || null,
    height: parseInt(page.dom('meta[property="og:image:height"]', 'head').attr('content')) || null,
  };

  if (!_.isNumber(image.width) || !_.isNumber(image.height)) {
    internal.setImageSizeFromSrc(image);
  }

  return image;
};

internal.exploreNode = function(node) {
  var src = node.attr('src');
  if (!src || src.length < 10 || src.indexOf('data:') === 0) return null;
  var image = {
    src: src
  };

  internal.setImageSizeFromSrc(image);
  if (!_.isNumber(image.height) || !_.isNumber(image.width)) {
    var size = utils.getElementSize(node);
    if (_.isNumber(size.width)) {
      image.width = image.width || size.width;
    }
    if (_.isNumber(size.height)) {
      image.height = image.height || size.height;
    }
  }

  var alt = node.attr('alt');
  if (alt) {
    image.alt = alt;
  }
  var style = node.attr('style');
  if (style) {
    image.style = style;
  }

  var cssClass = node.attr('class');
  if (cssClass) {
    image.cssClass = cssClass;
  }
  var id = node.attr('id');
  if (id) {
    image.id = id;
  }

  return image;
};

internal.getImageRating = function(image, title) {
  if (!title) return 1;

  var name = image.alt || image.title || image.src.substr(image.src.lastIndexOf('/') + 1);

  var nameWords = internal.getWords(name.toLowerCase());
  var titleWords = internal.getWords(title.toLowerCase());

  var rating = 0;

  nameWords.forEach(function(word) {
    if (titleWords.indexOf(word) > -1) {
      rating++;
    }
  });

  return rating;
};

internal.getWords = function(text) {
  return text.split(/[\s\.\:\?\!\(\)'"`„”,;_-]/i).filter(function(word) {
    return word.trim().length > 3 && ['foto', 'video', 'jpeg'].indexOf(word) === -1;
  }).map(function(word) {
    return word.trim();
  });
};

internal.setImageSizeFromSrc = function(image) {

  var m = image.src.match(/(\d+)(?:-|_)?x(?:-|_)?(\d+)/i);
  if (m) {
    image.width = image.width || parseInt(m[1]);
    image.height = image.height || parseInt(m[2]) || null;
    return;
  }
  m = image.src.match(/width=(\d+)$/i);
  if (m) {
    image.width = image.width || parseInt(m[1]);
    return;
  }
  m = image.src.match(/[\?;&](?:width|w)=(\d+)/i);
  if (m) {
    image.width = image.width || parseInt(m[1]);
  }
};
