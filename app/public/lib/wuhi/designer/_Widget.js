dojo.provide("wuhi.designer._Widget");

dojo.require("dijit._Widget");
dojo.require("dojo.dnd.Moveable");
dojo.require("dojo.dnd.Source");
dojo.require("dojox.html.entities");
dojo.require("dojox.html.format");
dojo.require("wuhi.designer.ResizeHandle");

dojo.declare("wuhi.designer._Widget", [dijit._Widget], {
	
	dojoClass: "", //like dijit.form.TextBox
	moveable: true,
	_toolboxImg: "Default.png",
	_dndTargetHandle: null,
	_dndMoveHandle: null,
	_resizeAvatarNode: null,
	_resizeHandle: null,
	_lastPos: {"x": 0, "y": 0},
	_gridLineNode: null,
	_gridOffset: 8, //pixel
	_resizeAxis: "xy",
	useChildDefaults: true, //some widgets dont want the defaults of a widget because they handle theier proteries self (like the bordercontainer)
	resizeable: true,
	isFocusable: function(){},
	designer: null,
	needsRecreate: false, //maybe the widget is easier to recreate than to set all properties to resize/reconfigure it
	_captionNode: null,
	_captionVisible: false,
	isDojoWidget: true,
	baseElement: "div",
	repositionChildren: true,
	
	//methods
	_getDndTargetNodeAttr:function(){
		return this.domNode;
	},
	_getDefaultsAttr: function(){
		//override this
		return new Array();
	},
	_getDefaultsObjectAttr: function(){
		var defaultsObject = {};
		dojo.forEach(this.get("defaults"), function(item, index){
			defaultsObject[item.name] = item.value;
		}, this);
		return defaultsObject;
	},
	_getDefaultChildrenAttr:function(){
		return [];
	},
	postCreate:function(){
	
		this.inherited("postCreate", arguments);
		
		//set the zIndex to get rid of selection/resize-problems
		dojo.style(this.domNode, "zIndex", 100);
		
		var accept = [];
		dojo.forEach(this.get("accept"), dojo.hitch(this, function(entry){
			if(dojo.indexOf(this.get("acceptNot"), entry) == -1){
				accept.push(entry);
			}
		}));

		//add a dnd target
		this._dndTargetHandle = new dojo.dnd.Source(this.get("DndTargetNode"), {
				"accept": accept,
				onDrop: dojo.hitch(this, "_onDndDrop"),
				onMouseMove: dojo.hitch(this, "_onDndTargetMouseMove")
		});
		
		//make the widget moveable
		this.set("moveable", this.moveable);
		//this.set("moveable", false);
		
		dojo.connect(this, "onClick", this, "_onClick");
		//dojo.connect(this, "onMouseMove", this, "_onMouseOver");
		//dojo.connect(this, "onMouseOut", this, "_onMouseOut");
		
		//this._captionNode = dojo.create("span", {"style": {"display": "none", "backgroundColor":"lightGreen", "fontSize": "9", "position": "absolute", "top": 1, "right": 1, "zIndex": 100}, "innerHTML": this.dojoClass}, this.domNode);
		
		if(!this.designer) {
			this.designer = dojo.query(".wuhiDesigner").some(function(node){
				return dijit.byNode(node);
			});
		}
	},
	_setMoveableAttr:function(value){
		
		this.moveable = value;
		
		if(value == true){
			if(this._dndMoveHandle != null){
				this._dndMoveHandle.destroy();
				this._dndMoveHandle = null;
			}
			this._dndMoveHandle = new dojo.dnd.Moveable(this.domNode);
			
			this._dndMoveHandle.onMoving = dojo.hitch(this, "_onDndMoving");

			dojo.connect(this._dndMoveHandle, "onMoved", this, "_adjustNodeToGrid");
			dojo.connect(this._dndMoveHandle, "onMoveStop", this, "_onDndMoved");
			
			dojo.addClass(this.domNode, "wuhiDesignerWidgetMoveable");
		}else{
			if(this._dndMoveHandle != null){
				this._dndMoveHandle.destroy();
				this._dndMoveHandle = null;
			}
		}
		
	},
	_getMoveableAttr:function(){
		return this.moveable;
	},
	_getResizeableAttr:function(){
		return this.resizeable;
	},
	_setResizeableAttr:function(value){
		this.resizeable = value;
	},
	_setResizeableAxisAttr:function(value){
		this._resizeAxis = value;
		if(this._resizeHandle != null){
			this._resizeHandle.resizeAxis = value;
		}
	},
	_getResizeableAxisAttr:function(){
		return this._resizeAxis;
	},
	_onMouseOver:function(evt){
		if(this._captionVisible == false){
			dojo.style(this._captionNode , "display", "block");
			this._captionVisible = true;
		}
		dojo.stopEvent(evt);
	},
	_onMouseOut:function(evt){
		if(this._captionVisible == true){
			dojo.style(this._captionNode , "display", "none");
			this._captionVisible = false;
		}
		dojo.stopEvent(evt);
	},
	_onClick:function(evt){
		dojo.publish("wuhi/designer/widget/click", [{widget: this, event: evt}]);
		dojo.stopEvent(evt);
	},
	showInPropertyGrid:function(){

		var items = [];
		var props = wuhi.designer._WidgetDescriptor.prototype.getProperties(this.dojoClass);
		dojo.forEach(props, function(item, index){
			if(item.isStyle == true){
				items.push({"id": index, "name": item.name, "value": dojo.style(this.domNode, item.name), "isStyle": item.isStyle, "type": item.type});
			}else if(item.container){
				items.push({"id": index, "name": item.name, "value": this.get(item.container)[item.name], "isStyle": item.isStyle, "type": item.type, "container": item.container});
			}else{
				var value = this.get(item.name);
				if(item.type == "json"){
					value = this.get(dojo.toJson(item.name));
				}
				items.push({"id": index, "name": item.name, "value": value, "isStyle": item.isStyle, "type": item.type});
			}
		}, this);
		
		
		var props = {'identifier': 'id',
			'label': 'name',
			'numRows': 1,
			'items':items
		};
		
		this.designer.propertyGrid.set("data", props);
		this.designer.propertyGrid.set("widget", this);
	},
	_createResizeHandle:function(){
		this._removeResizeHandle();
		
		if(this.resizeable == true){

			// z-index hirarchy:
			//	100 = widget
			//	auto = resizeAvatar
			// 	widget.zIndex + 1 = resizeSquares (N;W;E;S...)
			//
			this._resizeAvatarNode = dojo.create("div", {style: {"position": "absolute", "zIndex": "auto"}}, this.domNode.parentNode);
			dojo.connect(this._resizeAvatarNode, "onclick", function(evt){
				dojo.stopEvent(evt);
			});
						
			dojo.marginBox(this._resizeAvatarNode, dojo.marginBox(this.domNode));
			
			//add the resize handle
			this._resizeHandle = new wuhi.designer.ResizeHandle({
			    "targetNode": this._resizeAvatarNode,
			    resizeAxis: this._resizeAxis,
			    minWidth: 20,
				minHeight: 20,
				basezIndex: dojo.style(this.domNode, "zIndex")
			});
			
			dojo.connect(this._resizeHandle, "onResizeComplete", this, function(mBox) {
			    this._resizeWidget(mBox);
			});
			
			dojo.connect(this._resizeHandle, "onResize", this, function(node, mBox) {
			    dojo.publish("wuhi/designer/widget/resize", [{widget: this, marginBox: mBox}]);
			});
		}
	},
	_removeResizeHandle:function(){
		if(this.resizeable == true && this._resizeHandle != null){
			this._resizeHandle.destroy();
			this._resizeHandle = null;
			dojo.destroy(this._resizeAvatarNode);
		}
	},
	_hookResizeMarginBox:function(marginBox){
		//modify the marginbox before the widget gets resized	
	},
	_hookResizeStyleProps:function(styleProps, marginBox){
		//modify the styleprops before the widget gets resized	
	},
	_resizeWidget:function(marginBox){
		this._hookResizeMarginBox(marginBox);
		
		var oldMarginBox = dojo.marginBox(this.domNode);
		dojo.publish("wuhi/designer/widget/resizeComplete", [{widget: this, oldMarginBox: oldMarginBox, newMarginBox: marginBox, needsRecreate: this.needsRecreate}]);
		
		//resize the widget to the size of the avatar-node
		dojo.marginBox(this.domNode, marginBox);		
		var styleProps = {"style": {"height": marginBox.h+"px", "width": marginBox.w+"px", "left": marginBox.l+"px", "top": marginBox.t+"px"}};	

		if(this._resizeAxis == "x"){
			styleProps = {"style": {"width": marginBox.w+"px", "left": marginBox.l+"px", "top": marginBox.t+"px"}};	
		}else if(this._resizeAxis == "y"){
			styleProps = {"style": {"height": marginBox.h+"px", "left": marginBox.l+"px", "top": marginBox.t+"px"}};	
		}
		
		this._hookResizeStyleProps(styleProps, marginBox);
		this.designer._updateSourceNode(this.id, styleProps, true);
		
		if(this.needsRecreate == true){
			this.designer._refreshDesignerFromSource();
		}
	},
	_adjustNodeToGrid:function(mover, leftTop){
	
		if(this.designer.alignToGrid == false) { return; }
		
		var parent = mover.node.parentNode;
		
		this._removeAllGridLines();
		//create grid line
		gridLine = dojo.create("div", {"className": "wuhiDesignerGridLine", style: {"position": "absolute", "border": "1px dotted #0000FF"}}, parent);

		//console.log(parent.childNodes);
		//check all siblings if they are near to the current widget
		dojo.forEach(parent.childNodes, dojo.hitch(this,function(node){
			if(node != mover.node && dojo.attr(node, "widgetid") && parent == node.parentNode){
				var foundSibling = false;
				//horizontal left
				if(dojo.marginBox(node).l >= (dojo.marginBox(mover.node).l - this._gridOffset) && dojo.marginBox(node).l <= (dojo.marginBox(mover.node).l + this._gridOffset)){
					dojo.style(gridLine, {"height": "99%", "position": "absolute", "top": "0px", "left": dojo.marginBox(node).l+"px"});
					
					foundSibling = true;
					//adjust the node to the gridLine
					mover.node.style.left = dojo.marginBox(node).l+"px";
				}
				//horizontal right
				else if((dojo.marginBox(node).l + dojo.marginBox(node).w) >= ((dojo.marginBox(mover.node).l + dojo.marginBox(mover.node).w) - this._gridOffset) && (dojo.marginBox(node).l + dojo.marginBox(node).w) <= ((dojo.marginBox(mover.node).l + dojo.marginBox(mover.node).w) + this._gridOffset)){
					dojo.style(gridLine, {"height": "99%", "position": "absolute", "top": "0px", "left": (dojo.marginBox(node).l + dojo.marginBox(node).w)+"px"});
					
					foundSibling = true;
					//adjust the node to the gridLine
					mover.node.style.left = (dojo.marginBox(node).l + dojo.marginBox(node).w - dojo.marginBox(mover.node).w)+"px";
				}	
				//vertical top
				else if(dojo.marginBox(node).t >= (dojo.marginBox(mover.node).t - this._gridOffset) && dojo.marginBox(node).t <= (dojo.marginBox(mover.node).t + this._gridOffset)){
					dojo.style(gridLine, {"width": "99%", "position": "absolute", "left": "0px", "top": dojo.marginBox(node).t+"px"});
					foundSibling = true;
					//adjust the node to the gridLine
					mover.node.style.top = dojo.marginBox(node).t+"px";
				}			
				//vertical bottom
				else if(dojo.marginBox(node).h > 25 && (dojo.marginBox(node).t + dojo.marginBox(node).h) >= ((dojo.marginBox(mover.node).t + dojo.marginBox(mover.node).h) - this._gridOffset) && (dojo.marginBox(node).t + dojo.marginBox(node).h) <= ((dojo.marginBox(mover.node).t + dojo.marginBox(mover.node).h) + this._gridOffset)){
					dojo.style(gridLine, {"width": "99%", "position": "absolute", "left": "0px", "top": (dojo.marginBox(node).t + dojo.marginBox(node).h)+"px"});
					foundSibling = true;
					//adjust the node to the gridLine
					mover.node.style.top = (dojo.marginBox(node).t + dojo.marginBox(node).h - dojo.marginBox(mover.node).h)+"px";
				}	
				//vertical center
				else if((dojo.marginBox(node).t + (dojo.marginBox(node).h / 2)) >= ((dojo.marginBox(mover.node).t + (dojo.marginBox(mover.node).h / 2)) - this._gridOffset) && (dojo.marginBox(node).t + (dojo.marginBox(node).h / 2)) <= ((dojo.marginBox(mover.node).t + (dojo.marginBox(mover.node).h / 2)) + this._gridOffset)){
					var adjustment = 0;
				
					if((dojo.marginBox(node).h / 2) % 2){
						adjustment = 1;
					}
				
					dojo.style(gridLine, {"width": "99%", "position": "absolute", "left": "0px", "top": (- adjustment + dojo.marginBox(node).t + (dojo.marginBox(node).h / 2))+"px"});
					foundSibling = true;
					//adjust the node to the gridLine
					mover.node.style.top = (- adjustment + dojo.marginBox(node).t + (dojo.marginBox(node).h / 2) - (dojo.marginBox(mover.node).h / 2))+"px";
				}				
			}
		}));
	},
	_getGridLineByNode:function(node){
		return dojo.query(".wuhiDesignerGridLine", node)[0];
	},
	_removeAllGridLines:function(){
		dojo.query(".wuhiDesignerGridLine").every(dojo.destroy);
	},
	_onDndMoved:function(evt){
		dojo.publish("wuhi/designer/widget/moved", [{widget: this, event: evt}]);
		
		this._removeAllGridLines();
		//set the new position of the widget after every move
		this.designer._updateSourceNodePosition(this);
		this.designer._refreshCodePane();
	},
	_onDndMoving:function(mover, leftTop){
		dojo.publish("wuhi/designer/widget/move", [{widget: this, leftTop: leftTop}]);
		
		if(this._resizeHandle != null){
			this._resizeHandle.moveTo(dojo.mixin(dojo.marginBox(this.domNode), leftTop));	
		}
	},
	_onDndDrop:function(source, nodes, copy){		
		dojo.forEach(nodes, function(node, index, arr){			
			//search for the dropped designer-widget in the registry and create a defaultinstance
			this._createDroppedWidget(node);
		}, this);
	},
	_createDroppedWidget:function(node){
		dojo.forEach(wuhi.designer.registry.classes, dojo.hitch(this, function(entry){
				if(entry.type == "designerWidgetClass" && entry.content.prototype.dojoClass == dojo.attr(node, "dojoClass"))
				{
					var widget = this._insertWidget(entry.content.prototype);
					dojo.publish("wuhi/designer/widget/dropped", [{widget: widget, target: this}]);
				}
			})
		);	
		
		this.designer._refreshCodePane();	
	},
	_insertWidget:function(prototype){
		//set the designer, so each widget knows where it was created
		prototype.designer = this.designer;
		
		var createdWidget = prototype.createDefaultInstance(this);
		
		//assign the last cursorposition to the widget
		//you may override this method in some layout-widgets
		if(this.repositionChildren == true){
			createdWidget.set("position", this._lastPos);
		}

		//register the widget in the registry
		this.designer.registerWidget(createdWidget);
							
		//add the markupnode to the internal codepane
		this.designer._pasteSource(createdWidget._getMarkupBase(true, this.useChildDefaults), this.get("id"), false);
		
		//set the style-attributes to insert-coords
		//this.designer._updateSourceNodePosition(createdWidget, (createdWidget.attr("defaultChildren").length == 0));
		this.designer._updateSourceNodePosition(createdWidget, false);
		
		//create possible children (like contentpane of tabcontainer)
		dojo.forEach(createdWidget.get("defaultChildren"), function(childClass){
			var childPrototype = childClass.prototype;
			this._insertWidget(childPrototype);
		}, createdWidget);	
		
		createdWidget.postAllChildInstances();
		
		return createdWidget;
		
	},
	_onDndTargetMouseMove:function(evt){
		//remember the last position to insert the widget on the right place
		this._lastPos = {"x": evt.layerX, "y": evt.layerY};	
	},
	placeChildWidget:function(widget){
		dojo.place(widget.domNode, this.domNode);
	},
	createDefaultInstance:function(parent, baseNode){
		//console.log(this);
		var base = baseNode || this._getMarkupBase(false, parent.useChildDefaults);
		var designerWidgetClassname = wuhi.designer.Designer.prototype.designerClassFromDojoClass(this.dojoClass);
		var widgetClass = this.__stringToFunction(designerWidgetClassname);

		var widget;
		if(parent.useChildDefaults == true){
			widget = new widgetClass(this.get("defaultsObject"), base);
		}else{
			widget = new widgetClass({}, base);
		}
		
		//dojo.style(widget.domNode, "opacity", "0");
		//place the widget in the designer (its invisible)
	    	parent.placeChildWidget(widget);
		
		widget.postInstance(this);
		
		return widget;
	},
	postInstance:function(){
		//this is called after createDefaultInstance
	},
	postAllChildInstances:function(){
		//this is called after all createDefaultInstance methods of the children
	},
	_getMarkupBase:function(instanceCreated, useDefaults)	{
		//console.log("useDefaults", useDefaults);
		//create the basenode with dojotype and id
		var nodeId = this._getNextWidgetId(this.dojoClass);
		if(instanceCreated === true) { nodeId = this.get("id"); }
		var base = dojo.create(this.baseElement, {"id": nodeId});
		dojo.attr(base, ((this.designer.useHtml5Markup)?"data-dojo-type":"dojoType"), this.dojoClass);
		
		//add defaults
		if(useDefaults == true){
			var defaults = this.get("defaults");
			dojo.forEach(defaults, function(item, index){
				
				if(instanceCreated == true){
					item.value = this.get(item.name);
				}

				this.designer._updateNodeAttribute(base, item.name, item.value, false, this.designer.useHtml5Markup);

			}, this);
		}

		return base;
	},
	_getAcceptAttr:function(){
		var accept = [];
		//default accept all registered designerclasses
		dojo.forEach(wuhi.designer.registry.classes, function(classObject){
				accept.push(classObject.content.prototype.dojoClass);
			}
		);
		return accept;
	},
	_getAcceptNotAttr:function(){
		return [];
	},
	_setPositionAttr:function(position){
		dojo.style(this.domNode, {"position": "absolute", "top": position.y+"px", "left": position.x+"px"});
	},
	_getNextWidgetId:function(className){
		if(typeof(wuhi.designer.registry.widgets[className]) == "undefined"){
			wuhi.designer.registry.widgets[className] = [];
		}
		var newId = "wuhi_designer_" + className + "_" + wuhi.designer.registry.widgets[className].length;
		
		return newId.replace(".", "_");
	},
	_getNextWidgetPrintnameAttr:function(){
		if(typeof(wuhi.designer.registry.widgets[this.dojoClass]) == "undefined"){
			wuhi.designer.registry.widgets[this.dojoClass] = [];
		}
		
		var nameParts = this.dojoClass.split(".");
		return nameParts[(nameParts.length - 1)] + " " + wuhi.designer.registry.widgets[this.dojoClass].length;
	},
	__stringToFunction: function(str) {
		var arr = str.split(".");

		var fn = (window || this);
		for (var i = 0, len = arr.length; i < len; i++) {
			fn = fn[arr[i]];
		}

		if (typeof fn !== "function") {
			//console.log("function "+str+" not found");
		}

		return  fn;
	}


});