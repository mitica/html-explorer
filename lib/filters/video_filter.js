var utils = require('../utils');
var _ = utils._;
var external = module.exports;

var OPTIONS = {
  minHeight: 200,
  minWidth: 250,
  minRating: 0,
  minRatio: null,
  maxRatio: null,
  invalidRatio: [1],
  invalidExtensions: ['gif', 'png', 'php'],
  src: /clickTAG=|\/banner|c\.brightcove\.com|ws\.amazon\.|PHPSESSID/i,
  extraSrc: null,
  invalidTypes: null,
  types: ['jpg']
};

var Filter = module.exports = function Filter(options) {
  options = _.defaults(options || {}, OPTIONS);
  if (!_.isArray(options.invalidTypes))
    options.invalidTypes = [options.invalidTypes];
  if (!_.isArray(options.types))
    options.types = [options.types];
  if (!_.isArray(options.invalidRatio))
    options.invalidRatio = [options.invalidRatio];
  this.options = options;
};

Filter.prototype.filter = function(target) {
  var options = this.options;

  if (!passSizeFilter(target, 'width', 'height', options)) {
    return false;
  }

  if (options.src.test(target.src)) return false;
  if (options.extraSrc && options.extraSrc.test(target.src)) return false;

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
