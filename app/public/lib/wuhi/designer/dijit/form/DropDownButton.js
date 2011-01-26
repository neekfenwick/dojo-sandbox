dojo.provide("wuhi.designer.dijit.form.DropDownButton");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.DropDownButton");

dojo.declare("wuhi.designer.dijit.form.DropDownButton", [dijit.form.DropDownButton, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.DropDownButton",
	resizeable: false,
	_toolboxImg: "Control_Button.png",
	_getDefaultsAttr: function(){
		return [
			{"name": "label", "value": this.attr("NextWidgetPrintname")}
		];
	},
	_getAcceptAttr:function(){
		return ["dijit.Menu"];
	},
	postAllChildInstances:function(){
		//this.startup();
	},
	_resizeWidget:function(marginBox){		
		dojo.style(this.attr("id"), {"width": marginBox.w, "height": marginBox.h});
	},
	_getDefaultChildrenAttr:function(){
		return [/*wuhi.designer.html.Text, */wuhi.designer.dijit.Menu];
	},
	placeChildWidget:function(widget){
		//children are not allowed to be moveable or resizeable
		widget.attr("moveable", false);
		widget.attr("resizeable", false);
		widget.attr("style",  {"display": "none"});
		
		this.inherited("placeChildWidget", arguments);
	},
	loadDropDown:function(){
		//remove poup
	},
	toggleDropDown:function(){}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.DropDownButton);