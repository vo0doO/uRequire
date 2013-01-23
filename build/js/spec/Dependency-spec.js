// Generated by CoffeeScript 1.4.0
var Dependency, assert, chai, expect, _;

_ = require('lodash');

chai = require('chai');

assert = chai.assert;

expect = chai.expect;

Dependency = require("../code/Dependency");

describe("Dependency", function() {
  it("converts simple paths from bundleRelative to fileRelative", function() {
    var dep;
    dep = new Dependency('path/to/module', 'someRootModule.js', ['path/to/module.coffee']);
    expect(dep.name({
      relativeType: 'bundle'
    })).to.equal('path/to/module');
    return expect(dep.name({
      relativeType: 'file'
    })).to.equal('./path/to/module');
  });
  it("converts simple paths from fileRelative to bundleRelative", function() {
    var dep;
    dep = new Dependency('./path/to/module', 'someRootModule.js', ['path/to/module.coffee']);
    expect(dep.name({
      relativeType: 'bundle'
    })).to.equal('path/to/module');
    return expect(dep.name({
      relativeType: 'file'
    })).to.equal('./path/to/module');
  });
  it("split plugin, extension, resourceName & recostruct as String", function() {
    var dep;
    dep = new Dependency('node!somedir/dep.js');
    expect(dep.pluginName).to.equal('node');
    expect(dep.extname).to.equal('.js');
    expect(dep.name()).to.equal('node!somedir/dep.js');
    expect(dep.toString()).to.equal(dep.name());
    return expect(dep.name({
      plugin: false,
      ext: false
    })).to.equal('somedir/dep');
  });
  it("uses modyle & bundleFiles to convert from fileRelative to bundleRelative", function() {
    var dep;
    dep = new Dependency('../../../rootdir/dep', 'path/from/bundleroot/modyle.js', ['rootdir/dep.js']);
    expect(dep.extname).to.equal(void 0);
    expect(dep.pluginName).to.equal(void 0);
    expect(dep.name({
      relativeType: 'bundle'
    })).to.equal('rootdir/dep');
    expect(dep.name({
      relativeType: 'file'
    })).to.equal('../../../rootdir/dep');
    return expect(dep.toString()).to.equal('../../../rootdir/dep');
  });
  return it("uses modyle & bundleFiles to convert from bundleRelative to fileRelative", function() {
    var dep;
    dep = new Dependency('path/from/bundleroot/to/some/nested/module', 'path/from/bundleroot/modyle.js', ['path/from/bundleroot/to/some/nested/module.coffee']);
    expect(dep.name({
      relativeType: 'bundle'
    })).to.equal('path/from/bundleroot/to/some/nested/module');
    expect(dep.name({
      relativeType: 'file'
    })).to.equal('./to/some/nested/module');
    return expect(dep.toString()).to.equal('./to/some/nested/module');
  });
});

