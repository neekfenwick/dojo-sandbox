dojo.provide("wuhi.designer.SelectionArea");

//@TODO: this is the selectionarea of an very old test-version of the designer. port it to fit with the current version
dojo.declare("wuhi.designer.SelectionArea", [dijit._Widget, dijit._Templated], {
	templateString: '<div dojoAttachPoint="selectionArea" style="display: none;"><div dojoAttachPoint="selectionAreaInner"></div></div>',

	target: null,
	selectedNodes: new Array(),
	getSelectedNodes: function () {
/*
		var selectionLeft = parseInt(this.selectionArea.style.left);
		var selectionRight = selectionLeft + parseInt(this.selectionArea.style.width);
		var selectionBottom = parseInt(this.selectionArea.style.top) + parseInt(this.selectionArea.style.height);
		var selectionTop = parseInt(this.selectionArea.style.top);
		
		var selectedNodes = new Array();
		//parse all dijits in source
		dojo.query("div", more.designer.sourceCodeContainer).forEach(
				  function(node, index, arr){
					  
					  var nodeLeft = parseInt(node.style.left);
					  var nodeTop = parseInt(node.style.top);
					  
					  if(nodeLeft >= selectionLeft && nodeLeft <= selectionRight && nodeTop <= selectionBottom && nodeTop >= selectionTop)
					  {
						  var offsetTop = nodeTop - selectionTop;
						  var offsetLeft = nodeLeft - selectionLeft;
						  selectedNodes.push({nodeId: node.id, offsetTop: offsetTop, offsetLeft: offsetLeft});
					  }
				  });
		
		return selectedNodes;
		*/
		return [];
	},
	postCreate: function () {
		this.inherited(arguments);

		this.addSelectionHandler();
		dojo.place(this.domNode, this.target.domNode)

		dojo.style(this.selectionArea, {
			'position': 'absolute',
			'border': '1px solid #3399ff'
		});

		dojo.style(this.selectionAreaInner, {
			'background': '#3399ff',
			'opacity': "0.40",
			'width': '100%',
			'height': '100%'
		});

		var sender = this;
/*
		dojo.connect(this.domNode, "onmousedown",
				function()
				{
					sender.selectedNodes = sender.getSelectedNodes();
					dojo.forEach(sender.selectedNodes,
								function(nodeObject, index, arr)
								{
									//create clones of innerObjects to simulate real-time-moving 
									var cloneNode = dojo.clone(dojo.byId(nodeObject.nodeId));
									dojo.style(cloneNode, {'top': nodeObject.offsetTop+'px', 'left': nodeObject.offsetLeft+'px'});
									sender.selectionAreaInner.appendChild(cloneNode);
								});
					
					sender.moveHandler.onMoveStop = function(mover)
					{
						//console.log(mover);
						if(mover.mouseButton != 0)
						{
							return;
						}
						dojo.forEach(sender.selectedNodes,
							  function(nodeObject, index, arr)
							  {
									var currentDijit = dijit.byId(nodeObject.nodeId);
									dijitTop = parseInt(currentDijit.domNode.style.top);
									dijitLeft = parseInt(currentDijit.domNode.style.left);

									//set the position in designer mask
									more.designer.setPositionOnRaster(	currentDijit.domNode, 
																parseInt(mover.node.style.top) + nodeObject.offsetTop,
																parseInt(mover.node.style.left) + nodeObject.offsetLeft
																);
									
									//set the position in sourcecode
									dojo.query("div", more.designer.sourceCodeContainer).forEach(
											  function(node, index, arr){
												  if(node.id == nodeObject.nodeId)
												  {
													more.designer.setPositionOnRaster(	node, 
												  								parseInt(mover.node.style.top) + nodeObject.offsetTop, 
												  								parseInt(mover.node.style.left) + nodeObject.offsetLeft);
												  	more.designer.refreshSourceCode();
												  }
											  });
									
									//the the position of the selection
									more.designer.setPositionOnRaster(	mover.node, 
											parseInt(mover.node.style.top),
											parseInt(mover.node.style.left)
											);
									
									//remove all clone-nodes
									sender.selectionAreaInner.innerHTML = "";
							  });
					};
				}
		);
		*/

	},
	addSelectionHandler: function () {

		dojo.connect(this.target.domNode, "onmousedown", this, function (event) {
			//console.log(event);			
			dojo.style(this.selectionArea, {
				'top': parseInt(event.layerY) + 'px',
				'left': parseInt(event.layerX) + 'px',
				'height': "0px",
				'width': "0px",
				'display': 'block'
			});
			this.selectionCreated = true;
			dojo.stopEvent(event);
		});

		dojo.connect(dojo.doc, "onmousemove", this, function (event) {
			//console.log(event);
			if (this.selectionCreated == true) {
				var OldLeftX = parseInt(this.selectionArea.style.left);
				var OldTopY = parseInt(this.selectionArea.style.top);

				var oldWidth = OldLeftX;
				var oldHeight = OldTopY;
				var width = (parseInt(event.layerX) - oldWidth);
				var height = (parseInt(event.layerY) - oldHeight);

				if (width > 0) {
					dojo.style(this.selectionArea, {
						'width': width + 'px',
						'height': height + 'px'
					});
				}	
				dojo.stopEvent(event);			
			}
			
		});

		dojo.connect(this.target.domNode, "onmouseup", this, function (event) {
			//console.log(event);
			if (this.selectionCreated == true) {
				this.selectionCreated = false;
				dojo.style(this.selectionArea, 'display', 'none');
				dojo.stopEvent(event);
			}
		});

		dojo.connect(this.target.domNode, "oncontextmenu", this, function (event) {
			dojo.style(this.selectionArea, 'display', 'none');
			dojo.stopEvent(event);
		});
	}

});