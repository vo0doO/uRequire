// Generated by CoffeeScript 1.4.0
var rJSON, uRequireConfig, _, _B, _fs;

_fs = require('fs');

_ = require('lodash');

_B = require('uberscore');

rJSON = function(file) {
  return JSON.parse(_fs.readFileSync(file, 'utf-8'));
};

module.exports = uRequireConfig = {
  bundle: {
    /*
        Name of the bundle {optional}
    
        @todo: `bundleName` & is the (1st) default for 'main'
        `bundleName` it self can be derived from
            - --outputPath,
              - filename part, if 'combine' is used eg if its 'abcProject/abc.js', then 'abc'
              - folder name, if other template is used eg 'build/abcProject' gives 'abcProject'
    */

    bundleName: '',
    bundlePath: '',
    /*
        Everything that matches these is not proccessed.
    
        Can be a String, a RegExp or a Fucntion(item)
        Or an array of those
    
        @example
        [ "requirejs_plugins/text.js", /^draft/, function(x){return x === 'badApple.js'}]
    */

    excludes: [],
    /*
        List of modules to include, WITH extension.
        Can A string, RegExp or a Function(item)
    
        @example ['module1.js', 'myLibs/mylib1.js']
    */

    includes: [/.*\.(coffee)$/i, /.*\.(js|javascript)$/i],
    /*
        The "main" / "index" file of your bundle.
    
        * Used as 'name' / 'include' on RequireJS build.js,
          where all dependencies (recursivelly) are added to the combined file.
    
        * Also used to as the initiation `require` on your combined bundle.
          It is the module just kicks off the app and/or requires all your other library modules.
    
        @todo : defaults are 'bundleName, 'index', 'main' etc, the first one that is found in uModules
    */

    main: (function() {
      if (this.bundleName) {
        return this.bundleName;
      } else {
        return 'main';
      }
    })(),
    /*
        Where to map `/` when running in node. On RequireJS its http-server's root.
    
        Can be absolute or relative to bundle. Defaults to bundle.
        @example "/var/www" or "/../../fakeWebRoot"
    */

    webRootMap: '.',
    dependencies: {
      /*
            Each (global) dependency has one or more variables it is exported as, eg `jquery: ["$", "jQuery"]`
      
            They can be infered from the code of course (AMD only for now), but it good to list them here also.
      
            They are used to 'fetch' the global var at runtime, eg, when `combine:'almond'` is used.
      
            In case they are missing from modules (i.e u use the 'nodejs' module format only),
            and aren't here either, 'almond' build will fail.
      
            Also you can add a different var name that should be globally looked up.
      */

      variableNames: {
        lodash: "_",
        underscore: "_",
        jquery: ["$", "jQuery"],
        backbone: "Backbone",
        knockout: ["ko", 'Knockout']
      },
      /*
            depe
            { dependency: varName(s) *}
                or
            ['dep1', 'dep2'] (with discovered or ../variableNames names
      
            Each dep will be available in the *whole bundle* under varName(s)
      
            @example {
              'underscore': '_'
              'jquery': ["$", "jQuery"]
              'models/PersonModel': ['persons', 'personsModel']
            }
            @todo: rename to exports.bundle ?
      */

      bundleExports: {}
    }
  },
  /*
  
      Build : Defines the conversion, such as *where* and *what* to output
  */

  build: {
    /*
        Output converted files onto this
    
        * directory
        * filename (if combining)
        * function @todo: NOT IMPLEMENTED
    
        #todo: if ommited, requirejs.buildjs.baseUrl is used ?
        @example 'build/code'
    */

    outputPath: '',
    /*
        Output on the same directory as bundlePath.
    
        Useful if your sources are not `real sources` eg. you use coffeescript :-).
        WARNING: -f ignores --outputPath
    */

    forceOverwriteSources: false,
    /*
          String in ['UMD', 'AMD', 'nodejs', 'combine'] @todo: or an object with those as keys + more stuff!
    */

    template: {
      name: 'UMD'
    },
    watch: false,
    /*
        ignore exports
        # @todo: NOT IMPLEMENTED.
    */

    noRootExports: false,
    noBundleExports: false,
    /*
        *Web/AMD side only option* :
    
        By default, ALL require('') deps appear on []. to prevent RequireJS to scan @ runtime.
    
        With --s you can allow `require('')` scan @ runtime, for source modules that have no [] deps (i.e. nodejs source modules).
        NOTE: modules with rootExports / noConflict() always have `scanAllow: false`
    */

    scanAllow: false,
    /*
        Pre-require all deps on node, even if they arent mapped to parameters, just like in AMD deps [].
        Preserves same loading order, but a possible slower starting up. They are cached nevertheless, so you might gain speed later.
    */

    allNodeRequires: false,
    verbose: false,
    debugLevel: 0,
    "continue": false,
    uglify: false
  },
  /*
    Runtime settings - these are used only when executing on nodejs.
    They are written out as a "uRequire.config.js" module used at runtime on the nodejs side.
    @todo: NOT IMPLEMENTED
  */

  requirejs: {
    paths: {
      src: "../../src",
      text: "requirejs_plugins/text",
      json: "requirejs_plugins/json"
    },
    baseUrl: "../code"
  },
  "build.js": {
    /*
          piggy back on this? see `appDir` in https://github.com/jrburke/r.js/blob/master/build/example.build.js
          @todo: NOT IMPLEMENTED -
    */

    appDir: "some/path/",
    paths: {
      lodash: "../../libs/lodash.min"
    },
    optimize: "none"
  }
};