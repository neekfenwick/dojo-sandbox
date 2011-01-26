dojo.provide("wuhi.designer.dijit.form.RadioButton");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.RadioButton");

dojo.declare("wuhi.designer.dijit.form.RadioButton", [dijit.form.RadioButton, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.RadioButton",
	//_toolboxImg: "Control_CheckBox.png",
	resizeable: false,
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){

	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.RadioButton);