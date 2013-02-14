define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/json",
	"dojo/on",
	"dojo/request",
	"dojo/when",
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/Frontend.html",
	"dijit/Dialog",
	"dojox/widget/Dialog",
	"sandbox/frontend/_LoginMixin",
	"sandbox/frontend/_DialogUtilsMixin",
	"dojo-smore/RequestMemory",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/form/Button",
	"dijit/form/Select",
	"dijit/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"dojox/form/BusyButton",
	"dojox/data/JsonRestStore",
	"dijit/form/DropDownButton",
	"sandbox/frontend/EditorTab",
	"sandbox/frontend/SetupPane"
], function(declare, lang, dom, domAttr, domClass, domConstruct, domStyle, json, on, request, when, registry,
	_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
	Dialog, xDialog, _LoginMixin, _DialogUtilsMixin, RequestMemory) {

	return declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _LoginMixin, _DialogUtilsMixin], {

		templateString: template,

		versionInfo: 'Alpha version [ <a href="mailto:info@dojo-sandbox.net" title="Send some feedback via email - your thoughts are important to us.">contact us!</a> ]',
		versionTooltip: 'foo',

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
			
			var templateStore = new RequestMemory({
				url: '/backend/template'
			})
			this.templateSelect.set('store', templateStore);

			this.own(on(dom.byId("loginSubmit"), "click", lang.hitch(this, "loginSubmit")));
		},

		startup: function() {
			this.inherited(arguments);
			if (this.showChangelog === true) {
				this._changelogClick();
			}
			this.mainBorderContainer.layout();
		},

		_getEditorItem: function (id) {
			return this.editorTab._getEditorItem(id);
		},

		loginSubmit: function(e) {
			console.log("Login submit here!");
			e.preventDefault();
		},

		showMessageDialog: function(title, message) {
			var errDlg = registry.byId('errDlg');
			if (errDlg) {
				errDlg.set('title', title);
				errDlg.set('content', message);
			} else {
				errDlg = new Dialog( {
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
		_templateSelected: function(value) {
			// Assume store is synchronous
			when(this.templateSelect.store.get(value), lang.hitch(this, function(templateInfo) {
				console.log("Switch to ", templateInfo);
				if (confirm("Switch to template " + templateInfo.name + "?  This will lose any current state.  Once in the new template, you can make changes and click Fork to create a new bucket based on that template.") === true) {
					window.location = "/" + templateInfo.namespace + "/" + templateInfo.id + "/" + templateInfo.version;
				}
			}))
		},

		_saveClick: function () {
			this.saveBucket({
				save: 'save'
			}, function (response) {
				this.saveButton.cancel();
				console.log("saveClick load: ", response);
			});
		},

		_saveasnewClick: function () {

			this.saveBucket({
				save: 'new_version'
			}, function (response) {
				console.log("saveAsNew load: ", response);
				window.location = "/" + response.namespace + "/" + response.id + "/" + response.version;
			});
		},

		_forkClick: function () {
			var requestData = this.gatherBucketData();
			lang.mixin(requestData, { token: this.credentials.token });
			// Sends the content of the Editors to the Backend and runs the Output in an iFrame
			request("/backend/bucket", {
				method: "POST",
				data: requestData,
				handleAs: "json"
			}).then(lang.hitch(this, function (response) {
				console.log("Fork gave: ", response);
				if (response.success === true) {
					window.location = "/" + response.namespace + "/" + response.id + "/" + response.version;
				} else {
					console.error("Fork error: ", response);
					alert("Fork was not successful.");
				}
			}), function(err) {
				console.error("Fork error: ", err);
			});
//			this.saveBucket({
//				save: 'fork'
//			}, function (response) {
//				console.log("fork load: ", response);
//				window.location = "/" + response.namespace + "/" + response.id + "/" + response.version;
//			});
		},
		_genericSaveHandler: function (response, handler) {
			this._bucketInfo = {
				namespace: response.namespace,
				id: response.id,
				version: response.version
			};
			handler.apply(this, [response])
		},
		saveBucket: function (mixinData, successHandler, errHandler) {
			// Collect data from the active sandbox
			var requestData = this.gatherBucketData();
			lang.mixin(requestData, mixinData);
			lang.mixin(requestData, { token: this.credentials.token });

			// Sends the content of the Editors to the Backend and runs the Output in an iFrame
			request("/backend/run", {
				method: "POST",
				data: requestData,
				handleAs: "json"
			}).then(lang.hitch(this, function (response) {
				if (response.success === true) {
					this._genericSaveHandler(response, successHandler);
				} else {
					if (response.exception && response.exception === 'SecurityException') {
						console.log("Handle error: ", response);
						if (response.message && response.message === 'Invalid token') {
							//this.raiseErrorDialog("Security violation", "Your token was invalid");
							this.raiseQuestionDialog("Cannot save .. fork?", "Your token was invalid.  You are trying to save a bucket belonging to another user.  Would you like to fork this bucket instead?",
							lang.hitch(this, function(answer) {
								console.log("Got yesno answer: ", answer);
							}))
						}
					} else {
						this.raiseErrorDialog("Error", "An unhandled " +
							response.exception + " exception occurred; " + response.message);
					}
				}
			}),
			lang.hitch(this, function (response) {
				console.log("ERROR: ", response, "..", response.responseText);
				if (errHandler) {
					errHandler.apply(this, response);
				} else {
					if (response.responseText) {
						try {
							var responseObj = json.parse(response.responseText);
							if (responseObj.exceptionMessage && responseObj.exceptionMessage === 'Invalid token') {
								//this.raiseErrorDialog("Security violation", "Your token was invalid");
								this.raiseQuestionDialog("Cannot save .. fork?", "Your token was invalid.  You are trying to save a bucket belonging to another user.  Would you like to fork this bucket instead?",
								lang.hitch(this, function(answer) {
									console.log("Got yesno answer: ", answer);
								}))
							}
						} catch (e) {
							console.error("Error parsing response json: ", e);
						}
					}
				}
			}))

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
			var requestData = this.gatherBucketData();

			// Sends the content of the Editors to the Backend and runs the Output in an iFrame
			request("/backend/run", {
				method: "POST",
				data: requestData,
				handleAs: "json"
			}).then(lang.hitch(this, function (response) {
				console.log("runBucket LOAD: ", response);
				handler.apply(this, [response]);
			}),
			function(response) {
				if (response) {
					console.error("ERROR: ", response, "..", response.responseText);
				} else {
					console.error("ERROR! arguments: ", arguments);
				}
			})

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
			var changelogDlg = registry.byId('changelogDialog');
			if (!changelogDlg) {
				changelogDlg = new xDialog( {
					id: 'changelogDialog',
					title: 'Change Log',
					href: '/changelog.html'
				});
				changelogDlg.startup();
			}
			changelogDlg.show();
		}
	})
})