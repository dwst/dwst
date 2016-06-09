
/* global require */

const gulp = require('gulp');
const jsonlint = require('gulp-jsonlint');
const eslint = require('gulp-eslint');

gulp.task('jsonlint', () => {
  gulp.src('**/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError())
});

gulp.task('eslint', () => {
  return gulp.src(['**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('validate', ['jsonlint', 'eslint']);

gulp.task('test', ['validate']);

