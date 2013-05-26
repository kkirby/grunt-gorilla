(function () {
  "use strict";
  var __import, __in, __isArray, __owns, __slice, __strnum, __toArray, __typeof,
      path;
  __import = function (dest, source) {
    var k;
    for (k in source) {
      if (__owns.call(source, k)) {
        dest[k] = source[k];
      }
    }
    return dest;
  };
  __in = typeof Array.prototype.indexOf === "function"
    ? (function () {
      var indexOf;
      indexOf = Array.prototype.indexOf;
      return function (child, parent) {
        return indexOf.call(parent, child) !== -1;
      };
    }())
    : function (child, parent) {
      var i, len;
      len = +parent.length;
      i = -1;
      while (++i < len) {
        if (child === parent[i] && i in parent) {
          return true;
        }
      }
      return false;
    };
  __isArray = typeof Array.isArray === "function" ? Array.isArray
    : (function () {
      var _toString;
      _toString = Object.prototype.toString;
      return function (x) {
        return _toString.call(x) === "[object Array]";
      };
    }());
  __owns = Object.prototype.hasOwnProperty;
  __slice = Array.prototype.slice;
  __strnum = function (strnum) {
    var type;
    type = typeof strnum;
    if (type === "string") {
      return strnum;
    } else if (type === "number") {
      return String(strnum);
    } else {
      throw TypeError("Expected a string or number, got " + __typeof(strnum));
    }
  };
  __toArray = function (x) {
    if (x == null) {
      throw TypeError("Expected an object, got " + __typeof(x));
    } else if (__isArray(x)) {
      return x;
    } else if (typeof x === "string") {
      return x.split("");
    } else {
      return __slice.call(x);
    }
  };
  __typeof = (function () {
    var _toString;
    _toString = Object.prototype.toString;
    return function (o) {
      if (o === void 0) {
        return "Undefined";
      } else if (o === null) {
        return "Null";
      } else {
        return o.constructor && o.constructor.name || _toString.call(o).slice(8, -1);
      }
    };
  }());
  /*!
   * grunt-gorilla
   * https://github.com/ckknight/grunt-gorilla
   *
   * Copyright (c) 2013 Cameron Kenneth Knight
   * Licensed under the MIT license.
   */
  path = require("path");
  module.exports = function (grunt) {
    grunt.registerMultiTask("gorilla", "Compile GorillaScript files into JavaScript.", function () {
      var _arr, _i, _len, file, options, validFiles;
      options = this.options({ bare: false, sourcemap: false, linefeed: grunt.util.linefeed });
      grunt.verbose.writeflags(options, "Options");
      for (_arr = __toArray(this.files), _i = 0, _len = _arr.length; _i < _len; ++_i) {
        file = _arr[_i];
        validFiles = removeInvalidFiles(file);
        if (!hasExpectedExtensions(validFiles)) {
          continue;
        }
        compileWithMaps(validFiles, options, file.dest);
      }
    });
    function removeInvalidFiles(files) {
      var _arr, _arr2, _i, _len, filepath;
      for (_arr = [], _arr2 = __toArray(files.src), _i = 0, _len = _arr2.length; _i < _len; ++_i) {
        filepath = _arr2[_i];
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn("Source file '" + __strnum(filepath) + "' not found.");
        } else {
          _arr.push(filepath);
        }
      }
      return _arr;
    }
    function createOutputPaths(dest) {
      var filename;
      filename = path.basename(dest, path.extname(dest));
      return { dest: dest, destName: filename, destDir: path.dirname(dest), mapFilename: __strnum(filename) + ".js.map" };
    }
    function compileWithMaps(files, options, dest) {
      var _ref, paths;
      paths = createOutputPaths(dest);
      try {
        return require("gorillascript").compileFileSync(((_ref = __import({}, options)).input = files, _ref.output = paths.dest, options.sourceMap
          ? (_ref.sourceMap = {
            file: path.join(paths.destDir, paths.mapFilename),
            sourceRoot: options.sourceRoot || ""
          })
          : (_ref.sourceMap = null), _ref));
      } catch (e) {
        if (typeof e === "undefined" || e === null || e.line == null || e.column == null) {
          grunt.log.error("Got an unexpected exception from the gorillascript compiler. The original exception was: " + String(typeof e !== "undefined" && e !== null && e.stack || e));
        } else {
          grunt.log.error(e);
        }
        return grunt.fail.warn("GorillaScript failed to compile.");
      }
    }
    function hasExpectedExtensions(files) {
      var _arr, _i, _len, badExtensions, ext, file;
      badExtensions = [];
      for (_arr = __toArray(files), _i = 0, _len = _arr.length; _i < _len; ++_i) {
        file = _arr[_i];
        ext = path.extname(file);
        if (ext !== ".gs" && !__in(ext, badExtensions)) {
          badExtensions.push(ext);
        }
      }
      if (badExtensions.length) {
        grunt.fail.warn("Expected to only work with .gs files (found " + __strnum(extensions.join(", ")) + ").");
        return false;
      } else {
        return true;
      }
    }
    return hasExpectedExtensions;
  };
}.call(this));
