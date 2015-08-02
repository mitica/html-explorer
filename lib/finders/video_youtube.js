'use strict';

var external = module.exports;
var utils = require('../utils');

external.find = function(page) {
	var list = [];

	page.dom('iframe', 'body').each(function() {
		var iframe = page.dom(this);
		var src = iframe.attr('src');
		if (!src) {
			return;
		}
		var result = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i.exec(src);
		if (!result) {
			return;
		}

		var item = {
			image: 'http://i.ytimg.com/vi/' + result[1] + '/hqdefault.jpg',
			sourceId: result[1],
			sourceType: 'YOUTUBE'
		};

		var size = utils.getElementSize(iframe);
		if (!size || !size.width) {
			return;
		}

		item.width = size.width;
		item.height = size.height;

		list.push(item);
	});

	return list;
};
