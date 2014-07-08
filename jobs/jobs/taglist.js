module.exports = function (hub,url) {
    'use strict';
    
    return function (job) {

        hub.emit_progress('Updating Tag List...');
        
        // TODO - single place for this - or add a few per project
        return hub.tools.git.list_tags('git@github.com:blahblah/blahblah.git')
        .then(function (res) {
            console.log(res);
            hub.web_tags = res;
            hub.emit_progress('updated taglist for: THIS PROJECT');
        });
    };
};