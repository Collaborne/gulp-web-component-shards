# gulp-web-component-shards [![Build Status](https://travis-ci.org/Collaborne/gulp-web-component-shards.svg?branch=master)](https://travis-ci.org/Collaborne/gulp-web-component-shards) [![Greenkeeper badge](https://badges.greenkeeper.io/Collaborne/gulp-web-component-shards.svg)](https://greenkeeper.io/)

Plugin for gulp to process endpoints using [web-component-shards](https://github.com/PolymerLabs/web-component-shards).

## Installation

	$ npm install --save-dev gulp-web-component-shards

## Usage

```js
var wcs = require('gulp-web-component-shards');

gulp.task('shards', function() {
    gulp.src('app/elements/*.html', { base: 'app', read: false })
        .pipe(wcs({
		root: 'app',
		shared: 'shared.html',
		bower_components: 'bower_components',
		work: '.tmp/web-component-shards'
	}))
	.pipe(gulp.dest('dist'));
});
```

The plugin will process the given sources as endpoints, and return their vulcanized
forms. Note that the sources must exist properly on the file system, the plugin only
considers the file names.

### Options

- `root`: The root directory of the application, paths in imports are assumed to be relative to that. Defaults to the current directory.
- `shared`: The (relative-to-root) path for the shared import file, defaults to `shared.html`
- `threshold`: The sharing threshold.
- `bower_components`: The bower_components directory, relative to `root`. Defaults to `bower_components`.
- `work`: A work directory for the plugin, defaults to `.tmp/web-component-shards`.

## License

    This software is licensed under the Apache 2 license, quoted below.

    Copyright 2011-2015 Collaborne B.V. <http://github.com/Collaborne/>

    Licensed under the Apache License, Version 2.0 (the "License"); you may not
    use this file except in compliance with the License. You may obtain a copy of
    the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations under
    the License.
