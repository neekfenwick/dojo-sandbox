dojo.provide("wuhi.designer.dijit.PopupMenuItem");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.PopupMenuItem");

dojo.declare("wuhi.designer.dijit.PopupMenuItem", [dijit.PopupMenuItem, wuhi.designer._Widget], {
	
	dojoClass: "dijit.PopupMenuItem",
	resizeable: false,
	moveable: false,
	needsRecreate: false,
	_getDefaultsAttr: function(){
		return [
			{"name": "label", "value": this.attr("NextWidgetPrintname")}
		];
	},
	_getAcceptAttr:function(){
		return ["dijit.Menu"];
	},
	postInstance:function(){
		//this.startup();
	},
	placeChildWidget:function(widget){
		widget.attr("moveable", false);
		widget.attr("resizeable", false);
		
		this.inherited("placeChildWidget", arguments);

		//dojo.place(widget.domNode, this.containerNode);

	},
	_setPositionAttr:function(position){
		//needs no position
	},
	_onHover:function(){
		
	},
	_onUnhover:function(){
		
	},
	_onClick:function(){
		
	},
	_onFocus:function(){
		
	},
	_getDefaultChildrenAttr:function(){
		return [wuhi.designer.dijit.Menu];
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.PopupMenuItem);