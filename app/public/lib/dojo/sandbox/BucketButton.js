define([
	"dojo/_base/declare",
	"dojo/json",
	"dojo/window",
	"dijit/form/Button",
	"sandbox/BucketDialog"
], function(declare, json, win, Button, BucketDialog) {
	return declare(Button, {

		// sandbox: String
		//     The id of the sandbox to raise, e.g. { namespace: 'public', id: 'abcd', version: '1' }
		bucket: undefined,

		_dlg : undefined,

		onClick: function() {
			console.log("BucketButton onClick!");
			if (!this._dlg) {
				if (typeof this.bucket == 'string') {
					this.bucket =json.parseJson(this.bucket);
				}
				this._dlg = new BucketDialog( {
					title: 'Example',
					bucketNamespace: this.bucket.namespace,
					bucketId: this.bucket.id,
					bucketVersion: this.bucket.version
				}).placeAt(win.body());
				this._dlg.startup();
			}
			this._dlg.show();
		}
	})
})