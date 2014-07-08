window.jobmodels = {
	"clone":Backbone.Model.extend({}),
	"git":Backbone.Model.extend({}),

    "tests":Backbone.Model.extend({
        initialize:function(){}
    }),

	"main":Backbone.Model.extend({
		initialize:function(){}
	}),

	"pending":Backbone.Model.extend({
		initialize:function(){},
		render:function(){
			new window.views.pendingjob({
				model: this,
				socket:socket,
				id:this.id
			});
		}
	}),

	"completed":Backbone.Model.extend({
		initialize:function(){},
		render:function(){
			new window.views.completedjob({
				model: this,
				socket:socket,
				id:this.id
			});
		}
	})
};
