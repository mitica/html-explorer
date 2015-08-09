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
	it('explore video microdata', function() {
		return explorer.explore('http://wp.tv/i,kalorycznocs-i-wady-wakacyjnych-przekasek,mid,1751268,klip.html?_ticrsn=3&ticaid=515563', {
			images: {
				identify: true,
				timeout: 300
			}
		}).then(function(result) {
			// console.log(result);
			assert.equal(1, result.videos.length);
		});
	});
	it('explore video', function() {
		return explorer.explore('http://www.publika.md/luptele-continua-in-ucraina-doi-soldati-au-murit-iar-alti-sapte-au-fost-raniti-in-doar-24-de-ore_2373371.html', {
			images: {
				identify: true,
				timeout: 300
			}
		}).then(function(result) {
			// console.log(result);
			assert.equal(1, result.videos.length);
		});
	});
});
