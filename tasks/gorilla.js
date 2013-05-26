(function (GLOBAL) {
  "use strict";
  var __defer, __generatorToPromise, __import, __in, __isArray, __owns,
      __promise, __slice, __strnum, __toArray, __typeof, path, setImmediate;
  __defer = (function () {
    function __defer() {
      var deferred, isError, value;
      isError = false;
      value = null;
      deferred = [];
      function complete(newIsError, newValue) {
        var funcs;
        if (deferred) {
          funcs = deferred;
          deferred = null;
          isError = newIsError;
          value = newValue;
          if (funcs.length) {
            setImmediate(function () {
              var _end, i;
              for (i = 0, _end = funcs.length; i < _end; ++i) {
                funcs[i]();
              }
            });
          }
        }
      }
      return {
        promise: {
          then: function (onFulfilled, onRejected, allowSync) {
            var _ref, fulfill, promise, reject;
            if (allowSync !== true) {
              allowSync = void 0;
            }
            _ref = __defer();
            promise = _ref.promise;
            fulfill = _ref.fulfill;
            reject = _ref.reject;
            function step() {
              var f, result;
              try {
                if (isError) {
                  f = onRejected;
                } else {
                  f = onFulfilled;
                }
                if (typeof f === "function") {
                  result = f(value);
                  if (result && typeof result.then === "function") {
                    result.then(fulfill, reject, allowSync);
                  } else {
                    fulfill(result);
                  }
                } else {
                  (isError ? reject : fulfill)(value);
                }
              } catch (e) {
                reject(e);
              }
            }
            if (deferred) {
              deferred.push(step);
            } else if (allowSync) {
              step();
            } else {
              setImmediate(step);
            }
            return promise;
          },
          sync: function () {
            var result, state;
            state = 0;
            result = 0;
            this.then(
              function (ret) {
                state = 1;
                return result = ret;
              },
              function (err) {
                state = 2;
                return result = err;
              },
              true
            );
            switch (state) {
            case 0: throw Error("Promise did not execute synchronously");
            case 1: return result;
            case 2: throw result;
            default: throw Error("Unknown state");
            }
          }
        },
        fulfill: function (value) {
          complete(false, value);
        },
        reject: function (reason) {
          complete(true, reason);
        }
      };
    }
    __defer.fulfilled = function (value) {
      var d;
      d = __defer();
      d.fulfill(value);
      return d.promise;
    };
    __defer.rejected = function (reason) {
      var d;
      d = __defer();
      d.reject(reason);
      return d.promise;
    };
    return __defer;
  }());
  __generatorToPromise = function (generator, allowSync) {
    if (typeof generator !== "object" || generator === null) {
      throw TypeError("Expected generator to be an Object, got " + __typeof(generator));
    } else {
      if (typeof generator.send !== "function") {
        throw TypeError("Expected generator.send to be a Function, got " + __typeof(generator.send));
      }
      if (typeof generator["throw"] !== "function") {
        throw TypeError("Expected generator.throw to be a Function, got " + __typeof(generator["throw"]));
      }
    }
    if (allowSync == null) {
      allowSync = false;
    } else if (typeof allowSync !== "boolean") {
      throw TypeError("Expected allowSync to be a Boolean, got " + __typeof(allowSync));
    }
    function continuer(verb, arg) {
      var item;
      try {
        item = generator[verb](arg);
      } catch (e) {
        return __defer.rejected(e);
      }
      if (item.done) {
        return __defer.fulfilled(item.value);
      } else {
        return item.value.then(callback, errback, allowSync);
      }
    }
    function callback(value) {
      return continuer("send", value);
    }
    function errback(value) {
      return continuer("throw", value);
    }
    return callback(void 0);
  };
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
  __promise = function (value, allowSync) {
    var factory;
    if (allowSync == null) {
      allowSync = false;
    } else if (typeof allowSync !== "boolean") {
      throw TypeError("Expected allowSync to be a Boolean, got " + __typeof(allowSync));
    }
    if (typeof value === "function") {
      factory = function () {
        return __generatorToPromise(value.apply(this, arguments));
      };
      factory.sync = function () {
        return __generatorToPromise(
          value.apply(this, arguments),
          true
        ).sync();
      };
      return factory;
    } else {
      return __generatorToPromise(value, allowSync);
    }
  };
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
  setImmediate = typeof GLOBAL.setImmediate === "function" ? GLOBAL.setImmediate
    : typeof process !== "undefined" && typeof process.nextTick === "function"
    ? (function () {
      var nextTick;
      nextTick = process.nextTick;
      return function (func) {
        var args;
        if (typeof func !== "function") {
          throw TypeError("Expected func to be a Function, got " + __typeof(func));
        }
        args = __slice.call(arguments, 1);
        if (args.length) {
          return nextTick(function () {
            func.apply(void 0, __toArray(args));
          });
        } else {
          return nextTick(func);
        }
      };
    }())
    : function (func) {
      var args;
      if (typeof func !== "function") {
        throw TypeError("Expected func to be a Function, got " + __typeof(func));
      }
      args = __slice.call(arguments, 1);
      if (args.length) {
        return setTimeout(
          function () {
            func.apply(void 0, __toArray(args));
          },
          0
        );
      } else {
        return setTimeout(func, 0);
      }
    };
  /*!
   * grunt-gorilla
   * https://github.com/ckknight/grunt-gorilla
   *
   * Copyright (c) 2013 Cameron Kenneth Knight
   * Licensed under the MIT license.
   */
  path = require("path");
  module.exports = function (grunt) {
    var compile;
    grunt.registerMultiTask("gorilla", "Compile GorillaScript files into JavaScript.", function () {
      var _this, done, options, promise;
      _this = this;
      options = this.options({ bare: false, sourceMap: null, linefeed: grunt.util.linefeed });
      grunt.verbose.writeflags(options, "Options");
      done = this.async();
      promise = __generatorToPromise((function () {
        var _arr, _e, _i, _len, _send, _state, _step, _throw, file, validFiles;
        _state = 0;
        function _close() {
          _state = 5;
        }
        function _step(_received) {
          while (true) {
            switch (_state) {
            case 0:
              _arr = __toArray(_this.files);
              _i = 0;
              _len = _arr.length;
              ++_state;
            case 1:
              _state = _i < _len ? 2 : 5;
              break;
            case 2:
              file = _arr[_i];
              validFiles = removeInvalidFiles(file);
              _state = !hasExpectedExtensions(validFiles) ? 4 : 3;
              break;
            case 3:
              ++_state;
              return {
                done: false,
                value: compile(validFiles, options, file.dest)
              };
            case 4:
              ++_i;
              _state = 1;
              break;
            case 5:
              return { done: true, value: void 0 };
            default: throw Error("Unknown state: " + _state);
            }
          }
        }
        function _throw(_e) {
          _close();
          throw _e;
        }
        function _send(_received) {
          try {
            return _step(_received);
          } catch (_e) {
            _throw(_e);
          }
        }
        return {
          close: _close,
          iterator: function () {
            return this;
          },
          next: function () {
            return _send(void 0);
          },
          send: _send,
          "throw": function (_e) {
            _throw(_e);
            return _send(void 0);
          }
        };
      }()));
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
    compile = __promise(function (files, options, dest) {
      var _e, _ref, _send, _state, _step, _throw, compileOptions, destDir, e;
      _state = 0;
      function _close() {
        _state = 3;
      }
      function _step(_received) {
        while (true) {
          switch (_state) {
          case 0:
            destDir = path.dirname(dest);
            (_ref = __import({}, options)).input = files;
            _ref.output = dest;
            if (options.sourceMap) {
              _ref.sourceMap = {
                file: path.join(destDir, __strnum(path.basename(dest, path.extname(dest))) + ".js.map"),
                sourceRoot: options.sourceRoot || ""
              };
            } else {
              _ref.sourceMap = null;
            }
            compileOptions = _ref;
            ++_state;
          case 1:
            _state = 3;
            return { done: false, value: require("gorillascript").compileFile(compileOptions) };
          case 2:
            if (typeof e === "undefined" || e === null || e.line == null || e.column == null) {
              grunt.log.error("Got an unexpected exception from the gorillascript compiler. The original exception was: " + String(typeof e !== "undefined" && e !== null && e.stack || e));
            } else {
              grunt.log.error(e);
            }
            grunt.fail.warn("GorillaScript failed to compile.");
            ++_state;
          case 3:
            return { done: true, value: void 0 };
          default: throw Error("Unknown state: " + _state);
          }
        }
      }
      function _throw(_e) {
        if (_state === 1) {
          e = _e;
          _state = 2;
        } else {
          _close();
          throw _e;
        }
      }
      function _send(_received) {
        while (true) {
          try {
            return _step(_received);
          } catch (_e) {
            _throw(_e);
          }
        }
      }
      return {
        close: _close,
        iterator: function () {
          return this;
        },
        next: function () {
          return _send(void 0);
        },
        send: _send,
        "throw": function (_e) {
          _throw(_e);
          return _send(void 0);
        }
      };
    });
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
}.call(this, typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this));
