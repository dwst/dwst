
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
const colorHexAlpha = require('postcss-color-hex-alpha');
const discardComments = require('postcss-discard-comments');
const rename = require('gulp-rename');
const stylelint = require('gulp-stylelint');
const autoprefixer = require('autoprefixer');
const replace = require('gulp-replace');
const mocha = require('gulp-mocha');
const styleguide = require('sc5-styleguide');

const jsRootFile = 'dwst.js';
const cssRootFile = 'dwst.css';
const htmlRootFile = 'dwst.html';
const htmlRootLink = 'index.html';

const buildBase = 'build';
const targetDirs = {
  styles: path.join(buildBase, 'styles'),
  styleguide: path.join(buildBase, 'styleguide'),
  scripts: path.join(buildBase, 'scripts'),
  images: path.join(buildBase, 'images'),
};
const targetPaths = {
  cssRoot: path.join(targetDirs.styles, cssRootFile),
  htmlRoot: path.join(buildBase, htmlRootFile),
  htmlLink: path.join(buildBase, htmlRootLink),
};

const sourceBase = 'dwst';
const sourceDirs = {
  styles: path.join(sourceBase, 'styles'),
  scripts: path.join(sourceBase, 'scripts'),
  images: path.join(sourceBase, 'images'),
};
const sourcePaths = {
  manifest: path.join(sourceBase, 'manifest.json'),
  html: path.join(sourceBase, 'dwst.html'),
  css: path.join(sourceDirs.styles, '*.css'),
  cssEntry: path.join(sourceDirs.styles, 'dwst.css'),
  cssReadme: path.join(sourceDirs.styles, 'overview.md'),
  images: [
    path.join(sourceDirs.images, '*.png'),
    path.join(sourceDirs.images, '*.ico'),
  ],
  favicon: path.join(sourceDirs.images, 'favicon.ico'),
  scripts: path.join(sourceDirs.scripts, '**/*.js'),
  scriptEntry: path.join(sourceDirs.scripts, 'dwst.js'),
  styleguideFavicon: path.join(sourceDirs.styles, 'favicon.ico'),
};

const lintingPaths = {
  json: [sourcePaths.manifest, '.htmlhintrc', '.stylelintrc', 'package.json'],
  javascript: [sourcePaths.scripts, 'gulpfile.js', 'dwst/**/test/**/*.js'],
  html: sourcePaths.html,
  css: sourcePaths.css,
};

gulp.task('jsonlint', () => {
  return gulp.src(lintingPaths.json)
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError());
});

