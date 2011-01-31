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

dojo.require("sandbox.frontend.EditorTab");
dojo.require("sandbox.frontend.SetupPane");

dojo.declare("sandbox.Frontend", [dijit.layout.ContentPane, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("sandbox", "templates/Frontend.html"),

	// array of checkboxes for layer selection
	versionInfo: 'Alpha version',

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
	},

	startup: function () {
		this.inherited(arguments);
	},

	_getEditorItem: function (id) {
		return this.editorTab._getEditorItem(id);
	},

	getUserDetails: function (username) {
		// Request to backend for user details here
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
				
				this.setupPane._updateBucketInfoNodes(this._bucketInfo);
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
			"namespace": this._bucketInfo.namespace || '',
			"id": this._bucketInfo.id || '',
			"version": this._bucketInfo.version || 0,
			"name": 'foobar',
			"description": 'foodesc',
			"dojo_version": this.setupPane.versionSelect.get('value'),
			"dj_config": this.setupPane.djConfig.get('value'),
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
