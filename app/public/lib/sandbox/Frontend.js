dojo.provide("sandbox.Frontend");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dojox.data.JsonRestStore");

dojo.declare("sandbox.Frontend", [dijit.layout.ContentPane, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),

	postCreate: function() {
		this.inherited(arguments);

		this.fetchConfig();
	},

	fetchConfig: function() {
//		dojo.xhrGet( {
//			url: 'app/backend_handler.php/config' // REST style
//		})
		this.configStore = new dojox.data.JsonRestStore( {
			target: 'app/backend_handler.php/config'
		});
		console.log("Fetching all config...");
		this.configStore.fetch( {
			query: { 'id': '*' },
			onComplete: dojo.hitch(this, function(items) {
				console.log("Do something with items: ", items);
			})
		});

		// cookie should have stored username of last logged on user
		// Perhaps chain this in the config onComplete handler?
		var usercookie = dojo.cookie('dojo-sandbox');
		if (usercookie) {
			var userdata = dojo.objectFromQuery(usercookie);
			console.log("userdata: ", userdata);

			if (userdata && userdata.username) {
				this.getUserDetails();
			}
		}

	},

	getUserDetails: function(username) {
		// Request to backend for user details here
	},


	/* UI Response */

	_updateClick: function() {

	},

	_saveasnewClick: function() {

	},

	_deleteClick: function() {

	}

});