gulp.task('eslint', () => {
  return gulp.src(lintingPaths.javascript)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('htmlhint', () => {
  gulp.src(lintingPaths.html)
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.failReporter());
});

gulp.task('stylelint', () => {
  return gulp.src(lintingPaths.css)
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

gulp.task('mocha', () => {
  return gulp.src('test/test.js', {read: false})
    .pipe(mocha({
      compilers: 'js:babel-core/register',
    }));
});

gulp.task('test', ['validate', 'mocha']);

gulp.task('browser-sync-build', ['build'], () => {
  browserSync.init({
    server: {
      baseDir: buildBase,
      index: htmlRootLink,
    },
  });
  gulp.watch(sourcePaths.manifest, ['build-manifest']);
  gulp.watch(sourcePaths.html, ['build-html']);
  gulp.watch(sourcePaths.images, ['build-images']);
  gulp.watch(sourcePaths.scripts, ['build-js']);
  gulp.watch(sourcePaths.css, ['build-css']);
  gulp.watch(sourcePaths.css, ['build-styleguide']);
  gulp.watch(sourcePaths.cssReadme, ['build-styleguide']);
});

gulp.task('browser-sync-raw', () => {
  browserSync.init({
    server: {
      baseDir: sourceBase,
      index: htmlRootFile,
    },
  });
  gulp.watch(sourcePaths.manifest, ['sync-manifest']);
  gulp.watch(sourcePaths.html, ['sync-html']);
  gulp.watch(sourcePaths.images, ['sync-images']);
  gulp.watch(sourcePaths.scripts, ['sync-js']);
  gulp.watch(sourcePaths.css, ['sync-css']);
});

gulp.task('raw', ['browser-sync-raw']);

gulp.task('dev', ['browser-sync-build'], () => {
  const lines = [
    '',
    'Hosting the transpiled application bundle.',
    'Use "gulp raw" to host the raw source files.',
    '',
  ];
  console.log(lines.join('\n'));  // eslint-disable-line no-console
});

gulp.task('clean', () => {
  return gulp.src(buildBase, {read: false})
    .pipe(clean());
});

gulp.task('sync-css', () => {
  return gulp.src(sourcePaths.css)
    .pipe(browserSync.stream());
});

gulp.task('build-css', () => {
  return gulp.src(sourcePaths.cssEntry)
    .pipe(postcss([
      atImport(),
      colorHexAlpha(),
      autoprefixer(),
      discardComments(),
    ]))
    .pipe(gulp.dest(targetDirs.styles))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.styles, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-js', () => {
  return gulp.src(sourcePaths.scripts)
    .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
  return gulp.src(sourcePaths.scriptEntry)
    .pipe(webpackStream({
      output: {
        filename: jsRootFile,
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
              plugins: [
                ['babel-plugin-transform-builtin-extend', {
                  globals: ['Error'],
                }],
              ],
              presets: [
                ['env', {
                  targets: {
                    browsers: require('./package.json').browserslist,
                  },
                }],
              ],
            },
          },
        ],
      },
    }, webpack2))
    .pipe(gulp.dest(targetDirs.scripts))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.scripts, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-html', () => {
  return gulp.src(sourcePaths.html)
    .pipe(browserSync.stream());
});

gulp.task('build-html', () => {
  // We bundle javascript with webpack for production builds
  // So we should be fine without the module system
  return gulp.src(sourcePaths.html)
    .pipe(replace('<script type="module"', '<script'))
    .pipe(gulp.dest(buildBase))
    .pipe(rename(p => {
      p.dirname = path.join(buildBase, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-images', () => {
  return gulp.src(sourcePaths.images)
    .pipe(browserSync.stream());
});

gulp.task('build-images', () => {
  return gulp.src(sourcePaths.images)
    .pipe(gulp.dest(targetDirs.images))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.images, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('sync-manifest', () => {
  return gulp.src(sourcePaths.manifest)
    .pipe(browserSync.stream());
});

gulp.task('build-manifest', () => {
  return gulp.src(sourcePaths.manifest)
    .pipe(gulp.dest(buildBase))
    .pipe(rename(p => {
      p.dirname = path.join(buildBase, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('styleguide:generate', () => {
  return gulp.src(sourcePaths.css)
    .pipe(styleguide.generate({
      title: 'DWST Style Guide',
      overviewPath: sourcePaths.cssReadme,
      rootPath: targetDirs.styleguide,
      appRoot: '/styleguide',
      readOnly: true,
      extraHead: [
        '<style>.sg-design {display: none;}</style>',
      ],
    }))
    .pipe(gulp.dest(targetDirs.styleguide));
});

gulp.task('styleguide:applystyles', ['build-css'], () => {
  return gulp.src(targetPaths.cssRoot)
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(targetDirs.styleguide));
});

gulp.task('replace-styleguide-favicon', () => {
  return gulp.src(sourcePaths.styleguideFavicon)
    .pipe(gulp.dest(path.join(targetDirs.styleguide, 'assets/img')));
});

gulp.task('build-styleguide', gulpSequence(['styleguide:generate', 'styleguide:applystyles'], 'replace-styleguide-favicon'));

gulp.task('build-assets', ['build-js', 'build-styleguide', 'build-css', 'build-html', 'build-images', 'build-manifest']);

gulp.task('create-symlinks', () => {
  fse.ensureSymlinkSync(targetPaths.htmlRoot, targetPaths.htmlLink);
});

gulp.task('build', gulpSequence('clean', 'build-assets', 'create-symlinks'));

gulp.task('default', ['build']);
