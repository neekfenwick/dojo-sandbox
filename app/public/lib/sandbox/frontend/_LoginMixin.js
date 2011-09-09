dojo.provide("sandbox.frontend._LoginMixin");

dojo.declare("sandbox.frontend._LoginMixin", null, {
	startup: function() {
		this.inherited(arguments);
		// cookie should have stored username of last logged on user
		// If so, do a sync request to validate user.
		// @TODO: make this non sync. for now, it's easier to do it sync.
		//var usercookie = dojo.cookie('dojo-sandbox');
		var tokenCookie = dojo.cookie('token');
		console.log("tokenCookie: ", tokenCookie);
		
		if (this.credentials.hasOwnProperty("token")) {
			//this._userInfo = dojo.objectFromQuery(usercookie);
			//console.log("userdata: ", this._userInfo);

			dojo.xhrGet({
				url: '/backend/security',
				sync: true,
				content: {
					aaction: 'validateToken',
					token: this.credentials.token
				},
				handleAs: 'json',
				load: dojo.hitch(this, function (response) {
					console.log("validateSecurity response: ", response);
					if (response.success === true) {
						this.credentials.username = response.username;
						this.setupForUser();
					} else {
						alert("Token validation failed (" + response.message + ")");
						delete this.credentials.token;
					}
				}),
				error: dojo.hitch(this, function (response) {
					console.log("validateSecurity ERROR: ", response);
//								this._userInfo = undefined;
					delete this.credentials.token;
				})
			});
		}

		// At this point we may be logged in or not.
		// Update the UI for our this._userInfo
		this.setupForUser();
	},
	_loginClick: function () {
		//var dlg = dijit.byId('loginDialog');
        //dlg.show();
        
        var pane = dojo.byId('loginDialog');
        // should specify a width on dialogs with <p> tags, otherwise they get too wide
        if (!this.hasOwnProperty("loginDlg")) {
            this.loginDlg = new dijit.Dialog({
                id: "loginDlg",
                title: "Login",
                style: {width: '30em'},
                _onSubmit: dojo.hitch(this, function() {
                    console.log("Execute!");
                    if (!this.loginDlg.validate()) return;
                    
                    var fb = dojo.byId('loginFeedback');
                    dojo.attr(fb, 'innerHTML', 'Please wait...');
                    dojo.fx.wipeIn( {node: fb} ).play();
                    
                    dojo.xhrPost( {
                        url: "/backend/login",
                        content: this.loginDlg.get('value'),
                        handleAs: 'json',
                        load: dojo.hitch(this, function(data) {
                            console.log("LOAD: ", data);
                            if (data.success === true) {
                                this.credentials.username = data.username;
                                this.credentials.token = data.token;
                                dojo.fx.chain( [
                                    dojo.fx.wipeOut( {node: fb, onEnd: function() {
                                        dojo.attr(fb, 'innerHTML', data.message);    
                                    }}),
                                    dojo.fx.wipeIn( {node: fb, onEnd: dojo.hitch(this, function() {
                                        window.setTimeout(dojo.hitch(this, function() {
											this.setupForUser();
                                            this.loginDlg.hide();
                                        }), 3000);
                                    })})
                                ]).play();
                            } else {
                                dojo.attr(fb, 'innerHTML', data.message);
                            }
                        }),
                        error: function(data) {
                            console.error("ERROR: ", data);
							this.showMessageDialog(data.message, data.exceptionMessage);
                        }
                    });
                    
                })
            },pane);
        }
        this.loginDlg.reset();
        this.loginDlg.show();

	},

	_logoutClick: function () {
		dojo.xhrPost( {
			url: "/backend/logout",
			content: {
				token: this.credentials.token
			},
			handleAs: 'json',
			load: dojo.hitch(this, function(data) {
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
			error: function(data) {
				console.error("ERROR: ", data);
				this.showErrorMessageDialog(data);
//				this.showMessageDialog(data.message, data.exceptionMessage);
			}
		});
	},

	// setupForUser
	//     Generic handling for when we're logged in as a user
	setupForUser: function() {
			
		dojo.empty(this.userInfoNode);
		var b;
		if (this.credentials && this.credentials.username) {
			dojo.attr(this.userInfoNode, 'innerHTML',
			'<span class="userinfo">Logged on as: <span class="username">' +
				this.credentials.username + "</span></span>");
			b = new dijit.form.Button({
				label: 'Logout',
				style: 'vertical-align: middle;',
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
	}
});