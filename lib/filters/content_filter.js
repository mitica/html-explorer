'use strict';

var utils = require('../utils');
var _ = utils._;
var inTextSearch = require('in-text-search');

var OPTIONS = {
	minLine: 50,
	minPhrase: 100,
	phraseEndRegex: /[.!?:;¡¿%]$/,
	phraseEnd: false,
	maxInvalidLines: 3,
	minValidLines: 2,
	minScore: 0.3
};

module.exports.filter = function(page, options) {
	options = _.defaults(options || {}, OPTIONS);
	var text = page.content;

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

	text = text.join('\n');

	var opts = {};
	if (page.lang && page.lang.length === 2) {
		opts.stopwords = page.lang.toLowerCase();
	}
	var score = inTextSearch(text, opts).search(page.title);
	// console.log('score', score, page.title, opts, page.url, text);
	if (score < options.minScore) {
		// console.log('deleted page content', text);
		text = null;
	}

	return text;
};
