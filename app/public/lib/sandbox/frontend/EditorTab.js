dojo.provide("sandbox.frontend.EditorTab");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.form.DropDownButton");
dojo.require("dojox.html.format");

dojo.declare("sandbox.frontend.EditorTab", [dijit.layout.ContentPane, dijit._Templated], {
	templateString: dojo.cache("sandbox", "frontend/templates/EditorTab.html"),
	widgetsInTemplate: true,
	
	_basePath: "/lib/codemirror/",
	_editors: [],
	_editorMixin: {
		"initialized": false,
		"baseNode": null,
		"widget": null,
		"getValue": function () {
			return this.widget.getCode();
		},
		"setValue": function (value) {	
			if(!value){
				return;
			}
			if(this.initialized == false){
				this._valueToInit = value;
			}else{
				this.widget.setCode(value);
			}
		},
		"onInit": function(){
			this.setValue(this._valueToInit);
		},
		"autoFormat": function(){
			alert("not yet implemented");
		}		
	},
	
	constructor: function () {
		this._editors = [dojo.delegate(this._editorMixin, {
			"id": "javascript",
			"initialized": false,
			"containerNode": "centerLeftPane",
			"syntax": "js",
			"defaultValue": "/* js code here */",
			"autoFormat": function(){
				this.setValue( js_beautify( this.getValue() ) );
			}
		}),
		dojo.delegate(this._editorMixin, {
			"id": "html",
			"containerNode": "centerTopRightPane",
			"syntax": "html",
			"defaultValue": "<!-- html code here -->",
			"autoFormat": function(){
				this.setValue( dojox.html.format.prettyPrint(dojox.html.entities.decode( this.getValue() )) );
			}
		}),
		dojo.delegate(this._editorMixin, {
			"id": "css",
			"containerNode": "centerBottomRightPane",
			"syntax": "css",
			"defaultValue": "/* css code here */"
		})];
	},
	startup: function(){
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

		dojo.forEach(this._editors, function (editor) {

			editor.baseNode = dojo.create("textarea", {
					"style": {
						"height": "100%",
						"width": "100%"
					}
				}, this[editor.containerNode].containerNode);
			
			var parserfile = "";
			var stylesheet = "";
			switch (editor.syntax) {
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
			}

			editor.widget = CodeMirror.fromTextArea(editor.baseNode, {
				"height": "90%",
				"width": "100%",
				"content": editor.defaultValue,
				"parserfile": parserfile,
				"stylesheet": stylesheet,
				"path": this._basePath + "js/",
				"autoMatchParens": true,
				"onLoad": dojo.hitch(editor, function(){
					this.initialized = true;
					this.onInit();
				})
			});

			var toolbar = new dijit.Toolbar().placeAt(editor.widget.wrapping, "before");
			var menu = new dijit.Menu({
				style: "display: none;"
			});

			menu.addChild(new dijit.MenuItem({
				label: "autoformat",
				onClick: dojo.partial(function (scope, evt) {
					scope.autoFormat();
				}, editor)
			}));
			
			dojo.forEach(editor.additionalMenuItems, function(menuItem){
				menu.addChild(menuItem);
			}, this);

			toolbar.addChild(new dijit.form.DropDownButton({
				"label": editor.id,
				dropDown: menu
			}));

		}, this);
	},
	_getEditorItem: function (id) {
		return dojo.filter(this._editors, function (editor) {
			return (editor.id == id) ? editor : undefined;
		})[0];
	}
});