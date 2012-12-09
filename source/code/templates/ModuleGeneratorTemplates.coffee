pathRelative = require('../paths/pathRelative')
_ = require 'lodash'
#
#  A 'simple' template for a UMD module. Based on https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
#
#  @param o {Object} with
#   {
#     modulePath: where the module is, within bundle
#     moduleName: the moduleName, if it exists.
#     moduleType: type of the original module : 'nodejs' or 'AMD'
#     type: 'define' or 'require': NOT USED
#     arrayDependencies: Array of deps, as delcared in AMD, filerelative (eg '../PersonView' for 'views/PersonView') + all `require('dep')`
#     nodeDependencies: Array for file-relative dependencies, as required by node (eg '../PersonView')
#     parameters: Array of parameter names, as declared on the original AMD.
#     rootExports: Array with names 'root' variable(s) to export on the browser side (or false/undefined)
#     noConflict: if true, inject a noConflict() method on this module, that reclaims all rootExports to their original value and returns this module.
#     factoryBody: The actual code that returns our module (define) or just runs some code having dependencies resolved (require).
#     webRootMap: path of where to map '/' when running on node, relative to bundleRoot (starting with '.'), absolute OS path otherwise.
#  }
#
# @todo: recognise define [], -> or require [], -> and adjust both node & browser UMD accordingly
# @todo: make unit tests

module.exports =

class ModuleGeneratorTemplates

  constructor: ->
    @_constructor.apply @, arguments

  _constructor: (@o)->
    @header = "// Generated by uRequire v#{'version'}"

    @moduleNamePrint = if o.moduleName then "'#{o.moduleName}', " else ""

    ### @property parameters of the factory method, eg 'require, _, personModel' ###
    @parametersPrint = """
      require#{if (o.moduleType is 'nodejs') then ', exports, module' else ''}#{
      (", #{par}" for par in o.parameters).join ''}
    """

    ### @property arrayDependencies of define [], eg "['require', 'lodash', 'PersonModel']" ###
    @arrayDependenciesPrint = """
      #{
        if _.isEmpty o.arrayDependencies
          "" #keep empty [] not existent, enabling requirejs scan
        else
          if o.moduleType is 'nodejs'
            "['require', 'module', 'exports'"
          else
            "['require'"
      }#{
        (", '#{dep}'" for dep in o.arrayDependencies).join('')
      }#{
        if _.isEmpty o.arrayDependencies then '' else '], '
      }
      """

    @bodyStart = "// uRequire: start body of original #{o.moduleType} module"
    @bodyEnd = "// uRequire: end body of original #{o.moduleType} module"


    @factoryBodyInjects = "var isWeb = (typeof define === 'function' && define.amd), isNode = !isWeb;"

    ### @property factoryBodyUMDPrint
        Includes original (with replaced require paths) + injections like isWeb, isNode etc.
    ###
    @factoryBodyUMDPrint = """
      #{@factoryBodyInjects}

      #{@bodyStart}
      #{@o.factoryBody}
      #{@bodyEnd}

      #{ if (@o.moduleType is 'nodejs') then '\nreturn module.exports;' else '' }
    """

  ### private ###
  rootExportsNoConflict: (factoryFn, rootName='root')-> """

    var m = #{factoryFn};
    #{
      if @o.noConflict
        ("#{if i is 0 then 'var ' else '    '}old_#{exp} = #{rootName}.#{exp}" for exp, i in @o.rootExports).join(',\n') + ';'
      else ''
    }

    #{("#{rootName}.#{exp} = m" for exp in @o.rootExports).join(';\n') };

    """ + (
            if @o.noConflict
              """\n
                m.noConflict = function(){
                #{("  #{rootName}.#{exp} = old_#{exp}" for exp in @o.rootExports).join(';\n')};
                  return m;
                };
              """
            else ''
          ) + "\nreturn m;"


  ### UMD template - runs AS-IS on both Web/AMD and nodejs (having 'npm install urequire').
      * Uses `NodeRequirer` to perform `require`s.
  ###
  UMD: ->"""
    #{@header}
    (function (root, factory) {
      if (typeof exports === 'object') {
        var nr = new (require('urequire').NodeRequirer) ('#{@o.modulePath}', __dirname, '#{@o.webRootMap}');
        module.exports = factory(nr.require#{
          if (@o.moduleType is 'nodejs') then ', exports, module' else ''}#{
          (", nr.require('#{nDep}')" for nDep in @o.nodeDependencies).join('')});#{
            if false # todo: NOT WORKING!
              if @o.rootExports and @o.nodejs # Adds browser/root globals for *nodejs* as well
                @rootExportsNoConflict "module.exports"
            else ''
            }
      } else if (typeof define === 'function' && define.amd) {
          define(#{@moduleNamePrint}#{@arrayDependenciesPrint}#{
              if @o.rootExports # Adds browser/root globals
                "function (#{@parametersPrint}) {\n" +
                  (@rootExportsNoConflict "factory(#{@parametersPrint})") +
                "}"
              else
                'factory'
              });
      }
    })(this, function (#{@parametersPrint}) {\n #{@factoryBodyUMDPrint} \n});
  """ # todo: root / global is NOT WORKING for nodejs like 'this' :-)
      #       maybe we need (global || window || this)

  ### AMD template
      Simple `define(['dep'], function(dep){...body...}})`
      Runs only on WEB/AMD/RequireJs (and hopefully soon in node through uRequire'd *driven* RequireJS).
  ###
  AMD: -> """
      #{@header}
      define(#{@moduleNamePrint}#{@arrayDependenciesPrint}
        function (#{@parametersPrint}) {
      """ + (
              if not @o.rootExports # 'standard' AMD format
                @factoryBodyUMDPrint
              else # ammend to export window = @o.rootExports
                @rootExportsNoConflict """
                    (function (#{@parametersPrint}) {
                         #{@factoryBodyUMDPrint}
                      }
                    )(#{@parametersPrint})
                  """, 'window' # rootName
            ) + "\n});"

  # 'combine' is based on AMD, infusing global as window in case we have rootExports/noConflict
  combine: -> """
    (function(window) {
      #{@AMD()}
    })(__global);
  """

  nodejs: -> """
      #{@header}#{
        if @o.parameters.length > 0 then "\nvar " else ''}#{
        ("#{if pi is 0 then '' else '    '}#{param} = require('#{@o.nodeDependencies[pi]}')" for param, pi in @o.parameters).join(',\n')
      };

      #{@factoryBodyInjects}

      #{@bodyStart}
      #{ if @o.moduleType is 'AMD'
          "module.exports = (function() {\n #{@o.factoryBody} })()"
        else
          @o.factoryBody
      }
      #{@bodyEnd}
    """