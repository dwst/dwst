
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import path from 'path';
import exec from 'child_process';
import gulp from 'gulp';
import gulpJsonlint from 'gulp-jsonlint';
import gulpEslint from 'gulp-eslint';
import gulpHtmlhint from 'gulp-htmlhint';
import gulpClean from 'gulp-clean';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import fse from 'fs-extra';
import postcss from 'gulp-postcss';
import atImport from 'postcss-import';
import sprites from 'postcss-sprites';
import colorHexAlpha from 'postcss-color-hex-alpha';
import discardComments from 'postcss-discard-comments';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import gulpStylelint from 'gulp-stylelint';
import autoprefixer from 'autoprefixer';
import replace from 'gulp-replace';
import gulpMocha from 'gulp-mocha';
import styleguide from 'sc5-styleguide';
import {create as bsCreate} from 'browser-sync';

const browserSync = bsCreate();

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
  config: path.join(sourceDirs.scripts, 'model/config.js'),
};

// This is ugly but NodeGit does not support describe at the moment
const VERSION = exec.execSync('git describe --tags', {encoding: 'ascii'}).split('\n')[0].split('\r')[0];

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
  javascript: [sourcePaths.scripts, 'gulpfile.babel.js', 'dwst/**/test/**/*.js'],
  html: sourcePaths.html,
  css: sourcePaths.css,
};

export function jsonlint() {
  return gulp.src(lintingPaths.json)
    .pipe(gulpJsonlint())
    .pipe(gulpJsonlint.failOnError());
}

export function eslint() {
  return gulp.src(lintingPaths.javascript)
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError());
}

export function htmlhint() {
  return gulp.src(lintingPaths.html)
    .pipe(gulpHtmlhint('.htmlhintrc'))
    .pipe(gulpHtmlhint.failReporter());
}

export function stylelint() {
  return gulp.src(lintingPaths.css)
    .pipe(gulpStylelint({
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    }));
}

export const validate = gulp.parallel(jsonlint, eslint, stylelint, htmlhint);

export function mocha() {
  return gulp.src('test/test.js', {read: false})
    .pipe(gulpMocha({
      require: '@babel/register',
    }));
}

export const test = gulp.parallel(validate, mocha);

export function clean() {
  return gulp.src(buildBase, {read: false, allowEmpty: true})
    .pipe(gulpClean());
}

export function buildCss() {
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
}

const webpackModuleConf = {
  rules: [
    {
      test: /\.js$/,
      loader: 'babel-loader',
    },
  ],
};

export function buildAppJs() {
  return gulp.src(sourcePaths.scriptEntry)
    .pipe(webpackStream({
      output: {
        filename: jsRootFile,
      },
      mode: 'production',
      devtool: 'source-map',
      module: webpackModuleConf,
      plugins: [
        new webpack2.DefinePlugin({
          VERSION: JSON.stringify(VERSION),
        }),
      ],
    }, webpack2))
    .pipe(gulp.dest(targetDirs.scripts))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.scripts, p.dirname);
    }))
    .pipe(browserSync.stream());
}

export function buildSwJs() {
  return gulp.src(sourcePaths.swEntry)
    .pipe(webpackStream({
      output: {
        filename: swRootFile,
      },
      mode: 'production',
      devtool: 'source-map',
      module: webpackModuleConf,
      plugins: [
        new webpack2.DefinePlugin({
          VERSION: JSON.stringify(VERSION),
        }),
      ],
    }, webpack2))
    .pipe(gulp.dest(targetDirs.scripts))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.scripts, p.dirname);
    }))
    .pipe(browserSync.stream());
}

export const buildJs = gulp.series(buildSwJs, buildAppJs);

export function buildHtml() {
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
}

export function buildImages() {
  return gulp.src(sourcePaths.images)
    .pipe(gulp.dest(targetDirs.images))
    .pipe(rename(p => {
      p.dirname = path.join(targetDirs.images, p.dirname);
    }))
    .pipe(browserSync.stream());
}

export function buildManifest() {
  return gulp.src(sourcePaths.manifest)
    .pipe(gulp.dest(versionBase))
    .pipe(rename(p => {
      p.dirname = path.join(versionBase, p.dirname);
    }))
    .pipe(browserSync.stream());
}

export function styleguideGenerate() {
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
}

export const styleguideApplystyles = gulp.series(buildCss, () => {
  return gulp.src(targetPaths.cssRoot)
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(targetDirs.styleguide));
});

export function replaceStyleguideFavicon() {
  return gulp.src(sourcePaths.styleguideFavicon)
    .pipe(gulp.dest(path.join(targetDirs.styleguide, 'assets/img')));
}

export const buildStyleguide = gulp.series(gulp.parallel(styleguideGenerate, styleguideApplystyles), replaceStyleguideFavicon);

export const buildAssets = gulp.parallel(buildJs, buildStyleguide, buildHtml, buildImages, buildManifest);

export function createSymlinks(done) {
  fse.ensureSymlinkSync(targetPaths.styleguideHtmlRoot, targetPaths.styleguideHtmlLink);
  fse.ensureSymlinkSync(targetPaths.htmlRoot, targetPaths.htmlLink);
  fse.ensureSymlinkSync(targetPaths.serviceworkerRoot, targetPaths.serviceworkerLink);
  done();
}

export const build = gulp.series(clean, buildAssets, createSymlinks);

export const dev = gulp.series(build, () => {
  browserSync.init({
    server: {
      baseDir: buildBase,
      index: htmlRootLink,
    },
  });
  gulp.watch(sourcePaths.manifest, buildManifest);
  gulp.watch(sourcePaths.html, buildHtml);
  gulp.watch(sourcePaths.images, buildImages);
  gulp.watch(sourcePaths.scripts, buildJs);
  gulp.watch(sourcePaths.css, buildStyleguide);
  gulp.watch(sourcePaths.sprites, buildStyleguide);
  gulp.watch(sourcePaths.cssReadme, buildStyleguide);
});

export default build;
