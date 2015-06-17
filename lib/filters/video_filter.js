var utils = require('../utils');
var _ = utils._;

var OPTIONS = {
  minHeight: 250,
  minWidth: 350,
  minRatio: null,
  maxRatio: null,
  invalidRatio: [1],
  src: /clickTAG=|\/banner|c\.brightcove\.com|ws\.amazon\.|PHPSESSID/i,
  extraSrc: null
};

var Filter = module.exports = function Filter(options) {
  options = _.defaults(options || {}, OPTIONS);
  if (!_.isArray(options.invalidRatio))
    options.invalidRatio = [options.invalidRatio];
  this.options = options;
};

Filter.prototype.filter = function(target) {
  var options = this.options;

  if (target.sourceType && utils.VIDEO_TYPES.indexOf(target.sourceType) < 0) return false;

  if (!passSizeFilter(target, 'width', 'height', options)) {
    return false;
  }

  if (target.src && options.src.test(target.src)) return false;
  if (target.src && options.extraSrc && options.extraSrc.test(target.src)) return false;

  return true;
};


function passMinFilter(value, minValue) {
  return !(_.isNumber(value) && value < minValue);
}

function passSizeFilter(target, widthName, heightName, options) {
  var width = target[widthName];
  var height = target[heightName];

  if (!passMinFilter(width, options['min' + utils.startWithUpper(widthName)])) {
    return false;
  }

  if (!passMinFilter(height, options['min' + utils.startWithUpper(heightName)])) {
    return false;
  }

  var hasSize = _.isNumber(height) && _.isNumber(width);

  if (hasSize) {
    var ratio = width / height;
    if (_.isNumber(options.minRatio) && ratio < options.minRatio) return false;
    if (_.isNumber(options.maxRatio) && ratio > options.maxRatio) return false;
    for (var i = options.invalidRatio.length - 1; i >= 0; i--) {
      if (ratio === options.invalidRatio[i]) return false;
    }
  }
  return true;
}
