dojo.provide("wuhi.designer.dijit.form.CheckBox");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.CheckBox");

dojo.declare("wuhi.designer.dijit.form.CheckBox", [dijit.form.CheckBox, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.CheckBox",
	_toolboxImg: "Control_CheckBox.png",
	resizeable: false,
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){

	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.CheckBox);