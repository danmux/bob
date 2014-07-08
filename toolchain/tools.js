"use strict";
module.exports = function (jobHub) {

    var tools = {                                                  // register all your tools here

        git         : require("./tools/git.js")(jobHub),        // our - wrapper to interact with git
        requirejs   : require("requirejs"),                     // lib - tool to compile our js
        fs          : require("fs"),                            // lib - file system to delete files n shit - toolchain
        spawn       : require('child_process').spawn,           // lib - interop
        _           : require("underscore"),                    // templating with underscore
        lessutil    : require("./tools/lessutil.js")(jobHub),   // for compiling our css
        shellscript : require("./tools/shellscript.js")(jobHub),// for running shell scripts
    }

    tools._.templateSettings = {                              // alter the templates to use {{}} like python
        interpolate: /\{\{(.+?)\}\}/g
    };

    return tools;
};