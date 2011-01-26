dojo.provide("wuhi.designer.SelectionController");

dojo.declare("wuhi.designer.SelectionController", null, {
    designer: null,
    _selectedWidget: null,
    _selectedWidgetId: "",
    _isMoving: false,
    _outlineBorder: null,
    _subscribers: [{
	        "channel": "wuhi/designer/widget/click",
	        "method": "_onWidgetClick"},
    	{
	        "channel": "wuhi/designer/widget/dropped",
	        "method": "_onWidgetDropped"
	    },
	    {
	        "channel": "wuhi/designer/refresh",
	        "method": "_onDesignerRefresh"
	    },
	    {
	    	"channel": "wuhi/designer/widget/move",
	    	"method": "_onWidgetMove"	
	    },
	    {
	    	"channel": "wuhi/designer/widget/moved",
	    	"method": "_onWidgetMoved"	
	    },
	    {
	    	"channel": "wuhi/designer/widget/resize",
	    	"method": "_onWidgetResize"	
	    }],
    _subscriptions: [],

    constructor: function(designer) {
        this.designer = designer;
        //add dojo.subscribe
        dojo.forEach(this._subscribers, function(sub) {
            this._subscriptions.push(dojo.subscribe(sub.channel, this, sub.method));
        }, this);
    },
    _onWidgetClick: function(message) {
		if(!message.widget){ return; };
        if (message.widget.designer == this.designer) {
            message.widget.showInPropertyGrid();
         	this._setActiveWidget(message.widget);   
        }
    },
    _onWidgetDropped: function(message) {
        this._onWidgetClick(message);
    },
    _onWidgetResize:function(message){
    	dojo.marginBox(this._outlineBorder, message.marginBox);
    },
    _setActiveWidget:function(widget){
    	if(this._selectedWidget != null && this._selectedWidget != widget){
    		this._selectedWidget._removeResizeHandle();
    	}
    	widget._createResizeHandle();
    	this._selectedWidget = widget;	
    	this._selectedWidgetId = widget.get("id");
		this._createOutlineBorder();
    },
    _onDesignerRefresh:function(message){
    	this._onWidgetClick({widget: dijit.byId(this._selectedWidgetId)});
    },
    _onWidgetMove:function(message){
		this._isMoving = true;
		//never show a resize-handle while a move is in progress
		this._selectedWidget._removeResizeHandle();
		dojo.destroy(this._outlineBorder);
	},
	_onWidgetMoved:function(message){
		this._isMoving = false;
		//no need to recreate the border, because the mouse-click of the dnd-moveable causes a _setActiveWidget
		//this._createOutlineBorder();
	},
	_createOutlineMarginBox:function(marginBox){
		marginBox.l -= 2;
        marginBox.t -= 2;
        marginBox.w += 4;
        marginBox.h += 4;
        
        return marginBox;
	},
	_createReverseOutlineMarginBox:function(marginBox){
		marginBox.l += 2;
        marginBox.t += 2;
        marginBox.w -= 4;
        marginBox.h -= 4;
        
        return marginBox;
	},
	_createOutlineBorder:function(){
    	if(this._outlineBorder != null){
    		dojo.destroy(this._outlineBorder);	
    	}
    	this._outlineBorder = dojo.create("div", {"style": {"border": "1px dotted black", "position": "absolute"}}, this._selectedWidget.domNode.parentNode);
        var mBox = this._createOutlineMarginBox(dojo.marginBox(this._selectedWidget.domNode));

        dojo.marginBox(this._outlineBorder, mBox);
    },
    removeSelection:function(){
    	if(this._selectedWidget != null){
    		dojo.destroy(this._outlineBorder);
	    	this._selectedWidget._removeResizeHandle();
	    	this._selectedWidget = null;	
	    	this._selectedWidgetId = "";
    	}
    },
    destroy: function() {
        //unsubscribe all channels
        dojo.forEach(this._subscriptions, dojo.unsubscribe);
        dojo.destroy(this._outlineBorder);
    }

});