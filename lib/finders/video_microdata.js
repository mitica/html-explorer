'use strict';

var external = module.exports;
var utils = require('../utils');

external.find = function(page) {
	var list = [];

	page.dom('div[itemprop=video]', 'body').each(function() {
		var video = page.dom(this);
		var item = {
			image: page.dom('meta[itemprop=thumbnailUrl]', video).attr('content'),
			src: page.dom('meta[itemprop=contentURL]', video).attr('content'),
			height: page.dom('meta[itemprop=height]', video).attr('content'),
			width: page.dom('meta[itemprop=width]', video).attr('content'),
			sourceType: 'URL'
		};

		if (!item.src) {
			return;
		}
		if (item.height) {
			item.height = parseInt(item.height);
		}
		if (item.width) {
			item.width = parseInt(item.width);
		}

		if (item.src) {
			item.sourceId = item.src = utils.url.resolve(page.href, item.src);
			if (item.image) {
				item.image = utils.url.resolve(page.href, item.image);
			}
			list.push(item);
		}
	});

	return list;
};
