/**************************************/
/********* BACKBONE SUCKS *************/
/**************************************/
(function() {

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
		// tagName : 'li',

		//compiled template function which is associated with the view. Caches the compiled template once during constructor
		//initialization so that you may use the compiled template many times without repeating the compilation step
		//for all the instances.
		template : _.template( $('#item_template').html() ),

		//Register event handlers for any child elements of the view
		//If you skip the element selector in [event selector], the events are delegated to the root element of the
		//template. Use this for default event delegation.
		events : {
			'click input[type=checkbox]' : 'toggleCompleted'
		},

		//Initialize function is called by default during the construction phase
		initialize : function() {

			//Listen to events on other objects, in this case, the model associated with the view
			this.listenTo(this.model, 'change', this.render);

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
			
		},

		events : {
			'click input[type=button]' : 'createModel'
		},

		createModel : function() {

			TodoListCollection.add({
				title : this.$input.val()
				// completed : false
			});

		},

		addItem : function(todo, Collection) {
			var view = new ItemView({model : todo});
			this.$list.append(view.render().el);
		}
	});

	var appView = new AddView();


}())