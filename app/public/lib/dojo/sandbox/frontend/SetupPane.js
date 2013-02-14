define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/_base/json",
	"dojo/request",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dijit/form/TextBox",
    "dijit/form/Textarea",
	"dijit/form/CheckBox",
	"dojo/text!./templates/SetupPane.html",
	"dojox/data/JsonRestStore"
], function(declare, array, lang, domAttr, domClass, domConstruct, domStyle, json, request,
	_TemplatedMixin, _WidgetsInTemplateMixin, ContentPane, TextBox, Textarea, CheckBox, template, JsonRestStore) {

	return declare([ ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin ], {
		templateString: template,

		_layersCBs: [],
		frontend: null,

		startup: function(){
			this.inherited("startup", arguments);

			this.fetchConfig();
			this._djConfigChanged();
		},

		_djConfigChanged: function (evt) {
			var result = 'An unknown error ocurred';
			try {
				var p = json.fromJson('{' + this.djConfig.get('value') + '}');
				result = '';
				var elements = [];
				for (var thing in p) {
					elements.push(thing + ': ' + p[thing]);
				}
				result = elements.join(',<br>');
				domClass.remove(this.djConfigParsed, 'djConfigError');
			} catch (e) {
				console.error("parse error: ", e);
				console.dir(e);
				result = e.name + ' - ' + e.message;
				domClass.add(this.djConfigParsed, 'djConfigError');
			}
			domAttr.set(this.djConfigParsed, 'innerHTML', result);
		},
		_updateBucketInfo: function(bucketInfo) {
			this.frontend._bucketInfo = lang.mixin(this.frontend._bucketInfo, bucketInfo);
			// 'name' and 'description' will be provided when loading a bucket.
			//  When saving an existing bucket, they may not be and must be left
			//  with their old values if not.
			if (bucketInfo.hasOwnProperty('name')) {
				this.bucketNameNode.set('value', bucketInfo.name);
			}
			if (bucketInfo.hasOwnProperty('description')) {
				this.bucketDescriptionNode.set('value', bucketInfo.description);
			}
			domAttr.set(this.bucketNamespaceNode, 'innerHTML', bucketInfo.namespace);
			domAttr.set(this.bucketIdNode, 'innerHTML', bucketInfo.id);
			domAttr.set(this.bucketVersionNode, 'innerHTML', bucketInfo.version);
			
			this.frontend.saveButton.set('disabled', !(bucketInfo.namespace && bucketInfo.id));
			this.frontend.forkButton.set('disabled', !(bucketInfo.namespace && bucketInfo.id));
			this.frontend.deleteButton.set('disabled', !(bucketInfo.namespace && bucketInfo.id));
		},
		_launchClick: function () {
			this.frontend.runBucket(this.frontend.launchForDebug);
		},
		fetchConfig: function () {
			//dojo.xhrDelete( {
			//	url: 'backend/config' // REST style
			//})
			this.configStore = new JsonRestStore({
				target: '/backend/config'
			});
			console.log("Fetching all config...");
			this.configStore.fetch({
				query: {
					'id': '*'
				},
				onComplete: lang.hitch(this, function (data) {
					console.log("Do something with data: ", data);

					array.forEach(data.items, lang.hitch(this, function (item) {
						var allLayers;
						if (this.configStore.getValue(item, "name") == "dojo_versions") {
							console.log("Fill in versions: " + this.configStore.getValue(item, "value"));
							allLayers = this.configStore.getValue(item, "value");
							array.forEach(allLayers.split('##'), lang.hitch(this, function (v, index, arr) {
								console.log("Adding version: ", v);
								this.versionSelect.addOption([{
									value: v,
									label: v,
									//selected: (index == (arr.length -1))?true:false,
									disabled: false
								}]);

								//if(index == (arr.length -1)){// select the last option
								if (index === 0) {
									this.versionSelect.set("value", v); 
								}
							}));
						} else if (this.configStore.getValue(item, "name") == "dojo_layers") {
							console.log("Fill in layers: " + this.configStore.getValue(item, "value"));
							allLayers = this.configStore.getValue(item, "value");
							array.forEach(allLayers.split('##'), lang.hitch(this, function (v) {
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
								var l = domConstruct.create('label', {
									'class': 'layerName',
									innerHTML: shortName,
									title: v
								});
								domConstruct.place(l, this.layersContainer);
								var cb = new CheckBox({
									'class': 'layerCheckBox',
									layerName: v
								});
								cb.placeAt(this.layersContainer);
								this._layersCBs.push(cb);

								domConstruct.place(domConstruct.create('br'), this.layersContainer);
							}));
						}
					}));

					// inspect the location and see if we have to load a bucket
					var pn = window.location.pathname;
					var bucketRequest = {},
						namespace, id, version;

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

						if (this.frontend.credentials && this.frontend.credentials.token) {
							bucketRequest.token = this.frontend.credentials.token;
						}

						console.log("Requesting: ", bucketRequest);

						request('/backend/bucket', {
							query: bucketRequest,
							handleAs: 'json'
						}).then(lang.hitch(this, function (response) {
							console.log("bucket response: ", response);
							if (response.error && response.error === true) {
								window.alert("Error from server! " + response.message);
							} else {

								this._updateBucketInfo(response);/*{
									name: response.name,
									description: response.description,
									namespace: response.namespace,
									id: response.id,
									version: response.version
								});*/

								var setValueFn = function(response, responseField, editor) {
									editor.setValue(response[responseField]);
								};
								var setValuePartial = lang.partial(setValueFn, response);
								array.forEach(this.frontend.editorTab._editors, function(editor) {
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
								array.forEach(response.layers.split("##"), lang.hitch(this, lang.hitch(this, function (layerName) {
									array.forEach(this._layersCBs, lang.hitch(this, function (cb) {
										if (cb.layerName == layerName) {
											cb.set('checked', true);
										}
									}));
								})));
							}

						}),
						lang.hitch(this, function (response) {
							console.error("ERROR loading bucket: ", response);
						}));
					}
				})
			});

		},
		getLayers: function(){
			var layers = [];
			array.forEach(this._layersCBs, function (cb) {
				if (cb.get('checked') == true) {
					layers.push(cb.layerName);
				}
			});

			return layers;
		}
	})
})