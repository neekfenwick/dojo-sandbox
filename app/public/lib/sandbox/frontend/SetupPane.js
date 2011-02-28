dojo.provide("sandbox.frontend.SetupPane");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");


dojo.declare("sandbox.frontend.SetupPane", [dijit.layout.ContentPane, dijit._Templated], {
	templateString: dojo.cache("sandbox", "frontend/templates/SetupPane.html"),
	widgetsInTemplate: true,
	
	_layersCBs: [],
	_userInfo: undefined,
	frontend: null,
	
	startup: function(){
		this.inherited("startup", arguments);
		
		this.fetchConfig();
		this.djConfig.onKeyUp();
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
	_updateBucketInfoNodes: function(bucketInfo) {
		dojo.attr(this.bucketNamespaceNode, 'innerHTML', bucketInfo.namespace);
		dojo.attr(this.bucketIdNode, 'innerHTML', bucketInfo.id);
		dojo.attr(this.bucketVersionNode, 'innerHTML', bucketInfo.version);
	},
	_launchClick: function () {
		this.frontend.saveBucket({}, function (response) {
			//console.log("launchClick callback, response: ", response);
			window.open(this.generateUrl());
		});
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
		
								this._updateBucketInfoNodes({
									namespace: response.namespace,
									id: response.id,
									version: response.version
								});

								var setValueFn = function(response, responseField, editor) {
									editor.setValue(response[responseField]);
								};
								var setValuePartial = dojo.partial(setValueFn, response);
								dojo.forEach(this.frontend.editorTab._editors, function(editor) {
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

						}),
						error: dojo.hitch(this, function (response) {
							console.error("ERROR loading bucket: ", response);
						})
					});
				}
			})
		});

	},
	getLayers: function(){
		var layers = [];
		dojo.forEach(this._layersCBs, function (cb) {
			if (cb.get('checked') == true) {
				layers.push(cb.layerName);
			}
		});
		
		return layers;
	},
	
	_updateUserinfoNode: function() {
		dojo.empty(this.frontend.userInfoNode);
		var b;
		if (this._userInfo && this._userInfo.username) {
			dojo.attr(this.userInfoNode, 'innerHTML', '<span class="userinfo">Logged on as; <span class="username">' + this._userInfo.username + "</span></span>");
			b = new dijit.form.Button({
				label: 'Logout',
				onClick: dojo.hitch(this.frontend, "_logoutClick")
			});
			b.placeAt(this.frontend.userInfoNode);
		} else {
			b = new dijit.form.Button({
				label: 'Login',
				onClick: dojo.hitch(this.frontend, "_loginClick")
			});
			b.placeAt(this.frontend.userInfoNode);
		}
	}
});