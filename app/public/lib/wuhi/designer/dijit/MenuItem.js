dojo.provide("wuhi.designer.dijit.MenuItem");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.MenuItem");

dojo.declare("wuhi.designer.dijit.MenuItem", [dijit.MenuItem, wuhi.designer._Widget], {
	
	dojoClass: "dijit.MenuItem",
	resizeable: false,
	moveable: false,
	needsRecreate: false,
	_getDefaultsAttr: function(){
		return [
			{"name": "label", "value": this.attr("NextWidgetPrintname")}
		];
	},
	_getAcceptAttr:function(){
		return [];
	},
	postInstance:function(){
		//this.startup();
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
		
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.MenuItem);