'use strict';

var external = module.exports;
var utils = require('../utils');


function getContentInt(page, element) {
	if (element && element.length > 0) {
		var width = parseInt(page.dom(element[0]).attr('content'));
		if (!isNaN(width) && width > 10) {
			return width;
		}
	}
}

external.find = function(page) {
	var list = [];

	page.dom('meta[property="og:video"],meta[property="og:video:url"],meta[property="og:video:iframe"],meta[property="og:video:secure_url"]', 'head')
		.each(function() {
			var meta = page.dom(this);
			var item = {
				src: meta.attr('content')
			};
			if (!item.src || item.src.length < 10) {
				return;
			}
			item.sourceId = item.src = utils.url.resolve(page.href, item.src);
			list.push(item);
		});

	if (list.length > 0) {
		list = utils._.uniq(list, 'src');
		var width = getContentInt(page, page.dom('meta[property="og:video:width"]', 'head'));
		if (width) {
			var height = getContentInt(page, page.dom('meta[property="og:video:height"]', 'head'));
			if (height) {
				list.forEach(function(item) {
					item.width = width;
					item.height = height;
				});
			}
		}
	}

	return list;
};
