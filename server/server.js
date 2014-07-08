
var bs = (function () {
    "use strict";
    var that = {};
    
    that.express = require("express");                  // the web app frame work
    that.app = that.express();

    that.http = require("http");                        // not sure why we need this - doesnt express fo this out of the box - I found out its the boilerplate way for socket.io
    
    that.router = require("./router.js");               // app server
    
    that.server = that.http.createServer(that.app);     // part of the boilerplate - to allow socket.io

    that.commander = require("commander");
    that.less = require('less-middleware');
    that.build = require("./build.js");
    that.fs = require("fs");

    that.shortID = require("shortid");
    that.io = require('socket.io');                     // to glue the front end to the server
        
    that.jobs = require("../toolchain/jobhub.js")(that);             // job co-ordinator - and specific client job

    that.emit_progress = function (prog) {              // the main message / event agregator
        bs.io.sockets.emit("progress", {
            "prog": prog
        });
    };

    that.check_Jobs = setInterval(that.jobs.check_build, 80000);

    return that;
})();


bs.app.configure(function () {
    'use strict';
    this.use(bs.express.basicAuth(function(user, pass) {             // use midleware basic Auth
       return user === 'build' && pass === 'build';
    }));

    this.set('views', __dirname + '/views');
    
    
    this.set('view engine', 'html');
    this.engine('html', function(path, options, cb) {
        bs.fs.readFile(path, 'utf-8', cb);
    });

    this.use(bs.express.bodyParser());
    
    this.set('port', 8100);
    
    this.use(this.router);                                                      // use url router

    this.use(bs.express.methodOverride());                           // some thing to enrich the http methods express sees - i think?


    bs.commander.version('0.0.1')
    .option('-build, --build [scriptmode]', 'rebuild latest script file scriptmode can take value min or norm')
    .parse(process.argv);

    if (bs.commander.build === "min") {

        bs.build(true);

            // try {
            //     bs.fs.unlinkSync('public/css/bootstrap.css');
            // } catch (error) {
            //     console.log("bootstrap css does not exist .. yet ");
            // }
            this.use(bs.less({
                src: __dirname + '/public/',
                dest: __dirname + '/public/',
                compress: true,
                once: true
            }));
        } else {
            if (bs.commander.build === "norm") {
                console.log("devel");
                // try {
                //     bs.fs.unlinkSync('public/css/bootstrap.css');
                // } catch (error) {
                //     console.log("bootstrap css does not exist .. yet ");
                // }
                this.use(bs.less({
                    src: __dirname + '/public/',
                    dest: __dirname + '/public/',
                    debug: true,
                    force: true
                }));
                bs.build(false);
            }

        }

    this.use(bs.express.static(__dirname + '/public'));              // set the static folder

});



// all this socket.io is the single page app glue

bs.server.listen(bs.app.get("port"));
bs.io = bs.io.listen(bs.server);
bs.router(bs);
bs.io.configure(function () {
    'use strict';
    bs.io.enable('browser client etag');
    bs.io.set('log level', 3);

    bs.io.set('transports', [
        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
        ]);
});

bs.io.sockets.on('connection', function (client) {
    'use strict';
    client.on("newjob", function (data) {
        bs.jobs.add_Job(data);
    });

    client.on("checkbuilds", function (data) {

        console.log("CHECKBUILD SOCKETIO RECIEVED");

        bs.jobs.check_build(data);


    });

    client.on("ready", function () {
        console.log("READY SOCKETIO RECIEVED");
        client.emit("welcome", bs.jobs.lastJob);
        client.emit("web_tags", bs.jobs.web_tags);
        // client.emit("ps_tags", bs.jobs.ps_tags);
    });

    client.on("pending", function () {
        bs.jobs.list_Jobs('pending').then(function(result) {

            console.log("what im sending");
            console.log(result);

            client.emit("pendingjobs", result);
        });

    });
    client.on("completed", function () {

        bs.jobs.list_Jobs('complete').then(function (d) {
            console.log(d);
            client.emit("completedjobs", d);
        });

    });

    client.on('tests', function() {
        console.log('test results:', bs.jobs.test_res);
        client.emit('testresults', bs.jobs.test_res);
    });

});

// two initial jobs that MUST exist
// Set of start up jobs
// If you're testing you can remove 'initial_clone' to speed things up

var start_up = [
    'tag_list', 
    'initial_clone'
];

// var start_up = [];
for (var job_no = 0; job_no < start_up.length; job_no++) {
    var job = start_up[job_no];
    bs.jobs.add_Job({
        internal:{
            job_type: job,
            message: 'Initial set up: '+job,
        }
    });
}

bs.jobs.check_build();
