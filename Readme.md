# path.parse() from Node.js as a standalone package

[![npm](https://img.shields.io/npm/v/packaged-path-parse.svg)](https://www.npmjs.com/package/packaged-path-parse)
[![Build Status](https://travis-ci.org/ChALkeR/packaged-path-parse.svg?branch=master)](https://travis-ci.org/ChALkeR/packaged-path-parse)

[path.parse()](https://nodejs.org/api/path.html#path_path_parse_path) from a
current Node.js version (matching this package version), packaged into a
stand-alone module, without deps (including Node.js core).

_Consider using this package through 
[compatible-path-parse](https://github.com/ChALkeR/compatible-path-parse)
wrapper to avoid unnecessary version updates and to ensure proper
deduplication, see [semver section](#semver) for explanation_.

## usage

```js
// Note: use compatible-path-parse wrapper instead in require
const pathParse = require('packaged-path-parse')
pathParse(path) // platform-dependant, default — posix
pathParse.posix(path) // posix
pathParse.win32(path) // win32
```

## path.parse() from Node.js

Documented in
[Node.js Documentation](https://nodejs.org/api/path.html#path_path_parse_path).

## Clean

No deps on any modules, including Node.js core modules.

ES3-compatible. Single file.

Can be run in browser environment natively.

## Ponyfill

This module fits all definitions of being a [ponyfill](https://ponyfill.com).

## Fast

Uses the new code from Node.js that avoids using regexes — there is not a single
regex present here.

That was done mainly for performance reasons in Node.js, and path parsing became
faster.

## Tested

Tested to have the exact same behavior as the corresponding Node.js version
`path.parse()`. Tests are generated from Node.js code automatically, based on
strings present in Node.js path tests, and validated on any version.

The test matrix on Travis starts with Node.js 0.8.6 — the lowest one that has
pre-built Linux binaries that `nvm` can install.

Also tested for identical behavior on brute-forced strings on the exact same
version that the code was taken from.

## Up-to-date

Based on a recent Node.js verson.

How recent? That's easy to tell — it matches with this package version!

That also makes [testing](#tested) easier.

Also, the Node.js (and this package) version is mentioned on the very first line
of the library js file (`index.js`).

## Semver?

[Up-to-date section](#up-to-date) outlined why it was chosen to keep the Node.js
package version numbering for this package — to provide clear understanding of
the Node.js version used as the source, and to give predictable behavior.

Because of that while `packaged-path-parse` conforms to semver requirements,
it bumps versions more often than it should be done. But there is
[a fix](https://github.com/ChALkeR/compatible-path-parse) for that!

The version of `packaged-path-parse` is mirrored from Node.js version, and not
all semver-major changes in Node.js must be semver-major changes in
`path.parse`, as well as not all `semver-minor` changes in Node.js are
`semver-minor` changes in `path.parse`.

All `semver-major` changes in `path.parse` are `semver-major` in Node.js, and
all `semver-minor` changes in `path.parse` are `semver-minor` in Node.js, so you
will never miss those.

It is recommended to use
[compatible-path-parse](https://github.com/ChALkeR/compatible-path-parse)
instead, which is a wrapper around this module that takes care of not bumping
major/minor versions when `path.parse` was not affected by those — that way you
and your users will get important updates faster, and that will better
de-duplicate the code in case of several packages using this one.

## Is this compatible to `path-parse` npm package?

[path-parse](https://www.npmjs.com/package/path-parse) package looks
unmaintained and uses the old Node.js code that did the parsing using regexes.

The [tests](https://github.com/jbgutierrez/path-parse/blob/0f85a34/test.js) from
`path-parse` module pass on `packaged-path-parse` with the exception of the
exact `TypeError` error message texts — those were changed in Node.js over time.

## License

MIT. See `LICENSE` file.
