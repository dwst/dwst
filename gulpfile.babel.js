
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import fs from 'fs';
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
import {simpleGit} from 'simple-git';
import {create as bsCreate} from 'browser-sync';

const browserSync = bsCreate();

const jsRootFile = 'dwst.js';
const swRootFile = 'service_worker.js';
const cssRootFile = 'dwst.css';
const htmlRootFile = 'dwst.html';
const htmlRootLink = 'index.html';
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
  config: path.join(sourceDirs.scripts, 'model/config.js'),
};

const VERSION = (() => {
  // This is ugly but SimpleGit does not support describe at the moment
  // See https://github.com/steveukx/git-js/issues/318
  const stdout = exec.execSync('git describe --tags', {encoding: 'ascii'});
  const firstLine = stdout.split('\n').shift().split('\r').shift();
  const prefix = 'v';
  if (firstLine.startsWith(prefix)) {
    return firstLine.slice(prefix.length);
  }
  throw new Error('Unexpected version number format');
})();

function formTargets(base) {
  const targetDirs = {
    styles: path.join(base, 'styles'),
    scripts: path.join(base, 'scripts'),
    images: path.join(base, 'images'),
  };
  const targetPaths = {
    cssRoot: path.join(targetDirs.styles, cssRootFile),
    htmlRoot: path.join(base, htmlRootFile),
    serviceworkerRoot: path.join(targetDirs.scripts, serviceworkerRootFile),
  };
  return [targetDirs, targetPaths];
}

function formLinkTargets(base) {
  const targets = {
    htmlLink: path.join(base, htmlRootLink),
    serviceworkerLink: path.join(base, serviceworkerRootLink),
  };
  return targets;
}
const buildBase = 'build';
const versionBase = path.join(buildBase, VERSION);
const [targetDirs, targetPaths] = formTargets(versionBase);
const linkTargets = formLinkTargets(buildBase);

const releaseBase = 'release';

// The ending slash seems to be meaninful for some reason
const appBase = `/${VERSION}/`;

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

export function deleteBuild() {
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

export const buildAssets = gulp.parallel(buildJs, buildHtml, buildImages, buildManifest);

export function createSymlinks(done) {
  fse.ensureSymlinkSync(targetPaths.htmlRoot, linkTargets.htmlLink);
  fse.ensureSymlinkSync(targetPaths.serviceworkerRoot, linkTargets.serviceworkerLink);
  done();
}

export const buildWithoutLinks = gulp.series(deleteBuild, buildAssets);

export const build = gulp.series(buildWithoutLinks, createSymlinks);

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
});

export function getCurrent(done) {
  const releaseRepo = 'https://github.com/dwst/dwst.github.io.git';
  simpleGit().clone(releaseRepo, releaseBase).then(() => done()).catch(err => {
    throw err;
  });
}

export function ungitCurrent() {
  return gulp.src(path.join(releaseBase, '.git'), {read: false, allowEmpty: true})
    .pipe(gulpClean());
}

export const getOldStuff = gulp.series(deleteRelease, getCurrent, ungitCurrent);

export function addNewStuff() {
  return gulp.src(path.join(buildBase, '**/*'))
    .pipe(gulp.dest(releaseBase));
}

export function deleteRelease() {
  return gulp.src(releaseBase, {read: false, allowEmpty: true})
    .pipe(gulpClean());
}

function getStableReleases() {
  return fs.readdirSync(releaseBase).map(name => {
    if (fs.lstatSync(path.join(releaseBase, name)).isDirectory() === false) {
      // not a directory
      return null;
    }
    if (name.startsWith('2.') === false) {
      // not a release directory
      return null;
    }
    if (name.includes('-')) {
      // not a stable release directory
      return null;
    }
    return name;
  }).filter(x => x);
}

function compareVersions(a, b) {
  if (a.includes('-') || b.includes('-')) {
    throw new Error('Cannot compare unstable version numbers');
  }
  const [aMajor, aMinor, aPatch] = a.split('.').map(x => parseInt(x, 10));
  const [bMajor, bMinor, bPatch] = b.split('.').map(x => parseInt(x, 10));
  if (aMajor > bMajor) {
    return -1;
  }
  if (bMajor > aMajor) {
    return 1;
  }
  if (aMinor > bMinor) {
    return -1;
  }
  if (bMinor > aMinor) {
    return 1;
  }
  if (aPatch > bPatch) {
    return -1;
  }
  if (bPatch > aPatch) {
    return 1;
  }
  return 0;
}

function latestRelease() {
  const stableReleases = getStableReleases();
  stableReleases.sort(compareVersions);
  return stableReleases[0];
}

function updateLink(target, link) {
  try {
    fs.unlinkSync(link);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  fse.ensureSymlinkSync(target, link);
}

export function updateReleaseSymlinks(done) {
  const releaseLinks = formLinkTargets(releaseBase);
  const latest = latestRelease();
  const releasePath = path.join(releaseBase, latest);
  const [, releaseTargets] = formTargets(releasePath);
  updateLink(releaseTargets.htmlRoot, releaseLinks.htmlLink);
  updateLink(releaseTargets.serviceworkerRoot, releaseLinks.serviceworkerLink);
  done();
}

export const buildRelease = gulp.series(gulp.parallel(getOldStuff, buildWithoutLinks), addNewStuff, updateReleaseSymlinks);

export const clean = gulp.parallel(deleteBuild, deleteRelease);

export default build;
