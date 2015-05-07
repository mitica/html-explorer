var utils = require('../utils');
var _ = utils._;
var external = module.exports;

var OPTIONS = {
  minHeight: 200,
  minWidth: 250,
  minRating: 0,
  invalidExt: ['gif', 'png', 'php'],
  src: /\/small\/|\blogo\b|\.doubleclick\.|ad20\.|ads2\.|ads1\.|ads3\.|ads4\.|ads5\.|ads\.|banner|\/banere\/|icon\/|\/icon|alt\.coxnewsweb\.com|advertisement|adserver\.|baner\/|noi\.md\/uploads\/news\/|adserv|ad2\.|adriver\.|tns-counter\.|dclick\.ru|gravatar\.com|\/counter|spylog|cdnvideo\.ru\/p\/s_|cdnvideo\.ru\/p\/q_|reklama\.mb\.|dt00\.net|readme\.ru|adimg\.|adfox\.ru|\/adfox\/|77\.95\.133\.25|\.gif?|assets\.publika\.md|unimedia\.md\/design\/|unimedia\.md\/lib\/|like\.jpg|dislike\.jpg|\.trafic\.ro|\/small\/|\/thumbs\.php?|adnews\.rambler\.ru|jurnaltv\.md\/img\/site|ruvr\.ru\/images\/pxls\/|\/horoscop|lottery|24smi\.org|sj10\.ru|novoteka\.ru|rs\.mail\.ru|reklama\.|cdnvideo\.ru\/p\/s|go\.arbopl\.|player\.rutv\.ru\/p\/s_|\/logo|\.php\/components\/|thumb_41_x_41|a1\.ro\/images\/|\.t1\.ro|track\.cgi|\/delivery\/|\/captcha|PHPSESSID/i,
  cssClass: /(\s|_|^)(small|icon|banner|logo)(\s|$|_)/i,
  orientation: null // portrait | landscape
};

external.filter = function(image, options) {
  options = _.defaults(options || {}, OPTIONS);
  if (_.isNumber(image.width) && image.width < options.minWidth) {
    //console.log('width too small', image.width);
    return false;
  }
  if (_.isNumber(image.height) && image.height < options.minHeight) {
    //console.log('height too small', image);
    return false;
  }
  if (image.rating < options.minRating) return false;

  if (_.isNumber(image.height) && image.height === image.width && image.height < 400) return false;

  if (_.isNumber(image.height) && _.isNumber(image.width) && options.orientation) {
    if (options.orientation === 'portrait') {
      if (image.height > image.width) return false;
    } else if (options.orientation === 'landscape') {
      if (image.height < image.width) return false;
    }
  }

  if (options.src.test(image.src)) return false;

  if (options.cssClass && image.cssClass && options.cssClass.test(image.cssClass)) return false;

  var url = image.src.toLowerCase();

  var urls = [url, utils.url.parse(url).pathname];

  for (var i = urls.length - 1; i >= 0; i--) {
    var u = urls[i];
    for (var j = options.invalidExt.length - 1; j >= 0; j--) {
      var ext = '.' + options.invalidExt[j];
      if (u.indexOf(ext) === u.length - ext.length) return false;
    }
  }

  return true;
};
