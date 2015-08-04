[![NPM version](https://badge.fury.io/js/less-plugin-theme-creator.svg)](http://badge.fury.io/js/less-plugin-theme-creator) [![Dependencies](https://david-dm.org/hoogi/less-plugin-theme-creator.svg)](https://david-dm.org/hoogi/less-plugin-theme-creator) [![devDependency Status](https://david-dm.org/hoogi/less-plugin-theme-creator/dev-status.svg)](https://david-dm.org/hoogi/less-plugin-theme-creator#info=devDependencies) [![optionalDependency Status](https://david-dm.org/hoogi/less-plugin-theme-creator/optional-status.svg)](https://david-dm.org/hoogi/less-plugin-theme-creator#info=optionalDependencies)

less-plugin-theme-creator
========================

Creates a theme file like Bootstrap's "bootstrap-theme.css" from existing full less project files.

## lessc usage

Install..

```
npm install -g npm i less-plugin-theme-creator
```

## Programmatic usage (Grunt example)

```js
module.exports = function(grunt) {
 grunt.initConfig({
	 less: {
		development: {
			options: {
				paths: ['less'],
				plugins : [
					new (require('less-plugin-theme-creator'))({
						replacements: {
							'@brand-primary': 'FF00F2'
						}
					})
				]
			},
			files: {
				 "dist/theme.css": "less/bootstrap.less",
			}
		}
	 }
 });
 

 grunt.loadNpmTasks('grunt-contrib-less');
 grunt.registerTask('default', ['less']);
};
```

## Browser usage

Browser usage is not supported at this time.
