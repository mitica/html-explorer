'use strict';

var external = module.exports;
var utils = require('../utils');

external.find = function(page) {
	var list = [];

	page.dom('video', 'body').each(function() {
		var video = page.dom(this);
		var item = {
			image: video.attr('poster'),
			src: video.attr('src'),
			sourceType: 'URL'
		};

		var size = utils.getElementSize(video);
		if (!size || !size.width) {
			return;
		}

		item.width = size.width;
		item.height = size.height;

		if (!item.src) {
			var sources = page.dom('source', video);
			if (sources.length > 0) {
				var source = page.dom(sources[0]);
				item.src = source.attr('src');
				item.type = source.attr('type');
			}
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
