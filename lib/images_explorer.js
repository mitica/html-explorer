var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var cheerio = require('cheerio');
var ImageFilter = require('./filters/image_filter');
var internal = {};

var OPTIONS = {
  filter: null,
  limit: 5,
  identify: false,
  data: false
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

  if (options.limit < 1) return;

  var imageFilter = new ImageFilter(options.filter);
  var images = [];
  var imagesKeys = {};
  var maxExploreImages = options.limit + options.limit * 2;

  function addImage(image) {
    if (!image) return;
    image.src = utils.url.resolve(page.href, image.src);
    if (imagesKeys[image.src]) {
      var i = _.findIndex(images, {
        src: image.src
      });
      if (i > -1) {
        images[i] = _.defaults(images[i], _.pick(image, 'viewWidth', 'viewHeight', 'alt', 'title', 'style'));
      }
      return false;
    }
    if (images.length > maxExploreImages)
      return false;
    image.rating = internal.getImageRating(image, page.title);

    if (imageFilter.filter(image, options.filter)) {
      imagesKeys[image.src] = true;
      images.push(image);
    }
  }

  if (page.videos && page.videos.length > 0) {
    page.videos.forEach(function(video) {
      if (video.image) {
        addImage({
          src: video.image
        });
      }
    });
  }

  addImage(internal.exploreHeadImage(page));

  page.dom('img', 'body').each(function() {
    if (images.length > maxExploreImages) return false;
    var image = internal.exploreNode(page.dom(this));
    addImage(image);
  });

  if (!options.identify) {
    internal.createPageImages(page, images, options, imageFilter);
    return Promise.resolve();
  }

  return Promise.map(images, function(image) {
    return internal.identifyImage(image, options).then(function() {
      page.images.push(image);
    }).catch(function() {});
  }).finally(function() {
    internal.createPageImages(page, page.images, options, imageFilter);
  });
};

internal.createPageImages = function(page, images, options, imageFilter) {
  // filter images:
  page.images = images.filter(function(image) {
    return imageFilter.filter(image, options.filter);
  });
  // ordering images:
  page.images = _.sortByAll(page.images, [function(image) {
    return parseInt(image.rating / 3);
  }, 'width', 'viewWidth', 'rating']).reverse();

  // limit images:
  page.images = _.take(page.images, options.limit);
};

internal.exploreHeadImage = function(page) {
  var nodes = page.dom('meta[property="og:image"],meta[property="twitter:image:src"],meta[name="og:image"],meta[name="twitter:image:src"],meta[name="twitter:image"]', 'head');
  if (nodes.length === 0) return;

  var src = nodes.attr('content');

  if (!src) return;

  var image = {
    src: src
  };
  var viewWidth = parseInt(page.dom('meta[property="og:image:width"]', 'head').attr('content'));
  var viewHeight = parseInt(page.dom('meta[property="og:image:height"]', 'head').attr('content'));

  if (_.isNumber(viewWidth) && viewWidth > 0)
    image.viewWidth = viewWidth;
  if (_.isNumber(viewHeight) && viewHeight > 0)
    image.viewHeight = viewHeight;

  if (!_.isNumber(image.viewWidth) || !_.isNumber(image.viewHeight)) {
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
  if (!_.isNumber(image.viewHeight) || !_.isNumber(image.viewWidth)) {
    var size = utils.getElementSize(node);
    if (_.isNumber(size.width)) {
      image.viewWidth = image.viewWidth || size.width;
    }
    if (_.isNumber(size.height)) {
      image.viewHeight = image.viewHeight || size.height;
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
    image.viewWidth = image.viewWidth || parseInt(m[1]);
    image.viewHeight = image.viewHeight || parseInt(m[2]) || undefined;
    return;
  }
  m = image.src.match(/width=(\d+)$/i);
  if (m) {
    image.viewWidth = image.viewWidth || parseInt(m[1]);
    return;
  }
  m = image.src.match(/[\?;&](?:width|w)=(\d+)/i);
  if (m) {
    image.viewWidth = image.viewWidth || parseInt(m[1]);
  }
};

internal.identifyImage = function(image, options) {
  var http = require('http');
  var imageSize = require('image-size');

  return new Promise(function(resolve, reject) {
    http.get(image.src, function(response) {
      var chunks = [];
      response
        .on('data', function(chunk) {
          chunks.push(chunk);
        })
        .on('end', function() {
          var buffer = Buffer.concat(chunks);
          var size;
          try {
            size = imageSize(buffer);
          } catch (e) {
            e.message = e.message + ': ' + image.src;
            return reject(e);
          }
          if (!size && !size.width)
            return reject(new Error('Cannot detect image size'));

          image.width = size.width;
          image.height = size.height;
          size.type && (image.type = size.type);

          options.data && (image.data = buffer);
          return resolve();
        });
    }).on('error', reject);
  });
};
