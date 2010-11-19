dependencies ={
    layers: [
        {
            name: "dojodeps.js",
            resourceName: 'dojodeps.dojo',
            dependencies: [
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
        }
    ],
    prefixes: [
        [ "dojox", "../dojox" ],
        [ "dijit", "../dijit" ],
        [ "sandbox", "../../sandbox" ]
    ]
};
