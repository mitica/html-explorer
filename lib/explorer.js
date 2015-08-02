'use strict';

var external = module.exports;
var utils = require('./utils');
var Promise = utils.Promise;
var internal = {};
var pageExplorer = require('./page_explorer');
var imagesExplorer = require('./images_explorer');
var videoExplorer = require('./video_explorer');

var OPTIONS = {
	decodeURI: true
};

external.explore = function(url, options) {
	options = utils._.defaults(options || {}, OPTIONS);

	return pageExplorer.explore(url, options.page).then(function(page) {
		return internal.getVideos(page, options.video).then(function() {
			return internal.getImages(page, options.images).then(function() {
				delete page.dom;
				if (options.decodeURI !== false) {
					internal.decode(page);
				}
				return page;
			});
		});
	});
};

internal.getImages = function(page, options) {
	if (options === false) {
		return Promise.resolve();
	}

	return imagesExplorer.explore(page, options);
};


internal.getVideos = function(page, options) {
	if (options === false) {
		return Promise.resolve();
	}

	return videoExplorer.explore(page, options);
};


internal.decode = function(page) {
	if (page.canonical) {
		page.canonical = decodeURIComponent(page.canonical);
	}
	if (page.href) {
		page.href = decodeURIComponent(page.href);
	}
	if (page.images) {
		page.images.forEach(function(it) {
			it.src = decodeURIComponent(it.src);
		});
	}
	if (page.feeds) {
		page.feeds.forEach(function(it) {
			it.href = decodeURIComponent(it.href);
		});
	}
	if (page.videos) {
		page.videos.forEach(function(it) {
			it.sourceId = decodeURIComponent(it.sourceId);
		});
	}
};
