define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/query",
	"dijit/Dialog",
	"dijit/form/Form",
	"dijit/form/Button",
	"dijit/form/ValidationTextBox"
], function(declare, lang, domAttr, domClass, domConstruct, domStyle, query,
	Dialog, Form, Button, ValidationTextBox) {
	return declare(null, {
		okDialog: undefined,
		yesnoDialog: undefined,

		_makeokDialog: function() {
			if (this.okDialog) return;
			this.okDialog = new Dialog( {
				content: "<span class='dialogImg'></span><span class='dialogText'></span>" +
					"<div class='dijitDialogPaneActionBar'><button data-dojo-type='dijit.form.Button' data-dojo-props='type: \"submit\"'>OK</button></div>"
			});
			this.okDialog.startup();
		},
		_makeyesnoDialog: function() {
			if (this.yesnoDialog) return;
			this.yesnoDialog = new Dialog();
			var yesnoDialog = this.yesnoDialog;
			var form = new Form( {
				onSubmit: function(e) {
					console.log("submit!");
					dojo.stopEvent(e);
				}
			});
			form.placeAt(this.yesnoDialog.containerNode);
			domConstruct.create('span', {
				'class': 'dialogImg'
			}, form.containerNode);
			domConstruct.create('span', {
				'class': 'dialogText'
			}, form.containerNode);
			var ab = domConstruct.create('div', {
				'class': 'dijitDialogPaneActionBar'
			}, form.containerNode);
			var yesButton = new Button( {
				label: 'Yes',
				type: 'submit',
				onClick: function() {
					console.log("yes");
					yesnoDialog.callback(true);
				}
			});
			yesButton.placeAt(ab);
			var noButton = new Button( {
				label: 'No',
				type: 'submit',
				onClick: function() {
					console.log("no");
					yesnoDialog.callback(false);
				}
			});
			noButton.placeAt(ab);
			this.yesnoDialog.startup();
			//this.connect(this.yesnoDialog, 'onSubmit', lang.hitch(this, this._yesnoSubmit));
		},
		_yesnoSubmit: function(e) {
			console.log("yesno: ", e, " - callback: ", this.yesnoDialog.callback);
		},
		_applyState: function(dlg, state, title, message) {
			var imgResults = query('.dialogImg', dlg.containerNode);
			console.log("imgResults: ", imgResults);
			domClass.add(imgResults[0], state + 'DialogImg');
			dlg.set('title', title);
			var textResults = query('.dialogText', dlg.containerNode);
			domAttr.set(textResults[0], 'innerHTML', message);
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
})