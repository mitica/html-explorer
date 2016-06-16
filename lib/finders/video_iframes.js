'use strict';

var utils = require('../utils');

var REGS = [
	// facebook video
	/facebook\.com\/plugins\/video\.php/,
	// realitatea live
	/realitatealive\.md\/embed\/\d+/,
	// eagleplatform
	/eagleplatform\.com\/index\/player/
];

exports.find = function(page) {
	var list = [];

	page.dom('iframe', 'body').each(function() {
		var iframe = page.dom(this);
		var src = iframe.attr('src');
		if (!src) {
			return;
		}
		// console.log(src);
		var match = false;
		for (var i = 0; i < REGS.length; i++) {
			var reg = REGS[i];
			if (reg.test(src)) {
				match = true;
				break;
			}
		}
		if (!match) {
			return;
		}

		var item = {
			sourceId: src,
			sourceType: 'IFRAME'
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
