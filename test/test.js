'use strict';

const expect = require('chai').expect;
const vinyl = require('vinyl');
const fs = require('fs');
const path = require('path');
const plugin = require('../index.js');

/**
 * Process `file` and check expectations.
 *
 * @param {Object} config configuration for the plugin
 * @param {function} expectations callback, invoked with an array of all files produced by the plugin
 * @param {vinyl} files the Vinyl files to process
 */
function executePlugin(config, expectations, files) {
	var resultFiles = [];
	var stream = plugin.call(plugin, config);
	stream.on('data', function(file) {
		resultFiles.push(file);
	});
	stream.on('end', function() {
		expectations(resultFiles);
	});
	files.forEach(function(file) {
		stream.write(file);
	});
	stream.end();
}

function createVinyl(relPath) {
	const cwd = process.cwd();
	return new vinyl({
		cwd: cwd,
		base: path.join(cwd, path.dirname(relPath)),
		path: path.join(cwd, relPath),
		contents: new Buffer(fs.readFileSync(relPath))
	});
}

describe('gulp-web-component-shards', function() {
	describe('vulcanize', function() {
		var component;
		var index;

		beforeEach(function() {
			component = createVinyl('test/vulcanize/component.html');
			index = createVinyl('test/vulcanize/index.html');
		});

		it('should vulcanize trivially', function(done) {
			executePlugin({ root: path.join(process.cwd(), 'test/vulcanize' )}, function(resultFiles) {
				// Produce two outputs: index.html, and the shared.html containing all the shared imports
				// The shared.html in this case should be empty, and we want our component vulcanized into index.html
				expect(resultFiles).to.have.length(2);
				resultFiles.forEach(function(resultFile) {
					var name = path.basename(resultFile.path);
					var contents = resultFile.contents.toString();
					if (name === 'index.html') {
						expect(contents).to.match(/link.*\brel=["']import["'].*\bhref=["']\/shared.html["']/);
						expect(contents).to.match(/template/);
					} else if (name === 'shared.html') {
						expect(contents).to.not.match(/template/);
					} else {
						expect().fail('Produced unexpected file ' + resultFile.path);
					}
				});

				done();
			}, [ index ]);
		});
	});
});