<?php

class ConfigController extends Zend_Rest_Controller
{
	//	Test Array.
	//	@TODO: use Database
	private $_items = array(
			array("id" => "0", "name" => "theme",  "value" => "claro"),
      // dojo_versions - see RunController's use of dojo_version
			array("id" => "1", "name" => "dojo_versions",  "value" => "1.4.3##1.4.3-nooptimize##1.5.0##1.5.0-nooptimize##1.6.0##1.6.0-nooptimize"),
      // dojo_layers - layers defined in 'standard' profile
      array("id" => "2", "name" => "dojo_layers", "value" => "dijit/dijit-all.js##dojox/grid/DataGrid.js##dojox/gfx.js##dojox/charting/widget/Chart2D.js##dojox/dtl.js")
		);
	
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

  private function rescanItems() {
    // build available themes
    $themes = array("id" => "0", "name" => "theme",  "value" => "claro");
    // build available dojo versions
    $versions = array();
    $dir = opendir("../../public/lib");
    $this->_items = array();
    $id = 0;
    $matches = array();
    while($entryName = readdir($dir)) {
      // match those we want to make available
      if (preg_match('/^dojo-([0-9].*)$/', $entryName, $matches) > 0 ||
	preg_match('/^(0.0.0-trunk)$/', $entryName, $matches) > 0) {
        if (preg_match('/sandbox/', $matches[1]) == 0) {
          $versions[] = $matches[1];
        }
      }
    }
    rsort($versions);
    $dojo_versions = array("id" => "1", "name" => "dojo_versions",  "value" => join('##', $versions));
    // build available layers
    $layers = array("id" => "2", "name" => "dojo_layers", "value" => "dijit/dijit-all.js##dojox/grid/DataGrid.js##dojox/gfx.js##dojox/charting/widget/Chart2D.js##dojox/dtl.js");
    
    $this->_items = array(
        $themes, $dojo_versions, $layers
    );
  }

	// Handle GET and return a list of resources
	public function indexAction() {

    $this->rescanItems();

		$data = new Zend_Dojo_Data('id', $this->_items, "name");
		echo $data->toJson();
	}

	// Handle GET and return a specific resource item
	public function getAction() {

    $this->rescanItems();

		//@TODO: handle the query with $this->_getParam(...)
		$data = new Zend_Dojo_Data('id', $this->_items, "name");		
		echo $data->toJson();
	}

	// Handle POST requests to create a new resource item
	public function postAction() {
		echo "TODO: postAction()";
	}

	// Handle PUT requests to update a specific resource item
	public function putAction() {
		echo "TODO: putAction()";
	}

	// Handle DELETE requests to delete a specific item
	public function deleteAction() {
		echo "TODO: deleteAction()";
	}
}
