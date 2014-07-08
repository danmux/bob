/*
Example build chain for crunching up js - compiling les
*/
module.exports = function (hub) {
    "use strict";

    // utility functions used by the actual chain returned further down
    var appbuild = {
        
        // Example of adding some context - add the live datasetid file overwriting any that is there already
        // there are other template examples 
        write_dataset:function(version, buildFolder, stamp) {
            var deffered = hub.q.defer();
            hub.tools.fs.writeFile(buildFolder + "/web/backend/datasetid.py", "DATASET_ID = 'live'", function (err) {
              deffered.resolve(err)              
            });
            return deffered.promise;
        },

        js_Build:function(version, buildFolder, stamp, disable_console) {
            var deffered = hub.q.defer();
            console.log(__dirname);

            version = version + stamp;
            // load the config from the checkedout build
            var config = require("../"+buildFolder + "/build/build.js");

            // set up the build specifics
            config.baseUrl = buildFolder + "/web/static/js/app";
            config.out     = buildFolder + "/web/static/js/app/main-built-" + version + ".js";
            console.log(config);

            // This is a horrific hack to toggle console use 
            if (disable_console) {
                console.log('Live set, disabling console log');

                var file_to_mod = config.baseUrl + '/main.js';
                // set an encoding to get a string back, not a buffer
                var file_string = hub.tools.fs.readFileSync(file_to_mod,'utf-8');
                var regexp = new RegExp('^\\s*var debug = (true|false);');
                file_string = file_string.replace(regexp, 'var debug = false;');
                hub.tools.fs.writeFileSync(file_to_mod, file_string);
                
            }

            // run the require - to compile the single js
            hub.tools.requirejs.optimize(config, function (buildResponse) {
                //buildResponse is just a text output of the modules
                //included. Load the built file for the contents
                //Use config.out to get the optimized file contents.
                deffered.resolve(buildResponse);

            }, function(err) {
                console.log(err);
                deffered.reject(err);
            });

            return deffered.promise;
        },

        // css-ify the less
        css_Build: function(version, buildFolder) {
            var root = buildFolder + "/web/static/less";
            var lesspaths = [root];
            var lessFile  = root + "/app.less";
            var outFile   = buildFolder + "/web/static/css/app.css";

            return hub.tools.lessutil.process(lessFile, outFile, lesspaths);
        },

        style_Copy: function(version, buildFolder) {
            // use live styles for stage and live
            var styleInPath = buildFolder + "/web/templates/base/include/styles.live.html";
            var styleOutPath = buildFolder + "/web/templates/base/include/styles.html";

            var fs = hub.tools.fs;

            fs.createReadStream(styleInPath).pipe(fs.createWriteStream(styleOutPath));
        },
        
        // Example usint _ templates to dick with files in the build
        // add in the version to the build latest template files
        template_Version:function(version, outpath, stamp){
            var deffered = hub.q.defer();

            var dls_ver = 'live';
            var expiration = '100d';
            if (version == 'head') {
                dls_ver = 'stage';
                expiration = '100d';           // 1 day for stage
            }

            // add any passed in stamp
            version = version + stamp;

            var vars = {
                version: version,
                dls: dls_ver,
                expiration: expiration
            };
            
            try {
                hub.tools.fs.unlinkSync(outpath);
            } catch (e) {
                hub.emit_progress(e.toString());
            }
            
            this.template = hub.tools.fs.readFileSync(outpath + ".tpl");
            hub.tools.fs.writeFile(outpath, hub.tools._.template(this.template.toString(), vars), function (err) {
                deffered.resolve(err);
            });
            
            return deffered.promise;
        },
        
        // deploy to appengine
        app_Engine_Build: function(scriptname) {
            return hub.tools.shellscript.process('../jobs/upload.sh');
        }
    };

    // here is our actual job.......
    return function (job) {

        // using promises to chain all the async stuff
        var deffered = hub.q.defer();

        var buildFolder = "../builds/latest";

        // put cache busting timestamp on the version
        var stamp = "";
        if (job.version == 'head') {
            stamp = "" + Math.round(new Date().getTime() / 1000000);
        }
        
        // this is how we send stuff back to the ui via web sockets
        hub.emit_progress("Retreiving queued job");
        return hub.tools.git.git_clean_and_update(buildFolder)
        .then(function (res) {
            // if checking out head use master to avoid ending in 
            // detached branch otherwise use the specified version
            var tag = job.version.toLowerCase();
            // make sure we don't lose casing if a tag is supplied
            tag = (tag == 'head' || tag == 'none') ? 'master' : job.version;
            hub.emit_progress('checkout: '+tag);
            return hub.tools.git.git_checkout_tag(tag, buildFolder);
        })
        
        .then(function (res) {
 
            hub.emit_progress("Finished retreiving changed files");
            hub.emit_progress("Creating dataset id...");
            return appbuild.write_dataset(job.version, buildFolder);
        })

        .then(function (res) {
 
            hub.emit_progress("Building Javascript...");
            return appbuild.js_Build(job.version, buildFolder, stamp,
                job.disable_console);
        })
        
        .then(function(res){
            hub.emit_progress("Building css...");
            return appbuild.css_Build(job.version, buildFolder);
        })

        .then(function(res){
            hub.emit_progress("copying style template css...");
            return appbuild.style_Copy(job.version, buildFolder);
        })

        .then(function(res){
            hub.emit_progress("Updating web tag list...");
            // TODO - argh another magic string
            return hub.tools.git.list_tags('git@github.com:blah/blah.git');
        })
        
        .then(function (res) {
            console.log(res);
            hub.web_tags = res;
            hub.emit_progress("Built minified Javascript");
            hub.emit_progress("Template app.yaml...");
 
            return appbuild.template_Version(job.version, buildFolder + "/web/app.yaml", "");
        })
        
        .then(function (res) {
            hub.emit_progress("Templated app.yaml - OK");
            hub.emit_progress("Template conf.py...");
 
            return appbuild.template_Version(job.version, buildFolder + "/web/config/conf.py", stamp);
        })

         .then(function (res) {
             console.log(res);
             hub.emit_progress("Uploading...");
             return appbuild.app_Engine_Build();
        
         });
    };
};
