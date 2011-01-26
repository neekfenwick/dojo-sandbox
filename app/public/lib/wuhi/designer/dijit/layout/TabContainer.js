dojo.provide("wuhi.designer.dijit.layout.TabContainer");

dojo.require("wuhi.designer._Widget");
dojo.require("wuhi.designer.dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");

dojo.declare("wuhi.designer.dijit.layout.TabContainer", [dijit.layout.TabContainer, wuhi.designer._Widget], {
	
	dojoClass: "dijit.layout.TabContainer",
	_toolboxImg: "Control_TabContainer.png",
	needsRecreate: true,
	_getAcceptAttr:function(){
		return ["dijit.layout.ContentPane"];
	},
	placeChildWidget:function(widget){
				
		this.addChild(widget);
		//set the tab-name
		if(!widget.attr("title")){
			//widget.attr('title', 'Tab ' + this.getIndexOfChild(widget));
			widget.attr("title", widget.attr("NextWidgetPrintname"));
		}
		
		this.layout();
	},
	postInstance:function(){
		this.startup();
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "style", "value": {"height": "200px", "width": "300px"}}
		];
	},
	_getDefaultChildrenAttr:function(){
		return [wuhi.designer.dijit.layout.ContentPane];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.layout.TabContainer);