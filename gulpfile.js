'use strict';

/* global require */

const path = require('path');
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
const rename = require('gulp-rename');

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
      routes: {
        '/build': 'build',
      },
    },
  });
  gulp.watch('dwst/manifest.json', ['build-manifest', 'sync-manifest']);
  gulp.watch('dwst/dwst.html', ['build-html', 'sync-html']);
  gulp.watch('dwst/**/*.png', ['build-images', 'sync-images']);
  gulp.watch('dwst/**/*.ico', ['build-images', 'sync-images']);
  gulp.watch('dwst/**/*.js', ['build-js', 'sync-js']);
  gulp.watch('dwst/**/*.css', ['build-css', 'sync-css']);
});

gulp.task('dev', ['browser-sync']);

gulp.task('clean', () => {
  return gulp.src('build/', {read: false})
    .pipe(clean());
});

gulp.task('sync-css', () => {
  return gulp.src('dwst/**/*.css')
    .pipe(browserSync.stream());
});

gulp.task('build-css', () => {
  return gulp.src('dwst/dwst.css')
    .pipe(postcss([
      atImport(),
    ]))
    .pipe(gulp.dest('build/'))
    .pipe(rename(p => {
      p.dirname = path.join('build', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-js', () => {
  return gulp.src('dwst/**/*.js')
    .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
  return gulp.src('dwst/dwst.js')
    .pipe(webpackStream({
      output: {
        filename: 'dwst.js',
      },
    }, webpack2))
    .pipe(gulp.dest('build/'))
    .pipe(rename(p => {
      p.dirname = path.join('build', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-html', () => {
  return gulp.src('dwst/**/*.html')
    .pipe(browserSync.stream());
});

gulp.task('build-html', () => {
  return gulp.src('dwst/dwst.html')
    .pipe(gulp.dest('build/'))
    .pipe(rename(p => {
      p.dirname = path.join('build', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-images', () => {
  return gulp.src(['dwst/**/*.png', 'dwst/**/*.ico'])
    .pipe(browserSync.stream());
});

gulp.task('build-images', () => {
  return gulp.src(['dwst/**/*.png', 'dwst/**/*.ico'])
    .pipe(gulp.dest('build/'))
    .pipe(rename(p => {
      p.dirname = path.join('build', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-manifest', () => {
  return gulp.src('dwst/manifest.json')
    .pipe(browserSync.stream());
});

gulp.task('build-manifest', () => {
  return gulp.src('dwst/manifest.json')
    .pipe(gulp.dest('build/'))
    .pipe(rename(p => {
      p.dirname = path.join('build', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('build-assets', ['build-js', 'build-css', 'build-html', 'build-images', 'build-manifest']);

gulp.task('create-symlinks', () => {
  fse.ensureLinkSync('build/dwst.html', 'build/index.html');
});

gulp.task('build', gulpSequence('clean', 'build-assets', 'create-symlinks'));

gulp.task('default', ['build']);
