dojo.require( "dojo._base.lang" );
dojo.require( "dojo.dnd.Container" );
dojo.require( "dojo.dnd.Selector" );
dojo.require( "dojo.dnd.Source" );

//	NOTE:
//		- A lot of this is just copied and pasted from their dojo.dnd stuff. It would have
//		  been extremely complicated and probably a lot slower had I done it any other way.
//		- The only documentation provided is for the changes I've made. See dojo.dnd.Container,
//		  dojo.dnd.Selector, and dojo.dnd.Source for their documentation.

//	description:
//		Extends dojo.dnd.Item, dojo.dnd.Container, dojo.dnd.Selector, and dojo.dnd.Source. By including
//		this we will be able to add handles and selectors( an example would be a checkbox element ) to the
//		dojo.dnd.Item returned by our creator function. We should( not yet tested ) also be able to have
//		nested DnD items.

/*=====
dojo.dnd.Item = function(){
	// summary:
	//		Represents (one of) the source node(s) being dragged.
	//		Contains (at least) the "type" and "data" attributes.
	// type: String[]
	//		Type(s) of this item, by default this is ["text"]
	// data: Object
	//		Logical representation of the object being dragged.
	//		If the drag object's type is "text" then data is a String,
	//		if it's another type then data could be a different Object,
	//		perhaps a name/value hash.
	// node: Node
	//		The node that is draggable. This is the node that will have
	//		the "dojoDndItem" class applied to it.
	// handle?: Node
	//		Defaults to *node*. The node that will be used as the handle
	//		which will be used to initiate the drag and drop. 
	// selector?: Node
	//		Defaults to *node*. The node that will should be used to select
	//		the Item for drag and drop.
	 
	this.type = type;
	this.data = data;
	this.node = node;
	this.handle = handle; // Optional
	this.selector = selector; // Optional
}
=====*/

dojo.extend( dojo.dnd.Container, {
	dropWidget: null,
	
	postscript: function( ) {
		// added support to allow for a drop widget
		if(this.dropWidget) {
			this.parent = this.dropWidget.containerNode || this.dropWidget.domNode;
		}
	},
	
	insertNodes: function(data, before, anchor){
		if(!this.parent.firstChild){
			anchor = null;
		}else if(before){
			if(!anchor){
				anchor = this.parent.firstChild;
			}
		}else{
			if(anchor){
				anchor = anchor.nextSibling;
			}
		}
		if(anchor){
			if( this.dropWidget && "addChild" in this.dropWidget && "getChildren" in this.dropWidget) {
				var children = this.dropWidget.getChildren();
				for(var index = children.length - 1; 0 < index; index--){
					if(children[ index ].domNode === anchor) {
						break;
					}
				}
				
				if(index < 0 ) {
					index = 0;
				}
				
				for(var i = 0; i < data.length; ++i){
					var t = this._normalizedCreator(data[i]);
					// added node, handle, and selector properties to the item
					this.setItem(t.node.id, {data: t.data, type: t.type, node: t.node, handle: t.handle, selector: t.selector});
					this.dropWidget.addChild( dijit.byId( t.node.id ) || t.node, index++ );
				}
			} else {
				for(var i = 0; i < data.length; ++i){
					var t = this._normalizedCreator(data[i]);
					// added node, handle, and selector properties to the item
					this.setItem(t.node.id, {data: t.data, type: t.type, node: t.node, handle: t.handle, selector: t.selector});
					
					this.parent.insertBefore(t.node, anchor);
				}
			}
		}else{
			for(var i = 0; i < data.length; ++i){
				var t = this._normalizedCreator(data[i]);
				// added node, handle, and selector properties to the item
				this.setItem(t.node.id, {data: t.data, type: t.type, node: t.node, handle: t.handle, selector: t.selector});
				
				if( this.dropWidget && "addChild" in this.dropWidget ) {
					this.dropWidget.addChild( dijit.byId( t.node.id ) || t.node );
				} else {
					this.parent.appendChild(t.node);
				}
			}
		}
		return this;
	},
	
	getAllNodes: function( ) {
		// add support for drop widgets
		if(this.dropWidget && 'getChildren' in this.dropWidget) {
			var t = new dojo.NodeList();
			dojo.forEach(this.dropWidget.getChildren(), function(w) {
				t.push(w.domNode);
			});
			return t;
		}
		return dojo.query("> .dojoDndItem", this.parent);
	},

	
	_getChildByEvent: function(e){
		// faster now
		var node = e.target;
		if(node){
			for(var parent = node.parentNode; parent && node !== this.parent; node = parent, parent = node.parentNode){
				if(this.map[node.id]){ return node; }
			}
		}
		return null;
	}
} );

