dojo.provide("wuhi.designer.dijit.form.TimeTextBox");

dojo.require("wuhi.designer._Widget");
dojo.require("dijit.form.TimeTextBox");

dojo.declare("wuhi.designer.dijit.form.TimeTextBox", [dijit.form.TimeTextBox, wuhi.designer._Widget], {
	
	dojoClass: "dijit.form.TimeTextBox",
	//_toolboxImg: "Control_DateTextBox.png",
	_resizeAxis: "x",
	
	_getAcceptAttr:function(){
		return [];
	},
	_getDefaultsAttr: function(){
		return [
			{"name": "constraints", "value": {
	                timePattern: 'HH:mm:ss',
	                clickableIncrement: 'T00:30:00',
	                visibleIncrement: 'T00:30:00'
		        }
		    }
		];
	},
	_open:function(){
		//remove the calendar on click
	}
});

wuhi.designer.Designer.prototype.registerClass(wuhi.designer.dijit.form.TimeTextBox);
