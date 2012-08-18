dojo.provide("sandbox.frontend._DialogUtilsMixin");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");

dojo.declare("sandbox.frontend._DialogUtilsMixin", null, {
	okDialog: undefined,
	yesnoDialog: undefined,
	
	_makeokDialog: function() {
		if (this.okDialog) return;
		this.okDialog = new dijit.Dialog( {
			content: "<span class='dialogImg'></span><span class='dialogText'></span>" +
				"<div class='dijitDialogPaneActionBar'><button data-dojo-type='dijit.form.Button' data-dojo-props='type: \"submit\"'>OK</button></div>"
		});
		this.okDialog.startup();
	},
	_makeyesnoDialog: function() {
		if (this.yesnoDialog) return;
		this.yesnoDialog = new dijit.Dialog();
		var yesnoDialog = this.yesnoDialog;
		var form = new dijit.form.Form( {
			onSubmit: function(e) {
				console.log("submit!");
				dojo.stopEvent(e);
			}
		});
		form.placeAt(this.yesnoDialog.containerNode);
		dojo.create('span', {
			'class': 'dialogImg'
		}, form.containerNode);
		dojo.create('span', {
			'class': 'dialogText'
		}, form.containerNode);
		var ab = dojo.create('div', {
			'class': 'dijitDialogPaneActionBar'
		}, form.containerNode);
		var yesButton = new dijit.form.Button( {
			label: 'Yes',
			type: 'submit',
			onClick: function() {
				console.log("yes");
				yesnoDialog.callback(true);
			}
		});
		yesButton.placeAt(ab);
		var noButton = new dijit.form.Button( {
			label: 'No',
			type: 'submit',
			onClick: function() {
				console.log("no");
				yesnoDialog.callback(false);
			}
		});
		noButton.placeAt(ab);
		this.yesnoDialog.startup();
		//this.connect(this.yesnoDialog, 'onSubmit', dojo.hitch(this, this._yesnoSubmit));
	},
	_yesnoSubmit: function(e) {
		console.log("yesno: ", e, " - callback: ", this.yesnoDialog.callback);
	},
	_applyState: function(dlg, state, title, message) {
		var imgResults = dojo.query('.dialogImg', dlg.containerNode);
		console.log("imgResults: ", imgResults);
		dojo.addClass(imgResults[0], state + 'DialogImg');
		dlg.set('title', title);
		var textResults = dojo.query('.dialogText', dlg.containerNode);
		dojo.attr(textResults[0], 'innerHTML', message);
	},
	raiseErrorDialog: function(title, message) {
		if (!this.okDialog) {
			this._makeokDialog();
		}
		this._applyState(this.okDialog, 'error', title, message);
		this.okDialog.show();
	},
	raiseQuestionDialog: function(title, message, callback) {
		if (!this.yesnoDialog) {
			this._makeyesnoDialog();
		}
		this.yesnoDialog.callback = callback;
		this._applyState(this.yesnoDialog, 'question', title, message);
		this.yesnoDialog.show();
	}
})