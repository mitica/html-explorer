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
	it('explore charset=iso-8859-2', function() {
		return explorer.explore('http://www.wprost.pl/ar/516408/w-polsce-najwiecej-wydaja-turysci-amerykanscy-ale-najwiecej-jest-niemieckich/', {
			images: {
				identify: true,
				timeout: 300
			},
			content: {
			}
		}).then(function(result) {
			// console.log(result);
			assert.equal('W Polsce najwięcej wydają turyści amerykańscy, ale najwięcej jest niemieckich', result.title);
		});
	});
});
