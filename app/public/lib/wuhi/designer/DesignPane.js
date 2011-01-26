dojo.provide("wuhi.designer.DesignPane");

dojo.require("wuhi.designer.SelectionArea");
dojo.require("wuhi.designer._Widget");
dojo.require("dojo.parser");

dojo.declare("wuhi.designer.DesignPane", [wuhi.designer._Widget], {

	dojoClass: "wuhi.designer.DesignPane",
	moveable: false,
	resizeable: false,
	_mouseFollower: null,
	selectionArea: null,
	_getAcceptNotAttr: function () {
		return ["dijit.layout.ContentPane"];
	},
	_setContentAttr: function (content) {
		//clear content
		dojo.attr(this.domNode, "innerHTML", "");
		//assign new node to this
		//dojo.place(content, this.domNode);
		dojo.attr(this.domNode, "innerHTML", content);
		//parse for widgets
		dojo.parser.parse(this.domNode);
	},
	destroyChildren: function () {
		var childNodes = dojo.query("*", this.domNode);
		dojo.forEach(childNodes, function (node, index) {
			var childWidget = dijit.byNode(node);
			if (typeof(childWidget) != "undefined") {
				this.designer.unregisterWidget(childWidget);
				childWidget.destroyRecursive();
			}
		}, this);
	},
	postCreate: function () {
		this.inherited("postCreate", arguments);

		dojo.addClass(this.domNode, "wuhiDesignerDesignPane");

		//@TODO: selectionarea
		//this.selectionArea = new wuhi.designer.SelectionArea({"target": this});
		//this.selectionArea.startup();
		
		//dojo.connect(dojo.doc, "onmousemove", this, "_onMouseMove");
		//dojo.connect(dojo.doc, "onmouseover", this, "_onMouseOver");
		//dojo.connect(dojo.doc, "onmouseout", this, "_onMouseOut");
	},
	_onMouseOver: function (evt) {
		this._mouseFollower = dojo.create("div", {
			"innerHTML": "todo"
		}, dojo.body());
		dojo.stopEvent(evt);
	},
	_onMouseOut: function (evt) {
		dojo.destroy(this._mouseFollower);
		this._mouseFollower = null;
		dojo.stopEvent(evt);
	},
	_onMouseMove: function (evt) {
		dojo.style(this._mouseFollower, {
			"position": "absolute",
			"left": (evt.pageX + 20) + "px",
			"top": evt.pageY + "px"
		});
		dojo.stopEvent(evt);
	}
});