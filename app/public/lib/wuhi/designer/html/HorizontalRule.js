dojo.provide("wuhi.designer.html.HorizontalRule");

dojo.require("wuhi.designer._Widget");

dojo.declare("wuhi.designer.html.HorizontalRule", wuhi.designer._Widget, {
	
	dojoClass: "html.HorizontalRule",
	isDojoWidget: false,
	baseElement: "hr",
	resizeable: true,
	_resizeAxis: "x",
	_toolboxImg: "Control_Hr.png",
	_getDefaultsAttr: function(){
		return [{"name": "style", "value": {"width": "200px"}}];
	},
	_getAcceptAttr:function(){
		return [];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.html.HorizontalRule);