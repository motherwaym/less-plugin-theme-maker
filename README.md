less-plugin-theme-maker
=======================

Creates a theme file like Bootstrap's "bootstrap-theme.css" from existing full less project files. It deletes any rules
that don't make use of one or more LESS variables that are specified in the plugin configuration.

Based on https://github.com/hoogi/less-plugin-theme-creator

This version allows themed variables to be defined in LESS files where they can use functions and reference other variables.

## usage

Install..

```
npm install --save-dev zephyrweb/less-plugin-theme-maker
```

## Basic usage

```js
var less = require('less');
var LessThemeMaker = require('less-plugin-theme-maker');

less.render(lessStr, {
    plugins: [
      new LessThemeMaker({
        themedVariables: ['@some_var']
      }
    )]
  })
  .then(output => {
    console.log(output);
  }, error => {
    console.log(error);
  });
```

## Advanced/Gulp usage

Given less/main.less and some themes defined in themes.json:

```css
@bootstraplib: "../node_modules/bootstrap/less";

@import "@{bootstraplib}/variables.less";
@import "@{bootstraplib}/mixins.less";

// custom theme overrides:
@import "themes/@{theme}.less";

// Core CSS
@import "@{bootstraplib}/scaffolding.less";
@import "@{bootstraplib}/type.less";
@import "@{bootstraplib}/code.less";
@import "@{bootstraplib}/grid.less";
@import "@{bootstraplib}/tables.less";
@import "@{bootstraplib}/forms.less";
@import "@{bootstraplib}/buttons.less";

// Components
@import "@{bootstraplib}/component-animations.less";
...
```

```js
var gulp = require('gulp');
var less = require('gulp-less');
var LessThemeMaker = require('less-plugin-theme-maker');

gulp.task('less-themes', function (done) {

  var tasks = require('./themes.json')
    .map(theme => theme.id)
    .map(t => {
      return gulp.src(['less/styles.less'])
        .pipe(less({
          modifyVars: {
            theme: t
          },
          plugins: [
            new LessThemeMaker({
              themedVariables: getLessVars(t), // only preserve rules that this particular theme affects
              excludeMixinName: ".theme-overrides"
            })
          ]
        }))
        .pipe(rename(`theme-${t}.css`))
        .pipe(gulp.dest('./css'))
    });

  return merge(tasks);

});


function getLessVars(theme) {

  var contentsStr = fs.readFileSync(`./less/themes/${theme}.less`, 'utf8').toString('utf8');
    // replace all comments with empty string
    contentsStr = contentsStr.replace(/(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*)/g, '');

    var variableRegex = /(@[A-Za-z0-9\-_]+)(?=:)/g;
    return contentsStr.match(variableRegex).map(function (obj) {
      return obj;
    });

}
```

Options:

__themedVariables__

Array of variable names that are used to preserve CSS rules that reference them directly or indirectly.

__excludeMixinName__

Name of a mixin that will have its contents preserved. Useful for CSS overrides that don't make use of any themed variables.

## Browser usage

Browser usage is not supported at this time.
