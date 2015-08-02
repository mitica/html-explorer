'use strict';

var assert = require('assert');
var explorer = require('../lib/explorer');

describe('explorer', function() {
	it('explore charset=windows-1251', function() {
		return explorer.explore('http://www.gazeta.ru/social/news/2015/08/02/n_7428985.shtml', {
			images: {
				identify: true,
				timeout: 300
			}
		}).then(function(result) {
			// console.log(result);
			assert.equal('Взрывное устройство в гостинице «Radisson Славянская» в центре Москвы не найдено', result.title);
		});
	});
});
