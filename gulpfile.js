
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/


/* global require */

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const jsonlint = require('gulp-jsonlint');
const eslint = require('gulp-eslint');
const htmlhint = require('gulp-htmlhint');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const webpackStream = require('webpack-stream');
const webpack2 = require('webpack');
const fse = require('fs-extra');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const atImport = require('postcss-import');

gulp.task('jsonlint', () => {
  return gulp.src(['**/*.json', '.htmlhintrc', '!node_modules/**'])
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError());
});

gulp.task('eslint', () => {
  return gulp.src(['**/*.js', '!node_modules/**', '!build/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('htmlhint', () => {
  gulp.src(['**/*.html', '!node_modules/**', '!build/**'])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.failReporter());
});

gulp.task('validate', ['jsonlint', 'eslint', 'htmlhint']);

gulp.task('test', ['validate']);

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: 'dwst',
      index: 'dwst.html',
      routes: {
        '/build': 'build',
      },
    },
  });
});

gulp.task('dev', ['browser-sync']);

gulp.task('clean', () => {
  return gulp.src('build/', {read: false})
    .pipe(clean());
});

gulp.task('build-css', () => {
  return gulp.src('dwst/styles/dwst.css')
    .pipe(postcss([
      atImport(),
    ]))
    .pipe(gulp.dest('build/styles/'));
});

gulp.task('build-js', () => {
  return gulp.src('dwst/scripts/dwst.js')
    .pipe(webpackStream({
      output: {
        filename: 'dwst.js',
      },
    }, webpack2))
    .pipe(gulp.dest('build/scripts/'));
});

gulp.task('build-html', () => {
  // We bundle javascript with webpack for production builds
  // So we should be fine without the module system
  return gulp.src('dwst/**/*.html')
    .pipe(replace('<script type="module"', '<script'))
    .pipe(gulp.dest('build/'));
});

gulp.task('build-images', () => {
  return gulp.src(['dwst/images/*.png', 'dwst/images/*.ico'])
    .pipe(gulp.dest('build/images/'));
});

gulp.task('build-manifest', () => {
  return gulp.src('dwst/manifest.json')
    .pipe(gulp.dest('build/'));
});

gulp.task('build-assets', ['build-js', 'build-css', 'build-html', 'build-images', 'build-manifest']);

gulp.task('create-symlinks', () => {
  fse.ensureLinkSync('build/dwst.html', 'build/index.html');
});

gulp.task('build', gulpSequence('clean', 'build-assets', 'create-symlinks'));

gulp.task('default', ['build']);
