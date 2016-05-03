'use strict';

var WebComponentShards = require('web-component-shards');
var path = require('path');
var gulp = require('gulp');
var stream = require('stream');
var util = require('util');

/**
 * @typedef Config
 * @property {string} root
 * @property {string} bower_components
 * @property {string} work
 * @property {string} shared
 * @property {string} threshold
 * @property {string} [depReport] file name for a dependency report (JSON)
 */

function WebComponentShardsStream(options) {

	options.endpoints = [];

	this._transform = function(file, enc, cb) {
		try {
			options.endpoints.push(file.relative);
			cb();
		} catch (err) {
			cb(err);
		}
	}.bind(this);
	this._flush = function(cb) {
		var stream = this;

		// Run the actual sharding tool
		var shards = new WebComponentShards(options);
		shards.build().then(function() {
			// Now collect all files from options.dest_dir for further processing.
			gulp.src(options.dest_dir + '/**/*.html').on('data', function(file) {
				stream.push(file);
			}).on('end', function() {
				cb();
			});
		});
	}.bind(this);

	stream.Transform.call(this, {objectMode: true});
}

util.inherits(WebComponentShardsStream, stream.Transform);

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
		depReport: config.depReport ? path.resolve(process.cwd(), config.depReport) : undefined
	};
	// Collect all input files into endpoints, run the tool, and return new vinyl instances for the produced output.
	// XXX: for now this doesn't handle situations where the contents of the files matters, rather we assume here
	//		that these files have not been touched.
	return new WebComponentShardsStream(wcsOptions);
};

module.exports = gwcs;