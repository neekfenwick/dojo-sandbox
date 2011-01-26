dojo.provide("wuhi.designer.dijit.form.TextBox");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.TextBox");

dojo.declare("wuhi.designer.dijit.form.TextBox", [dijit.form.TextBox, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.TextBox",
	_toolboxImg: "Control_TextBox.png",
	_resizeAxis: "x",
	
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){

	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.TextBox);