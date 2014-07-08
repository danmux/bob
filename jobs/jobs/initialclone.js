/*
Clone a load of things
*/
module.exports = function (hub) {
    'use strict';
    
    // TODO move specific things into seperate projects
    var git_root = 'git@github.com:blahblah';

    var build_dir = '../builds';
    var url_dir_map = {
        '/blahblah.git': '/latest'
    };


    var loop_func = function (url_ext, dir_ext) {
        var url = git_root + url_ext;
        var dir = build_dir + dir_ext;
        return hub.tools.git.git_clone(url, dir);
    };

    return function (job) {

        hub.emit_progress('Organise what to clone');
        // Construct our array of promises (the git functions produce promises).
        var promises = [];
        for (var url_ext in url_dir_map) {
            // trust javascript about as far as you can throw it
            if (url_dir_map.hasOwnProperty(url_ext)) {
                promises.push(loop_func(url_ext, url_dir_map[url_ext]));
            }
        }

        // wait for all the clones to complete
        hub.emit_progress('Begin cloning');
        return hub.q.all(promises)
    };
};
