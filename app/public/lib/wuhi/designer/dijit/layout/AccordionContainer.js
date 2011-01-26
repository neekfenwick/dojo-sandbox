dojo.provide("wuhi.designer.dijit.layout.AccordionContainer");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.layout.AccordionContainer");

dojo.declare("wuhi.designer.dijit.layout.AccordionContainer", [dijit.layout.AccordionContainer, wuhi.designer._Widget], {
	
	dojoClass: "dijit.layout.AccordionContainer",
	_toolboxImg: "Control_AccordionContainer.png",
	moveable: true,
	resizeable: true,
	needsRecreate: true,
	placeChildWidget:function(widget){		
		var index = this.getChildren().length
		this.addChild(widget);
		
		if(!widget.attr("title")){
			widget.attr("title", widget.attr("NextWidgetPrintname"));
		}
		
		this.layout();
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "style", "value": {"width": "150px", "height": "200px"}}
		];
	},
	postInstance:function(){
		this.startup();
	},
	_getAcceptAttr:function(){
		return ["dijit.layout.ContentPane"];
	},
	_getDefaultChildrenAttr:function(){
		return [wuhi.designer.dijit.layout.ContentPane, wuhi.designer.dijit.layout.ContentPane];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.layout.AccordionContainer);