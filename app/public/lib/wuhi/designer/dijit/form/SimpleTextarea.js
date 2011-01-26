dojo.provide("wuhi.designer.dijit.form.SimpleTextarea");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("wuhi.designer.dijit.form.SimpleTextarea", [dijit.form.SimpleTextarea, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.SimpleTextarea",
	//_toolboxImg: "Control_TextBox.png",
	_resizeAxis: "xy",
	
	_getDefaultsAttr: function(){
		return [{"name": "style", "value": {"width": "200px"}}, {"name": "value", "value": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat."}];
	},
	_getAcceptAttr:function(){
		return [];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.SimpleTextarea);