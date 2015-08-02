'use strict';

var external = module.exports;
var utils = require('./utils');
var Promise = utils.Promise;
var read = require('node-readability');
var sanitizer = require('sanitizer');

// var OPTIONS = {

// };

function stripHTML(html) {
	var clean = sanitizer.sanitize(html, function(str) {
		return str;
	});

	// Put new lines after p
	clean = clean.replace(/<\/p>/gmi, '</p>\n');
	// Remove all remaining HTML tags.
	clean = clean.replace(/<(?:.|\n)*?>/gm, '');

	clean = sanitizer.unescapeEntities(clean);

	// RegEx to remove needless newlines and whitespace.
	// See: http://stackoverflow.com/questions/816085/removing-redundant-line-breaks-with-regular-expressions
	clean = clean.replace(/(?:\s*(?:\r\n|\r|\n)\s*){2,}/ig, '\n');

	// Return the final string, minus any leading/trailing whitespace.
	return clean.trim();
}

external.explore = function(page) {
	// options = _.defaults(options || {}, OPTIONS);
	var html = page.html || page.dom.html();
	return new Promise(function(resolve, reject) {
		read(html, function(err, article) {
			if (err) {
				return reject(err);
			}

			page.content = article.content ? stripHTML(article.content) : null;
			resolve();
		});
	});
};
