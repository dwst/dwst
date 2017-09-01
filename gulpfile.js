'use strict';

/* global require */

/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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
const stylelint = require('gulp-stylelint');

gulp.task('jsonlint', () => {
  return gulp.src(['**/*.json', '.htmlhintrc', '.stylelintrc', '!node_modules/**'])
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

gulp.task('stylelint', () => {
  return gulp.src('dwst/styles/*.css')
    .pipe(stylelint({
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    }));
});

gulp.task('validate', ['jsonlint', 'eslint', 'stylelint', 'htmlhint']);

gulp.task('test', ['validate']);

gulp.task('browser-sync', ['build'], () => {
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
  gulp.watch('dwst/images/*.png', ['build-images', 'sync-images']);
  gulp.watch('dwst/images/*.ico', ['build-images', 'sync-images']);
  gulp.watch('dwst/scripts/*.js', ['build-js', 'sync-js']);
  gulp.watch('dwst/styles/*.css', ['build-css', 'sync-css']);
});

gulp.task('dev', ['browser-sync']);

gulp.task('clean', () => {
  return gulp.src('build/', {read: false})
    .pipe(clean());
});

gulp.task('sync-css', () => {
  return gulp.src('dwst/styles/*.css')
    .pipe(browserSync.stream());
});

gulp.task('build-css', () => {
  return gulp.src('dwst/styles/dwst.css')
    .pipe(postcss([
      atImport(),
    ]))
    .pipe(gulp.dest('build/styles/'))
    .pipe(rename(p => {
      p.dirname = path.join('build/styles', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-js', () => {
  return gulp.src('dwst/scripts/*.js')
    .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
  return gulp.src('dwst/scripts/dwst.js')
    .pipe(webpackStream({
      output: {
        filename: 'dwst.js',
      },
    }, webpack2))
    .pipe(gulp.dest('build/scripts/'))
    .pipe(rename(p => {
      p.dirname = path.join('build/scripts', p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-html', () => {
  return gulp.src('dwst/dwst.html')
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
  return gulp.src(['dwst/images/*.png', 'dwst/images/*.ico'])
    .pipe(browserSync.stream());
});

gulp.task('build-images', () => {
  return gulp.src(['dwst/images/*.png', 'dwst/images/*.ico'])
    .pipe(gulp.dest('build/images'))
    .pipe(rename(p => {
      p.dirname = path.join('build/images', p.dirname);
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
