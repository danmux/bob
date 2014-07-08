
module.exports = function(hub){
    "use strict";
    var shellscript = {

        process: function(scriptname) {
            var deffered = hub.q.defer();
            console.log(__dirname);

            var script = hub.tools.spawn(scriptname);
              
            script.stdout.on('data', function (data) {
                hub.emit_progress(data.toString());
                console.log(data.toString());
            });
            script.stderr.on('data', function (data) {
                hub.emit_progress(data.toString());
            });
            script.on('close', function (code) {
                deffered.resolve(code);
            });
            return deffered.promise;
        }
    };

    return shellscript;
};