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
import webpack from 'webpack';
import fse from 'fs-extra';
import postcss from 'gulp-postcss';
import atImport from 'postcss-import';
// Exports-only ESM package; resolves at runtime but eslint-plugin-import's
// resolver can't follow its exports map.
// eslint-disable-next-line import/no-unresolved
import colorHexAlpha from 'postcss-color-hex-alpha';
import discardComments from 'postcss-discard-comments';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import replace from 'gulp-replace';
import { simpleGit } from 'simple-git';
import { create as bsCreate } from 'browser-sync';

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
  const stdout = exec.execSync('git describe --tags', { encoding: 'ascii' });
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
    sprites: path.join(base, 'sprites'),
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

function remove(target) {
  return fs.promises.rm(target, { recursive: true, force: true });
}

export function deleteBuild() {
  return remove(buildBase);
}

export function buildCss() {
  return gulp
    .src(sourcePaths.cssEntry, { sourcemaps: true })
    .pipe(
      postcss([atImport(), colorHexAlpha(), autoprefixer(), discardComments()]),
    )
    .pipe(gulp.dest(targetDirs.styles, { sourcemaps: '.' }))
    .pipe(
      rename((p) => {
        p.dirname = path.join(targetDirs.styles, p.dirname);
      }),
    )
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

function bundleJs(entry, filename) {
  const compiler = webpack({
    entry: path.resolve(entry),
    output: {
      path: path.resolve(targetDirs.scripts),
      filename,
    },
    mode: 'production',
    devtool: 'source-map',
    module: webpackModuleConf,
    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(VERSION),
      }),
    ],
  });
  return new Promise((resolve, reject) => {
    compiler.run((runError, stats) => {
      compiler.close((closeError) => {
        if (runError || closeError) {
          reject(runError || closeError);
          return;
        }
        if (stats.hasErrors()) {
          reject(new Error(stats.toString('errors-only')));
          return;
        }
        resolve();
      });
    });
  });
}

export function buildAppJs() {
  return bundleJs(sourcePaths.scriptEntry, jsRootFile);
}

export function buildSwJs() {
  return bundleJs(sourcePaths.swEntry, swRootFile);
}

export const buildJs = gulp.series(buildSwJs, buildAppJs);

export function buildHtml() {
  // We bundle javascript with webpack for production builds
  // So we should be fine without the module system
  return gulp
    .src(sourcePaths.html)
    .pipe(replace('<script type="module"', '<script'))
    .pipe(replace('<base href="/"', `<base href="${appBase}"`))
    .pipe(gulp.dest(versionBase))
    .pipe(
      rename((p) => {
        p.dirname = path.join(versionBase, p.dirname);
      }),
    )
    .pipe(browserSync.stream());
}

export function buildImages() {
  return gulp
    .src(sourcePaths.images, { encoding: false })
    .pipe(gulp.dest(targetDirs.images))
    .pipe(
      rename((p) => {
        p.dirname = path.join(targetDirs.images, p.dirname);
      }),
    )
    .pipe(browserSync.stream());
}

export function buildSprites() {
  return gulp
    .src(sourcePaths.sprites, { encoding: false })
    .pipe(gulp.dest(targetDirs.sprites))
    .pipe(
      rename((p) => {
        p.dirname = path.join(targetDirs.sprites, p.dirname);
      }),
    )
    .pipe(browserSync.stream());
}

export function buildManifest() {
  return gulp
    .src(sourcePaths.manifest)
    .pipe(gulp.dest(versionBase))
    .pipe(
      rename((p) => {
        p.dirname = path.join(versionBase, p.dirname);
      }),
    )
    .pipe(browserSync.stream());
}

export const buildAssets = gulp.parallel(
  buildJs,
  buildCss,
  buildHtml,
  buildImages,
  buildSprites,
  buildManifest,
);

export function createSymlinks(done) {
  fse.ensureSymlinkSync(targetPaths.htmlRoot, linkTargets.htmlLink);
  fse.ensureSymlinkSync(
    targetPaths.serviceworkerRoot,
    linkTargets.serviceworkerLink,
  );
  done();
}

export const buildWithoutLinks = gulp.series(deleteBuild, buildAssets);

export const build = gulp.series(buildWithoutLinks, createSymlinks);

function reloadBrowsers(done) {
  browserSync.reload();
  done();
}

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
  gulp.watch(sourcePaths.sprites, buildSprites);
  gulp.watch(sourcePaths.scripts, gulp.series(buildJs, reloadBrowsers));
  gulp.watch(sourcePaths.css, buildCss);
});

export function getCurrent(done) {
  const releaseRepo = 'https://github.com/dwst/dwst.github.io.git';
  simpleGit()
    .clone(releaseRepo, releaseBase)
    .then(() => done())
    .catch((err) => {
      throw err;
    });
}

export function ungitCurrent() {
  return remove(path.join(releaseBase, '.git'));
}

export const getOldStuff = gulp.series(deleteRelease, getCurrent, ungitCurrent);

export function addNewStuff() {
  return gulp
    .src(path.join(buildBase, '**/*'), { encoding: false })
    .pipe(gulp.dest(releaseBase));
}

export function deleteRelease() {
  return remove(releaseBase);
}

function getStableReleases() {
  return fs
    .readdirSync(releaseBase)
    .map((name) => {
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
    })
    .filter((x) => x);
}

function compareVersions(a, b) {
  if (a.includes('-') || b.includes('-')) {
    throw new Error('Cannot compare unstable version numbers');
  }
  const [aMajor, aMinor, aPatch] = a.split('.').map((x) => parseInt(x, 10));
  const [bMajor, bMinor, bPatch] = b.split('.').map((x) => parseInt(x, 10));
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

export const buildRelease = gulp.series(
  gulp.parallel(getOldStuff, buildWithoutLinks),
  addNewStuff,
  updateReleaseSymlinks,
);

export const clean = gulp.parallel(deleteBuild, deleteRelease);

export default build;
