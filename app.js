/**************************************/
/********* BACKBONE SUCKS *************/
/**************************************/
(function() {

	Backbone.sync = function(method, model) {
		switch(method) {
				case 'create':
					var db = JSON.parse(localStorage.getItem('todos')) || {};
					db[model.attributes.title] = model.attributes;
					
					localStorage.removeItem('todos');
					localStorage.setItem('todos', JSON.stringify(db));		
					break;

				case 'read':
					var deferred = Backbone.$.deferred();
					deferred.resolve(JSON.parse(localStorage.getItem('todos')));
					break;
			};
	};

	//Create a Todo Model constructor which inherits from base Backbone.Model constructor
	var Todo = Backbone.Model.extend({

		//Set default values for the constructed objects
		defaults : {
			title : '',
			completed : false
		},

		//Helper functions to play with model's state
		toggle : function() {

			this.save({
				completed : !this.get('completed')
			});

		}
	});

	//Create a TodoList Collection constructor which inherits from base Backbone.Collection constructor
	var TodoList = Backbone.Collection.extend({

		//Provide a model constructor.
		//A collection is made of similar model objects.
		model : Todo,

		completed : function() {

			return this.where({completed : true});

		},

		remaining : function() {
			return this.where({completed : false});
		}
	});

	//Create a new TodoList collection object
	var TodoListCollection = new TodoList();

	//Create a View constructor which inherits from base Backbone.View constructor
	var ItemView = Backbone.View.extend({
		tagName : 'li',

		//compiled template function which is associated with the view. Caches the compiled template once during constructor
		//initialization so that you may use the compiled template many times without repeating the compilation step
		//for all the instances.
		template : _.template( $('#item_template').html() ),

		//Register event handlers for any child elements of the view
		//If you skip the element selector in [event selector], the events are delegated to the root element of the
		//template. Use this for default event delegation.
		events : {
			'click input[type=checkbox]' : 'toggleCompleted',
			'click input[type=button]' : 'removeItem'
		},

		//Initialize function is called by default during the construction phase
		initialize : function() {

			//Listen to events on other objects, in this case, the model associated with the view
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);

		},

		//Override default render function to render your view
		render : function() {

			//Pass the model's state to the template function
			this.$el.html(this.template(this.model.attributes));

			//Return this to chain methods
			return this;

		},

		toggleCompleted : function() {

			this.model.toggle();

		},

		removeItem : function() {

			this.model.destroy();

		}
	});

	var AddView = Backbone.View.extend({
		el : $('#listApp'),

		statsTemplate : _.template( $('#stats_template').html() ),

		initialize : function() {
			this.$list = $('#todolist');
			this.$input = $('#newTodo');
			this.$stats = $('#statsContainer');

			this.listenTo(TodoListCollection, 'add', this.addItem);
			this.listenTo(TodoListCollection, 'all', this.render);
			this.listenTo(TodoListCollection, 'reset', this.addAll);

			TodoListCollection.fetch({
				success : function(data) {
					console.log('HELLO');
				}
			});
		},

		//Override default render function
		render : function() {
			var completed = TodoListCollection.completed().length,
				remaining = TodoListCollection.remaining().length;

			if(TodoListCollection.length) {
				this.$stats.html(this.statsTemplate({
					remaining : remaining,
					finished : completed,
					total : remaining + completed
				}));	
			}
			else {
				this.$stats.hide();
			}			
			
		},

		events : {
			'click input[type=button]' : 'createModel'
		},

		createModel : function() {

			var inputValue = this.$input.val();

			if(inputValue) {
				TodoListCollection.create({
					title : inputValue
					// completed : false
				});

				this.$input.val('');
			}

		},

		addItem : function(todo, Collection) {
			var view = new ItemView({model : todo});
			this.$list.append(view.render().el);
		},

		adAll : function() {
			this.$list.html('');
			TodoListCollection.each(this.addItem, this);
		}
	});

	var appView = new AddView();


}())