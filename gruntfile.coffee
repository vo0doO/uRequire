_fs = require 'fs'

module.exports = (grunt) ->

  sourceDir     = "source/code"
  buildDir      = "build/code"
  sourceSpecDir = "source/spec"
  buildSpecDir  = "build/spec"

  pkg = JSON.parse _fs.readFileSync './package.json', 'utf-8'

  globalBuildCode = switch process.platform
    when "win32" then "c:/Program Files/nodejs/node_modules/urequire/build/code/"
    when 'linux' then "/usr/local/lib/node_modules/urequire/build/code/"
    else ""

  globalClean = switch process.platform
    when "win32" then  "c:/Program Files/nodejs/node_modules/urequire/build/code/**/*.*"
    when 'linux' then "/usr/local/lib/node_modules/urequire/build/code/**/*.*"
    else ""

  gruntConfig =
    pkg: "<json:package.json>"

    meta:
      banner: """
      /*!
      * <%= pkg.name %> - version <%= pkg.version %>
      * Compiled on <%= grunt.template.today(\"yyyy-mm-dd\") %>
      * <%= pkg.repository.url %>
      * Copyright(c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %> (<%= pkg.author.email %> )
      * Licensed <%= pkg.licenses[0].type %> <%= pkg.licenses[0].url %>
      */
      """
      varVersion: "var version = '<%= pkg.version %>';"
      mdVersion: "# uRequire v<%= pkg.version %>"
      usrBinEnvNode: "#!/usr/bin/env node"

    options:
      sourceDir:     sourceDir
      buildDir:      buildDir
      sourceSpecDir: sourceSpecDir
      buildSpecDir:  buildSpecDir
      globalBuildCode: globalBuildCode
      globalClean: globalClean

    shell:
      coffee:
        command: "coffee -cb -o ./#{buildDir} ./#{sourceDir}"

      coffeeSpec:
        command: "coffee -cb -o ./#{buildSpecDir} ./#{sourceSpecDir}"

      coffeeWatch:
        command: "coffee -cbw -o ./build ./source"

      mocha:
        command: "mocha #{buildSpecDir} --recursive --bail --reporter spec"

      chmod: # change urequireCmd.js to executable - linux only (?mac?)
        command:  switch process.platform
          when "linux" then "chmod +x '#{globalBuildCode}urequireCmd.js'"
          else "rem" #do nothing

      dos2unix: # download from http://sourceforge.net/projects/dos2unix/files/latest/download
        command: switch process.platform
          when "win32" then "dos2unix build/code/urequireCmd.js"
          else "echo" #do nothing

      globalInstall:
        command: "npm install -g"

      doc:
        command: "codo source/code --title 'uRequire #{pkg.version} API documentation' --cautious"

      _options: # subtasks inherit _options but can override them
        failOnError: true
        stdout: true
        stderr: true

    concat:
      bin:
        src: [
          '<banner:meta.usrBinEnvNode>'
          '<banner>'
          '<banner:meta.varVersion>'
          '<%= options.buildDir %>/urequireCmd.js'
        ]
        dest:'<%= options.buildDir %>/urequireCmd.js'

      main:
        src: [
          '<banner>'
          '<banner:meta.varVersion>'
          '<%= options.buildDir %>/urequire.js'
        ]
        dest:'<%= options.buildDir %>/urequire.js'

#      md:
#        src: [
#          '<banner:meta.mdVersion>'
#          './readme.md' #how do we strip 1st line ?
#        ]
#        dest: './readme.md'

    copy:
      specResources:
        options: flatten: false
        files:                       #copy all ["source/**/*.html", "...txt" ]
          "<%= options.buildSpecDir %>/": ("#{sourceSpecDir}/**/#{ext}" for ext in [ "*.html", "*.js", "*.txt", "*.json" ])

      globalInstallTests:
        files:
          "<%= options.globalBuildCode %>": [ #dest
            "<%= options.buildDir %>/**/*.js"  #source
          ]

      uRequireExamples_node_modules: #needed by the examples, makeNodeRequire()
        files:
          "../uRequireExamples/node_modules/urequire/build/code/": [ #dest
            "<%= options.buildDir %>/**/*.js"  #source
          ]

    clean:
        files: [
          "<%= options.globalClean %>"
          "<%= options.buildDir %>/**/*.*"
          "<%= options.buildSpecDir %>/**/*.*"
          "../uRequireExamples/node_modules/urequire/build/code/"
        ]

  ### shortcuts generation ###

  # shortcut to all "shell:cmd"
  grunt.registerTask cmd, "shell:#{cmd}" for cmd of gruntConfig.shell

  # generic shortcuts
  grunt.registerTask shortCut, tasks for shortCut, tasks of {
     # basic commands
     "default": "clean build test"
     "build":   "cf concat dos2unix copy chmod" #chmod alternative "shell:globalInstall" (slower but more 'correct')
     "test":    "coffeeSpec mocha"
      # generic shortcuts
     "cf":      "shell:coffee" # there's a 'coffee' task already!
     "cfw":     "coffeeWatch"
     "c":       "clean"
     "co":      "copy" #" todo: all ?
     "b":       "build"
     "t":       "test"
  }

  grunt.initConfig gruntConfig
  grunt.loadNpmTasks 'grunt-contrib'
  grunt.loadNpmTasks 'grunt-shell' #https://npmjs.org/package/grunt-shell

  null