// Add some extra functionality to dojo.dnd.Selector which allows you to also have actual selectors
// such as check boxes other than the item itself or handle.
dojo.extend( dojo.dnd.Selector, {
	postscript: function( ) {
		dojo.dnd.Selector.superclass.postscript.apply( this, arguments );
		// this is just a work around to prevent copying the constructor and shoud probably
		// be added to the constructor if dojo wants to use this.
		this.events.push( dojo.connect( this, "_addItemClass", this, "_onClassChange" ) );
		this.events.push( dojo.connect( this, "_removeItemClass", this, "_onClassChange" ) );
	},
	
	getSelectedNodes: function( ) {
		// I haven't quite figured this out yet but something weird is happening when we try to "remember" the selection.
		// This is putting nodes that have been removed into the selection and dojo.byId is returning null which really screws
		// up everything when attempting to create avatars. So, until I can figure out exactly why this is happening, I've added 
		// this which filters out the null's returned by dojo.byId.
		var t = new dojo.NodeList();
		var e = dojo.dnd._empty;
		var n;
		for(var i in this.selection){
			if(i in e){ continue; }
			n = dojo.byId(i);
			if( n ) {
				t.push(n);
			}
		}
		return t;
	},
	
	onSelectorChange: function( selector, selected, node ) {
		//	summary:
		//		This a default stub function so that if we want to use something other than check boxes as
		//		selectors for items. This will only be called if there is a change.
		//	selector: Node
		//		The selector that needs to be updated.
		//	selected: Boolean
		//		Whether or not the item is selected.
		//	node:
		//		The item's node incase we need if for some reason.
		
		selector.checked = selected;
	},
	
	isSelectorSelected: function( selector ) {
		//	summary:
		//		This a default stub function allowing us to determine if the item should be selected or not.
		//		We can redefine this is we want to use something other than check boxes as selectors.
		//	selector: Node
		//		The selector we are inquiring about.
		
		return "checked" in selector && selector.checked; // Boolean
	},
	
	isSelected: function( node ) {
		//	summary:
		//		Determine whether or not an item is selected
		//	node: String | Node
		//		The item's node or node id.
		
		node = dojo.byId( node );
		
		// Can't say "return node.id in this.selection" because in most causes the item is not added to or
		// removed from the selection until after their class name has changed. 
		return dojo.hasClass( node, "dojoDndItemSelected" ) || dojo.hasClass( node, "dojoDndItemAnchor" );
	},
	
	select: function( node ) {
		//	summary:
		//		Select a specific item based on it's node.
		//	node: String | Node | Array
		//		The node or node's id of the item we want to select.
		
		if( dojo.isArray( node ) ) {
			dojo.forEach( node, this.select, this );
			return;
		}		
		
		node = dojo.byId( node );
		
		if( !node || !this.map[ node.id ] || this.isSelected( node ) ) {
			return;
		}
		
		var cls = "Selected";
		
		if( !this.anchor ) {
			cls = "Anchor";
			this.anchor = node;
		}
		
		this.selection[ node.id ] = 1;
		this._addItemClass( node, cls );
	},
	
	deselect: function( node ) {
		//	summary:
		//		Deselect a specific item based on it's node.
		//	node: String | Node | Array
		//		The node or node's id of the item we want to deselect.
		
		if( dojo.isArray( node ) ) {
			dojo.forEach( node, this.deselect, this );
			return;
		}
		
		node = dojo.byId( node );
		
		if( !node || !this.map[ node.id ] || !this.isSelected( node ) ) {
			return;
		}
		
		var m = this.map,
			cls = "Selected",
			selector = m[ node.id ] && m[ node.id ].selector;
		
		if( node === this.anchor ) {
			cls = "Anchor";
			this.anchor = null;
		}
		
		delete this.selection[ node.id ];
		this._removeItemClass( node, cls );
	},
	
	insertNodes: function(addSelected, data, before, anchor){
		var oldCreator = this._normalizedCreator;
		this._normalizedCreator = function(item, hint){
			var t = oldCreator.call(this, item, hint);
			
			// Add our DnD classes. Since we're keeping track of them in the map the we're
			// not required to do it in the creator anymore.
			t.handle && dojo.toggleClass( t.handle, "dojoDndHandle", true );
			t.selector && dojo.toggleClass( t.selector, "dojoDndSelector", true );
			
			if(addSelected){
				if(!this.anchor){
					this.anchor = t.node;
					this._removeItemClass(t.node, "Selected");
					this._addItemClass(this.anchor, "Anchor");
				}else if(this.anchor != t.node){
					this._removeItemClass(t.node, "Anchor");
					this._addItemClass(t.node, "Selected");
				}
				// If there is a selector call onSelectorChange so we update it as well.
				if( t.selector && !this.isSelectorSelected( t.selector ) ) {
					this.onSelectorChange( t.selector, true, t.node );
				}
				this.selection[t.node.id] = 1;
			}else{
				this._removeItemClass(t.node, "Selected");
				this._removeItemClass(t.node, "Anchor");
			}
			return t;
		};
		dojo.dnd.Selector.superclass.insertNodes.call(this, data, before, anchor);
		this._normalizedCreator = oldCreator;
		return this;
	},
	
	onClick: function( e ) {
		// summary:
		//		Handler for when an item is clicked. This is mainly for selector clicks.
		
		if( !this.current ) {
			return;
		}
		
		var node = this.current;
		var selector = this.map[ node.id ] && this.map[ node.id ].selector;
		
		if( selector && selector === e.target ) {
			this.isSelectorSelected( selector ) ? this.select( node ) : this.deselect( node );
		}
	},
	
	onOverEvent: function(){
		// Added onclick to support selector clicks and _addItemClass and _removeItemClass to support WAI states.
		this._deferredConnects = [
			dojo.connect(this.node, "onclick", this, "onClick"),
			dojo.connect(this.node, "onmousemove", this, "onMouseMove")
		];
	},
	
	onOutEvent: function(){
		// Needs this because we updated onOverEvent.
		if( this._deferredConnects ) {
			for( var i = 0; i < this._deferredConnects.length; i++ ) {
				dojo.disconnect( this._deferredConnects[ i ] );
			}
		}
		
		delete this._deferredConnects;
	},
	
	_onClassChange: function( node, type ) {
		//	summary:
		//		Adds a little accessability support and makes sure the selector, if we are using one,
		//		gets notified of a change in the selection.
		//	node: Node
		//		The node that has had it's class changed.
		//	type: String
		//		The type of change made in _removeItemClass and _addItemClass.
		
		// TODO: Add more accessibility support.
		if( type === "Selected" || type === "Anchor" || !dijit.hasWaiState( node, "selected" ) ) {
			var selected = this.isSelected( node );
			var selector = node.id in this.map && this.map[ node.id ].selector;
			
			// accessability support
			dijit.setWaiState( node, "selected", selected );
			
			// selector notification
			if( selector && this.isSelectorSelected( selector ) !== selected ) {
				this.onSelectorChange( selector, selected, node );
			}
		}
	}
} );

