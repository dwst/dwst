# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dark WebSocket Terminal (DWST): a browser-based, netcat-like terminal for talking to WebSocket servers. Pure client-side app — no backend. Hosted production build lives at https://dwst.github.io/.

Node version is pinned in `.nvmrc` (v22). Use `yarn` (not npm) — `yarn.lock` is committed and CI runs `yarn install --immutable`.

## Commands

```
yarn build            # gulp build → ./build/<version>/
yarn build:release    # gulp buildRelease → clones dwst.github.io and merges into ./release/
yarn lint             # runs lint:js, lint:css, lint:html, lint:knip, lint:format
yarn lint:js          # eslint CLI (flat config, owns its own file globs)
yarn test             # mocha via @babel/register, runs test/test.js
gulp dev              # build + browser-sync at ./build with live reload on file change
```

Tests live next to source in `**/test/test.js` files and are aggregated up the tree:
`test/test.js` → `dwst/test/test.js` → `dwst/scripts/test/test.js` → each module's `test/test.js`. To add tests for a new module, add a `test/test.js` to that module and require it from the parent aggregator. There is no single-test runner — `yarn test` runs the whole tree.

`VERSION` is read at build time from `git describe --tags` (must match `v*`). Builds will fail in a shallow clone or a repo with no `v*` tag; CI uses `fetch-depth: 0` for this reason.

## Project philosophy (load-bearing)

Three principles shape almost every design choice in this repo. Internalize them before changing anything:

