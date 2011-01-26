dojo.provide("wuhi.designer.dijit.form.DateTextBox");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.DateTextBox");

dojo.declare("wuhi.designer.dijit.form.DateTextBox", [dijit.form.DateTextBox, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.DateTextBox",
	_toolboxImg: "Control_DateTextBox.png",
	_resizeAxis: "x",
	
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){
	
	},
	_open:function(){
		//remove the calendar on click
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.DateTextBox);