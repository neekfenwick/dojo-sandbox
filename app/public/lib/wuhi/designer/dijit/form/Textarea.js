dojo.provide("wuhi.designer.dijit.form.Textarea");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.Textarea");

dojo.declare("wuhi.designer.dijit.form.Textarea", [dijit.form.Textarea, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.Textarea",
	//_toolboxImg: "Control_TextBox.png",
	_resizeAxis: "x",
	
	_getDefaultsAttr: function(){
		return [{"name": "style", "value": {"width": "200px"}}, {"name": "value", "value": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat."}];
	},
	_getAcceptAttr:function(){
		return [];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.Textarea);