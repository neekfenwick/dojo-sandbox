dojo.provide("sandbox.Frontend");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.data.JsonRestStore");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.DropDownButton");
dojo.require("dojox.widget.Dialog");

dojo.require("sandbox.frontend.EditorTab");
dojo.require("sandbox.frontend.SetupPane");
dojo.require("sandbox.frontend._LoginMixin");

dojo.declare("sandbox.Frontend", [dijit._Widget, dijit._Templated, sandbox.frontend._LoginMixin], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),

	// array of checkboxes for layer selection
	versionInfo: 'Alpha version',
	
	showChangelog: false,
	
	credentials: {},

	_bucketInfo: {
		namespace: undefined,
		id: undefined,
		version: undefined
	},

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

	postCreate: function () {
		this.inherited(arguments);

		this.editorTab.frontend = this;
		this.setupPane.frontend = this;
        
        this.connect("loginSubmit", "onClick", dojo.hitch(this, "loginSubmit"));
	},
	
	startup: function() {
		this.inherited(arguments);
		if (this.showChangelog === true) {
			this._changelogClick();
		}
	},

	_getEditorItem: function (id) {
		return this.editorTab._getEditorItem(id);
	},

    loginSubmit: function(e) {
        console.log("Login submit here!");
        dojo.stopEvent(e);
    },
	
	showMessageDialog: function(title, message) {
		var errDlg = dijit.byId('errDlg');
		if (errDlg) {
			errDlg.set('title', title);
			errDlg.set('content', message);
		} else {
			errDlg = new dijit.Dialog( {
				id: 'errDlg',
				title: title,
				content: message
			});
		}
		errDlg.startup();
		errDlg.show();
	},
	
	showErrorMessageDialog: function(data) {
		if (data.message && data.exceptionMessage) {
			// an exception was thrown in the backend
			this.showMessageDialog(data.message, data.exceptionMessage);
		} else if (data.message && data.responseText) {
			// an HTTP response code was sent
			this.showMessageDialog(data.message, data.responseText);
		} else if (data.message) {
			this.showMessageDialog('An error occurred', data.message);
		} else {
			this.showMessageDialog('An error occurred', 'An internal error occurred');
		}
	},

    /* UI Response */


	_updateClick: function () {
		alert(this.nlsString['STR_NOT_IMPLEMENTED']);
	},

	_saveasnewClick: function () {

		this.saveBucket({
			save_as_new: true
		}, function (response) {
			console.log("saveAsNew load: ", response);
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
		dojo.mixin(request, { token: this.credentials.token });

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

		this.runBucket(this.refreshRunNode);
	},
	
	/* Helper function that calls the run controller to save the current bucket
	 * in a session variable, and calls the supplied handler function with the
	 * response.
	 */
	runBucket: function(handler) {
		// Collect data from the active sandbox
		var request = this.gatherBucketData();

		// Sends the content of the Editors to the Backend and runs the Output in an iFrame
		dojo.xhrPost({
			"url": "/backend/run",
			"content": request,
			"handleAs": "json",
			"load": dojo.hitch(this, function (response) {
				console.log("runBucket LOAD: ", response);
				handler.apply(this, [response]);
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

	/* Launch a new window with the bucket referred to in the provided response */
	launchForDebug: function(response) {
		window.open(this.generateUrl(response), 'SandboxDebug', "resizable=yes,scrollbars=yes,status=yes");//"/backend/run/index/session_id/" + response.session_id;
	},

	// Convenience method to gather a lump of data about the current bucket
	//  for posting to the server.
	gatherBucketData: function () {
		
		// Gather enabled layers into an array to be join()ed later
		//		if (this.dijitLayerCB.get('checked') === true) {
		//			layersAr.push('dijit');
		//		}
		var layersAr = this.setupPane.getLayers();
		
		console.log("Made layersAr", layersAr);
		return {
			"name": this.setupPane.bucketNameNode.get('value'),
			"description": this.setupPane.bucketDescriptionNode.get('value'),
			"namespace": this._bucketInfo.namespace || '',
			"id": this._bucketInfo.id || '',
			"version": this._bucketInfo.version || 0,
			"dojo_version": this.setupPane.versionSelect.get('value'),
			"dj_config": this.setupPane.djConfig.get('value'),
			"html": this._getEditorItem("html").getValue(),
			"css": this._getEditorItem("css").getValue(),
			"javascript": this._getEditorItem("javascript").getValue(),
			"layers": layersAr.join('##')
		};
	},

	// Update the Run iframe with a URL according to the current bucket info
	refreshRunNode: function (response) {
//		if (typeof(this._bucketInfo.id) != "undefined") {
			this.iframeRunNode.src = this.generateUrl(response);
//		}
	},

	generateUrl: function (response) {
		//console.log("generateUrl using this._bucketInfo: ", this._bucketInfo);
		//return "/backend/run/index" + "/namespace/" + this._bucketInfo.namespace + "/id/" + this._bucketInfo.id + "/version/" + this._bucketInfo.version;
		return "/backend/run/index/session_id/" + response.session_id;
	},
	
	_changelogClick: function() {
		var changelogDlg = dijit.byId('changelogDialog');
		if (!changelogDlg) {
			changelogDlg = new dojox.widget.Dialog( {
				id: 'changelogDialog',
				title: 'Change Log',
				href: 'changelog.html'
			});
			changelogDlg.startup();
		}
		changelogDlg.show();
	}

});