dojo.extend( dojo.dnd.Source, {
	onMouseDown: function( e ) {
		if(!this.mouseDown && this._legalMouseDown(e)){
			if( this.current && !(e.shiftKey || e.ctrlKey) ) {
				// If others are selected and this.current isn't keep track of the one's that were
				// selected and reselect them after the drop... the user may have accidentally started
				// to drag the wrong one. This should be moved to Selector.onMouseDown, but I'm not quite
				// how to implement it there yet.
				// FIXME: This still seems to be a little buggy.
				var m = this.map,
					n = this.current,
					s = m[ n.id ] && m[ n.id ].selector,
					selected = this.getSelectedNodes( );
				
				if( s && !this.isSelectorSelected( s ) && selected.length !== 0 ) {
					this._lastSelected = { };
					
					// add the anchor first so that it will always be the anchor later
					if( this.anchor ) {
						this._lastSelected[ this.anchor.id ] = 1;
					}
					
					selected.forEach( function( n ) {
						this._lastSelected[ n.id ] = 1;
					}, this );
					
					this.selectNone( );
					
					this.anchor = n;
					this.selection[ n.id ] = 1;
					this._addItemClass( n, "Anchor" );
				}
			} else {
				delete this._lastSelected;
			}
			
			if(!this.skipForm || !dojo.dnd.isFormElement(e)) {
				this.mouseDown = true;
				this._lastX = e.pageX;
				this._lastY = e.pageY;
				dojo.dnd.Source.superclass.onMouseDown.call(this, e);
			}
		}
	},
	
	onDndCancel: function(){
		if(this.targetAnchor){
			this._unmarkTargetAnchor();
			this.targetAnchor = null;
		}
		this.before = true;
		this.isDragging = false;
		this.mouseDown = false;
		this._changeState("Source", "");
		this._changeState("Target", "");
		
		// Reselect all items that were previously selected if there are any see comments above in onMouseDown.
		// This has to be done AFTER everything else or it will screw things up. Since, the target's onDndCancel
		// doesn't get called until after the source's onDndCancel the target does it for the source.
		var m = dojo.dnd.manager(), target = m.target, source = m.source;
		var target = m.target;
		var source = m.source || this;
		
		if( ( !target || target === this ) && source._lastSelected) {
			source.selectNone( );
			
			for(var i in source._lastSelected) {
				if(!( i in source.map )) {
					continue;
				}
				
				source.select( source.map[ i ].node );
			}
			
			delete source._lastSelected;
		}
	},
	
	onDropExternal: function(source, nodes, copy){
		var oldCreator = this._normalizedCreator;
		
		if(this.creator){
			this._normalizedCreator = function(node, hint){
				return oldCreator.call(this, source.getItem(node.id).data, hint);
			};
		}else{
			if(copy){
				this._normalizedCreator = function(node, hint){
					return dojo.dnd.Source._copyItem( source.getItem(node.id) );
				};
			}else{
				this._normalizedCreator = function(node, hint){
					var t = source.getItem(node.id);
					source.delItem(node.id);
					// support for the new dojo.dnd.Item
					return {node: node, data: t.data, type: t.type, handle: t.handle, selector: t.selector};
				};
			}
		}
		this.selectNone();
		if(!copy && !this.creator){
			source.selectNone();
		}
		this.insertNodes(true, nodes, this.before, this.current);
		if(!copy && this.creator){
			source.deleteSelectedNodes();
		}
		this._normalizedCreator = oldCreator;
	},
	
	onDropInternal: function(nodes, copy){
		var oldCreator = this._normalizedCreator;
		
		if(this.current && this.current.id in this.selection){
			return;
		}
		if(copy){
			if(this.creator){
				this._normalizedCreator = function(node, hint){
					return oldCreator.call(this, this.getItem(node.id).data, hint);
				};
			}else{
				this._normalizedCreator = function(node, hint){
					// support for the new dojo.dnd.Item
					return dojo.dnd.Source._copyItem( this.getItem( node.id ) );
				};
			}
		}else{
			if(!this.current){
				return;
			}
			this._normalizedCreator = function(node, hint){
				var t = this.getItem(node.id);
				// support for the new dojo.dnd.Item
				return {node: node, data: t.data, type: t.type, handle: t.handle, selector: t.selector};
			};
		}
		this.selectNone();
		this.insertNodes(true, nodes, this.before, this.current);
		this._normalizedCreator = oldCreator;
	},
	
	onOverEvent: function(){
				
		// see _isValidMouseOverOut
		if(!this._isValidMouseOverOut()){
			return;
		}
				
		dojo.dnd.Source.superclass.onOverEvent.call(this);
		dojo.dnd.manager().overSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOver();
		}
	},
	
	onOutEvent: function(){
		
		// see _isValidMouseOverOut
		if(!this._isValidMouseOverOut()){
			return;
		}
		
		dojo.dnd.Source.superclass.onOutEvent.call(this);
		dojo.dnd.manager().outSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOut();
		}
	},
	
	_isValidMouseOverOut: function( ) {
		//	summary:
		//		This determines whether or not to do our mouse over or mouse out which allows
		//		us to have nested DnD containers! This works only as long as any give parent
		//		container doesn't accept any of the same items as any nested containers it contains.
		
		var m = dojo.dnd.manager(), s = m.source, n = m.nodes;
		return !Boolean( s ) || n.length === 0 || s === this || this.checkAcceptance( s, n );
	},
	
	_legalMouseDown: function(e){
		if(!dojo.mouseButtons.isLeft(e)){ return false; }
		
		var m = this.map, c = this.current;
		
		if( !c || !( c.id in m  ) ) { return false; }
		
		var handle = m[ c.id ].handle;
		
		if( !handle && !this.withHandles ) { return true; }
		
		for(var node = e.target; node && node !== this.node; node = node.parentNode){
			if(dojo.hasClass(node, "dojoDndHandle")){
				// For backwards compatibility always return true if we don't have a handle.
				return handle ? handle === node : true;
			}
			
			if(dojo.hasClass(node, "dojoDndItem") || dojo.hasClass(node, "dojoDndIgnore")){ break; }
		}
		
		return false;
	}
} );

// added node, handle, and selector properties to the items that are copied
dojo.dnd.Source._copyItem = function( i ) {
	// Make sure we can find our handle and selector after the clone.
	if( i.handle && !i.handle.id ) {
		i.handle.id = node.id + "_handle";
	}
	if( i.selector && !i.selector.id ) {
		i.selector.id = node.id + "_selector";
	}
	
	var n = node.cloneNode(true);
	n.id = dojo.dnd.getUniqueId();
	
	// Make sure we change the id's of the new handle and selector so we don't have duplicates.
	var h, s;
	if( i.handle ) {
		h = dojo.byId( i.handle.id, n );
		h.id = n.id + "_handle";
	}
	if( i.selector ) {
		s = dojo.byId( i.selector.id, n );
		s.id = n.id + "_selector";
	}
	
	return {node: n, data: i.data, type: i.type, handle: h, selector: s};
};
