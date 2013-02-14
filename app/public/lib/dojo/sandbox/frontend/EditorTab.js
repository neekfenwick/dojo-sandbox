define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/EditorTab.html",
    "dojox/html/format",
    "dojox/html/entities",
    "dijit/Toolbar",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/form/DropDownButton",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function(declare, array, lang, domConstruct,
	_TemplatedMixin, _WidgetsInTemplateMixin, template,
	format, entities, Toolbar, Menu, MenuItem, DropDownButton, ContentPane) {
	
	return declare([ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,

		_basePath: "/lib/codemirror/",
		frontend: null,
		_editors: [],
		_editorMixin: {
			"baseNode": null,
			"widget": null,
			"getValue": function () {
				return this.widget.getValue();
			},
			"setValue": function (value) {	
				if(!value){
					return;
				}
				this.widget.setValue(value);
				/* onLoad not working??
				if(this.initialized == false){
					this._valueToInit = value;
				}else{
					this.widget.setValue(value);
				}*/
			}
		},

		constructor: function () {
			this._editors = [lang.delegate(this._editorMixin, {
				"id": "javascript",
				"containerNode": "centerLeftPane",
				"mode": "javascript",
				"defaultValue": "/* js code here */",
				"autoFormat": function(){
					this.setValue( js_beautify( this.getValue() ) );
				}
			}),
			lang.delegate(this._editorMixin, {
				"id": "html",
				"containerNode": "centerTopRightPane",
				"mode": "htmlmixed",
				"defaultValue": "<!-- html code here -->",
				"autoFormat": function(){
					this.setValue( format.prettyPrint(entities.decode( this.getValue() )) );
				}
			}),
			lang.delegate(this._editorMixin, {
				"id": "css",
				"containerNode": "centerBottomRightPane",
				"mode": "css",
				"defaultValue": "/* css code here */"
			})];
		},
		postCreate: function(){
			this.inherited("startup", arguments);

			this.setupEditors();
		},
		setupEditors: function () {
			window["keyBindings"] = {
				enter: "newline-and-indent",
				tab: "reindent-selection",
				ctrl_z: "undo",
				ctrl_y: "redo",
				ctrl_backspace: "undo-for-safari (which blocks ctrl-z)",
				ctrl_bracket: "highlight-brackets",
				ctrl_shift_bracket: "jump-to-matching-bracket"
			};

			array.forEach(this._editors, function (editor) {

//				editor.baseNode = domConstruct.create("textarea", {
//						"style": {
//							"height": "100%",
//							"width": "100%"
//						},
//						value: editor.defaultValue
//					}, this[editor.containerNode].containerNode);

				/*var parserfile = "";
				var stylesheet = "";
				switch (editor.mode) {
				case "html":
					parserfile = ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"];
					stylesheet = [this._basePath + "css/xmlcolors.css", this._basePath + "css/jscolors.css", this._basePath + "css/csscolors.css"];
					break;

				case "js":
					parserfile = ["tokenizejavascript.js", "parsejavascript.js"];
					stylesheet = this._basePath + "css/jscolors.css";
					break;

				case "css":
					parserfile = "parsecss.js";
					stylesheet = this._basePath + "css/csscolors.css";
					break;
				}*/

//				editor.widget = CodeMirror.fromTextArea(editor.baseNode, {
//					"height": "90%",
//					"width": "100%",
//					//value: editor.defaultValue,
//					/*"parserfile": parserfile,
//					"stylesheet": stylesheet,*/
//					mode: editor.mode,
//					"path": this._basePath + "js/",
//					"autoMatchParens": true,
//					"onLoad": lang.hitch(editor, function(){
//						this.initialized = true;
//						this.onInit();
//					})
//				});

				// Each editorDestination is a BorderContainer
				var editorDestination = this[editor.containerNode]
					
				var paneCodeMirrorContainer = new ContentPane({
					region: 'center'
				}).placeAt(editorDestination);
				
				editor.widget = CodeMirror(paneCodeMirrorContainer.containerNode, {
					value: editor.defaultValue,
					mode: editor.mode,
					"path": this._basePath + "js/",
					"autoMatchParens": true
				})
				var toolbar = new Toolbar({
					region: 'top'
				}).placeAt(editorDestination);
				var menu = new Menu({
					style: "display: none;"
				});

				menu.addChild(new MenuItem({
					label: "autoformat",
					onClick: lang.partial(function (scope, evt) {
						scope.autoFormat();
					}, editor)
				}));

				array.forEach(editor.additionalMenuItems, function(menuItem){
					menu.addChild(menuItem);
				}, this);

				toolbar.addChild(new DropDownButton({
					"label": editor.id,
					dropDown: menu
				}));

				//editorDestination.resize();
				editor.widget.refresh();
			}, this);
		},
		_getEditorItem: function (id) {
			return array.filter(this._editors, function (editor) {
				return (editor.id == id) ? editor : undefined;
			})[0];
		}
	})
})