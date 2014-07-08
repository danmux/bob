
window.views = {

    'lastbuild':Backbone.View.extend({
        tagName:'div',
        className:'main',
        initialize:function(options){
            'use strict';
            this.$el.undelegate();
            this.el = options.el;
            this.socket = options.socket;
            this.model = options.model;
            this.render();
        },
        template:'lastbuild',
        events:{}
    }),

    'nojob':Backbone.View.extend({
        tagName:'div',
        className:'main',
        initialize:function(options){
            'use strict';
            this.$el.undelegate();
            this.el = options.el;
            this.socket = options.socket;
            this.model = options.model;
            this.render();
        },
        template:'nojobs'
    }),

    'main':Backbone.View.extend({
        tagName:'div',
        className:'main',

        initialize:function (options){
            'use strict';
            this.$el.undelegate();
            this.el = options.el;
            this.socket = options.socket;
            this.model = options.model;
            this.render();
        },
        template:'index',
        events:{
            'click #checkbuilds':'checkbuilds',
            'click #checktags':'checktags'
        },
        checkbuilds:function (){
            'use strict';
            console.log('Check the build status');
            this.socket.emit('checkbuilds');
        },
        checktags:function (){
            'use strict';
            console.log('Update the tag list');
            this.socket.emit('newjob',{
                'head_commit':{
                    'author':{
                        'name':'Build Server'
                    },
                    'id':'000000',
                    'job_type':'tag_list',
                    'message':'Web UI requested tag list update',
                    'timestamp':new Date(),
                    'url':window.location.href
                }
            });
        }
    }),

    'clone':Backbone.View.extend({
        tagName:'div',
        className:'clone',
        initialize:function(options){
            'use strict';
            this.el = options.el;
            this.$el.undelegate();
            this.socket = options.socket;
            this.model = options.model;
            this.render();

        },
        template:'clone',
        events:{
            'click #webnewmaster':'newbuild',
            'click .webtaglist li':'webtagbuild',
            'click #newpageserver':'pageserver',
            'click .pstaglist li':'pstagbuild',
            'click .deploylist li':'deployto'
        },
        render:function(){
            'use strict';
            dust.render(this.template, buildserver, function(err,out){
               this.$el.html(out);
               $('#app').append(this.$el);
               this.modelbinder(this.$el[0],this.linkattribute);
               this.bindtoview();
            }.bind(this));
            return this;
        },
        webtagbuild:function(evt){
            'use strict';
            var tag = evt.target.text;
            console.log(tag);
            this.socket.emit('newjob',{
                'head_commit': {
                    'author': {
                        'name': 'Build Server'
                    },
                    'id': '000000',
                    'job_type':'web_app',
                    'version':tag,
                    'message': 'Tagged web-app build of '+tag+' requested through web UI.',
                    'timestamp': new Date(),
                    'url': window.location.href,
                    'disable_console': true
                }
            });
        },
        newbuild:function(){
            'use strict';
            console.log('newjob');
            this.socket.emit('newjob',{
                'head_commit': {
                    'author': {
                        'name': 'Build Server'
                    },
                    'job_type':'web_app',
                    'id': '000000',
                    'message': 'Web-app build requested through web UI.',
                    'timestamp': new Date(),
                    'url': window.location.href
                }
            });
        },
        pstagbuild:function(evt){
            'use strict';
            var tag = evt.target.text;
            console.log(tag);
            this.socket.emit('newjob',{
                'head_commit': {
                    'author': {
                        'name': 'Build Server'
                    },
                    'id': '000000',
                    'job_type':'pageserver',
                    'version':tag,
                    'message': 'Tagged pageserver build of '+tag+' requested through web UI.',
                    'timestamp': new Date(),
                    'url': window.location.href
                }
            });
        },
        pageserver:function(){
            'use strict';
            console.log('newjob');
            this.socket.emit('newjob',{
                'head_commit': {
                    'author': {
                        'name': 'Build Server'
                    },
                    'job_type':'pageserver',
                    'id': '000000',
                    'message': 'Pageserver build requested through web UI.',
                    'timestamp': new Date(),
                    'url': window.location.href
                }
            });
        },
        deployto:function(evt){
            'use strict';
            var tgt = evt.target.text;
            console.log(tgt);
            this.socket.emit('newjob',{
                'head_commit': {
                    'author': {
                        'name': 'Build Server'
                    },
                    'job_type':'deploy',
                    'id': '000000',
                    'version': tgt,
                    'message': 'Pageserver deploy to '+tgt+' requested through web UI.',
                    'timestamp': new Date(),
                    'url': window.location.href
                }
            });
        }
    }),

    'completedjob':Backbone.View.extend({
        tagName:'div',
        className:'clone',
        initialize:function(options){
            'use strict';
            this.$el.undelegate();
            this.socket = options.socket;
            this.model = options.model;
            this.render();

        },
        template:'completedjob',

        render:function(){
            'use strict';
            dust.render(this.template, this.model.attributes, function(err,out){
               this.$el.html(out);
               $('#app').append(this.$el);
               this.modelbinder(this.$el[0],this.linkattribute);
               this.bindtoview();
            }.bind(this));
            return this;
        }
    }),

    'pendingjob':Backbone.View.extend({
        tagName:'div',
        className:'clone',
        initialize:function(options){
            'use strict';
            this.$el.undelegate();
            this.socket = options.socket;
            this.model = options.model;
            this.render();
        },
        template:'pendingjob',
        render:function(){
            'use strict';
            var ht = _.template( $('#pending').html(), this.model.attributes );
            $('#app').append(ht);
            this.modelbinder(this.$el[0],this.linkattribute);
            this.bindtoview();
            return this;
        }
    }),

    'tests':Backbone.View.extend({
        tagName:'div',
        className:'clone',
        initialize:function(options){
            'use strict';
            this.$el.undelegate();
            this.socket = options.socket;
            this.model = options.model;
            this.render();

        },
        template:'tests',
        events:{
            'click #runtests':'runtests'
        },
        render:function(){
            'use strict';
            console.log(this.model.attributes);
            dust.render(this.template, this.model.attributes, function(err,out){
               this.$el.html(out);
               $('#app').append(this.$el);
               this.modelbinder(this.$el[0],this.linkattribute);
               this.bindtoview();
            }.bind(this));
            return this;
        },
        runtests:function() {
            'use strict';
            console.log('Run tests');
            this.socket.emit('newjob',{
                'head_commit':{
                    'author':{
                        'name':'Build Server'
                    },
                    'id':'000000',
                    'job_type':'test_ps',
                    'message':'Test the pageserver, request via web-ui',
                    'timestamp':new Date(),
                    'url':window.location.href
                }
            });
        }
    }),
};