describe("Dependency isEquals(),", function() {
  var dep1, dep2, dep3;
  dep1 = new Dependency('../../../rootdir/dep.js', 'path/from/bundleroot/modyle.js', ['rootdir/dep.js']);
  dep2 = new Dependency('rootdir/dep', 'path/from/bundleroot/modyle.js', ['rootdir/dep.js']);
  dep3 = new Dependency('node!rootdir/dep', 'path/from/bundleroot/modyle.js', ['rootdir/dep.js']);
  it("With `Dependency` as param", function() {
    expect(dep1.isEqual(dep2)).to.be["true"];
    return expect(dep2.isEqual(dep1)).to.be["true"];
  });
  it("false when plugin differs", function() {
    return expect(dep1.isEqual(dep3)).to.be["false"];
  });
  return describe("With `String` as param", function() {
    describe(" with `bundleRelative` format ", function() {
      it("with .js extensions", function() {
        expect(dep1.isEqual('rootdir/dep.js')).to.be["true"];
        return expect(dep2.isEqual('rootdir/dep.js')).to.be["true"];
      });
      it("plugins still matter", function() {
        return expect(dep3.isEqual('node!rootdir/dep.js')).to.be["true"];
      });
      return it("without extensions", function() {
        expect(dep1.isEqual('rootdir/dep')).to.be["true"];
        expect(dep2.isEqual('rootdir/dep')).to.be["true"];
        return it("plugins still matter", function() {
          return expect(dep3.isEqual('node!rootdir/dep')).to.be["true"];
        });
      });
    });
    describe(" with `fileRelative` format ", function() {
      it("with .js extensions", function() {
        expect(dep1.isEqual('../../../rootdir/dep.js')).to.be["true"];
        return expect(dep2.isEqual('../../../rootdir/dep.js')).to.be["true"];
      });
      it("plugins still matter", function() {
        return expect(dep3.isEqual('node!../../../rootdir/dep.js')).to.be["true"];
      });
      return it("without extensions", function() {
        expect(dep1.isEqual('../../../rootdir/dep')).to.be["true"];
        expect(dep2.isEqual('../../../rootdir/dep')).to.be["true"];
        return it("plugins still matter", function() {
          return expect(dep3.isEqual('node!../../../rootdir/dep')).to.be["true"];
        });
      });
    });
    it(" with false extensions", function() {
      expect(dep1.isEqual('rootdir/dep.txt')).to.be["false"];
      return expect(dep2.isEqual('../../../rootdir/dep.txt')).to.be["false"];
    });
    return it(" looking for one in an array", function() {
      var deps;
      deps = [dep1, dep2, dep3];
      return expect(_.any(deps, function(dep) {
        return dep.isEqual('rootdir/dep.js');
      })).to.be["true"];
    });
  });
});

describe("Dependency - resolving many", function() {
  return it("resolves bundle&file relative, finds external, global, notFound, webRootMap", function() {
    var bundleFiles, bundleRelative, d, dep, deps, external, fileRelative, global, modyle, notFoundInBundle, strDependencies, webRootMap, _i, _len;
    modyle = 'actions/greet.js';
    bundleFiles = ['main.js', 'actions/greet.js', 'calc/add.js', 'calc/multiply.js', 'calc/more/powerof.js', 'data/numbers.js', 'data/messages/bye.js', 'data/messages/hello.coffee'];
    strDependencies = ['underscore', 'data/messages/hello.js', '../data/messages/bye', '../lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'];
    deps = [];
    for (_i = 0, _len = strDependencies.length; _i < _len; _i++) {
      dep = strDependencies[_i];
      deps.push(new Dependency(dep, modyle, bundleFiles));
    }
    fileRelative = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        _results.push(d.name({
          relativeType: 'file'
        }));
      }
      return _results;
    })();
    bundleRelative = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        _results.push(d.name({
          relativeType: 'bundle'
        }));
      }
      return _results;
    })();
    global = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isGlobal()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    external = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isExternal()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    notFoundInBundle = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isNotFoundInBundle()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    webRootMap = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isWebRootMap()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    console.log('\n', {
      bundleRelative: bundleRelative,
      fileRelative: fileRelative,
      global: global,
      external: external,
      notFoundInBundle: notFoundInBundle,
      webRootMap: webRootMap
    });
    return expect({
      bundleRelative: bundleRelative,
      fileRelative: fileRelative,
      global: global,
      external: external,
      notFoundInBundle: notFoundInBundle,
      webRootMap: webRootMap
    }).to.deep.equal({
      bundleRelative: ['underscore', 'data/messages/hello', 'data/messages/bye', 'lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'],
      fileRelative: ['underscore', '../data/messages/hello', '../data/messages/bye', '../lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'],
      global: ['underscore'],
      external: ['../../some/external/lib.js'],
      notFoundInBundle: ['../lame/dir.js'],
      webRootMap: ['/assets/jpuery-max']
    });
  });
});
