# Node.js path parts

This folder, except for the `README.md` file, consists of files directly copied
from the corresponding Node.js release, defined in the top-level `package.json`.

Those are used for building the `path-parse.js` file in the top directory.

No modifications are done to those files here, `builder.js` script from the top
directory does all the stuff instead.

## Updating

To update, update all `*.js` files in this dir (without modifying them
manually), update `package.json` file to specify the current Node.js version you
took those from, and run `builder.js` script from the top dir.

Make sure that `builder.js` succeeds and modify it if needed.

If `path.js` was updated — try to include tests for the new behavior.

Also make sure to update the Node.js version in `.travis.yml` test matrix.

## Version

See `version` field in the `package.json`.

## License

MIT, see `LICENSE` file.

The original for that file is located at
<https://github.com/nodejs/node/blob/master/LICENSE>, the list of
"externally maintained libraries" was excluded as those are not bundled here.
