const pathParse = (function(){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';


const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;
const CHAR_QUESTION_MARK = 63;

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('ERR_INVALID_ARG_TYPE', 'path', 'string');
  }
}

function isPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}

function isWindowsDeviceRoot(code) {
  return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z ||
         code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
}

const win32 = function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
      return ret;

    var len = path.length;
    var rootEnd = 0;
    let code = path.charCodeAt(0);

    // Try to match a root
    if (len > 1) {
      if (isPathSeparator(code)) {
        // Possible UNC root

        rootEnd = 1;
        if (isPathSeparator(path.charCodeAt(1))) {
          // Matched double path separator at beginning
          var j = 2;
          var last = j;
          // Match 1 or more non-path separators
          for (; j < len; ++j) {
            if (isPathSeparator(path.charCodeAt(j)))
              break;
          }
          if (j < len && j !== last) {
            // Matched!
            last = j;
            // Match 1 or more path separators
            for (; j < len; ++j) {
              if (!isPathSeparator(path.charCodeAt(j)))
                break;
            }
            if (j < len && j !== last) {
              // Matched!
              last = j;
              // Match 1 or more non-path separators
              for (; j < len; ++j) {
                if (isPathSeparator(path.charCodeAt(j)))
                  break;
              }
              if (j === len) {
                // We matched a UNC root only

                rootEnd = j;
              } else if (j !== last) {
                // We matched a UNC root with leftovers

                rootEnd = j + 1;
              }
            }
          }
        }
      } else if (isWindowsDeviceRoot(code)) {
        // Possible device root

        if (path.charCodeAt(1) === CHAR_COLON) {
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              if (len === 3) {
                // `path` contains just a drive root, exit early to avoid
                // unnecessary work
                ret.root = ret.dir = path;
                return ret;
              }
              rootEnd = 3;
            }
          } else {
            // `path` contains just a drive root, exit early to avoid
            // unnecessary work
            ret.root = ret.dir = path;
            return ret;
          }
        }
      }
    } else if (isPathSeparator(code)) {
      // `path` contains just a path separator, exit early to avoid
      // unnecessary work
      ret.root = ret.dir = path;
      return ret;
    }

    if (rootEnd > 0)
      ret.root = path.slice(0, rootEnd);

    var startDot = -1;
    var startPart = rootEnd;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= rootEnd; --i) {
      code = path.charCodeAt(i);
      if (isPathSeparator(code)) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      if (end !== -1) {
        ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      ret.name = path.slice(startPart, startDot);
      ret.base = path.slice(startPart, end);
      ret.ext = path.slice(startDot, end);
    }

    // If the directory is the root, use the entire root as the `dir` including
    // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
    // trailing slash (`C:\abc\def` -> `C:\abc`).
    if (startPart > 0 && startPart !== rootEnd)
      ret.dir = path.slice(0, startPart - 1);
    else
      ret.dir = ret.root;

    return ret;
  };
const posix = function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
      return ret;
    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      const code = path.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === CHAR_DOT) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute)
          ret.base = ret.name = path.slice(1, end);
        else
          ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = '/';

    return ret;
  };
const proc = typeof process === 'undefined' ? {} : process;
const pathParse = (proc.platform === 'win32') ? win32 : posix;
pathParse.win32 = win32;
pathParse.posix = posix;
pathParse.version = 'v9.11.1';
return pathParse;
}());
if (typeof module !== 'undefined') module.exports = pathParse;
