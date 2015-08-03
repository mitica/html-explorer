'use strict';

var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var cheerio = require('cheerio');
var feedFilter = require('./filters/feed_filter').filter;
var internal = {};

var OPTIONS = {
	timeout: 5000,
	accept: 'text/html',
	headers: {},
	feeds: feedFilter,
	canonical: true,
	validator: utils.noop,
	html: false
};

external.explore = function(url, options) {
	options = _.defaults(options || {}, OPTIONS);

	return internal.getPage(url, options).then(function(page) {
		try {
			return internal.explore(page, options);
		} catch (e) {
			return Promise.reject(e);
		}
	});
};

internal.getPage = function(url, options) {
	var page = {
		url: url,
		href: url
	};
	if (_.isString(options.html)) {
		page.dom = cheerio.load(options.html, {
			decodeEntities: true
		});
		return Promise.resolve(page);
	}
	var reqOptions = {
		url: url,
		method: 'GET',
		headers: _.defaults(options.headers || {}, {
			'Accept-Charset': 'utf8'
		}),
		timeout: options.timeout,
		encoding: null
	};

	return utils.request(reqOptions).then(function(result) {
		page.href = result.response.request.href;
		var decoded = utils.decodePage(result.response, result.body);
		result.body = decoded.page;
		page.encoding = decoded.encoding;
		if (options.html) {
			page.html = result.body;
		}
		page.dom = cheerio.load(result.body);
		return page;
	});
};

internal.explore = function(page, options) {
	if (options.canonical) {
		internal.exploreCanonical(page);
	}
	internal.exploreInfo(page);

	if (options.validator) {
		options.validator(page);
	}
	if (options.feeds !== false) {
		internal.exploreFeeds(page, options);
	}
	return page;
};

internal.exploreInfo = function(page) {
	var el = page.dom('meta[name="keywords"],meta[property="keywords"]', 'head');
	if (el.length > 0) {
		page.keywords = el.attr('content');
	}

	el = page.dom('meta[name="description"],meta[property="og:description"],meta[name="og:description"],meta[name="twitter:description"]', 'head');
	el.each(function() {
		var description = page.dom(this).attr('content');
		if (description) {
			page.description = page.description && page.description.length > description.length ? page.description : description;
		}
	});

	el = page.dom('meta[name="og:title"],meta[property="og:title"]', 'head');
	if (el.length > 0) {
		page.title = el.attr('content');
	}
	if (!page.title) {
		el = page.dom('title', 'head');
		if (el.length > 0) {
			page.title = el.text();
		}
	}

	if (page.title) {
		page.title = page.title.replace(/[\t\r\n]/g, ' ').replace(/ {2,}/g, ' ').trim();
	}
	if (page.description) {
		page.description = page.description.replace(/[\t\r\n]/g, ' ').replace(/ {2,}/g, ' ').trim();
	}
};

internal.exploreFeeds = function(page, options) {
	var el = page.dom('link[type="application/rss+xml"]', 'head');
	page.feeds = [];
	if (el.length === 0) {
		return;
	}

	var validator = _.isFunction(options.feeds) ? options.feeds : utils.noop;

	el.each(function() {
		var item = page.dom(this);
		var feed = {
			title: item.attr('title'),
			href: item.attr('href')
		};
		if (!feed.href) {
			return;
		}
		feed.href = utils.url.resolve(page.href, feed.href);
		if (validator(feed) !== false) {
			page.feeds.push(feed);
		}
	});
};

internal.exploreCanonical = function(page) {
	var el = page.dom('link[rel="canonical"],link[property="og:url"],meta[property="og:url"],meta[name="twitter:url"]', 'head');
	if (el.length > 0) {
		page.canonical = el.attr('href') || el.attr('content');
		page.canonical = utils.url.resolve(page.href, page.canonical);
	}
};
