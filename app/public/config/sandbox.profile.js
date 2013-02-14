var profile = {
	layerOptimize: 'closure',
	optimize: 'closure',
	//layerOptimize: false,
	//optimize: false,
	cssOptimize: 'comments',
	basePath:"../lib/dojo",
	releaseDir: "../",
	selectorEngine: "acme",

	packages:["dojo","dijit","dojox","sandbox","dojo-smore"],
	//deps:["main", "custom.city.ClientDeps"],
	layers: {
		// see http://bugs.dojotoolkit.org/ticket/14947
		"dojo/dojo":{
			include:[
				"dojo/i18n",
				"sandbox/Frontend"
			],
			customBase: true,
			boot: true
		}
	},
	staticHasFeatures: {
		// The trace & log APIs are used for debugging the loader,
		// so we don’t need them in the build
		'dojo-trace-api': 0,
		'dojo-log-api': 0,
		// This causes normally private loader data to be exposed for debugging,
		// so we don’t need that either
		'dojo-publish-privates': 0,
		// We’re fully async, so get rid of the legacy loader
		'dojo-sync-loader': 0,
		// We aren’t loading tests in production
		'dojo-test-sniff': 0
	}
};
