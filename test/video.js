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
				// console.log(result.videos);
			});
	});

	it('should find youtube videos', function() {
		return explorer.explore('http://stirileprotv.ro/stiri/sport/bilantul-violentelor-de-la-marsilia-31-de-raniti-dintre-care-patru-in-stare-grava-sase-suporteri-au-fost-arestati-foto.html')
			.then(function(result) {
				// console.log(result.videos);
				assert.equal(1, result.videos.length);
			});
	});

	it('should find iframe videos', function() {
		return explorer.explore('http://stirileprotv.ro/stiri/international/atac-armat-intr-un-club-de-noapte-din-orlando-in-statul-american-florida-mesajul-aparut-pe-facebook-inainte-de-incident.html', {
				video: { limit: 3 }
			})
			.then(function(result) {
				// console.log(result.videos);
				assert.equal(3, result.videos.length);
			});
	});

	// no find slash videos!
	// it('should find video vesti.ru', function() {
	// 	return explorer.explore('http://www.vesti.ru/doc.html?id=2765505', {
	// 			video: { limit: 3 }
	// 		})
	// 		.then(function(result) {
	// 			console.log(result);
	// 			// assert.equal(3, result.videos.length);
	// 		});
	// });

});
