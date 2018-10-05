
/* global require */

/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

const fs = require('fs');
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
const sprites = require('postcss-sprites');
const colorHexAlpha = require('postcss-color-hex-alpha');
const discardComments = require('postcss-discard-comments');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const stylelint = require('gulp-stylelint');
const autoprefixer = require('autoprefixer');
const replace = require('gulp-replace');
const mocha = require('gulp-mocha');
const styleguide = require('sc5-styleguide');

const jsRootFile = 'dwst.js';
const swRootFile = 'service_worker.js';
const cssRootFile = 'dwst.css';
const htmlRootFile = 'dwst.html';
const htmlRootLink = 'index.html';
const styleguideRoot = 'styleguide';
const styleguideRootFile = 'index.html';
const styleguideRootLink = path.join(styleguideRoot, 'index.html');
const serviceworkerRootFile = 'service_worker.js';
const serviceworkerRootLink = 'service_worker.js';

const sourceBase = 'dwst';
const sourceDirs = {
  styles: path.join(sourceBase, 'styles'),
  scripts: path.join(sourceBase, 'scripts'),
  sprites: path.join(sourceBase, 'sprites'),
  images: path.join(sourceBase, 'images'),
};
const sourcePaths = {
  manifest: path.join(sourceBase, 'manifest.json'),
  html: path.join(sourceBase, 'dwst.html'),
  css: path.join(sourceDirs.styles, '*.css'),
  cssEntry: path.join(sourceDirs.styles, 'dwst.css'),
  cssReadme: path.join(sourceDirs.styles, 'overview.md'),
  sprites: path.join(sourceDirs.sprites, '*.png'),
  images: [
    path.join(sourceDirs.images, '*.png'),
    path.join(sourceDirs.images, '*.ico'),
  ],
  favicon: path.join(sourceDirs.images, 'favicon.ico'),
  scripts: path.join(sourceDirs.scripts, '**/*.js'),
  scriptEntry: path.join(sourceDirs.scripts, 'dwst.js'),
  swEntry: path.join(sourceDirs.scripts, 'service_worker.js'),
  styleguideFavicon: path.join(sourceDirs.styles, 'favicon.ico'),
  config: path.join(sourceDirs.scripts, 'models/config.js'),
};

const VERSION = (function () {
  // hack to read the version number from an EcmaScript module
  const configFile = fs.readFileSync(sourcePaths.config, {encoding: 'utf-8'});
  return configFile.match(/appVersion: +'([^']*)',/)[1];
}());

const buildBase = 'build';
const versionBase = path.join(buildBase, VERSION);
const targetDirs = {
  styles: path.join(versionBase, 'styles'),
  scripts: path.join(versionBase, 'scripts'),
  images: path.join(versionBase, 'images'),
  styleguide: path.join(versionBase, 'styleguide'),
};
const targetPaths = {
  cssRoot: path.join(targetDirs.styles, cssRootFile),
  htmlRoot: path.join(versionBase, htmlRootFile),
  htmlLink: path.join(buildBase, htmlRootLink),
  styleguideHtmlRoot: path.join(targetDirs.styleguide, styleguideRootFile),
  styleguideHtmlLink: path.join(buildBase, styleguideRootLink),
  serviceworkerRoot: path.join(targetDirs.scripts, serviceworkerRootFile),
  serviceworkerLink: path.join(buildBase, serviceworkerRootLink),
};

// The ending slash of both base paths seems to be meaninful for some reason
const appBase = `/${VERSION}/`;
const styleguideBase = `/${VERSION}/${styleguideRoot}`;

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

gulp.task('dev', ['build'], () => {
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
  gulp.watch(sourcePaths.css, ['build-styleguide']);
  gulp.watch(sourcePaths.sprites, ['build-styleguide']);
  gulp.watch(sourcePaths.cssReadme, ['build-styleguide']);
});

gulp.task('clean', () => {
  return gulp.src(buildBase, {read: false})
    .pipe(clean());
});

gulp.task('build-css', () => {
  return gulp.src(sourcePaths.cssEntry)
    .pipe(sourcemaps.init())
    .pipe(postcss([
      atImport(),
      sprites({
        spritePath: targetDirs.images,
        stylesheetPath: targetDirs.styles,
        spritesmith: {
          padding: 2,
        },
      }),
      colorHexAlpha(),
      autoprefixer(),
      discardComments(),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(targetDirs.styles))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.styles, p.dirname);
    }))
    .pipe(browserSync.stream());
});

const webpackModuleConf = {
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
};

gulp.task('build-app-js', () => {
  return gulp.src(sourcePaths.scriptEntry)
    .pipe(webpackStream({
      output: {
        filename: jsRootFile,
      },
      devtool: 'source-map',
      module: webpackModuleConf,
    }, webpack2))
    .pipe(gulp.dest(targetDirs.scripts))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.scripts, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('build-sw-js', () => {
  return gulp.src(sourcePaths.swEntry)
    .pipe(webpackStream({
      output: {
        filename: swRootFile,
      },
      devtool: 'source-map',
      module: webpackModuleConf,
    }, webpack2))
    .pipe(gulp.dest(targetDirs.scripts))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.scripts, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('build-js', cb => {
  gulpSequence('build-sw-js', 'build-app-js')(cb);
});

gulp.task('build-html', () => {
  // We bundle javascript with webpack for production builds
  // So we should be fine without the module system
  return gulp.src(sourcePaths.html)
    .pipe(replace('<script type="module"', '<script'))
    .pipe(replace('<base href="/"', `<base href="${appBase}"`))
    .pipe(gulp.dest(versionBase))
    .pipe(rename(p => {
      p.dirname = path.join(versionBase, p.dirname);
    }))
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

gulp.task('build-manifest', () => {
  return gulp.src(sourcePaths.manifest)
    .pipe(gulp.dest(versionBase))
    .pipe(rename(p => {
      p.dirname = path.join(versionBase, p.dirname);
    }))
    .pipe(browserSync.stream());
});

gulp.task('styleguide:generate', () => {
  return gulp.src(sourcePaths.css)
    .pipe(styleguide.generate({
      title: 'DWST Style Guide',
      overviewPath: sourcePaths.cssReadme,
      rootPath: targetDirs.styleguide,
      appRoot: styleguideBase,
      disableEncapsulation: true,
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

gulp.task('build-styleguide', cb => {
  // the cb hassle is needed since gulpSequence is used inside a watcher
  gulpSequence(['styleguide:generate', 'styleguide:applystyles'], 'replace-styleguide-favicon')(cb);
});

gulp.task('build-assets', ['build-js', 'build-styleguide', 'build-html', 'build-images', 'build-manifest']);

gulp.task('create-symlinks', () => {
  fse.ensureSymlinkSync(targetPaths.styleguideHtmlRoot, targetPaths.styleguideHtmlLink);
  fse.ensureSymlinkSync(targetPaths.htmlRoot, targetPaths.htmlLink);
  fse.ensureSymlinkSync(targetPaths.serviceworkerRoot, targetPaths.serviceworkerLink);
});

gulp.task('build', gulpSequence('clean', 'build-assets', 'create-symlinks'));

gulp.task('default', ['build']);
