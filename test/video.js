'use strict';

var assert = require('assert');
var explorer = require('../lib/explorer');

describe('explorer', function() {

	it('should find custom videos: jurnaltv', function() {
		return explorer.explore('http://jurnaltv.md/ro/news/2016/5/16/eurodeputati-in-vizita-la-chisinau-10214790/', {
				video: {
					customFinders: [{
						find: function(page) {
							if (!/^http:\/\/(\w+\.)?jurnaltv\.md/.test(page.href)) {
								console.log('no href');
								return null;
							}

							var list = [];
							var body = page.dom('body').text();
							var result = /videoUrl\s*:\s*"http:\/\/video\.jurnaltv\.md\/gallery_video\/(\d+)\.mp4"/i.exec(body);

							if (result) {
								list.push({
									width: 640,
									height: 358,
									sourceId: 'http://video.jurnaltv.md/gallery_video/' + result[1] + '.mp4',
									sourceType: 'URL'
								});
							}
							return list;
						}
					}]
				}
			})
			.then(function(result) {
				assert.equal(1, result.videos.length);
				console.log(result.videos);
			});
	});

});
