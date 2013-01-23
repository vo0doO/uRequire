// Generated by CoffeeScript 1.4.0
var Dependency, Logger, ModuleGeneratorTemplates, ModuleManipulator, UModule, YADC, l, upath, _, _B,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

_B = require('uberscore');

upath = require('../paths/upath');

ModuleGeneratorTemplates = require('../templates/ModuleGeneratorTemplates');

ModuleManipulator = require("../moduleManipulation/ModuleManipulator");

Dependency = require("../Dependency");

Logger = require('../utils/Logger');

l = new Logger('UModule');

module.exports = UModule = (function() {
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
      _results.push(Object.defineProperty(UModule.prototype, n, d));
    }
    return _results;
  };

  function UModule() {
    this._constructor.apply(this, arguments);
  }

  /*
    @param {Object} bundle The Bundle where this UModule belongs
    @param {String} filename of module, eg 'models/PersonModel.coffee'
    @param {String} sourceCode, AS IS (might be coffee, coco, livescript, typescript etc)
  */


  UModule.prototype._constructor = function(bundle, filename, sourceCode) {
    this.bundle = bundle;
    this.filename = filename;
    this.sourceCode = sourceCode;
  };

  /* @return {String} the filename extension of this module, eg `.js` or `.coffee`
  */


  UModule.property({
    extname: {
      get: function() {
        return upath.extname(this.filename);
      }
      /* @return {String} filename, as read from filesystem (i.e bundleRelative) without extension eg `models/PersonModel`
      */

    }
  });

  UModule.property({
    modulePath: {
      get: function() {
        return upath.trimExt(this.filename);
      }
      /*
          Module sourceCode, AS IS (might be coffee, coco, livescript, typescript etc)
      
          Everytime it is set, if its new sourceCode it adjusts moduleInfo, resetting all deps.
      
          It does not actually convert, as it waits for instructions from the bundle
          But the module is ready to provide & alter deps information (eg add some injected Dependencies)
      */

    }
  });

  UModule.property({
    sourceCode: {
      enumerable: false,
      get: function() {
        return this._sourceCode;
      },
      set: function(src) {
        if (src !== this._sourceCode) {
          this._sourceCode = src;
          this._sourceCodeJs = false;
          return this.adjustModuleInfo();
        }
      }
    }
    /* Module source code, compiled to JavaScript if it aint already so
    */

  });

  UModule.property({
    sourceCodeJs: {
      get: function() {
        var cs;
        if (!this._sourceCodeJs) {
          if (this.extname === '.js') {
            this._sourceCodeJs = this.sourceCode;
          } else {
            if (this.extname === '.coffee') {
              l.debug(95, "Compiling coffeescript '" + this.filename + "'");
              cs = require('coffee-script');
              try {
                this._sourceCodeJs = cs.compile(this.sourceCode, {
                  bare: true
                });
              } catch (err) {
                err.uRequire = "Coffeescript compilation error:\n";
                l.err(err.uRequire, err);
                throw err;
              }
            }
          }
        }
        return this._sourceCodeJs;
      }
      /*
        Extract AMD/module information for this module.
        Factory bundleRelative deps like `require('path/dep')` are replaced with their fileRelative counterpart
        Extracted module info augments this instance.
      */

    }
  });

  UModule.prototype.adjustModuleInfo = function() {
    var d, dep, deps, moduleManipulator, pd, requireReplacements, strDep, strDepsArray, _base, _base1, _i, _len, _ref, _ref1;
    this.isConvertible = false;
    this.convertedJs = '';
    moduleManipulator = new ModuleManipulator(this.sourceCodeJs, {
      beautify: true
    });
    this.moduleInfo = moduleManipulator.extractModuleInfo();
    if (_.isEmpty(this.moduleInfo)) {
      return l.warn("Not AMD/nodejs module '" + this.filename + "', copying as-is.");
    } else if (this.moduleInfo.moduleType === 'UMD') {
      return l.warn("Already UMD module '" + this.filename + "', copying as-is.");
    } else if (this.moduleInfo.untrustedArrayDependencies) {
      return l.err("Module '" + this.filename + "', has untrusted deps " + ((function() {
        var _i, _len, _ref, _results;
        _ref = this.moduleInfo.untrustedDependencies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          d = _ref[_i];
          _results.push(d);
        }
        return _results;
      }).call(this)) + ": copying as-is.");
    } else {
      this.isConvertible = true;
      (_base = this.moduleInfo).parameters || (_base.parameters = []);
      (_base1 = this.moduleInfo).arrayDependencies || (_base1.arrayDependencies = []);
      if (_.isEmpty(this.moduleInfo.arrayDependencies)) {
        this.moduleInfo.parameters = [];
      } else {
        this.moduleInfo.parameters = this.moduleInfo.parameters.slice(0, +(this.moduleInfo.arrayDependencies.length - 1) + 1 || 9e9);
      }
      _ref = [this.moduleInfo.parameters, this.moduleInfo.arrayDependencies];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pd = _ref[_i];
        if (pd[0] === 'require') {
          pd.shift();
        }
      }
      requireReplacements = {};
      _ref1 = (function() {
        var _j, _k, _len1, _len2, _ref1, _ref2, _ref3, _results;
        _ref1 = [this.moduleInfo.arrayDependencies, this.moduleInfo.requireDependencies, this.moduleInfo.asyncDependencies];
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          strDepsArray = _ref1[_j];
          deps = [];
          _ref2 = strDepsArray || [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            strDep = _ref2[_k];
            deps.push(dep = new Dependency(strDep, this.filename, this.bundle.filenames));
            requireReplacements[strDep] = dep.name();
            if (this.bundle.reporter && (_ref3 = dep.type, __indexOf.call(this.bundle.reporter.interestingDepTypes, _ref3) >= 0)) {
              this.bundle.reporter.addReportData(_B.okv({}, dep.type, [this.filename]));
            }
          }
          _results.push(deps);
        }
        return _results;
      }).call(this), this.arrayDeps = _ref1[0], this.requireDeps = _ref1[1], this.asyncDeps = _ref1[2];
      this.moduleInfo.factoryBody = moduleManipulator.getFactoryWithReplacedRequires(requireReplacements);
      this.parameters = _.clone(this.moduleInfo.parameters);
      this.nodeDeps = _.clone(this.arrayDeps);
      _.defaults(this, this.moduleInfo);
      return this;
    }
  };

  /*
    Actually converts the module to the target @build options.
  */


  UModule.prototype.convert = function(build) {
    var bundleExports, d, depName, err, moduleTemplate, reqDep, ti, varName, varNames, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
    this.build = build;
    if (this.isConvertible) {
      l.debug(30, "**** Converting '" + this.modulePath + "' ****\n");
      if (!_.isEmpty((bundleExports = (_ref = this.bundle) != null ? (_ref1 = _ref.dependencies) != null ? _ref1.bundleExports : void 0 : void 0))) {
        l.debug(30, "" + this.modulePath + ": injecting dependencies \n", this.bundle.dependencies.bundleExports);
        for (depName in bundleExports) {
          varNames = bundleExports[depName];
          if (_.isEmpty(varNames)) {
            varNames = bundleExports[depName] = this.bundle.getDepsVars({
              depName: depName
            })[depName];
            l.debug(80, "" + this.modulePath + ": dependency '" + depName + "' had no corresponding parameters/variable names to bind with.\nAn attempt to infer varNames from bundle:", varNames);
          }
          if (_.isEmpty(varNames)) {
            err = {
              uRequire: "Error converting bundle named '" + this.bundle.bundleName + "' in '" + this.bundle.bundlePath + "'.\n\nNo variable names can be identified for bundleExports dependency '" + depName + "'.\nThese variable name are used to :\n  - inject the dependency into each module\n  - grab the dependency from the global object, when running as <script>.\n\nYou should add it at uRequireConfig 'bundle.dependencies.bundleExports' as a\n```\n  bundleExports: {\n    '" + depName + "': 'VARIABLE_IT_BINDS_WITH',\n    ...\n    jquery: ['$', 'jQuery'],\n    backbone: ['Backbone']\n  }\n```\ninstead of the simpler\n\n```\n  bundleExports: [ '" + depName + "', 'jquery', 'backbone' ]\n```\n\nAlternativelly, define at least one module that has this dependency + variable binding,\nusing AMD instead of commonJs format, and uRequire will find it!"
            };
            l.err(err.uRequire);
            throw err;
          } else {
            for (_i = 0, _len = varNames.length; _i < _len; _i++) {
              varName = varNames[_i];
              if (!(__indexOf.call(this.parameters, varName) >= 0)) {
                d = new Dependency(depName, this.filename, this.bundle.filenames);
                this.arrayDeps.push(d);
                this.nodeDeps.push(d);
                this.parameters.push(varName);
                l.debug(50, "" + this.modulePath + ": injected dependency '" + depName + "' as parameter '" + varName + "'");
              } else {
                l.debug(10, "" + this.modulePath + ": Not injecting dependency '" + depName + "' as parameter '" + varName + "' cause it already exists.");
              }
            }
          }
        }
      }
      if (!(_.isEmpty(this.arrayDeps) && ((_ref2 = this.build) != null ? _ref2.scanAllow : void 0) && !this.moduleInfo.rootExports)) {
        _ref3 = this.requireDeps;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          reqDep = _ref3[_j];
          if (reqDep.pluginName !== 'node' && !(_.any(this.arrayDeps, function(dep) {
            return dep.isEqual(reqDep);
          }))) {
            this.arrayDeps.push(reqDep);
            if ((_ref4 = this.build) != null ? _ref4.allNodeRequires : void 0) {
              this.nodeDeps.push(reqDep);
            }
          }
        }
      }
      moduleTemplate = new ModuleGeneratorTemplates(ti = this.templateInfo);
      l.verbose("Converting '" + this.modulePath + "' with template = '" + this.build.template.name + "', templateInfo = \n", _.omit(ti, ['factoryBody', 'webRootMap']));
      this.convertedJs = moduleTemplate[this.build.template.name]();
    } else {
      this.convertedJs = this.sourceCodeJs;
    }
    return this;
  };

  /*
    Returns all deps in this module along with their corresponding parameters (variable names)
    @param {Object} q optional query with two optional fields : depType & depName
    @return {Object}
          jquery: ['$', 'jQuery']
          lodash: ['_']
          'models/person': ['pm']
  */


  UModule.prototype.getDepsAndVars = function(q) {
    var dep, depsAndVars, dv, idx, _i, _len, _name, _ref, _ref1;
    if (q == null) {
      q = {};
    }
    depsAndVars = {};
    if (this.isConvertible) {
      _ref = this.arrayDeps;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        dep = _ref[idx];
        if (!(((!q.depType) || (q.depType === dep.type)) && ((!q.depName) || (dep.isEqual(q.depName))))) {
          continue;
        }
        dv = (depsAndVars[_name = dep.name({
          relativeType: 'bundle'
        })] || (depsAndVars[_name] = []));
        if (this.parameters[idx] && !(_ref1 = this.parameters[idx], __indexOf.call(dv, _ref1) >= 0)) {
          dv.push(this.parameters[idx]);
        }
      }
      return depsAndVars;
    } else {
      return {};
    }
  };

  /* for reference (we could have passed UModule instance it self :-)
  */


  UModule.property({
    templateInfo: {
      get: function() {
        var d,
          _this = this;
        return _B.go({
          moduleName: this.moduleName,
          moduleType: this.moduleType,
          modulePath: this.modulePath,
          webRootMap: this.bundle.webRootMap || '.',
          arrayDependencies: (function() {
            var _i, _len, _ref, _results;
            _ref = this.arrayDeps;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              d = _ref[_i];
              _results.push(d.name());
            }
            return _results;
          }).call(this),
          nodeDependencies: (function() {
            var _i, _len, _ref, _results;
            _ref = this.nodeDeps;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              d = _ref[_i];
              _results.push(d.name());
            }
            return _results;
          }).call(this),
          parameters: this.parameters,
          factoryBody: this.factoryBody,
          rootExports: (function() {
            var result;
            result = _this.build.noRootExports ? void 0 : _this.rootExports ? _this.rootExports : _this.rootExport;
            if (result) {
              return _B.arrayize(result);
            }
          })(),
          noConflict: this.build.noRootExports ? void 0 : this.noConflict
        }, {
          fltr: function(v) {
            return !_.isUndefined(v);
          }
        });
      }
    }
  });

  return UModule;

}).call(this);

/* Debug information
*/


if (Logger.prototype.debugLevel > 90) {
  YADC = require('YouAreDaChef').YouAreDaChef;
  YADC(UModule).before(/_constructor/, function(match, bundle, filename) {
    return l.debug("Before '" + match + "' with filename = '" + filename + "'");
  });
}
