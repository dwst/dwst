var gulp = require('gulp');
var jsonlint = require('gulp-jsonlint');

gulp.task('jsonlint', () => {
  gulp.src('**/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError())
});

gulp.task('validate', ['jsonlint']);

gulp.task('test', ['validate']);

