dojo.provide("wuhi.designer.CallbackDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

dojo.declare("wuhi.designer.CallbackDialog", [dijit._Widget, dijit._Templated],{

	templateString: dojo.cache("wuhi.designer","resources/CallbackDialog.html"),
	widgetsInTemplate: true,
	title: "",
	content: null,
	callback: function(){},

	postCreate:function(){
		this.inherited("postCreate", arguments);
		
		this.contentArea.appendChild(this.content)
	},
	_onOkClick:function(){

		var form= this.dialog.getValues();
		var size = 0;
		for (e in form) { 
			if(form[e] != null) {size++;}
		}
		if(size > 0){
			this.callback(form);
			this.hide();
		}
	},
	show:function(){
		this.dialog.show();
	},
	hide:function(){
		this.dialog.hide();
	}

});