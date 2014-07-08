"use strict";
module.exports = function(hub){
    var lessutil = {

        process: function(lessFile, outFile, lesspaths) {
            var less = require("less");

            var deffered = hub.q.defer();
            
            var less_source = hub.tools.fs.readFileSync(lessFile).toString();
            
            console.log('>>>>>>>>>>>>>>LESS source>>>>>>>>>>>>>>>>');
            
            var parser = new(less.Parser)({
                paths: lesspaths, // Specify search paths for @import directives
                filename: lessFile // Specify a filename, for better error messages
            });

            parser.parse(less_source, function (e, tree) {
                
                console.log(">>>>>>>>>>>>>>got a LESS'd tree>>>>>>>>>>>>>>>>");
                if(e) {
                    console.log(e);
                    deffered.reject(err);
                } else {
                    hub.tools.fs.writeFile(outFile, tree.toCSS({ compress: true }), function (err) {
                        if (err) {
                            deffered.reject(err);
                        } else {
                            deffered.resolve("css saved");    
                        }
                        
                    });

                    deffered.resolve("css builds");
                }
            });

            return deffered.promise;
        }

    };

    return lessutil;
}