dojo.provide("sandbox.BucketButton");
dojo.require("dijit.form.Button");
dojo.require("sandbox.BucketDialog");

dojo.declare('sandbox.BucketButton', dijit.form.Button, {

	// sandbox: String
	//     The id of the sandbox to raise, e.g. /public/abcd/1
	bucketNamespace: 'public',
	bucketId: undefined,
	bucketVersion: '1',

	_dlg : undefined,

	onClick: function() {
		console.log("BucketButton onClick!");
		if (!this._dlg) {
			this._dlg = new sandbox.BucketDialog( {
				title: 'Example',
				bucketNamespace: this.bucketNamespace,
				bucketId: this.bucketId,
				bucketVersion: this.bucketVersion
			}).placeAt(dojo.body());
			this._dlg.startup();
		}
		this._dlg.show();
	}
});