dojo.provide("wuhi.designer.dijit.layout.BorderContainer");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.layout.BorderContainer");
dojo.require("wuhi.designer.CallbackDialog");
dojo.require("dijit.form.RadioButton");

dojo.declare("wuhi.designer.dijit.layout.BorderContainer", [dijit.layout.BorderContainer, wuhi.designer._Widget], {
	
	dojoClass: "dijit.layout.BorderContainer",
	_toolboxImg: "Control_BorderContainer.png",
	moveable: true,
	resizeable: true,
	needsRecreate: true,
	_regions: ["left", "center", "top", "bottom"],
	_callbackDialog: null,
	useChildDefaults: false,
	placeChildWidget:function(widget){		
		var dialogContent = dojo.create("div");
		dojo.forEach(this._regions, function(region, index){
			var radio = new dijit.form.RadioButton({
			    checked: false,
			    value: region,
			    name: "region"
			}).placeAt(dialogContent);
			dojo.create("span", {"innerHTML": region}, dialogContent);			
			dojo.create("br", null, dialogContent);			
		}, this);
		
		if(this._callbackDialog != null){
			this._callbackDialog.destroyRecursive();
		}

		this._callbackDialog = new wuhi.designer.CallbackDialog({"title": "select a region", content: dialogContent, style: "width: 150px;", callback: dojo.hitch(this, "_regionCallback", widget)});
		this._callbackDialog.show();
		
		//@TODO: get clientX/Y and show dialog on the right position
		dojo.style(this._callbackDialog.dialog.domNode,{
			left: dojo.position(this.domNode).x+"px",
			top: dojo.position(this.domNode).y+"px"
		});
	},
	_regionCallback:function(widget, form){
		//@TODO: check if there exists already a contentpane with that region
		widget.attr("region", form.region);
		
		//region-specific size
		var style = {/*"position": "relative", "top": 0, "left": 0*/};
		if(form.region == "left"){
			style["width"] = "120px";
		}
		dojo.style(widget, style);
		
		this.addChild(widget);
		
		this.designer._updateSourceNode(widget.attr("id"), {"region": form.region, "style":style}, /*instantrefresh*/true, /*clearattributes*/true);
		widget = this.designer._refreshDesignerFromSource(widget.attr("id"));
		widget.showInPropertyGrid();
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "gutters", "value": "true"},
			{"name": "design", "value": "sidebar"},
			{"name": "style", "value": {"height": "200px", "width": "300px"}}
		];
	},
	_getAcceptAttr:function(){
		return ["dijit.layout.ContentPane", "dijit.layout.AccordionContainer", "dijit.layout.TabContainer", "dijit.layout.BorderContainer", "dijit.Menu", "dijit.Toolbar"];
	},
	layout:function(){
		this.inherited("layout", arguments);
		
		//all children of a bordercontainer are not allowed to be resizeable and moveable
		dojo.forEach(this.getChildren(), function(child){
			child.attr("moveable", false);
			child.attr("resizeable", false);
		});
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.layout.BorderContainer);