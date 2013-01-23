// Generated by CoffeeScript 1.4.0
var BundleBase, Dependency, Logger, l, pathRelative, upath, _, _fs;

_ = require('lodash');

_fs = require('fs');

upath = require('../paths/upath');

pathRelative = require('../paths/pathRelative');

Dependency = require('../Dependency');

Logger = require('../utils/Logger');

l = new Logger('NodeRequirer');

/*
Common functionality used at build time (Bundle) or runtime (NodeRequirer)
*/


BundleBase = (function() {
  var _this = this;

  Function.prototype.property = function(p) {
    var d, n, _results;
    _results = [];
    for (n in p) {
      d = p[n];
      _results.push(Object.defineProperty(this.prototype, n, d));
    }
    return _results;
  };

  Function.prototype.staticProperty = function(p) {
    var d, n, _results;
    _results = [];
    for (n in p) {
      d = p[n];
      _results.push(Object.defineProperty(BundleBase.prototype, n, d));
    }
    return _results;
  };

  function BundleBase() {
    this._constructor.apply(this, arguments);
  }

  BundleBase.property({
    webRoot: {
      get: function() {
        return upath.normalize("" + (this.webRootMap[0] === '.' ? this.bundlePath + '/' + this.webRootMap : this.webRootMap));
      }
    }
  });

  /*
    For a given `Dependency`, resolve *all possible* paths to the file.
  
    `resolvePaths` is respecting:
         - The `Dependency`'s own semantics, eg `webRootMap` if `dep` is relative to web root (i.e starts with `\`) and similarly for isRelative etc. See <code>Dependency</code>
         - `@relativeTo` param, which defaults to the module file calling `require` (ie. @dirname), but can be anything eg. @bundlePath.
         - `requirejs` config, if it exists in this instance of BundleBase / NodeRequirer
  
    @param {Dependency} dep The Dependency instance whose paths we are resolving.
    @param {String} relativeTo Resolve relative to this path. Default is `@dirname`, i.e the module/file that called `require`
  
    @return {Array<String>} The resolved paths of the Dependency
  */


  BundleBase.prototype.resolvePaths = function(dep, relativeTo) {
    var addit, depName, path, pathStart, paths, resPaths, _i, _len, _ref;
    if (relativeTo == null) {
      relativeTo = this.dirname;
    }
    depName = dep.name({
      plugin: false,
      ext: true
    });
    resPaths = [];
    addit = function(path) {
      return resPaths.push(upath.normalize(path));
    };
    if (dep.isFileRelative()) {
      addit(relativeTo + '/' + depName);
    } else {
      if (dep.isWebRootMap()) {
        addit(this.webRoot + depName);
      } else {
        pathStart = depName.split('/')[0];
        if ((_ref = this.getRequireJSConfig().paths) != null ? _ref[pathStart] : void 0) {
          paths = this.getRequireJSConfig().paths[pathStart];
          if (!_(paths).isArray()) {
            paths = [paths];
          }
          for (_i = 0, _len = paths.length; _i < _len; _i++) {
            path = paths[_i];
            addit(this.bundlePath + (depName.replace(pathStart, path)));
          }
        } else {
          if (dep.isRelative()) {
            addit(this.bundlePath + depName);
          } else {
            addit(depName);
            addit(this.bundlePath + depName);
          }
        }
      }
    }
    return resPaths;
  };

  return BundleBase;

}).call(this);

module.exports = BundleBase;
