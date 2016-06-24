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
		// Note that we're only calling cb() once at the end, and use _push/_emit inside the try-catch.
		// This avoids situations where we get another error in the callback, trigger the catch, and then
		// call the callback again.
		// See https://github.com/sindresorhus/gulp-esnext/issues/8 for a similar example.
		var discoverErr;
		try {
			console.log('Considering ' + file.relative + ' as endpoint');
			wcsOptions.endpoints.push(file.relative);
		} catch (err) {
			console.log('Error in collecting endpoints: ' + err);
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
			// Now collect all files from options.dest_dir for further processing.
			console.log('Collecting output from ' + options.dest_dir);
			gulp.src(options.dest_dir + '/**/*.html').on('data', function(file) {
				console.log('Found output: '+ file.relative);
				push(file);
			}).on('end', function() {
				console.log('Found all output, calling cb');
				cb();
			});
		}).catch(function(err) {
			console.log('Error in build(): ' + err);
			cb(new gutil.PluginError('gulp-web-component-shards', err));
		});
	}

	return through2.obj(discoverEndpoint, processAndCollect);
};

module.exports = gwcs;
