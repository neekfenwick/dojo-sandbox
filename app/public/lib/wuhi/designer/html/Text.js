dojo.provide("wuhi.designer.html.Text");

dojo.require("wuhi.designer._Widget");

dojo.declare("wuhi.designer.html.Text", wuhi.designer._Widget, {
	
	dojoClass: "html.Text",
	isDojoWidget: false,
	baseElement: "span",
	resizeable: false,
	_toolboxImg: "Control_Label.png",
	_getDefaultsAttr: function(){
		return [{"name": "innerHTML", "value": this.attr("NextWidgetPrintname")}];
	},
	_getAcceptAttr:function(){
		return [];
	},
	_setInnerHTMLAttr:function(value){
		this.innerHTML = value;
		dojo.attr(this.domNode, "innerHTML", value);
	},
	_getInnerHTMLAttr:function(){
		return this.innerHTML;
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.html.Text);