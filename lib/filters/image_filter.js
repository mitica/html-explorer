var utils = require('../utils');
var _ = utils._;
var external = module.exports;

var OPTIONS = {
  minHeight: 200,
  minWidth: 250,
  minRating: 0,
  minRatio: null,
  maxRatio: null,
  extensions: ['gif', 'png', 'php'],
  src: /\/small\/|\blogo\b|\.doubleclick\.|ad20\.|ads2\.|ads1\.|ads3\.|ads4\.|ads5\.|ads\.|banner|\/banere\/|icon\/|\/icon|alt\.coxnewsweb\.com|advertisement|adserver\.|baner\/|noi\.md\/uploads\/news\/|adserv|ad2\.|adriver\.|tns-counter\.|dclick\.ru|gravatar\.com|\/counter|spylog|cdnvideo\.ru\/p\/s_|cdnvideo\.ru\/p\/q_|reklama\.mb\.|dt00\.net|readme\.ru|adimg\.|adfox\.ru|\/adfox\/|77\.95\.133\.25|\.gif?|assets\.publika\.md|unimedia\.md\/design\/|unimedia\.md\/lib\/|like\.jpg|dislike\.jpg|\.trafic\.ro|\/small\/|\/thumbs\.php?|adnews\.rambler\.ru|jurnaltv\.md\/img\/site|ruvr\.ru\/images\/pxls\/|\/horoscop|lottery|24smi\.org|sj10\.ru|novoteka\.ru|rs\.mail\.ru|reklama\.|cdnvideo\.ru\/p\/s|go\.arbopl\.|player\.rutv\.ru\/p\/s_|\/logo|\.php\/components\/|thumb_41_x_41|a1\.ro\/images\/|\.t1\.ro|track\.cgi|\/delivery\/|\/captcha|PHPSESSID/i,
  extraSrc: null,
  cssClass: /(\s|_|^)(small|icon|banner|logo)(\s|$|_)/i,
  validTypes: null,
  types: ['gif', 'svg', 'psd']
};

var Filter = module.exports = function Filter(options) {
  options = _.defaults(options || {}, OPTIONS);
  if (_.isString(options.validTypes))
    options.validTypes = [options.validTypes];
  this.options = options;
  console.log('image filter options', options);
};

Filter.prototype.filter = function(image) {
  var options = this.options;

  if (_.isNumber(image.width) && image.width < options.minWidth) {
    return false;
  }
  if (_.isNumber(image.height) && image.height < options.minHeight) {
    return false;
  }
  if (image.rating < options.minRating) return false;

  var hasSize = _.isNumber(image.height) && _.isNumber(image.width);

  if (hasSize && image.height === image.width && image.height < 401) return false;

  if (hasSize) {
    var ratio = image.width / image.height;
    if (_.isNumber(options.minRatio) && ratio < options.minRatio) return false;
    if (_.isNumber(options.maxRatio) && ratio > options.maxRatio) return false;
  }

  if (options.src.test(image.src)) return false;
  if (options.extraSrc && options.extraSrc.test(image.src)) return false;

  if (options.cssClass && image.cssClass && options.cssClass.test(image.cssClass)) return false;

  var src = image.src.toLowerCase();

  var urls = [src, utils.url.parse(src).pathname];

  if (options.extensions) {
    for (var i = urls.length - 1; i >= 0; i--) {
      var u = urls[i];
      for (var j = options.extensions.length - 1; j >= 0; j--) {
        var ext = '.' + options.extensions[j];
        if (u.indexOf(ext) === u.length - ext.length) return false;
      }
    }
  }

  if (image.type && _.isArray(options.types) && options.types.indexOf(image.type) > -1) return false;
  if (image.type && _.isArray(options.validTypes) && options.validTypes.indexOf(image.type) < 0) return false;

  return true;
};
