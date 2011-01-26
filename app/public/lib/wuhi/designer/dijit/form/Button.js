dojo.provide("wuhi.designer.dijit.form.Button");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.Button");

dojo.declare("wuhi.designer.dijit.form.Button", [dijit.form.Button, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.Button",
	resizeable: false,
	_toolboxImg: "Control_Button.png",
	_getDefaultsAttr: function(){
		return [{"name": "label", "value": this.attr("NextWidgetPrintname")}];
	},
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){
		//this.startup();
	},
	_resizeWidget:function(marginBox){		
		dojo.style(this.attr("id"), {"width": marginBox.w, "height": marginBox.h});
	},
	_onButtonClick:function(evt){
		this._onClick(evt);
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.Button);