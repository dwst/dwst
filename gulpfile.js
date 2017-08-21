'use strict';

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

gulp.task('sync-css', () => {
  return gulp.src(['dwst/**/*.css'])
    .pipe(browserSync.stream());
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: 'dwst',
      index: 'dwst.html',
    },
  });
  gulp.watch('dwst/**/*.css', ['sync-css']);
  gulp.watch(['dwst/**/*', '!dwst/**/*.css']).on('change', browserSync.reload);
});

gulp.task('dev', ['browser-sync']);

gulp.task('clean', () => {
  return gulp.src('build/', {read: false})
    .pipe(clean());
});

gulp.task('build-css', () => {
  return gulp.src('dwst/dwst.css')
    .pipe(postcss([
      atImport(),
    ]))
    .pipe(gulp.dest('build/'));
});

gulp.task('build-js', () => {
  return gulp.src('dwst/dwst.js')
    .pipe(webpackStream({
      output: {
        filename: 'dwst.js',
      },
    }, webpack2))
    .pipe(gulp.dest('build/'));
});

gulp.task('build-html', () => {
  return gulp.src('dwst/dwst.html')
    .pipe(gulp.dest('build/'));
});

gulp.task('build-images', () => {
  return gulp.src(['dwst/**/*.png', 'dwst/**/*.ico'])
    .pipe(gulp.dest('build/'));
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