1. **Zero runtime dependencies.** `package.json`'s `"dependencies": {}` is intentionally empty. The shipped app contains no third-party JavaScript. Everything in `node_modules/` is `devDependencies` for the build.
2. **The source is authored in standard browser languages and runs unbuilt in a sufficiently modern browser.** Opening `dwst/dwst.html` directly should produce a working app in (at minimum) the newest Chrome/Firefox. That's why the source uses `<script type="module">`, every `import` is a relative path with an explicit `.js` extension, and CSS uses native `@import`. No JSX, TypeScript, SCSS, or other compile-to-run languages.
3. **The build is an optimization+coverage layer, not a prerequisite.** Webpack/babel/postcss exist to bundle for production and to *shim coverage gaps* — autoprefixer, postcss-color-hex-alpha, and `@babel/preset-env` (keyed to browserslist) all transform standard code into more-compatible standard code. Some not-yet-universal CSS features are also accepted as degrading gracefully (see `.stylelintrc`'s `plugin/no-unsupported-browser-features` ignore list: `css-masks`, `css-hyphens`, `multicolumn`). The bright line: **transforming standard code into more-compatible standard code is fine; authoring in a non-standard language that requires compilation is not.**

Practical consequences when working in this repo: don't add to `dependencies`; don't introduce file formats that need compilation; always use explicit `.js` extensions in imports (bundlers tolerate looser forms, native modules don't); the "god-object passed through constructors" wiring pattern exists because adding a DI/event-bus library would violate principle 1.

## Architecture

Entry point `dwst/scripts/dwst.js` constructs a single sealed `dwst` object with three composed subsystems and two namespaces:

```
dwst = { model, ui, controller, types, lib }
```

Each subsystem receives the whole `dwst` reference in its constructor and reaches across via `this._dwst.<other>.<thing>`. This is the project's primary wiring pattern — there is no DI container, no event bus. When adding cross-cutting behavior, follow the same pattern rather than introducing new wiring.

- **`model/`** — state only (history, variables, plugins registry, connection state, help content, config). No DOM, no sockets.
- **`controller/`** — orchestration. Each handler (`connection.js`, `socket.js`, `prompt.js`, `template.js`, `plugins.js`, `functions.js`, etc.) mediates between model, ui, and side-effecting APIs (WebSocket, browser).
- **`ui/`** — DOM. `ui.js` instantiates components in `ui/components/` (terminal, prompt, screen, buttons) and renderers in `ui/renderers/` (mlog, gfx, log_entry). Each component is `init(element)`-ed against a `js-*` id from `dwst/dwst.html` on `DOMContentLoaded`.
- **`types/`** — value/error types: `abstract/` (base classes incl. `DwstError`, `DwstFunction`), `errors/`, `m/` (message types), `util/` (incl. `parsee` for parser state).
- **`lib/`** — pure helpers: `parser.js` (template expression parser), `control.js`, `utils.js`.

### Plugin system (slash commands)

User-typed lines like `/send hello` or `/connect ws://…` dispatch to plugin classes in `dwst/scripts/plugins/` (one per command: `send`, `connect`, `disconnect`, `spam`, `interval`, `set`, `unset`, `vars`, `binary`, `clear`, `forget`, `help`, `pwa`, `reset`, `splash`). Each exports a class with `commands()` (aliases — `send` registers `['send', 's', '']` so a bare prompt also sends), `usage()`, `examples()`, `info()`, and `run(...)`. Register a new plugin by importing it and adding it to the array in `controller/plugins.js`; the controller passes the list to `model.plugins.setPlugins()` at startup.

### Template system

Send commands accept template expressions (e.g. `/send hello\r\n${time()}`). `controller/template.js` evaluates parsed particles — `text`, `byte`, `codepoint`, `variable`, `function` — using `lib/parser.js` for parsing and `model/variables.js` for variable/function lookup. Functions live in `dwst/scripts/functions/` (`byte_range`, `char_range`, `file`, `random_bytes`, `random_chars`, `time`) and are registered through `controller/functions.js` analogously to plugins.

### Errors

Throw subclasses of `DwstError` (`types/errors/`). `dwst.js` installs a global `error` listener that catches `DwstError`s and routes them to `controller.error.onDwstError` for display in the terminal — uncaught `DwstError`s become user-visible messages, not console noise. Don't catch them at the call site unless you have a specific reason.

## Build pipeline

`gulpfile.babel.js` is the single source of truth. It bundles app JS and the service worker through webpack+babel into `build/<version>/scripts/`, runs CSS through postcss (`postcss-import`, `postcss-sprites`, `colorHexAlpha`, `autoprefixer`, `discardComments`) into `build/<version>/styles/`, rewrites the HTML `<base href>` to the versioned path, and symlinks `build/index.html` and `build/service_worker.js` to the versioned files. Sprites are generated from `dwst/sprites/*.png`.

`buildRelease` clones the live `dwst.github.io` repo into `./release/`, overlays the new version, and updates `release/index.html` / `release/service_worker.js` symlinks to point at the highest stable `2.x.y` directory found there. Multiple versions coexist in the release tree on purpose — the pipeline is additive only, with no path that removes or deprecates an old version directory. Every release ever published remains permanently reachable at `dwst.github.io/<version>/`; there is no takedown/GC step, which is relevant if a security issue affects historical builds.

## PWA / offline

DWST is a PWA designed to work offline. `dwst/manifest.json` makes it installable; `dwst/scripts/service_worker.js` is registered from `dwst.js` on `window.load`. The service worker uses a **cache-first strategy with a `VERSION`-keyed cache**: on `install` it pre-caches a hardcoded `staticAssets` list (CSS, JS bundle, sprite, all icons, manifest) plus `/`; on `fetch` it returns the cached response if matched, else falls through to network; on `activate` it deletes every cache whose key isn't the current `VERSION`. Google Analytics is explicitly skipped. `beforeinstallprompt` is intercepted and stashed; the user explicitly fires it later via the `/pwa install` slash command.

Offline here means **the UI works without network** — the WebSocket connections themselves obviously still need reach to the target server (`ws://localhost:…` works on a plane, `wss://example.com/…` doesn't). Two practical gotchas:

- **Adding a new top-level static asset** (new icon size, new CSS entry, etc.) requires adding it to the `staticAssets` array in `service_worker.js`. Otherwise the asset loads online but is silently absent offline.
- The cache is `VERSION`-keyed, so each released `dwst.github.io/<version>/` URL maintains its own independent cache, and a fresh build only evicts the old cache once `VERSION` changes and the new SW activates.

## CSS documentation (orphaned)

`dwst/styles/*.css` contain KSS-style doc blocks (`markup:`, modifier lists, `Styleguide 2.4` footers) and `overview.md` is their index page. These were rendered by **sc5-styleguide**, which was removed in commit `e0b7c45` ("Eliminate SC5 styleguide generator") because it had gone years without bug fixes or security updates. Nothing currently renders them — the blocks are kept in place pending a replacement, most likely **Storybook**. Don't strip these as dead comments; treat them as authoritative component documentation and follow the same convention when adding components.

## Conventions worth knowing

- `eslint.config.mjs` (flat config, eslint 9) is strict — notable bans include `switch` statements (`no-restricted-syntax`), `no-bitwise`, `no-ternary`, `no-await-in-loop`, `no-console`, `no-undefined`, and `no-negated-condition`. Preferring `Reflect.apply` etc. is still the convention, but is no longer machine-enforced: the `prefer-reflect` rule was removed in eslint 9.
- License is CC0-1.0; source files carry the standard CC0 header block. New files in `dwst/scripts/` follow the same header.
- Each subsystem class receives `dwst` in its constructor. Don't store sub-references at construction time (`this._socket = dwst.model.connection.socket`) — those can be null/replaced; reach through `this._dwst` each time.
