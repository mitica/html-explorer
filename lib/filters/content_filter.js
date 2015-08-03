'use strict';

var utils = require('../utils');
var _ = utils._;

var OPTIONS = {
	minLine: 50,
	minPhrase: 100,
	phraseEndRegex: /[.!?:;¡¿%]$/,
	phraseEnd: false,
	maxInvalidLines: 3,
	minValidLines: 2
};

module.exports.filter = function(text, options) {
	options = _.defaults(options || {}, OPTIONS);
	if (!text) {
		return text;
	}
	var lines = text.split(/\n/g);
	text = [];
	var invalidLines = 0;
	var stop = false;

	lines.forEach(function(line) {
		if (stop) {
			return;
		}
		if (options.maxInvalidLines && text.length >= options.minValidLines && invalidLines >= options.maxInvalidLines) {
			stop = true;
			return;
		}
		line = line.trim();
		if (options.phraseEnd && !options.phraseEndRegex.test(line)) {
			invalidLines++;
			return;
		}
		if (line.length < options.minLine || line.length < options.minPhrase && !options.phraseEndRegex.test(line)) {
			invalidLines++;
			return;
		}
		text.push(line);
		invalidLines = 0;
	});

	return text.join('\n');
};
