define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/cookie",
	"dojo/html",
	"dojo/request",
	"dojo/on",
	"dojo/_base/fx",
	"dojo/fx",
	"dojox/fx",
	"dijit/form/Button",
	"dijit/Dialog"
], function(declare, lang, dom, domAttr, domClass, domConstruct, domStyle, cookie, html, request, on, fx, coreFx, xFx, Button, Dialog) {
	return declare(null, {
		startup: function() {
			this.inherited(arguments);
			// cookie should have stored username of last logged on user
			// If so, do a sync request to validate user.
			// @TODO: make this non sync. for now, it's easier to do it sync.
			//var usercookie = dojo.cookie('dojo-sandbox');
			var tokenCookie = cookie('token');
			console.log("tokenCookie: ", tokenCookie);

			if (this.credentials.hasOwnProperty("token")) {
				//this._userInfo = dojo.objectFromQuery(usercookie);
				//console.log("userdata: ", this._userInfo);

				request('/backend/security', {
					sync: true,
					query: {
						action: 'validateToken',
						token: this.credentials.token
					},
					handleAs: 'json'
				}).then(lang.hitch(this, function (response) {
						console.log("validateSecurity response: ", response);
						if (response.success === true) {
							this.credentials.username = response.username;
							this.setupForUser();
						} else {
							console.log("Token validation failed (" + response.message + ")");
							delete this.credentials.token;
						}
					}),
					lang.hitch(this, function (response) {
						console.log("validateSecurity ERROR: ", response);
	//								this._userInfo = undefined;
						delete this.credentials.token;
					})
				)
			}

			// At this point we may be logged in or not.
			// Update the UI for our this._userInfo
			this.setupForUser();
		},
		_loginClick: function () {
			//var dlg = dijit.byId('loginDialog');
			//dlg.show();

			var pane = dom.byId('loginDialog');
			// should specify a width on dialogs with <p> tags, otherwise they get too wide
			if (!this.hasOwnProperty("loginDlg")) {
				this.loginDlg = new Dialog({
					id: "loginDlg",
					title: "Login",
					style: {width: '30em'}
				},pane);
				
				on(this.loginDlg, 'submit', lang.hitch(this, function(e) {
					e.preventDefault();
					console.log("Execute!");
					if (!this.loginDlg.validate()) return;

					var fb = dom.byId('loginFeedback');
					domAttr.set(fb, 'innerHTML', 'Please wait...');
					coreFx.wipeIn( {node: fb} ).play();

					var form = this.loginDlg.getChildren()[0];

					request("/backend/login", {
						method: "POST",
						data: form.get('value'),
						handleAs: 'json'
					}).then(lang.hitch(this, function(data) {
							console.log("LOAD: ", data);
							if (data.success === true) {
								this.credentials.username = data.username;
								this.credentials.token = data.token;
								coreFx.chain( [
									coreFx.wipeOut( {node: fb, onEnd: function() {
										domAttr.set(fb, 'innerHTML', data.message);    
									}}),
									coreFx.wipeIn( {node: fb, onEnd: lang.hitch(this, function() {
										window.setTimeout(lang.hitch(this, function() {
											this.setupForUser();
											this.loginDlg.hide();
										}), 3000);
									})})
								]).play();
							} else {
								domAttr.set(fb, 'innerHTML', data.message);
							}
						}),
						function(data) {
							console.error("ERROR: ", data);
							this.showMessageDialog(data.message, data.exceptionMessage);
						}
					)
				}))
			}
			this.loginDlg.reset();
			this.loginDlg.show();

		},

		_logoutClick: function () {
			request("/backend/logout", {
				method: "POST",
				data: {
					token: this.credentials.token
				},
				handleAs: 'json'
			}).then(lang.hitch(this, function(data) {
					console.log("LOAD: ", data);
					if (data.success === true) {
						this.credentials = {};
	//					this.credentials.username = 'public';
	//					this.credentials.token = undefined;
					} else {
						alert("Logout unsuccessful: " + data.message);
					}
					this.setupForUser();
				}),
				function(data) {
					console.error("ERROR: ", data);
					this.showErrorMessageDialog(data);
	//				this.showMessageDialog(data.message, data.exceptionMessage);
				}
			)
		},

		// setupForUser
		//     Generic handling for when we're logged in as a user
		setupForUser: function() {

			domConstruct.empty(this.userInfoNode);
			var b;
			if (this.credentials && this.credentials.username) {
				domAttr.set(this.userInfoNode, 'innerHTML',
				'<span class="userinfo">Logged on as: <span class="username">' +
					this.credentials.username + "</span></span>");
				b = new Button({
					label: 'Logout',
					style: 'vertical-align: middle;',
					onClick: lang.hitch(this, "_logoutClick")
				});
				b.placeAt(this.userInfoNode);
			} else {
				b = new Button({
					label: 'Login',
					onClick: lang.hitch(this, "_loginClick")
				});
				b.placeAt(this.userInfoNode);
			}
		}
	})
})