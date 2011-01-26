dojo.provide("wuhi.designer.PropertyGrid");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("wuhi.designer._Widget");

dojo.declare("wuhi.designer.PropertyGrid", [dijit._Widget, dijit._Templated],{

	templateString: dojo.cache("wuhi.designer","resources/PropertyGrid.html"),
	widgetsInTemplate: true,
	_widget: null,
	_widgetId: "",
	designer: null,
	postCreate:function(){
		this.inherited("postCreate", arguments);
				
		this.dataGrid.startup();
	},
	_setDataAttr:function(data){
		var store = new dojo.data.ItemFileWriteStore({"data": data});
		console.log(dojo.clone(data));
		this.dataGrid.setStore(store);
	},
	_onApplyCellEdit:function(inValue, inRowIndex, inFieldIndex){
		//refresh the reference to the widget, because its maybe lost during dnd/refresh
		this._widget = dijit.byId(this._widgetId);
		
		var item = this.dataGrid.getItem(inRowIndex);
		
		//update sourcenode
		var propArray = {};
		if(this.dataGrid.store.getValue(item, "isStyle") == true){
			//update displayed widget
			dojo.style(this._widget.domNode, this.dataGrid.store.getValue(item, "name"), inValue)
			propArray["style"] = {};
			propArray["style"][this.dataGrid.store.getValue(item, "name")] = inValue;
		}else{
			//update displayed widget
			var propName = this.dataGrid.store.getValue(item, "name");
			var propValue = inValue;
			
			if(this.dataGrid.store.getValue(item, "container")){
				propName = this.dataGrid.store.getValue(item, "container");	
				propValue = {};
				propValue[this.dataGrid.store.getValue(item, "name")] = inValue;
				
				this._widget.set(propName, propValue);
				propValue = dojo.toJson(propValue).replace(/"/g, "'");
			}else{
				this._widget.set(propName, propValue);
			}
			
			propArray[propName] = propValue;
		}
		//this.designer._updateNodeAttribute(base, item.name, item.value, this.designer.useHtml5Markup);
		this.designer._updateSourceNode(this._widget.get("id"), propArray, true);
		
		if(this._widget.needsRecreate == true){
			this._refreshDesigner();
		}
	},
	_setWidgetAttr:function(widget){
		this._widget = widget;
		this._widgetId = widget.get("id");
	},
	_refreshDesigner:function(){
		var recreatedWidget = this._widget.designer._refreshDesignerFromSource(this._widget.get("id"));
		this.set("widget", recreatedWidget);
	},
	destroy:function(){
		this.dataGrid.destroy();
	}

});