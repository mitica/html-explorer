'use strict';

var assert = require('assert');
var pageExplorer = require('../lib/page_explorer');

describe('pageExplorer', function() {
	it('explore', function() {
		return pageExplorer.explore('http://ipn.md/ro/politica/69667')
			.then(function(result) {
				assert.ok(result.dom);
			});
	});
});
