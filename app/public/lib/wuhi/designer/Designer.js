dojo.provide("wuhi.designer.Designer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("wuhi.designer._WidgetDescriptor");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.layout.TabContainer");
dojo.require("dojox.widget.Toaster");
dojo.require("dijit.Toolbar");
dojo.require("dojox.widget.Dialog");
dojo.require("dojox.grid.DataGrid");
dojo.require("wuhi.designer.PropertyGrid");		
dojo.require("wuhi.designer.DesignPane");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Tree");
dojo.require("dijit.tree.TreeStoreModel");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.tree.dndSource");
dojo.require("dijit.form.ToggleButton");
dojo.require("wuhi.designer.SelectionController");
dojo.require("dojox.html.entities");

dojo.declare("wuhi.designer.Designer", [dijit._Widget, dijit._Templated],{

	templateString: dojo.cache("wuhi.designer","resources/Designer.html"),
	widgetsInTemplate: true,
	_objectTree: null,
	_objectTreeStore: null,
	alignToGrid: true,
	useHtml5Markup: false,
	_history: [""], //the first history-entry is an empty string
	_historyIndex: 1,
	selectionController: null,
	
	postCreate:function(){
		//set designer for the deisgnerpane (first widget) it will inherit the designer to all created child widgets
		this.designerPane.designer = this;
		this.propertyGrid.designer = this;
		this.selectionController = new wuhi.designer.SelectionController(this);
		
		this.inherited("postCreate", arguments);

		//add all avaliable designer-widgets to the toolbox
		dojo.forEach(wuhi.designer.registry.classes, function(entry){
				if(entry.type == "designerWidgetClass" ){
					var proto = entry.content.prototype;

					var entry = dojo.create("div", {"dndType": proto.dojoClass, "dojoClass": proto.dojoClass});
					var cellLeft = dojo.create("div", {"style": {"float": "left", "width": "20px"}}, entry);
					var img = dojo.create("img", {"src": "img/" + proto._toolboxImg}, cellLeft);
					var cellRight = dojo.create("div", {"innerHTML": proto.dojoClass}, entry);
					
					dojo.addClass(entry, "dojoDndItem");
					dojo.place(entry,  this.toolboxDndSource);
				}
			}, this
		);
			
		//enable dnd
		this._toolboxDndSource = new dojo.dnd.Source(this.toolboxDndSource);
		dojo.connect(this._toolboxDndSource, "onDndStart", this, function(){
			//remove the selection if dnd is in progress. this is needed because the selection-avatar has a higher zIndex than the dnd-target of the widget
			this.selectionController.removeSelection();
		});
			
		//this.mainToaster.setContent('did you know?<p>...you can resize the widgets with a doubleclick...</p>', 'message');
		//this.mainToaster.show();
			
		//init object explorer	
		this._loadObjectExplorer();
	},
	createHistoryStep:function(){
		var content = dojo.attr(dojo.clone(this.codePaneInternal), "innerHTML");

		//if the historyIndex is not at the end of the array, cut the array from historyIndex to the end
		if(this._historyIndex < this._history.length - 1){
			var newHistory = [];
			for(var i = 0; i <= this._historyIndex; i++){
				newHistory.push(this._history[i]);
			}
			this._history = newHistory;
		}
		
		if(content != this._history[this._history.length - 1]){
			this._history.push(content);
			this._historyIndex = this._history.length - 1;
		}
	},
	_onUndoClick:function(evt){
		
		if(this._historyIndex > 0){
			this._historyIndex--;
			
			this.set("sourceInternal", dojo.create("div", {"innerHTML": this._history[this._historyIndex]}), false);
			this._refreshDesignerFromSource();
			
			this._refreshCodePane(true);
		}
	},
	_onRedoClick:function(evt){
		
		if(this._historyIndex < (this._history.length - 1)){
			this._historyIndex++;
			
			this.set("sourceInternal", dojo.create("div", {"innerHTML": this._history[this._historyIndex]}), false);
			this._refreshDesignerFromSource();
			
			this._refreshCodePane(true);
		}
	},
	_onAlignToGridChanged:function(value){
		this.alignToGrid = value;
	},
	_onHtml5ButtonChanged:function(value){
		this.useHtml5Markup = value;	
	},
	_onClickTundra:function(evt){
		dojo.removeClass(dojo.body(), "claro");
		dojo.addClass(dojo.body(), "tundra");
		this._refreshDesignerFromSource();
	},
	_onClickClaro:function(evt){
		dojo.removeClass(dojo.body(), "tundra");
		dojo.addClass(dojo.body(), "claro");
		this._refreshDesignerFromSource();
	},
	_loadObjectExplorer: function () {
		
		if (this._objectTree != null) {
			this._objectTree.destroyRecursive();
			this._objectTree = null;
		}
		this._objectTreeStore = new dojo.data.ItemFileWriteStore({
			data: {
				identifier: "id",
				label: "name",
				items: [this.getObjectExplorerData()]
			}
		});
		
		dojo.connect(this._objectTreeStore, "onNew", function(item, parent){
			//@TODO: create dropped widgets
			//console.log(item, parent);
		});
				
		var model = new dijit.tree.TreeStoreModel({
			"store": this._objectTreeStore,
			"childrenAttrs": ["children"]
		});

		//@TODO: fix this with dojo.hitch
		var designer = this;
	
		this._objectTree = new dijit.Tree({
			"model": model,
			"dndController": dijit.tree.dndSource,
			"showRoot": true,
			"onClick": dojo.hitch(this, "_onObjectTreeClick"),
			"autoExpand": true,
			"checkItemAcceptance":function(node,source){
				var accepted = false;
				//console.log(node, source);
				source.forInSelectedItems(function(item){
					var storeItem = dijit.getEnclosingWidget(node).item;
					var sourceDojoType;
					
					if(item.type == "treeNode"){//dnd tree to tree
						sourceDojoType = designer._objectTreeStore.getValue(item.data.item, "name");
					}else{//dnd from toolbox to tree
						sourceDojoType = item.type;
						
						accepted = false;
						return;
					}

					var targetDojoType = storeItem.name[0];
					var targetDesignerDojoType = designer.designerClassFromDojoClass(targetDojoType);				
					var targetWidget = wuhi.designer._Widget.prototype.__stringToFunction(targetDesignerDojoType);
					
					if(storeItem.id[0] == "root"){
						targetWidget = {prototype: wuhi.designer.DesignPane.prototype};
					}

					//check if the source is accepted by the target
					if(targetWidget){
						dojo.forEach(targetWidget.prototype.get("accept"), function(entry){
							if(entry == sourceDojoType){
								accepted = true;
							}
						});
					}
				});
				
				return accepted;
			},
			"onDndDrop":function(source, nodes, copy){
				this.inherited("onDndDrop", arguments)
				
				if(source.declaredClass == "dijit.tree.dndSource"){ //dnd tree to tree
					
					var newInternalSourceContainer = designer.__getSourceNodesByTreeStoreItemsHelper(designer._objectTreeStore._arrayOfAllItems[0]);
					designer.set("sourceInternal", newInternalSourceContainer, true);
				}else if(source.declaredClass == "dojo.dnd.Source"){
					
				}
			},
			"onClick":dojo.hitch(this, function(item){
				var widget = dijit.byId(this._objectTreeStore.getValue(item, "id"));
				if(widget){
					dojo.publish("wuhi/designer/widget/click", [{widget: widget, event: null}]);
				}
			})
		}).placeAt(this.objectExplorer.domNode);
		
		this._objectTree.startup();
	},
	__getSourceNodesByTreeStoreItemsHelper:function(item){
		//
		//	helperfunction
		//
		var entry = dojo.clone(this._getInternalNodeById(item.id[0]));
		if(item.id[0] == "root"){
			entry = dojo.create("div");
		}
			
		//remove all children because there whre added one by one
		var widget = dijit.byId(dojo.attr(entry, "id"));
		if(widget){
			if(widget.isDojoWidget == true){
				dojo.attr(entry, "innerHTML", "");
			}
		}
		
		//console.log(item.id[0], entry);
		
		dojo.forEach(item.children, function(child) {
			var newChild = this.__getSourceNodesByTreeStoreItemsHelper(child);
			if(dojo.attr(newChild, "id")){
				entry.appendChild(newChild);
			}
		}, this);
			
		return entry;
	},
	_getInternalNodeById:function(id){
		var node = dojo.query("[id$="+id+"]", this.codePaneInternal)[0] || null;
		return node;
	},

	_onObjectTreeClick:function(item){

		var widget = dijit.byId(this._objectTreeStore.getValue(item, "id"));
		
		var items = [];
		var props = wuhi.designer._WidgetDescriptor.prototype.getProperties(widget.dojoClass);
		dojo.forEach(props, function(item, index){
			if(item.isStyle == true){
				items.push({"id": index, "name": item.name, "value": dojo.style(this.domNode, item.name), "isStyle": item.isStyle});
			}else{
				items.push({"id": index, "name": item.name, "value": this.get(item.name), "isStyle": item.isStyle});
			}
		}, widget);
		
		var props = {'identifier': 'id',
			'label': 'name',
			'numRows': 1,
			'items':items
		};
		
		this.propertyGrid.set("data", props);
		this.propertyGrid.set("widget", widget);
	},
	getObjectExplorerData:function(){
		return this.__getTreeEntriesHelper(this.codePaneInternal);
	},
	__getTreeEntriesHelper:function(node){
		//
		//	helperfunction
		//
		var entry = {"id": dojo.attr(node, "id") || "root", "name": dojo.attr(node, ((this.useHtml5Markup)?"data-dojo-type":"dojoType")) || node.tagName};

		var children = [];
		dojo.forEach(dojo.query(">", node), function(subNode) {
		   children.push(this.__getTreeEntriesHelper(subNode));
		}, this);
		
		if(children.length > 0){
			entry["children"] = children;
		}
		
		return entry;
	},
	_getDesignerSourceAttr:function(){
		var source = dojo.attr(this.codePaneInternal, "innerHTML");
		var container = dojo.create("div", {"innerHTML": source});
		
		dojo.query("*", container).forEach(function(node){
			if(dojo.attr(node, ((this.useHtml5Markup)?"data-dojo-type":"dojoType"))){
				//console.log(node);
				dojo.attr(node, ((this.useHtml5Markup)?"data-dojo-type":"dojoType"), this.designerClassFromDojoClass(dojo.attr(node, ((this.useHtml5Markup)?"data-dojo-type":"dojoType"))));
			}
		}, this);
		
		return dojo.attr(container, "innerHTML");
	},
	_getSourceAttr:function(){
		return this.codePaneInternal.innerHTML;
	},
	_setSourceAttr: function(value){
		var container = dojo.create("div", {"innerHTML": value});
		
		this.set("sourceInternal", container, true);
	},
	_setOutputSourceAttr: function(value){
		this.codePaneExternal.innerHTML = value;
	},
	_getOutputSourceAttr: function(){
		return this.codePaneExternal.innerHTML;
	},
	_pasteSource:function(sourceNode, parentId, instantRefresh){
		if(sourceNode == null){ return; }

		var foundParent = 0;
		dojo.query("*", this.codePaneInternal).forEach(function(node){
			//console.log("checking node ", node);
			if(node.id == parentId){
				dojo.place(sourceNode, node);
				foundParent++;
			}
		});
		//if no parent was found (e.g. for the first widget) drop it in the root ...
		if(foundParent == 0){ dojo.place(sourceNode, this.codePaneInternal); }

		if(instantRefresh === true){
			//display the new source
			this._refreshCodePane();
		}
		
		//refresh the object-explorer
		//this._loadObjectExplorer();
		//@TODO: fix this ugly time-hack (its only with dndcontroller of the object-tree
		setTimeout(dojo.hitch(this, "_loadObjectExplorer"), 100);
	},
	_refreshCodePane:function(noHistory){
		var internalSource = dojo.clone(this.codePaneInternal);
		//remove the internal id's
		//dojo.query("[dojoType]", internalSource).forEach(function(node){
		dojo.query("*", internalSource).forEach(function(node){
			var widget = dijit.byId(dojo.attr(node, "id"));
			if(widget){
				if(widget.isDojoWidget != true){ //remove the dojotype of non-dojo-widgets. (dojotype of a non-dojo-widget is a wrapper)
					node.removeAttribute(((this.useHtml5Markup)?"data-dojo-type":"dojoType"));
				}
			}
			node.removeAttribute("id");
		});
				
		//textarea content
		this.set("outputSource", dojox.html.format.prettyPrint(dojox.html.entities.decode(dojo.attr(internalSource, "innerHTML"))));
		
		if(!noHistory){
			//add history step
			this.createHistoryStep();
		}
	},
	_updateSourceNode:function(sourceNodeId, properties, instantRefresh, clearAttributes){
		dojo.query("*", this.codePaneInternal).forEach(dojo.hitch(this, function(node){
			//console.log("checking node ", sourceNodeId, properties);
			if(dojo.attr(node, "id") == sourceNodeId){
				
				for(var prop in properties){
					/*
					//node.setAttribute(prop, properties[prop]);
					if(clearAttributes == true){
						dojo.removeAttr(node, prop);
					}
					if(prop == "style" && typeof(properties[prop]) == "object"){
						for(var styleProp in properties[prop]){
							dojo.style(node, styleProp, properties[prop][styleProp]);
						}
					}else{
						dojo.attr(node, prop, properties[prop]);
					}
					*/
					this._updateNodeAttribute(node, prop, properties[prop], clearAttributes, this.useHtml5Markup);
				}	
			}
		}));

		if(instantRefresh === true){
			//display the new source
			this._refreshCodePane();
		}
	},
	_updateSourceNodePosition:function(widget, instantRefresh){

		var styleProps = null;
		//this._updateSourceNode(widget.id, {"style": widget.attr("style")}, false);
		//@TODO: fix the position-problem ... relative nodes are not alloed to have top/left. keep in mind that the position can be changed with the popertygrid
		if(widget.moveable == true) {
			styleProps = {"style": {"top": dojo.style(widget.domNode, "top")+"px", "left": dojo.style(widget.domNode, "left")+"px", "position": dojo.style(widget.domNode, "position")}};
		}

		this._updateSourceNode(widget.id, styleProps, instantRefresh, false);
	},
	_updateNodeAttribute:function(node, name, value, clearValue, html5){
		//console.log(node, name, value, clearValue, html5);
		var itemValue = value;
		if(typeof(html5) == "undefined"){
			html5 = this.useHtml5Markup;	
		}

		var dataDojoProps;
		if(html5 && dojo.attr(node, "data-dojo-props") != null && clearValue == false){
			dataDojoProps = dojo.fromJson("{"+dojo.attr(node, "data-dojo-props")+"}");
			//console.log(dojo.clone(dataDojoProps));
		}
		if(!dataDojoProps){
			dataDojoProps = {};
		}
		
		if(itemValue != null){
						
			if(html5){
				if(typeof(itemValue) == "object"){

					if(typeof(dataDojoProps[name]) != "undefined"){
						for(var prop in itemValue){
							dataDojoProps[name][prop] = itemValue[prop];
						}
					}else{
						dataDojoProps[name] = itemValue;
					}
				}else{
					dataDojoProps[name] = itemValue;
				}
				var jsonContent = dojo.toJson(dataDojoProps).replace(/"/g, "'");
				//console.log(jsonContent);
				jsonContent = jsonContent.substr(1, jsonContent.length - 2);
				dojo.attr(node, "data-dojo-props", jsonContent);
			}else{
				if(name == "value"){
					node.setAttribute(name, itemValue);
				}else if(name == "style" && typeof(itemValue) == "object"){

					if(clearValue == true){
						dojo.attr(node, "style", "");	
					}
					dojo.style(node, itemValue);

				}else if(typeof(itemValue) == "object"){
					//@TODO: fix the replace thing. the properties are getting escaped to much. so its a string ether than an object
					//try the style ... if a width is set, and a move is perfeormed, the move will override the width
					if(html5){
						itemValue = dojo.toJson(itemValue);
					}else{
						itemValue = dojo.toJson(itemValue).replace(/"/g, "'");
					}
					
					dojo.attr(node, name, itemValue);
				}else {
					dojo.attr(node, name, itemValue);	
				}
			}	
		}	
	},
	registerWidget:function(widget)	{
		if(!dojo.isArray(wuhi.designer.registry.widgets[widget.dojoClass])){
			wuhi.designer.registry.widgets[widget.dojoClass] = new Array();
		}
		
		wuhi.designer.registry.widgets[widget.dojoClass].push(widget);
	},
	unregisterWidget:function(widget){
		//console.log(widget, typeof(wuhi.designer.registry.widgets[widget.dojoClass]));
		//wuhi.designer.registry.widgets[widget.dojoClass].remove(widget);
		//@TODO
	},
	registerClass:function(classPntr){
		if(typeof(wuhi.designer.registry) == "undefined"){	
			wuhi.designer.registry = {};
			wuhi.designer.registry.widgets = []; //holds the created widgets
			wuhi.designer.registry.classes = []; //holds the pointers to the avaliable designer-widgets
		}

		wuhi.designer.registry.classes.push({"type": "designerWidgetClass", "content": classPntr});		
	},
	unregisterClass:function(classPntr){
		//@TODO
	},
	designerClassFromDojoClass:function(dojoClass){
		var designerClass = "";
		dojo.forEach(wuhi.designer.registry.classes, function(entry){
			if(entry.content.prototype.dojoClass == dojoClass){
				designerClass = entry.content.prototype.declaredClass;
			}
		});
		return designerClass;
	},
	_refreshDesignerFromSource:function(recreatedInstanceOfWidgetId, sourceCode){
		//@TODO: all operations from see _Widget._onDndDrop should be called here ...
		//this.designerPane.destroyChildren();
		this.destroyWidgets();
		//console.log(this.designerPane);
		//console.log("after destroy");
		var source = sourceCode || this.get("designerSource");
		dojo.attr(this.designerPane.domNode, "innerHTML", source);
		dojo.parser.parse(this.designerPane.domNode);
		
		if(recreatedInstanceOfWidgetId){
			return dijit.byId(recreatedInstanceOfWidgetId);
		}		
		
		dojo.publish("wuhi/designer/refresh", [{}]);
		//refresh the object-explorer
		//this._loadObjectExplorer();
		//@TODO: fix this ugly time-hack (its only with dndcontroller of the object-tree
		setTimeout(dojo.hitch(this, "_loadObjectExplorer"), 100);
	},
	_setSourceInternalAttr:function(container, instantRefresh){
		dojo.attr(this.codePaneInternal, "innerHTML", dojo.attr(container, "innerHTML"));
		if(instantRefresh == true){
			this._refreshDesignerFromSource();
			this._refreshCodePane();
		}
	},
	destroyWidgets:function(){
		dojo.query("[id]", this.codePaneInternal).forEach(function(node){
			var childWidget = dijit.byId(dojo.attr(node, "id"));
			if (typeof(childWidget) != "undefined") {
				this.unregisterWidget(childWidget);
				childWidget.destroyRecursive();
			}
		}, this);
	}

});