dojo.provide("wuhi.designer.dijit.TitlePane");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.TitlePane");

dojo.declare("wuhi.designer.dijit.TitlePane", [dijit.TitlePane, wuhi.designer._Widget], {
	
	dojoClass: "dijit.TitlePane",
	resizeable: false,
	needsRecreate: true,
	_getDefaultsAttr: function(){
		return [
			{"name": "title", "value": this.attr("NextWidgetPrintname")}
		];
	},
	postInstance:function(){
		//this.startup();
	},
	placeChildWidget:function(widget){
		dojo.place(widget.domNode, this.containerNode);
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.TitlePane);