dojo.provide("sandbox.Frontend");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dojox.data.JsonRestStore");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("sandbox.Frontend", [dijit._Widget, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),
	_editors: [],
	
	constructor: function(){
		this._editors = [
			{"id": "javascript", "containerNode": "centerLeftPane", "widget": null, "syntax": "js", "getValue": function(){}},
			{"id": "html", "containerNode": "centerTopRightPane", "widget": null, "syntax": "html", "getValue": function(){}},
			{"id": "css", "containerNode": "centerBottomRightPane", "widget": null, "syntax": "css", "getValue": function(){}}
		];
	},

	postCreate: function() {
		this.inherited(arguments);

		this.fetchConfig();
		this.setupEditors();
	},
	
	startup: function(){
		this.inherited(arguments);
		
		//@TODO: fix this hack! the tabcontainer needs to get resized on startup. why?!
		setTimeout(dojo.hitch(this.mainBorderContainer, "layout"), 100);
	},

	fetchConfig: function() {
		dojo.xhrDelete( {
			url: 'backend/config' // REST style
		})
		this.configStore = new dojox.data.JsonRestStore( {
			target: 'backend/config'
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
	
	setupEditors: function(){
		dojo.forEach(this._editors, function(editor){
			editor.widget = new dijit.form.SimpleTextarea({"style": "height: 100%; width: 100%;"});
			editor.widget.placeAt(this[editor.containerNode].containerNode);
			editor.getValue = function(){
				return editAreaLoader.getValue(this.widget.textbox.id);
			};
			
			
			editAreaLoader.init({
				id: editor.widget.textbox.id
				,start_highlight: true
				,allow_resize: "no"
				,allow_toggle: false
				,word_wrap: false
				,language: "en"
				,syntax: editor.syntax
				,is_editable: true
				,toolbar: "syntax_selection, search, go_to_line, |, undo, redo, |, select_font,|, highlight, reset_highlight, word_wrap" 
			});
			
		}, this);
	},
	
	_getEditorItem:function(id){
		return dojo.filter(this._editors, function(editor){
			if(editor.id == id){
				return editor;
			}
		})[0];
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

	},
	
	_runClick: function(){

		var request = {
			"html":  this._getEditorItem("html").getValue(),
			"css":  this._getEditorItem("css").getValue(),
			"javascript":  this._getEditorItem("javascript").getValue()
		};
		
		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function(response){
				if(typeof(response.id) != "undefined"){
					this.iframeRunNode.src = "backend/run/index/id/"+response.id;
				}
			})
		});
		
	}

});
