dojo.provide("sandbox.BucketButton");
dojo.require("dijit.form.Button");
dojo.require("sandbox.BucketDialog");

dojo.declare('sandbox.BucketButton', dijit.form.Button, {

	// sandbox: String
	//     The id of the sandbox to raise, e.g. { namespace: 'public', id: 'abcd', version: '1' }
	bucket: undefined,

	_dlg : undefined,

	onClick: function() {
		console.log("BucketButton onClick!");
		if (!this._dlg) {
			if (typeof this.bucket == 'string') {
				this.bucket = dojo.parseJson(this.bucket);
			}
			this._dlg = new sandbox.BucketDialog( {
				title: 'Example',
				bucketNamespace: this.bucket.namespace,
				bucketId: this.bucket.id,
				bucketVersion: this.bucket.version
			}).placeAt(dojo.body());
			this._dlg.startup();
		}
		this._dlg.show();
	}
});