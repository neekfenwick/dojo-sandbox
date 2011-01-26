dojo.provide("wuhi.designer.dijit.form.VerticalSlider");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.VerticalSlider");

dojo.declare("wuhi.designer.dijit.form.VerticalSlider", [dijit.form.VerticalSlider, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.VerticalSlider",
	//_toolboxImg: "Control_TextBox.png",
	_resizeAxis: "y",
	
	_getAcceptAttr:function(){
		return [];
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "value", "value": "5"},
			{"name": "minimum", "value": "-10"},
			{"name": "maximum", "value": "10"},
			{"name": "intermediateChanges", "value": "true"},
			{"name": "style", "value": {"height": "200px"}}
		];
	},
	_onBarClick:function(){},
	_onHandleClick:function(){},
	_onClkDecBumper:function(){},
	_onClkIncBumper:function(){}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.VerticalSlider);