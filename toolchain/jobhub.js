
module.exports = function (app) {
    "use strict";

    var fake = require("fakedb");

    var q = require("q");

    // our two local databases
    app.fs.unlinkSync("../datastore/active.db");
    // app.fs.unlinkSync("../datastore/archived.db");

    var dbs = {
        active   : fake.init("../datastore/active.db"),
        archived : fake.init("../datastore/archived.db")
    };
    dbs.active.purge();

    //dbs.archived.purge();
    var jobHub = {

        jobInProgress: null,
        lastJob:null,                              // acts as a store and mutex

        emit_progress: function (prog) {
            console.log(prog);                 // the hubs main message / event agregator - pass onto the app
            app.emit_progress(prog);
        },
        
        // check and run any new builds if there is no build running
        check_build: function () {
            jobHub.emit_progress("checking for pending jobs");

            if (that.jobInProgress) {
                jobHub.emit_progress("job currently in progress: " + that.jobInProgress.id);
            } else {

                var job = that.get_pending();
                
                if (job) {
                    jobHub.emit_progress("checked and found...");
                    console.log(job);

                    // factory - based on something in jobs to pick a job type....
                    if (!(job.job_type in that.jobTypeList)) {
                        job.status ="error";
                        jobHub.emit_progress("cant find this job type " + job.job_type);
                        return "bad";
                    } else {
                        job.status ="active";
                        that.jobInProgress = job;

                        that.jobTypeList[job.job_type](job).then(
                            function() {
                                var msg = "Job "+job.internal_key+" Complete!!!";
                                that.jobInProgress.status = "complete";
                                that._complete_Job().then(function(){
                                    
                                    jobHub.emit_progress(msg);
                                })
                               
                            },
                            function(err) {
                                console.error("FAILED job type " + job.job_type);
                                console.error(err);
                                that.jobInProgress.status = "error";
                                that._complete_Job().then(function(){
                                    that.jobInProgress = null;    
                                });

                                jobHub.emit_progress("Job Failed!!! - " + err );

                            }
                        ).then(function (){
                            // Load up the next job
                            that.check_build();
                        });
                    }
                } else {
                    jobHub.emit_progress("No Jobs..");
                }
            }
        },

        add_Job: function (data) { // todo add job type
            var deferred = jobHub.q.defer();
            
            console.log("adding job");
            console.log(data);

            var job = {
                "id"           : app.shortID.generate(),
                "internal_key" : "",
                "time"         : new Date(),
                "status"       : "new"
            };

            if (data.head_commit) {
                // data has this structure if raised from the web client
                /*
                { 
                    head_commit:{ 
                        author: { 
                            name: 'Build Server' 
                        },
                        id: '000000',
                        message: 'Build requested through web UI.',
                        timestamp: '2013-08-17T10:39:44.447Z',
                        url: 'http://localhost:8100/#newbuild' 
                    } 
                }
                */

                // TODO always pass this in from the 'client of jobhub'
                var version = 'head';
                if (data.head_commit.version) {
                    version = data.head_commit.version;
                }

                // by default disable the console unless we're building head
                var disable_console = true;
                if (data.head_commit.disable_console) {
                    disable_console = data.head_commit.disable_console;
                } else if (version === 'head') {
                    disable_console = false;
                }
                
                // use short circuit to set web_app as default
                // job["job_type" ] = data.head_commit.type || "web_app";
                job["job_type" ] = data.head_commit.job_type;
                job["author"   ] = data.head_commit.author.name;
                job["commit_ID"] = data.head_commit.id;
                job["message"  ] = data.head_commit.message;
                job["url"      ] = data.head_commit.url;
                job["version"  ] = version;
                job["disable_console"] = disable_console;
            } else if (data.internal) {
                // this structure if is an internal job
                /*
                { 
                    internal:{ 
                        jobtype: ' they job name to trigger'
                        message: 'something usefull.',
                    } 
                }
                */
                
                job["job_type" ] = data.internal.job_type;
                job["author"   ] = "build server internal";
                job["commit_ID"] = "internal";
                job["message"  ] = data.internal.message;
                job["url"      ] = "";
                job["version"  ] = 'none';
                job["disable_console"] = false;
            }


            var key = dbs.active.add(job);
            job.internal_key = key;

            deferred.resolve(key);

            return deferred.promise
            .then(function () {
                // Once we know the job has been added check for new jobs
                that.check_build();
            });
        },
        // return one pending job - TODO make sure its the oldest
        get_pending: function() {
            jobHub.emit_progress("Getting oldest Job");
            var jobDoc = [];
            dbs.active.all().forEach(function(job) {
                jobDoc.push(job.doc);
            });
            return jobDoc[0];
        },
        
        _complete_Job: function () {
            var deferred = jobHub.q.defer();
            jobHub.emit_progress("Archiving Job...");
            console.log("job - deleting" + that.jobInProgress.internal_key + " deleted");
            dbs.active.del(that.jobInProgress.internal_key);

            var key = dbs.archived.add(that.jobInProgress);

            that.lastJob = that.jobInProgress;
            console.log(that.lastJob);
            that.jobInProgress = null;

            deferred.resolve("completed res");
            return deferred.promise;
        },


        list_Jobs: function (type) {
            var deferred = jobHub.q.defer();

            var jobDoc = [];

            if (type == 'pending') {
                dbs.active.all().forEach(function(job) {
                    console.log("pending");
                    console.log(job);
                    jobDoc.push(job.doc);
                });
            } else {
                dbs.archived.all().forEach(function(job) {
                    console.log(job);
                    jobDoc.push(job.doc);
                });
            }

            deferred.resolve(jobDoc);
            return deferred.promise;
        }
    };

    jobHub.q           = q; // to schedule the jobs
    jobHub.web_tags    = {};
    jobHub.ps_tags     = {};
    jobHub.test_res    = {};
    jobHub.tools       = require("./tools.js")(jobHub);
    jobHub.jobTypeList = require("../jobs/joblist.js")(jobHub);

    // some useful enclosed variables
    var that = jobHub;

    return that;
};