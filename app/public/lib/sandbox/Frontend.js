dojo.provide("sandbox.Frontend");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Select");
dojo.require("dojox.data.JsonRestStore");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("sandbox.Frontend", [dijit._Widget, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),
	_editors: [],

	_bucketInfo: {
		namespace: undefined,
		id: undefined,
		version: undefined
	},

	_userInfo: undefined, // logged in user info

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
		//dojo.xhrDelete( {
		//	url: 'backend/config' // REST style
		//})
		this.configStore = new dojox.data.JsonRestStore( {
			target: '/backend/config'
		});
		console.log("Fetching all config...");
		this.configStore.fetch( {
			query: { 'id': '*' },
			onComplete: dojo.hitch(this, function(data) {
				console.log("Do something with data: ", data);

				dojo.forEach(data.items, dojo.hitch(this, function(item) {
					if (this.configStore.getValue(item, "name") == "dojo_versions") {
						console.log("Fill in versions: " + this.configStore.getValue(item, "value"));
						var allVersions = this.configStore.getValue(item, "value");
						dojo.forEach(allVersions.split('##'), dojo.hitch(this, function(v) {
							console.log("Adding version: ", v);
							this.versionSelect.addOption([
								{
									value: v,
									label: v,
									selected: true,
									disabled: false
								}
							]);
						}));
					}
				}));

				// cookie should have stored username of last logged on user
				// If so, do a sync request to validate user.
				// @TODO: make this non sync. for now, it's easier to do it sync.
				var usercookie = dojo.cookie('dojo-sandbox');
				if (usercookie) {
					this._userInfo = dojo.objectFromQuery(usercookie);
					console.log("userdata: ", this._userInfo);

					if (this._userInfo && this._userInfo.username) {
						dojo.xhrGet( {
							url: '/backend/security',
							sync: true,
							content: {
								action: 'validateToken',
								username: this._userInfo.username,
								token: this._userInfo.token
							},
							handleAs: 'json',
							load: dojo.hitch(this, function(response) {
								console.log("validateSecurity response: ", response);

							}),
							error: dojo.hitch(this, function(response) {
								console.log("validateSecurity ERROR: ", response);
								this._userInfo = undefined;
							})
						});
					}
				}

				// At this point we may be logged in or not.
				// Update the UI for our this._userInfo
				this.updateUserinfoNode();

				// inspect the location and see if we have to load a bucket
				var pn = window.location.pathname;
				var bucketRequest = dojo.mixin(this._userInfo, {});

				var re1 = new RegExp("^\/([^/]+)$");
				var re2 = new RegExp("^\/([^/]+)\/([^/]+)$");
				var re3 = new RegExp("^\/([^/]+)\/([^/]+)\/([0-9]+)$");
				var matches = re1.exec(pn);
				//var matches = pn.match(/^\/([^/]*)$/);
				if (matches) {
					// e.g. "/wuhi"
					console.log("Matched just namespace: ", matches[1]);
					// not sure what to do here .. list buckets?
				} else {
					matches = re2.exec(pn);
					if (matches) {
						// e.g. "/wuhi/1234"
						console.log("Matched namespace/id: ", matches[1], " - ", matches[2]);
						namespace = matches[1], id = matches[2];
						bucketRequest = { namespace: matches[1], id: matches[2] };
					} else {
						matches = re3.exec(pn);
						if (matches) {
							console.log("Matched namespace/id/version: ", matches[1], " - ", matches[2], " - ", matches[3]);
							namespace = matches[1], id = matches[2], version = matches[3];
							bucketRequest = { namespace: matches[1], id: matches[2], version: matches[3] };
						}
					}
				}

				if (bucketRequest && bucketRequest.namespace && bucketRequest.id && bucketRequest.version) {
					console.log("Requesting: ", bucketRequest);

					dojo.xhrGet( {
						url: '/backend/bucket',
						content: bucketRequest,
						handleAs: 'json',
						load: dojo.hitch(this, function(response) {
							console.log("bucket response: ", response);
							if (response.error && response.error === true) {
								window.alert("Error from server! " + response.message);
							} else {
								this._bucketInfo = {
									namespace: response.namespace,
									id: response.id,
									version: response.version
								};
								dojo.attr(this.bucketNamespaceNode, 'innerHTML', this._bucketInfo.namespace);
								dojo.attr(this.bucketIdNode, 'innerHTML', this._bucketInfo.id);
								dojo.attr(this.bucketVersionNode, 'innerHTML', this._bucketInfo.version);
								var setValueFn = function(response, responseField, editor) {
									editor.widget.setValue(response[responseField]);
								};
								var setValuePartial = dojo.partial(setValueFn, response);
								dojo.forEach(this._editors, dojo.hitch(setValuePartial, function(editor) {
									if (editor.id == 'html') {
		//								editor.widget.setValue(response.content_html);
										this('content_html', editor);
									} else if (editor.id == 'css') {
		//								editor.widget.setValue(response.content_css);
										this('content_css', editor);
									} else if (editor.id == 'javascript') {
		//								editor.widget.setValue(response.content_js);
										this('content_js', editor);
									}
								}))
							}
						}),
						error: dojo.hitch(this, function(response) {

						})
					});
				}
			})
		});

	},

	updateUserinfoNode: function() {
		dojo.empty(this.userInfoNode);
		var b;
		if (this._userInfo && this._userInfo.username) {
			dojo.attr(this.userInfoNode, 'innerHTML',
				'<span class="userinfo">Logged on as; <span class="username">' +
					this._userInfo.username + "</span></span>");
			b = new dijit.form.Button( {
				label: 'Logout',
				onClick: dojo.hitch(this, "_logoutClick")
			});
			b.placeAt(this.userInfoNode);
		} else {
			b = new dijit.form.Button( {
				label: 'Login',
				onClick: dojo.hitch(this, "_loginClick")
			});
			b.placeAt(this.userInfoNode);
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

	_loginClick: function() {

	},

	_logoutClick: function() {

	},

	_updateClick: function() {

	},

	_saveasnewClick: function() {

		// Collect data from the active sandbox
		var request = this.gatherBucketData();
		request.saveAsNew = true;

		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "/backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function(response){
				console.log("saveAsNew load: ", response);
//				// cannot have the 302 response cause a Redirect, so do this instead.
				window.location = "/" + response.namespace + "/" + response.id +
					"/" + response.version;
//				this._bucketInfo = {
//					namespace: response.namespace,
//					id: response.id,
//					version: response.version
//				};
//				this.refreshRunNode();
			}),
			"error": function(response) {
				console.log("ERROR: ", response, "..", response.responseText);
			}
		});

	},

	_deleteClick: function() {

	},
	
	_runClick: function(){

		// Collect data from the active sandbox
		var request = this.gatherBucketData()
		
		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "/backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function(response){
				console.log("LOAD: ", response);
//				// cannot have the 302 response cause a Redirect, so do this instead.
//				window.location = "/" + response.namespace + "/" + response.id +
//					"/" + response.version;
				this._bucketInfo = {
					namespace: response.namespace,
					id: response.id,
					version: response.version
				};
				this.refreshRunNode();
			}),
			"error": function(response) {
				console.log("ERROR: ", response, "..", response.responseText);
			}
		});
		
	},

	// Convenience method to gather a lump of data about the current bucket
	//  for posting to the server.
	gatherBucketData: function() {
		return {
			"namespace": this._bucketInfo.namespace || '',
			"id": this._bucketInfo.id || '',
			"version": this._bucketInfo.version || 0,
			"name": 'foobar',
			"description": 'foodesc',
			"dojo_version": this.versionSelect.get('value'),
			"dj_config": this.djConfig.get('value'),
			"html":  this._getEditorItem("html").getValue(),
			"css":  this._getEditorItem("css").getValue(),
			"javascript":  this._getEditorItem("javascript").getValue()
		};
	},

	// Update the Run iframe with a URL according to the current bucket info
	refreshRunNode: function() {
		if(typeof(this._bucketInfo.id) != "undefined"){
			this.iframeRunNode.src = "/backend/run/index" +
				"/namespace/"+this._bucketInfo.namespace +
				"/id/"+this._bucketInfo.id +
				"/version/"+this._bucketInfo.version;
		}
	}

});
