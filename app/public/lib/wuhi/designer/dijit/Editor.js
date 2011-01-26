dojo.provide("wuhi.designer.dijit.Editor");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.Editor");

dojo.declare("wuhi.designer.dijit.Editor", [dijit.Editor, wuhi.designer._Widget], {
	
	dojoClass: "dijit.Editor",
	//_toolboxImg: "Control_Menu.png",
	resizeable: true,
	_resizeAxis: "y",
	needsRecreate: true,
	_getDefaultsAttr: function(){
		return [
			{"name": "height", "value": "200px"}
		];
	},
	_getAcceptAttr:function(){
		return [];
	},
	_hookResizeMarginBox:function(marginBox){
		marginBox.h -= dojo.marginBox(this.toolbar.domNode).h;
	},
	_hookResizeStyleProps:function(styleProps, marginBox){
		styleProps.style = {"left": marginBox.l+"px", "top": marginBox.t+"px"};
		styleProps.height = marginBox.h+"px";
	},
	postCreate:function(){
		this.inherited("postCreate", arguments);
		//replace the iframe with a plain div to suport the dnd adn resize-functions
		this.iframe = dojo.create("div", {style: {"height": this.height, "width": "100%"}}, this.iframe, "replace");
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.Editor);