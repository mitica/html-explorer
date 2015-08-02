'use strict';

var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var VideoFilter = require('./filters/video_filter');
var internal = {};

var OPTIONS = {
	filter: null,
	limit: 1,
	priority: ['YOUTUBE', 'VIMEO', 'URL', 'IFRAME'],
	customFinders: []
};

external.explore = function(page, options) {
	options = _.defaults(options || {}, OPTIONS);

	return Promise.resolve().then(function() {
		try {
			return internal.explore(page, options);
		} catch (e) {
			return Promise.reject(e);
		}
	});
};

internal.explore = function(page, options) {
	var videos = [];

	var finders = [
		require('./finders/video_element'),
		require('./finders/video_youtube'),
		require('./finders/video_vimeo'),
		require('./finders/video_head')
	];

	if (Array.isArray(options.customFinders)) {
		options.customFinders.forEach(function(finder) {
			if (_.isFunction(finder.find)) {
				finders.push(finder);
			}
		});
	}

	finders.forEach(function(finder) {
		var result = finder.find(page);
		if (Array.isArray(result)) {
			videos = videos.concat(result);
		}
	});

	if (videos.length === 0) {
		return null;
	}

	videos = internal.sortVideos(videos, options.priority);

	var videoFilter = new VideoFilter(options.filter);

	function filter(vids) {
		return vids.filter(function(video) {
			return videoFilter.filter(video);
		});
	}

	videos = filter(videos);

	function uniq(vids) {
		return _.uniq(vids, function(video) {
			return video.sourceType + '_' + video.sourceId;
		});
	}

	videos = uniq(videos);

	if (!internal.isValidType(videos[Math.min(options.limit, videos.length) - 1].sourceType)) {
		return Promise.map(videos, function(video) {
				if (video.sourceType) {
					return video;
				}
				return internal.identifyVideo(video)
					.catch(function() {
						return video;
					});
			})
			.then(function(vids) {
				vids = vids.filter(function(video) {
					return internal.isValidType(video.sourceType);
				});
				vids = uniq(vids);
				vids = internal.sortVideos(vids, options.priority);
				page.videos = _.take(vids, options.limit);
			});
	}

	page.videos = _.take(videos, options.limit);
};

internal.isValidType = function(type) {
	return utils.VIDEO_TYPES.indexOf(type) > -1;
};

internal.sortVideos = function(videos, priority) {
	var i;
	return _.sortBy(videos, function(video) {
		i = priority.indexOf(video.sourceType);
		return i < 0 ? 100 : i;
	});
};

internal.identifyVideo = function(video) {
	var request = require('request');
	var url = video.sourceId.toLowerCase();
	if (url.lastIndexOf('.mp4') === url.length - 4 || url.lastIndexOf('.webm') === url.length - 5) {
		video.sourceType = 'URL';
		return Promise.resolve(video);
	}
	return new Promise(function(resolve, reject) {
		request({
			url: video.src || video.sourceId,
			method: 'HEAD',
			timeout: 1000,
			headers: {
				accept: 'text/html,q=0.9,video/*;q=0.8'
			}
		}).on('response', function(response) {
			var contentType = response.headers['content-type'];
			contentType = contentType && contentType.toLowerCase() || '';
			video.contentType = contentType;
			if (contentType.indexOf('text/html') === 0) {
				video.sourceType = 'IFRAME';
			} else if (contentType.indexOf('video/') === 0) {
				video.sourceType = 'URL';
			}
			resolve(video);
		}).on('error', reject);
	});
};
