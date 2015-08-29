'use strict';

var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var read = require('readability-js');
var sanitizer = require('sanitizer');
var contentFilter = require('./filters/content_filter');

var OPTIONS = {
	filter: null
};

function stripHTML(html) {
	var clean = sanitizer.sanitize(html, function(str) {
		return str;
	});

	// Put new lines after p, br
	clean = clean.replace(/<\/p>/gmi, '</p>\n');
	clean = clean.replace(/<\/div>/gmi, '</div>\n');
	clean = clean.replace(/<(br|br\/|br \/)>/gmi, '\n');
	// Remove all remaining HTML tags.
	clean = clean.replace(/<(?:.|\n)*?>/gm, '');

	clean = sanitizer.unescapeEntities(clean);

	// RegEx to remove needless newlines and whitespace.
	// See: http://stackoverflow.com/questions/816085/removing-redundant-line-breaks-with-regular-expressions
	clean = clean.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/ig, '\n');

	clean = clean.replace(/\n\s+/g, '\n').replace(/\s+\n/g, '\n');

	clean = clean.replace(/([.])[ \t]{2,}/g, '$1 ');

	// Return the final string, minus any leading/trailing whitespace.
	return clean.trim();
}

external.explore = function(page, options) {
	options = _.defaults(options || {}, OPTIONS);
	var html = page.dom || page.html;
	return new Promise(function(resolve, reject) {
		read(html, {
			onlyArticleBody: true
		}, function(err, article) {
			if (err) {
				return reject(err);
			}

			page.content = article.content ? stripHTML(article.content.html()) : null;
			if (page.content) {
				if (options.filter !== false) {
					page.content = contentFilter.filter(page.content, options.filter);
				}
			}
			resolve();
		});
	});
};
