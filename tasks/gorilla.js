(function () {
  "use strict";
  var __in, __isArray, __lte, __num, __owns, __slice, __strnum, __toArray,
      __toPromise, __typeof, fs, path;
  __in = typeof Array.prototype.indexOf === "function"
    ? (function (indexOf) {
      return function (child, parent) {
        return indexOf.call(parent, child) !== -1;
      };
    }(Array.prototype.indexOf))
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
    : (function (_toString) {
      return function (x) {
        return _toString.call(x) === "[object Array]";
      };
    }(Object.prototype.toString));
  __lte = function (x, y) {
    var type;
    type = typeof x;
    if (type !== "number" && type !== "string") {
      throw new TypeError("Cannot compare a non-number/string: " + type);
    } else if (type !== typeof y) {
      throw new TypeError("Cannot compare elements of different types: " + type + " vs " + typeof y);
    } else {
      return x <= y;
    }
  };
  __num = function (num) {
    if (typeof num !== "number") {
      throw new TypeError("Expected a number, got " + __typeof(num));
    } else {
      return num;
    }
  };
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
      throw new TypeError("Expected a string or number, got " + __typeof(strnum));
    }
  };
  __toArray = function (x) {
    if (x == null) {
      throw new TypeError("Expected an object, got " + __typeof(x));
    } else if (__isArray(x)) {
      return x;
    } else if (typeof x === "string") {
      return x.split("");
    } else if (typeof x.length === "number") {
      return __slice.call(x);
    } else {
      throw new TypeError("Expected an object with a length property, got " + __typeof(x));
    }
  };
  __toPromise = function (func, context, args) {
    if (typeof func !== "function") {
      throw new TypeError("Expected func to be a Function, got " + __typeof(func));
    }
    return new Promise(function (fulfill, reject) {
      return func.apply(context, __toArray(args).concat([
        function (err, value) {
          if (err != null) {
            reject(err);
          } else {
            fulfill(value);
          }
        }
      ]));
    });
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
  fs = require("fs");
  module.exports = function (grunt) {
    var hasExpectedExtensions;
    grunt.registerMultiTask("gorilla", "Compile GorillaScript files into JavaScript.", function () {
      var _this, done, options, promise, verbose;
      _this = this;
      options = this.options({
        bare: false,
        sourceMap: null,
        linefeed: grunt.util.linefeed,
        encoding: grunt.file.defaultEncoding,
        verbose: false,
        overwrite: false,
        coverage: false
      });
      grunt.verbose.writeflags(options, "Options");
      verbose = grunt.option("verbose") || options.verbose;
      done = this.async();
      promise = ((async function () {
        var _arr, _i, _len, _ref, file, k, maxNameLength, name, numCompiled,
            progressCounts, progressTotals, startTime, v, validFiles;
        await require("gorillascript-community").init();
        maxNameLength = calculateMaxNameLength(_this.files);
        startTime = Date.now();
        if (verbose) {
          grunt.log.write(grunt.util.repeat(maxNameLength, " "));
          grunt.log.writeln("     parse     macro     reduce    translate compile |   total");
        }
        progressTotals = {};
        numCompiled = 0;
        for (_arr = __toArray(_this.files), _i = 0, _len = _arr.length; _i < _len; ++_i) {
          file = _arr[_i];
          validFiles = removeInvalidFiles(file);
          if (!hasExpectedExtensions(validFiles)) {
            continue;
          }
          if (validFiles.length === 0) {
            continue;
          }
          if (options.overwrite || (await needsCompiling(validFiles, file.dest))) {
            ++numCompiled;
            progressCounts = (await compile(
              validFiles,
              options,
              file.dest,
              maxNameLength,
              verbose
            ));
            if (verbose) {
              for (k in progressCounts) {
                if (__owns.call(progressCounts, k)) {
                  v = progressCounts[k];
                  if ((_ref = progressTotals[k]) == null) {
                    progressTotals[k] = 0;
                  }
                  progressTotals[k] = __num(progressTotals[k]) + __num(v);
                }
              }
            }
          } else if (verbose) {
            grunt.log.writeln(__strnum(validFiles.join(", ")) + ": Skipping");
          } else {
            grunt.log.writeln("Skipping " + __strnum(validFiles.join(", ")));
          }
        }
        if (verbose && numCompiled > 1) {
          grunt.log.write(grunt.util.repeat(__num(maxNameLength) + 53, "-"));
          grunt.log.writeln("+----------");
          grunt.log.write(grunt.util.repeat(__num(maxNameLength) + 2, " "));
          for (_arr = [
            "parse",
            "macroExpand",
            "reduce",
            "translate",
            "compile"
          ], _i = 0, _len = _arr.length; _i < _len; ++_i) {
            name = _arr[_i];
            grunt.log.write(" ");
            grunt.log.write(padLeft(9, (__num(progressTotals[name]) / 1000).toFixed(3) + " s"));
          }
          grunt.log.write(" | ");
          return grunt.log.writeln(padLeft(9, ((Date.now() - startTime) / 1000).toFixed(3) + " s"));
        }
      })());
      promise.then(
        function () {
          return done();
        },
        function (e) {
          grunt.log.error("Got an unexpected exception: " + String(e != null && e.stack || e));
          return done(false);
        }
      );
    });
    async function needsCompiling(inputs, output) {
      var _arr, _arr2, _i, _len, gorillaMtimeP, input, inputStatP, inputStatsP,
          outputStat, outputStatP;
      _arr = [];
      for (_arr2 = __toArray(inputs), _i = 0, _len = _arr2.length; _i < _len; ++_i) {
        input = _arr2[_i];
        _arr.push(__toPromise(fs.stat, fs, [input]));
      }
      inputStatsP = _arr;
      outputStatP = __toPromise(fs.stat, fs, [output]);
      gorillaMtimeP = require("gorillascript-community").getMtime();
      try {
        outputStat = (await outputStatP);
      } catch (_err) {
        return true;
      }
      if (!__lte((await gorillaMtimeP).getTime(), (await outputStatP).mtime.getTime())) {
        return true;
      }
      for (_i = 0, _len = inputStatsP.length; _i < _len; ++_i) {
        inputStatP = inputStatsP[_i];
        if (!__lte((await inputStatP).mtime.getTime(), (await outputStatP).mtime.getTime())) {
          return true;
        }
      }
      return false;
    }
    function calculateMaxNameLength(fileses) {
      var _arr, _arr2, _i, _i2, _len, _len2, _ref, file, files, maxNameLength;
      maxNameLength = 0;
      for (_arr = __toArray(fileses), _i = 0, _len = _arr.length; _i < _len; ++_i) {
        files = _arr[_i];
        for (_arr2 = __toArray(files.src), _i2 = 0, _len2 = _arr2.length; _i2 < _len2; ++_i2) {
          file = _arr2[_i2];
          if (maxNameLength < __num(_ref = file.length)) {
            maxNameLength = _ref;
          }
        }
      }
      return maxNameLength;
    }
    function removeInvalidFiles(files) {
      var _arr, _arr2, _i, _len, filepath;
      _arr = [];
      for (_arr2 = __toArray(files.src), _i = 0, _len = _arr2.length; _i < _len; ++_i) {
        filepath = _arr2[_i];
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn("Source file '" + __strnum(filepath) + "' not found.");
        } else {
          _arr.push(filepath);
        }
      }
      return _arr;
    }
    function padRight(desiredLength, text) {
      if (typeof desiredLength !== "number") {
        throw new TypeError("Expected desiredLength to be a Number, got " + __typeof(desiredLength));
      }
      if (typeof text !== "string") {
        throw new TypeError("Expected text to be a String, got " + __typeof(text));
      }
      if (text.length < desiredLength) {
        return text + __strnum(grunt.util.repeat(desiredLength - text.length, " "));
      } else {
        return text;
      }
    }
    function padLeft(desiredLength, text) {
      if (typeof desiredLength !== "number") {
        throw new TypeError("Expected desiredLength to be a Number, got " + __typeof(desiredLength));
      }
      if (typeof text !== "string") {
        throw new TypeError("Expected text to be a String, got " + __typeof(text));
      }
      if (text.length < desiredLength) {
        return __strnum(grunt.util.repeat(desiredLength - text.length, " ")) + text;
      } else {
        return text;
      }
    }
    async function compile(files, options, dest, maxNameLength, verbose) {
      var _ref, compileOptions, destDir, gorilla, numSpaces, progressCounts,
          startTime;
      destDir = path.dirname(dest);
      compileOptions = {
        input: files,
        output: dest,
        encoding: options.encoding,
        linefeed: options.linefeed,
        bare: options.bare,
        coverage: options.coverage,
        sourceMap: options.sourceMap
          ? {
            file: path.join(destDir, __strnum(path.basename(dest, path.extname(dest))) + ".js.map"),
            sourceRoot: options.sourceRoot || ""
          }
          : null
      };
      gorilla = require("gorillascript-community");
      await gorilla.init();
      startTime = Date.now();
      progressCounts = {};
      if (!verbose) {
        grunt.log.write("Compiling " + __strnum(files.join(", ")) + " ...");
      } else {
        if (__num(files.length) > 1) {
          grunt.log.write(files.join(", "));
          grunt.log.writeln(": ");
          grunt.log.write(grunt.util.repeat(__num(maxNameLength) + 2, " "));
        } else {
          grunt.log.write(padRight(__num(maxNameLength) + 1, __strnum(files[0]) + ":"));
          grunt.log.write(" ");
        }
        compileOptions.progress = function (name, time) {
          grunt.log.write(" ");
          grunt.log.write(padLeft(9, (__num(time) / 1000).toFixed(3) + " s"));
          return progressCounts[name] = time;
        };
      }
      try {
        await gorilla.compileFile(compileOptions);
      } catch (e) {
        grunt.log.writeln();
        if (typeof e === "undefined" || e === null || e.line == null || e.column == null) {
          grunt.log.error("Got an unexpected exception from the gorillascript compiler. The original exception was: " + String(typeof e !== "undefined" && e !== null && e.stack || e));
        } else {
          grunt.log.error(e);
        }
        grunt.fail.warn("GorillaScript failed to compile.");
      }
      if (!verbose) {
        if ((_ref = __num(maxNameLength) - __num(files.join(", ").length)) < 60) {
          numSpaces = _ref;
        } else {
          numSpaces = 60;
        }
        if (numSpaces > 0) {
          grunt.log.write(grunt.util.repeat(numSpaces, " "));
        }
        grunt.log.write(" ");
      } else {
        grunt.log.write(" | ");
      }
      grunt.log.writeln(padLeft(9, ((Date.now() - startTime) / 1000).toFixed(3) + " s"));
      return progressCounts;
    }
    return hasExpectedExtensions = function (files) {
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
    };
  };
}.call(this));
