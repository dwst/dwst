'use strict';

/* global require */

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const jsonlint = require('gulp-jsonlint');
const eslint = require('gulp-eslint');
const htmlhint = require('gulp-htmlhint');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const webpack = require('gulp-webpack');
const fse = require('fs-extra');

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
  return gulp.src('dwst/**/*.css')
    .pipe(gulp.dest('build/'));
});

gulp.task('build-js', () => {
  return gulp.src('dwst/dwst.js')
    .pipe(webpack({
      output: {
        filename: 'dwst.js',
      },
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('build-static', () => {
  return gulp.src(['dwst/**/*.html', 'dwst/**/*.json', 'dwst/**/*.png', 'dwst/**/*.ico'])
    .pipe(gulp.dest('build/'));
});

gulp.task('build-assets', ['build-static', 'build-js', 'build-css']);

gulp.task('create-symlinks', () => {
  fse.ensureLinkSync('build/dwst.html', 'build/index.html');
});

gulp.task('build', gulpSequence('clean', 'build-assets', 'create-symlinks'));

gulp.task('default', ['build']);
