dojo.provide("sandbox.Frontend");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.data.JsonRestStore");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.DropDownButton");
dojo.require("dojox.html.format");

dojo.declare("sandbox.Frontend", [dijit.layout.ContentPane, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),

	_basePath: "/lib/codemirror/",
	_editors: [],
	_layersCBs: [],
	// array of checkboxes for layer selection
	versionInfo: 'Alpha version',

	_bucketInfo: {
		namespace: undefined,
		id: undefined,
		version: undefined
	},

	_userInfo: undefined,
	// logged in user info
	attributeMap: {
		versionInfo: {
			node: 'versionInfoNode',
			type: 'innerHTML'
		}
	},

	// dummy for when we have i18n resource bundle
	nlsString: {
		STR_NOT_IMPLEMENTED: 'Not yet implemented'
	},
	_editorMixin: {
		"initialized": false,
		"baseNode": null,
		"widget": null,
		"getValue": function () {
			return this.widget.getCode();
		},
		"setValue": function (value) {	
			if(!value){
				return;
			}
			if(this.initialized == false){
				this._valueToInit = value;
			}else{
				this.widget.setCode(value);
			}
		},
		"onInit": function(){
			this.setValue(this._valueToInit);
		},
		"autoFormat": function(){
			alert("not yet implemented");
		}		
	},
	constructor: function () {
		this._editors = [dojo.delegate(this._editorMixin, {
			"id": "javascript",
			"initialized": false,
			"containerNode": "centerLeftPane",
			"syntax": "js",
			"defaultValue": "/* js code here */",
			"autoFormat": function(){
				this.setValue( js_beautify( this.getValue() ) );
			}
		}),
		dojo.delegate(this._editorMixin, {
			"id": "html",
			"containerNode": "centerTopRightPane",
			"syntax": "html",
			"defaultValue": "<!-- html code here -->",
			"autoFormat": function(){
				this.setValue( dojox.html.format.prettyPrint(dojox.html.entities.decode( this.getValue() )) );
			}
		}),
		dojo.delegate(this._editorMixin, {
			"id": "css",
			"containerNode": "centerBottomRightPane",
			"syntax": "css",
			"defaultValue": "/* css code here */"
		})];
	},

	postCreate: function () {
		this.inherited(arguments);

		this.setupEditors();
		this.fetchConfig();
		this.djConfig.onKeyUp();
		
		this.connect(this.centerTabContainer, "selectChild", "_selectTab");
	},

	startup: function () {
		this.inherited(arguments);
	},

	fetchConfig: function () {
		//dojo.xhrDelete( {
		//	url: 'backend/config' // REST style
		//})
		this.configStore = new dojox.data.JsonRestStore({
			target: '/backend/config'
		});
		console.log("Fetching all config...");
		this.configStore.fetch({
			query: {
				'id': '*'
			},
			onComplete: dojo.hitch(this, function (data) {
				console.log("Do something with data: ", data);

				dojo.forEach(data.items, dojo.hitch(this, function (item) {
					var allLayers;
					if (this.configStore.getValue(item, "name") == "dojo_versions") {
						console.log("Fill in versions: " + this.configStore.getValue(item, "value"));
						allLayers = this.configStore.getValue(item, "value");
						dojo.forEach(allLayers.split('##'), dojo.hitch(this, function (v, index, arr) {
							console.log("Adding version: ", v);
							this.versionSelect.addOption([{
								value: v,
								label: v,
								//selected: (index == (arr.length -1))?true:false,
								disabled: false
							}]);
							
							if(index == (arr.length -1)){
								this.versionSelect.set("value", v); // select the last option
							}
						}));
					} else if (this.configStore.getValue(item, "name") == "dojo_layers") {
						console.log("Fill in layers: " + this.configStore.getValue(item, "value"));
						allLayers = this.configStore.getValue(item, "value");
						dojo.forEach(allLayers.split('##'), dojo.hitch(this, function (v) {
							// at the moment, we just get the full path to the layer
							//  e.g. ../dojox/charting/widget/Chart2D.js
							console.log("Adding layer: ", v);
							//var shortName = v.match(//)
							var re = /^.*\/(.*)\.js$/;
							var ar = re.exec(v);
							console.dir(ar);
							var shortName = v;
							if (ar.length > 1) {
								shortName = ar[1];
							}
							// Build as a label and checkbox.. could build table?
							var l = dojo.create('label', {
								'class': 'layerName',
								innerHTML: shortName,
								title: v
							});
							dojo.place(l, this.layersContainer);
							var cb = new dijit.form.CheckBox({
								'class': 'layerCheckBox',
								layerName: v
							});
							cb.placeAt(this.layersContainer);
							this._layersCBs.push(cb);

							dojo.place(dojo.create('br'), this.layersContainer);
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
						dojo.xhrGet({
							url: '/backend/security',
							sync: true,
							content: {
								action: 'validateToken',
								username: this._userInfo.username,
								token: this._userInfo.token
							},
							handleAs: 'json',
							load: dojo.hitch(this, function (response) {
								console.log("validateSecurity response: ", response);

							}),
							error: dojo.hitch(this, function (response) {
								console.log("validateSecurity ERROR: ", response);
								this._userInfo = undefined;
							})
						});
					}
				}

				// At this point we may be logged in or not.
				// Update the UI for our this._userInfo
				this._updateUserinfoNode();

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
						bucketRequest = {
							namespace: matches[1],
							id: matches[2]
						};
					} else {
						matches = re3.exec(pn);
						if (matches) {
							console.log("Matched namespace/id/version: ", matches[1], " - ", matches[2], " - ", matches[3]);
							namespace = matches[1], id = matches[2], version = matches[3];
							bucketRequest = {
								namespace: matches[1],
								id: matches[2],
								version: matches[3]
							};
						}
					}
				}

				if (bucketRequest && bucketRequest.namespace && bucketRequest.id && bucketRequest.version) {
					console.log("Requesting: ", bucketRequest);

					dojo.xhrGet({
						url: '/backend/bucket',
						content: bucketRequest,
						handleAs: 'json',
						load: dojo.hitch(this, function (response) {
							console.log("bucket response: ", response);
							if (response.error && response.error === true) {
								window.alert("Error from server! " + response.message);
							} else {
								this._bucketInfo = {
									namespace: response.namespace,
									id: response.id,
									version: response.version
								};
								this._updateBucketInfoNodes();

								var setValueFn = function(response, responseField, editor) {
									editor.setValue(response[responseField]);
								};
								var setValuePartial = dojo.partial(setValueFn, response);
								dojo.forEach(this._editors, function(editor) {
									if (editor.id == 'html') {
										this('content_html', editor);
									} else if (editor.id == 'css') {
										this('content_css', editor);
									} else if (editor.id == 'javascript') {
										this('content_js', editor);
									}
								}, setValuePartial);
								this.djConfig.set('value', response.dj_config);
								this.versionSelect.set('value', response.dojo_version);
								this._djConfigChanged();
								// Check all layerCBs with names matching those for this bucket.
								// Presume all CBs are unchecked to begin with.
								dojo.forEach(response.layers.split("##"), dojo.hitch(this, dojo.hitch(this, function (layerName) {
									dojo.forEach(this._layersCBs, dojo.hitch(this, function (cb) {
										if (cb.layerName == layerName) {
											cb.set('checked', true);
										}
									}));
								})));
							}

							this.mainBorderContainer.resize();
						}),
						error: dojo.hitch(this, function (response) {
							console.error("ERROR loading bucket: ", response);
						})
					});
				}
			})
		});

	},

	_updateUserinfoNode: function() {
		dojo.empty(this.userInfoNode);
		var b;
		if (this._userInfo && this._userInfo.username) {
			dojo.attr(this.userInfoNode, 'innerHTML', '<span class="userinfo">Logged on as; <span class="username">' + this._userInfo.username + "</span></span>");
			b = new dijit.form.Button({
				label: 'Logout',
				onClick: dojo.hitch(this, "_logoutClick")
			});
			b.placeAt(this.userInfoNode);
		} else {
			b = new dijit.form.Button({
				label: 'Login',
				onClick: dojo.hitch(this, "_loginClick")
			});
			b.placeAt(this.userInfoNode);
		}
	},


	_updateBucketInfoNodes: function() {
		dojo.attr(this.bucketNamespaceNode, 'innerHTML', this._bucketInfo.namespace);
		dojo.attr(this.bucketIdNode, 'innerHTML', this._bucketInfo.id);
		dojo.attr(this.bucketVersionNode, 'innerHTML', this._bucketInfo.version);
	},

	setupEditors: function () {
		window["keyBindings"] = {
			enter: "newline-and-indent",
			tab: "reindent-selection",
			ctrl_z: "undo",
			ctrl_y: "redo",
			ctrl_backspace: "undo-for-safari (which blocks ctrl-z)",
			ctrl_bracket: "highlight-brackets",
			ctrl_shift_bracket: "jump-to-matching-bracket"
		};

		dojo.forEach(this._editors, function (editor) {

			editor.baseNode = dojo.create("textarea", {
					"style": {
						"height": "100%",
						"width": "100%"
					}
				}, this[editor.containerNode].containerNode);
			
			var parserfile = "";
			var stylesheet = "";
			switch (editor.syntax) {
			case "html":
				parserfile = ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"];
				stylesheet = [this._basePath + "css/xmlcolors.css", this._basePath + "css/jscolors.css", this._basePath + "css/csscolors.css"];
				break;

			case "js":
				parserfile = ["tokenizejavascript.js", "parsejavascript.js"];
				stylesheet = this._basePath + "css/jscolors.css";
				break;

			case "css":
				parserfile = "parsecss.js";
				stylesheet = this._basePath + "css/csscolors.css";
				break;
			}

			editor.widget = CodeMirror.fromTextArea(editor.baseNode, {
				"height": "90%",
				"width": "100%",
				"content": editor.defaultValue,
				"parserfile": parserfile,
				"stylesheet": stylesheet,
				"path": this._basePath + "js/",
				"autoMatchParens": true,
				"onLoad": dojo.hitch(editor, function(){
					this.initialized = true;
					this.onInit();
				})
			});

			var toolbar = new dijit.Toolbar().placeAt(editor.widget.wrapping, "before");
			var menu = new dijit.Menu({
				style: "display: none;"
			});

			menu.addChild(new dijit.MenuItem({
				label: "autoformat",
				onClick: dojo.partial(function (scope, evt) {
					scope.autoFormat();
				}, editor)
			}));
			
			dojo.forEach(editor.additionalMenuItems, function(menuItem){
				menu.addChild(menuItem);
			}, this);

			toolbar.addChild(new dijit.form.DropDownButton({
				"label": editor.id,
				dropDown: menu
			}));

		}, this);
	},
	_selectTab: function(tab){
		if(tab == this.designerWidget){
			//this._getEditorItem("html").setValue(this.designerWidget.get("outputSource"));
		}
	},
	_getEditorItem: function (id) {
		return dojo.filter(this._editors, function (editor) {
			return (editor.id == id) ? editor : undefined;
		})[0];
	},

	getUserDetails: function (username) {
		// Request to backend for user details here
	},

	_djConfigChanged: function (evt) {
		var result = 'An unknown error ocurred';
		try {
			var p = dojo.fromJson('{' + this.djConfig.get('value') + '}');
			result = '';
			var elements = [];
			for (var thing in p) {
				elements.push(thing + ': ' + p[thing]);
			}
			result = elements.join(',<br>');
			dojo.removeClass(this.djConfigParsed, 'djConfigError');
		} catch (e) {
			console.error("parse error: ", e);
			console.dir(e);
			result = e.name + ' - ' + e.message;
			dojo.addClass(this.djConfigParsed, 'djConfigError');
		}
		dojo.attr(this.djConfigParsed, 'innerHTML', result);
	},

	/* UI Response */

	_loginClick: function () {
		alert(this.nlsString['STR_NOT_IMPLEMENTED']);
	},

	_logoutClick: function () {
		alert(this.nlsString['STR_NOT_IMPLEMENTED']);
	},

	_updateClick: function () {
		alert(this.nlsString['STR_NOT_IMPLEMENTED']);
	},

	_saveasnewClick: function () {

		this.saveBucket({
			saveAsNew: true
		}, function (response) {
			console.log("saveAsNew load: ", response);
			//				// cannot have the 302 response cause a Redirect, so do this instead.
			window.location = "/" + response.namespace + "/" + response.id + "/" + response.version;
		});
	},
	_genericSaveHandler: function (response, handler) {
		this._bucketInfo = {
			namespace: response.namespace,
			id: response.id,
			version: response.version
		};
		handler.apply(this, [response])
	},
	saveBucket: function (mixinData, handler) {
		// Collect data from the active sandbox
		var request = this.gatherBucketData();
		dojo.mixin(request, mixinData);

		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "/backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function (response) {
				this._genericSaveHandler(response, handler);
			}),
			"error": function (response) {
				console.log("ERROR: ", response, "..", response.responseText);
			}
		});

	},

	_deleteClick: function () {
		alert(this.nlsString['STR_NOT_IMPLEMENTED']);
	},

	_runClick: function () {

		// Collect data from the active sandbox
		var request = this.gatherBucketData();

		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "/backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function (response) {
				//console.log("LOAD: ", response);
				//				// cannot have the 302 response cause a Redirect, so do this instead.
				//				window.location = "/" + response.namespace + "/" + response.id +
				//					"/" + response.version;
				this._bucketInfo = {
					namespace: response.namespace,
					id: response.id,
					version: response.version
				};
				this._updateBucketInfoNodes();
				this.refreshRunNode();
			}),
			"error": function(response) {
				if (response) {
					console.error("ERROR: ", response, "..", response.responseText);
				} else {
					console.error("ERROR! arguments: ", arguments);
				}
			}
		});

	},

	_launchClick: function () {
		this.saveBucket({}, function (response) {
			console.log("launchClick callback, response: ", response);
			window.open(this.generateUrl());
		});
	},

	// Convenience method to gather a lump of data about the current bucket
	//  for posting to the server.
	gatherBucketData: function () {
		var layersAr = [];
		// Gather enabled layers into an array to be join()ed later
		//		if (this.dijitLayerCB.get('checked') === true) {
		//			layersAr.push('dijit');
		//		}
		dojo.forEach(this._layersCBs, function (cb) {
			if (cb.get('checked') == true) {
				layersAr.push(cb.layerName);
			}
		});
		console.log("Made layersAr", layersAr);
		return {
			"namespace": this._bucketInfo.namespace || '',
			"id": this._bucketInfo.id || '',
			"version": this._bucketInfo.version || 0,
			"name": 'foobar',
			"description": 'foodesc',
			"dojo_version": this.versionSelect.get('value'),
			"dj_config": this.djConfig.get('value'),
			"html": this._getEditorItem("html").getValue(),
			"css": this._getEditorItem("css").getValue(),
			"javascript": this._getEditorItem("javascript").getValue(),
			"layers": layersAr.join('##')
		};
	},

	// Update the Run iframe with a URL according to the current bucket info
	refreshRunNode: function () {
		if (typeof(this._bucketInfo.id) != "undefined") {
			this.iframeRunNode.src = this.generateUrl();
		}
	},

	generateUrl: function () {
		//console.log("generateUrl using this._bucketInfo: ", this._bucketInfo);
		return "/backend/run/index" + "/namespace/" + this._bucketInfo.namespace + "/id/" + this._bucketInfo.id + "/version/" + this._bucketInfo.version;
	}

});
