define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/request",
	"dijit/Dialog",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
	"dojox/widget/Standby"
], function(declare, lang, domAttr, domClass, domConstruct, domStyle,
	Dialog, ContentPane, TabContainer, Standby) {
	return declare(Dialog, {

		// width,height applied to either dialog containerNode or TabContainer,
		//  depending on showSource.  TODO improve the way these are specified,
		//  can we get the same result by taking the 'style' attribute provided to
		//  us in markup, similar to dijit.Dialog?
		width: "500px",
		height: "500px",

		// bucketBaseUrl: String
		//     Base url to prefix to fetch the bucket content, e.g. '', 'http://somewhere.com'
		bucketBaseUrl: '',

		// If specified, these can cause the bucket's normal dojo version to be
		//  overridden and loaded from elsewhere.
		//  e.g. http://anotherserver.com/somepath/dojo-release-1.5.0-src/dojo/dojo.xd.js
		dojoLibOverrideUrl: undefined, // e.g. http://anotherserver.com/somepath
		dojoLibOverrideSDK: undefined, // e.g. dojo-release-1.5.0-src
		dojoLibOverrideDojoJS: undefined, // e.g. 'dojo.js', 'dojo.xd.js'

		// bucket: String
		//     The id of the bucket to raise, e.g. /public/abcd/1
		bucketNamespace: undefined,
		bucketId: undefined,
		bucketVersion: undefined,

		// showSource: Boolean
		//     Should the source panes be displayed?  If true, a TabContainer is
		//     created and html/js/css panes are available, otherwise no TabContainer
		//     is created for optimal use of GUI space.
		showSource: true,

		_iframe: undefined,

		buildRendering: function() {
			this.inherited(arguments);

			this._containerCP = new ContentPane();
			this._containerCP.placeAt(this.containerNode);

			if (this.showSource === true) {
				this._tc = new TabContainer({
					style: "width: " + this.width + "; height: " + this.height
				});
				this._tc.placeAt(this._containerCP.containerNode);
				this._tc.startup();

				// html pane
				this._htmlPane = new ContentPane({
					title: 'HTML'
				});
				this._tc.addChild(this._htmlPane);

				// js pane
				this._jsPane = new ContentPane({
					title: 'Javascript'
				});
				this._tc.addChild(this._jsPane);

				// css pane
				this._cssPane = new ContentPane({
					title: 'CSS'
				});
				this._tc.addChild(this._cssPane);

				// run pane
				this._ifrcp = new ContentPane({
					title: 'Run'
				});
				this._tc.addChild(this._ifrcp);
			}

			this._sb = new Standby( {
				target: this.containerNode
			});
			this._sb.startup();
		},

		onShow: function() {
			this.inherited(arguments);

			console.log("BucketDialog doing custom onShow() handling...");

			if (!this._iframe) {
				var ifr = domConstruct.create('iframe');
				ifr.id = this.id+"_iframe";

				ifr.style.border = "none";
				ifr.style.width = "100%";
				this._layoutMode = true; // hack
				if(this._layoutMode){
					// iframe should be 100% height, thus getting it's height from surrounding
					// <div> (which has the correct height set by Editor)
					ifr.style.height = "100%";
				}else{
					if(has('ie') >= 7){
						if(this.height){
							ifr.style.height = this.height;
						}
						if(this.minHeight){
							ifr.style.minHeight = this.minHeight;
						}
					}else{
						ifr.style.height = this.height ? this.height : this.minHeight;
					}
				}
				ifr.frameBorder = 0;
				ifr._loadFunc = lang.hitch( this, function(win){
					this.window = win;
					this.document = this.window.document;

					console.log("_loadFunc here! this ", this, " win ", this.window, " document ", this.document);
					this._sb.hide();
	//				if(dojo.isIE){
	//					this._localizeEditorCommands();
	//				}
	//
	//				// Do final setup and set initial contents of editor
	//				this.onLoad(this.bucket);
				});

				this._iframe = ifr;

				var putIframeIn = this._containerCP.containerNode;
				if (this.showSource === true) {
					// We have a TabContainer to populate
					console.log("Populating full source...");



					// Request the bucket source and populate those panes asynchronously
					request('/backend/bucket', {
						data: {
							namespace: this.bucketNamespace,
							id: this.bucketId,
							version: this.bucketVersion
						},
						handleAs: 'json'
					}).then(lang.hitch(this, function (response) {
							console.log("bucket response: ", response);
							if (response.error && response.error === true) {
								window.alert("Error from server! " + response.message);
							} else {
								this._htmlPane.set('content', response.content_html);
								this._jsPane.set('content', response.content_js);
								this._cssPane.set('content', response.content_css);
							}
						}),
						lang.hitch(this, function(response) {
							console.error("ERROR loading bucket, response: ", response);
						})
					);

					this._tc.selectChild(this._ifrcp);
					putIframeIn = this._ifrcp.containerNode;

					this._tc.resize();
				} else {
					// No TabContainer, just use this.containerNode
					domStyle.set(putIframeIn, {
						width: this.width,
						height: this.height
					});
				}

				putIframeIn.appendChild(this._iframe);

				var queryParams = [ "onLoadHandler=_loadFunc" ];
				if (this.dojoLibOverrideUrl) queryParams.push(this.dojoLibOverrideUrl);
				if (this.dojoLibOverrideSDK) queryParams.push(this.dojoLibOverrideSDK);
				if (this.dojoLibOverrideLoader) queryParams.push(this.dojoLibOverrideLoader);
				this._iframe.src = this._generateRunUrl() +
					((queryParams.length > 0) ? ('?' + queryParams.join('&')) : '');
	//			var getContent = {};
	//			if (this.dojoLibOverrideUrl) getContent.dojoLibOverrideUrl = dojoLibOverrideUrl;
	//			dojo.xhrGet( {
	//				url: this._generateRunUrl(),
	//				content: {
	//					dojoLibOverrideUrl: this.dojoLibOverrideUrl,
	//				}
	//			})
			}

		},
		_generateRunUrl: function() {
			return this.bucketBaseUrl +
				"/backend/run/index" +
				"/namespace/" + this.bucketNamespace +
				"/id/" + this.bucketId +
				"/version/" + this.bucketVersion;
		}
	})
})