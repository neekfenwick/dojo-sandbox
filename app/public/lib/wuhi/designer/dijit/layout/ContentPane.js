dojo.provide("wuhi.designer.dijit.layout.ContentPane");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.layout.ContentPane");

dojo.declare("wuhi.designer.dijit.layout.ContentPane", [dijit.layout.ContentPane, wuhi.designer._Widget], {
	
	dojoClass: "dijit.layout.ContentPane",
	_toolboxImg: "Control_ContentPane.png",
	moveable: false,
	resizeable: false,
	needsRecreate: true,
	placeChildWidget:function(widget){
		dojo.place(widget.domNode, this.containerNode);
		this._scheduleLayout();
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "region", "value": null},
			{"name": "splitter", "value": null},
			{"name": "title", "value": null}
		];
	},
	postInstance:function(){
		
	},
	_getAcceptNotAttr:function(){
		return ["dijit.layout.ContentPane"];
	},
	_setPositionAttr:function(position){
		//a contentpane needs no position
	},
	postCreate:function(){
		this.inherited("postCreate", arguments);
		
		dojo.subscribe("wuhi/designer/widget/resizeComplete", dojo.hitch(this, function(message){
			if(message.needsRecreate == false){
				this._scheduleLayout();
			}
		}));
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.layout.ContentPane);