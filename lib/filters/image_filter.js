'use strict';

var utils = require('../utils');
var _ = utils._;

var OPTIONS = {
	minHeight: 200,
	minWidth: 250,
	minViewHeight: 180,
	minViewWidth: 220,
	minRating: 0,
	minRatio: null,
	maxRatio: null,
	invalidRatio: [1],
	invalidExtensions: ['gif', 'png', 'php'],
	src: /\/small\/|\blogo\b|\.doubleclick\.|ad20\.|ads2\.|ads1\.|ads3\.|ads4\.|ads5\.|ads\.|banner|\/banere\/|icon\/|\/icon|alt\.coxnewsweb\.com|advertisement|adserver\.|baner\/|noi\.md\/uploads\/news\/|adserv|ad2\.|adriver\.|tns-counter\.|dclick\.ru|gravatar\.com|\/counter|spylog|cdnvideo\.ru\/p\/s_|cdnvideo\.ru\/p\/q_|reklama\.mb\.|dt00\.net|readme\.ru|adimg\.|adfox\.ru|\/adfox\/|77\.95\.133\.25|\.gif?|assets\.publika\.md|unimedia\.md\/design\/|unimedia\.md\/lib\/|like\.jpg|dislike\.jpg|\.trafic\.ro|\/small\/|\/thumbs\.php?|adnews\.rambler\.ru|jurnaltv\.md\/img\/site|ruvr\.ru\/images\/pxls\/|\/horoscop|lottery|24smi\.org|sj10\.ru|novoteka\.ru|rs\.mail\.ru|reklama\.|cdnvideo\.ru\/p\/s|go\.arbopl\.|player\.rutv\.ru\/p\/s_|\/logo|\.php\/components\/|thumb_41_x_41|a1\.ro\/images\/|\.t1\.ro|track\.cgi|\/delivery\/|\/captcha|PHPSESSID/i,
	extraSrc: null,
	cssClass: /(\s|_|^)(small|icon|banner|logo)(\s|$|_)/i,
	invalidTypes: null,
	types: ['jpg']
};


function passMinFilter(value, minValue) {
	return !(_.isNumber(value) && value < minValue);
}

function passSizeFilter(image, widthName, heightName, options) {
	var width = image[widthName];
	var height = image[heightName];

	if (!passMinFilter(width, options['min' + utils.startWithUpper(widthName)])) {
		return false;
	}

	if (!passMinFilter(height, options['min' + utils.startWithUpper(heightName)])) {
		return false;
	}

	var hasSize = _.isNumber(height) && _.isNumber(width);

	if (hasSize) {
		var ratio = width / height;
		if (_.isNumber(options.minRatio) && ratio < options.minRatio) {
			return false;
		}
		if (_.isNumber(options.maxRatio) && ratio > options.maxRatio) {
			return false;
		}
		for (var i = options.invalidRatio.length - 1; i >= 0; i--) {
			if (ratio === options.invalidRatio[i]) {
				return false;
			}
		}
	}
	return true;
}

var Filter = module.exports = function Filter(options) {
	options = _.defaults(options || {}, OPTIONS);
	if (!_.isArray(options.invalidTypes)) {
		options.invalidTypes = [options.invalidTypes];
	}
	if (!_.isArray(options.types)) {
		options.types = [options.types];
	}
	if (!_.isArray(options.invalidRatio)) {
		options.invalidRatio = [options.invalidRatio];
	}
	this.options = options;
};

Filter.prototype.filter = function(image) {
	var options = this.options;

	if (!passMinFilter(image.rating, options.minRating)) {
		return false;
	}

	if (!passSizeFilter(image, 'viewWidth', 'viewHeight', options)) {
		return false;
	}

	if (!passSizeFilter(image, 'width', 'height', options)) {
		return false;
	}

	if (options.src.test(image.src)) {
		return false;
	}
	if (options.extraSrc && options.extraSrc.test(image.src)) {
		return false;
	}

	if (options.cssClass && image.cssClass && options.cssClass.test(image.cssClass)) {
		return false;
	}

	var src = image.src.toLowerCase();

	var urls = [src, utils.url.parse(src).pathname];

	if (options.invalidExtensions) {
		for (var i = urls.length - 1; i >= 0; i--) {
			var u = urls[i];
			for (var j = options.invalidExtensions.length - 1; j >= 0; j--) {
				var ext = '.' + options.invalidExtensions[j];
				if (u.indexOf(ext) === u.length - ext.length) {
					return false;
				}
			}
		}
	}

	if (image.type && _.isArray(options.invalidTypes) && options.invalidTypes.indexOf(image.type) > -1) {
		return false;
	}
	if (image.type && _.isArray(options.types) && options.types.indexOf(image.type) < 0) {
		return false;
	}

	return true;
};
