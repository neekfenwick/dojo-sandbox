dependencies ={
    layers: [
        {
            name: "dojodeps.js",
            resourceName: 'dojodeps.dojo',
            dependencies: [
		"dojo._base.lang",
		"dojo.dnd.Container",
		"dojo.dnd.Selector",
		"dojo.dnd.Source",
                "dojox.analytics.Urchin",
                "dijit.layout.BorderContainer",
                "dijit.layout.ContentPane",
                "dijit.Toolbar",
                "dijit.form.Button",
                "dijit.form.ValidationTextBox",
		"dojox.data.JsonRestStore"
            ],
            copyrightFile: 'sandboxCopyright.txt'
        },
        {
            name: "sandbox.js",
            resourceName: 'sandbox.dojo',
            dependencies: [
				"sandbox.Frontend"
            ],
            copyrightFile: 'sandboxCopyright.txt'
        },
	{
            name: "designer.js",
            resourceName: 'designer.dojo',
            dependencies: [
		"wuhi.designer.Designer",
		"wuhi.designer.dijit.form.TextBox",
		"wuhi.designer.dijit.form.Button",
		"wuhi.designer.dijit.form.CheckBox",
		"wuhi.designer.dijit.form.RadioButton",
		"wuhi.designer.dijit.form.DateTextBox",
		"wuhi.designer.dijit.form.TimeTextBox",
		"wuhi.designer.dijit.form.Textarea",
		"wuhi.designer.dijit.form.SimpleTextarea",
		"wuhi.designer.dijit.Editor",
		"wuhi.designer.dijit.layout.ContentPane",
		"wuhi.designer.dijit.layout.TabContainer",
		"wuhi.designer.dijit.layout.BorderContainer",
		"wuhi.designer.dijit.layout.AccordionContainer",
		"wuhi.designer.html.Text",
		"wuhi.designer.html.HorizontalRule",
		"wuhi.designer.dijit.form.HorizontalSlider",
		"wuhi.designer.dijit.form.VerticalSlider",
		"wuhi.designer.dijit.form.DropDownButton",
		"wuhi.designer.dijit.Toolbar",
		"wuhi.designer.dijit.Menu",
		"wuhi.designer.dijit.MenuItem",
		"wuhi.designer.dijit.PopupMenuItem"
            ],
            copyrightFile: 'sandboxCopyright.txt'
        }
    ],
    prefixes: [
        [ "dojox", "../dojox" ],
        [ "dijit", "../dijit" ],
        [ "sandbox", "../../sandbox" ],
	[ "wuhi", "../../wuhi" ]
    ]
};
