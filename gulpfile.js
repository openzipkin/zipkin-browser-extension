const fs = require('fs');
const gulp = require('gulp');
const jest = require('gulp-jest').default;
const mustache = require("gulp-mustache");
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const shell = require('gulp-shell');
const zip = require('gulp-zip');
const webpack = require('webpack-stream');
const webpackChromeConfig = require('./webpack-chrome.config.js');
const webpackFirefoxConfig = require('./webpack-firefox.config.js');

const version = fs.readFileSync('VERSION', 'utf-8').trim();

gulp.task('clean', () => gulp.src(['build', 'dist'], {read: false}).pipe(clean()));

gulp.task('test:unit', () => gulp.src('test').pipe(jest()));

// Chrome extension build
gulp.task('chrome:webpack', () => gulp.src('vendor/chrome')
  .pipe(webpack(webpackChromeConfig))
  .pipe(gulp.dest('build/chrome')));
gulp.task('chrome:mustache', () => gulp.src([
  'vendor/chrome/manifest.json'
]).pipe(mustache({
  version
})).pipe(gulp.dest("build/chrome")));
gulp.task('chrome:static', () => gulp.src([
  'vendor/chrome/devtools.html',
  'vendor/chrome/panel.html'
]).pipe(gulp.dest('build/chrome')));
gulp.task('chrome:package', ['chrome:webpack', 'chrome:mustache', 'chrome:static'], () => gulp.src('build/chrome/*')
  .pipe(zip('zipkin-chrome-extension.zip'))
  .pipe(gulp.dest('dist/chrome')));
gulp.task('chrome', ['chrome:package']);

// Firefox addon build
gulp.task('firefox:webpack', () => gulp.src('vendor/firefox')
  .pipe(webpack(webpackFirefoxConfig))
  .pipe(gulp.dest('build/firefox')));
gulp.task('firefox:mustache', () => gulp.src([
  'vendor/firefox/package.json'
]).pipe(mustache({
    version
})).pipe(gulp.dest("build/firefox")));
gulp.task('firefox:data', () => gulp.src([
  'vendor/firefox/zipkin-panel.html',
  'img/icon64.png'
]).pipe(gulp.dest('build/firefox/data')));
gulp.task('firefox:jpm-xpi', ['firefox:webpack', 'firefox:mustache', 'firefox:data'], () => gulp.src('build/firefox')
    .pipe(shell([
      'node ../../node_modules/jpm/bin/jpm xpi'
    ], {
      cwd: 'build/firefox'
    }))
);
gulp.task('firefox:move-package', ['firefox:jpm-xpi'], () => gulp.src('build/firefox/*.xpi')
  .pipe(rename('firefox/zipkin-firefox-extension.xpi'))
  .pipe(gulp.dest('dist')));
gulp.task('firefox', ['firefox:move-package']);

// Aggregate build
gulp.task('default', ['test:unit', 'chrome', 'firefox']);
