'use strict';

var request = require('request');
var external = module.exports;
var _ = external._ = require('lodash');
var Promise = external.Promise = require('bluebird');
var charset = require('charset');
var cheerio = require('cheerio');
external.url = require('url');
var internal = {};

external.VIDEO_TYPES = ['YOUTUBE', 'VIMEO', 'URL', 'IFRAME'];

external.request = function(options) {
	return new Promise(function(resolve, reject) {
		request(options, function(error, response, body) {
			if (error) {
				return reject(error);
			}
			resolve({
				body: body,
				response: response
			});
		});
	});
};

external.decodePage = function(response, buffer) {
	var encoding = charset(response.headers['content-type']);

	if (!encoding) {
		var dom = cheerio.load(buffer.toString('utf8'));
		var contentType = dom('meta[http-equiv=content-type],meta[http-equiv=Content-Type]', 'head').attr('content');
		if (contentType) {
			encoding = charset(contentType);
		}
		encoding = encoding || 'utf8';
	}

	if (encoding !== 'utf8') {
		var iconv = require('iconv-lite');
		return {
			page: iconv.decode(buffer, encoding),
			encoding: encoding
		};
	}

	return {
		page: buffer.toString(encoding),
		encoding: encoding
	};
};

external.noop = function() {};

external.startWithUpper = function(text) {
	if (!text || text.length < 1) {
		return text;
	}
	return text[0].toUpperCase() + text.substr(1);
};

external.strip = function(html) {
	if (!html) {
		return html;
	}
	return html.replace(/<\/?[^<>]*>/gi, '');
};

external.getElementSize = function(element, noParent) {
	var size = {};
	if (!element) {
		return size;
	}

	var height = element.attr('height');
	if (height && height.indexOf('%') === -1) {
		height = parseInt(height);
		if (_.isNumber(height)) {
			size.height = height;
		}
	}
	var width = element.attr('width');
	if (width && width.indexOf('%') === -1) {
		width = parseInt(width);
		if (_.isNumber(width)) {
			size.width = width;
		}
	}
	var style = element.attr('style');
	if (!size.height || !size.width) {
		if (style) {
			size.width = size.width || internal.getWidthFromStyle(style);
			size.height = size.height || internal.getHeightFromStyle(style);
		}
	}

	if (!noParent && !_.isNumber(size.width)) {
		var w = width && (width.indexOf('%') > 1) && parseInt(width);
		w = w && w > 90 && w <= 100 && w || internal.getWidthPercentFromStyle(style);

		if (w > 90 && w <= 100) {
			var parent = element.parent();
			var pSize = external.getElementSize(parent);
			size.width = pSize.width;
			size.height = size.height || pSize.height;
		}
	}

	return size;
};

internal.getWidthPercentFromStyle = function(style) {
	if (!style) {
		return null;
	}
	var m = style.match(/\bwidth:\s*(\d+)\s*%/i);
	if (!m) {
		return null;
	}
	return parseInt(m[1]);
};

internal.getWidthFromStyle = function(style) {
	var m = style.match(/\bwidth:\s*(\d+)\s*[$p;]/i);
	if (!m) {
		return null;
	}
	return parseInt(m[1]);
};

internal.getHeightFromStyle = function(style) {
	var m = style.match(/\bheight:\s*(\d+)\s*[$p;]/i);
	if (!m) {
		return null;
	}
	return parseInt(m[1]);
};
