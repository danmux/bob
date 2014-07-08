
module.exports = function(rt){
    "use strict";

    rt.app.get('/', function(req, res) {
        console.log("kinel");
        res.render("index");
    });

    rt.app.post('/webhooks', function (req, res) {
        console.log(req.body);
        rt.jobs.add_Job(req.body).then(function(r){

        });
        res.end();
    });
};