# path.parse() from Node.js as a standalone package

[path.parse()](https://nodejs.org/api/path.html#path_path_parse_path) from a
current Node.js version (matching this package version), packaged into a
stand-alone module, without deps (including Node.js core).

_Consider using this package through 
[compatible-path-parse](https://github.com/ChALkeR/compatible-path-parse)
wrapper to avoid unnecessary version updates and to ensure proper
deduplication, see [#semver](#semver) for explanation_.

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

Also tested for identical behavior on brute-forced strings.

## Up-to-date

Based on a recent Node.js verson.

How recent? That's easy to tell — it matches with this package version!

That also makes [testing](#tested) easier.

Also, the Node.js (and this package) version is exported through `.version`
property.

## Semver?

[Up-to-date](#up-to-date) section outlined why it was chosen to keep the Node.js
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

## License

MIT. See `LICENSE` file.
