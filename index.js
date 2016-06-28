'use strict';

var WebComponentShards = require('web-component-shards');
var path = require('path');
var gulp = require('gulp');
var through2 = require('through2');
var util = require('util');
var gutil = require('gulp-util');

/**
 * @typedef Config
 * @property {string} root
 * @property {string} bower_components
 * @property {string} work
 * @property {string} shared
 * @property {string} threshold
 * @property {string} [depReport] file name for a dependency report (JSON)
 */

/**
 * @param {Config} [opts] the configuration
 */
function gwcs(opts) {
	var config = opts || {};
	var work = config.work || '.tmp/web-component-shards';

	var wcsOptions = {
		root: config.root || process.cwd(),
		bowerdir: config.bower_components || 'bower_components',
		shared_import: config.shared || 'shared.html',
		sharing_threshold: config.threshold || 2,
		dest_dir: path.resolve(work, 'dist'),
		workdir: path.resolve(work, 'tmp'),
		depReport: config.depReport ? path.resolve(process.cwd(), config.depReport) : undefined,
		endpoints: []
	};

	// Collect all input files into endpoints, run the tool, and return new vinyl instances for the produced output.
	// XXX: for now this doesn't handle situations where the contents of the files matters, rather we assume here
	//		that these files have not been touched.

	function discoverEndpoint(file, enc, cb) {
		var discoverErr;
		try {
			wcsOptions.endpoints.push(file.relative);
		} catch (err) {
			console.error('Error in collecting endpoints: ' + err);
			discoverErr = err;
		}

		if (discoverErr) {
			cb(new gutil.PluginError('gulp-web-component-shards', discoverErr));
		} else {
			cb(null, file);
		}
	}

	function processAndCollect(cb) {
		var push = this.push.bind(this);

		// Run the actual sharding tool
		var shards = new WebComponentShards(wcsOptions);
		return shards.build().then(function() {
			// Now collect all files from wcsOptions.dest_dir for further processing.
			gulp.src(wcsOptions.dest_dir + '/**/*.html').on('data', function(file) {
				push(file);
			}).on('end', function() {
				cb();
			});
		}).catch(function(err) {
			console.error('Error in build(): ' + err);
			cb(new gutil.PluginError('gulp-web-component-shards', err));
		});
	}

	return through2.obj(discoverEndpoint, processAndCollect);
};

module.exports = gwcs;
