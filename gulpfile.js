'use strict';

/* global require */

const gulp = require('gulp');
const jsonlint = require('gulp-jsonlint');
const eslint = require('gulp-eslint');
const htmlhint = require('gulp-htmlhint');
const browserSync = require('browser-sync').create();

gulp.task('jsonlint', () => {
  return gulp.src(['**/*.json', '!node_modules/**'])
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError());
});

gulp.task('eslint', () => {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('htmlhint', () => {
  gulp.src(['**/*.html', '!node_modules/**'])
    .pipe(htmlhint())
    .pipe(htmlhint.failReporter());
});

gulp.task('validate', ['jsonlint', 'eslint', 'htmlhint']);

gulp.task('test', ['validate']);

gulp.task('default');

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
