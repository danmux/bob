
module.exports = function (hub) {
    'use strict';
    var git = {

        tags: '',
        delete_Dir:function (path) {
            console.log(path);
            if( hub.tools.fs.existsSync(path)) {
                hub.tools.fs.readdirSync(path).forEach(function(file,index){
                    var curPath = path + '/' + file;
                    if(hub.tools.fs.statSync(curPath).isDirectory()) { // recurse
                        hub.tools.git.delete_Dir(curPath);
                    } else { // delete file
                        hub.tools.fs.unlinkSync(curPath);
                    }
                });
            hub.tools.fs.rmdirSync(path);
            }
        },

        list_tags:function (url) {
            var deffered = hub.q.defer();
            
            console.log(__dirname);
            var ls = hub.tools.spawn('git', ['ls-remote','--tags', url]);
            var log = '';
                ls.stdout.on('data', function (data) {
                    console.log(data.toString());
                    log = data.toString();
                 
                });

                ls.stderr.on('data', function (data) {
                    console.log(data.toString());
                   
                });

                ls.on('close', function (code) {
                    console.log(code);
                    console.log(log);
                    
                    deffered.resolve(log);
                      //broadcast info to all sockets here
                });
            return deffered.promise;
        },

        // Workdir is the directory to run the command /from/ git dir is 
        // where to clone into
        git_clone: function (url, gitdir) {
            var git = this;
            console.log('checking build folder: ' + gitdir);
            if (hub.tools.fs.existsSync(gitdir)) {
                console.log('deleting build folder: ' + gitdir);
                git.delete_Dir(gitdir);
            }
            
            // set the workdir to be here for this command
            return spawn_git_process(hub, '.', ['clone', url, gitdir]);
        },

        git_checkout_tag:function (tag, gitdir) {
            return spawn_git_process(hub, gitdir, ['checkout', tag]);
        },

        git_clean: function (gitdir) {
            // This removes any untracked & any ignored files from the gitdir
            return spawn_git_process(hub, gitdir, ['clean', '-f', '-x']);
        },

        git_hard_reset: function (gitdir) {
            // This returns any modified files to their last committed state
            return spawn_git_process(hub, gitdir, ['reset', '--hard']);
        },

        git_pull: function (gitdir) {
            return spawn_git_process(hub, gitdir, ['pull']);
        },

        git_clean_and_update: function (gitdir) {
            var git = this;
            hub.emit_progress('Starting clean & update for: '+gitdir);
            return git.git_clean(gitdir)
            .then(function (res) {
                hub.emit_progress('Cleaning complete');
                return git.git_hard_reset(gitdir);
            })
            .then(function (res) {
                hub.emit_progress('Hard reset complete');
                return git.git_checkout_tag('master', gitdir);
            })
            .then(function (res) {
                hub.emit_progress('Returned to master branch');
                return git.git_pull(gitdir);
            });
        }
    };

    return git;
};


function spawn_git_process(hub, gitdir, git_cmds) {
    
    var deffered = hub.q.defer();

    // cwd = current work directory
    var opts = {cwd:gitdir};
    var ls = hub.tools.spawn('git', git_cmds, opts);

    ls.stdout.on('data', function (data) {
        console.log('Git stdout:');
        console.log(data.toString());
        hub.emit_progress(data.toString());
    });

    ls.stderr.on('data', function (data) {
        console.log('Git stderr:');
        console.log(data.toString());
        hub.emit_progress(data.toString());
    });

    ls.on('close', function (code) {
        console.log('Git ' + git_cmds[0] +  ' finished with code:');
        console.log(code);
        deffered.resolve(code);
    });
    
    return deffered.promise;
}

