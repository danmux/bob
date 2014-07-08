var buildserver;
var socket = (function () {
    'use strict';

    // TODO make deployment aware
    // this is the web socket server - at the moment you have to remember to change before putting the build server on a server
    // Hassle! - FIXIT

    // var socket = io.connect('https://build.mydomain.com/');       // the live server dns or ip  
    var socket = io.connect('http://localhost:8100/');                // local dev
    
    socket.on('connect', function () {
        $('#header ul.nav a').click(function (e) {
            $('.navbar-inner li').removeClass('active');
            $(e.target).parent().addClass('active');
        });

        $('#header a.brand').click(function (e) {
            $('.navbar-inner li').removeClass('active');
        });

        socket.emit('ready');
        router = new router();
        Backbone.history.start();
    });

    socket.on('welcome', function (data) {
        buildserver.currentbuild.set(data);
    });

    // socket.on('ps_tags',function(data){
    //     buildserver.ps_tags = [];
    //     for (var i = 0; i < data.split('\n').length; i++) {
    //         buildserver.ps_tags.push({'tag': data.split('\n')[i].split('refs/tags/')[1]});
    //     }
    // });

    socket.on('web_tags',function(data){
        buildserver.web_tags = [];
        for (var i = 0; i < data.split('\n').length; i++) {
            buildserver.web_tags.push({'tag': data.split('\n')[i].split('refs/tags/')[1]});
        }
    });
    
    socket.on('progress', function (data) {
        buildserver.currentbuild.set('progress',data.prog);
    });

    socket.on('testresults', function (data) {
        buildserver.tests.set('pass', data.pass);
        buildserver.tests.set('fail', data.fail);
        buildserver.tests.set('total', data.total);
        buildserver.tests.set('fail_details', data.fail_details);
        buildserver.view = new window.views.tests({
            el: '#app',
            socket: socket,
            model: buildserver.tests
        });
    });

    socket.on('pendingjobs', function (pend) {
        if (pend.length === 0) {
            buildserver.view = new window.views.nojob({
                el: '#app',
                socket: socket,
                model: buildserver.currentbuild
            });
            return;
        }

        $('#app').html('');
        this.models = [];
        for (var i = 0; i < pend.length; i++) {
            this.models.push(new window.jobmodels.pending(pend[i]));
        }
        buildserver.pending.reset(this.models);
        _.each(buildserver.pending.models,function(element,index,list){
            element.render();
        });

    });

    socket.on('completedjobs', function (comp) {
        console.log(comp);
        if (comp.length === 0) {
            buildserver.view = new window.views.nojob({
                el: '#app',
                socket: socket,
                model: buildserver.currentbuild
            });
            return;
         }
         $('#app').html('');
         this.models = [];
         for (var i = 0; i < comp.length; i++) {
            this.models.push(new window.jobmodels.completed(comp[i]));
            
        }
        buildserver.completed.reset(this.models);
    
        _.each(buildserver.completed.models,function(element,index,list){
            element.render();
        });

    });

    return socket;
})();


buildserver = (function () {

    var init = {};
    init.currentbuild = new window.jobmodels.main({
        'progress':'No Build...',
        'id':'',
        'author':'',
        'message':'No latest Build',
        'status': 'none',
        'url':'#newbuild',
        'version':'current'
    });

    init.pending = new window.collections.joblist({
    });

    init.view = new window.views.main({
        model: init.currentbuild,
        socket:socket
    });

    // init.ps_tags = [];
    init.web_tags = [];

    init.completed = new window.collections.joblist({
    });

    init.tests = new window.jobmodels.tests({
        pass:0,
        fail:0,
        total:0,
        fail_details:[]
    });
    
    return init;
})();

var router = Backbone.Router.extend({

    routes: {
        'pending': 'pending',
        '': 'home',
        'completed': 'completed',
        'newbuild': 'newjob',
        'tests': 'tests'
    },

    pending: function () {
        $('#app').html();
        buildserver.pending.reset();
        socket.emit('pending');

    },

    home: function () {
        $('#app').html();
        buildserver.view = new window.views.main({
            el: '#app',
            socket: socket,
            model: buildserver.currentbuild
        });
    },

    completed: function () {
        $('#app').html();
        buildserver.completed.reset();
        socket.emit('completed');

    },

    newjob: function () {
        $('#app').html();
        buildserver.view = new window.views.clone({
            el: '#app',
            socket: socket,
            model: new window.jobmodels.clone({})
        });
    },

    tests: function() {
        $('#app').html();
        socket.emit('tests');
    }
});
