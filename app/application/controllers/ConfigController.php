<?php

class ConfigController extends Zend_Rest_Controller
{
	//	Test Array.
	//	@TODO: use Database
	private $_items = array(
			array("id" => "0", "name" => "theme",  "value" => "claro"), 
			array("id" => "1", "name" => "test",  "value" => "something")
		);
	
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

	// Handle GET and return a list of resources
	public function indexAction() {

		$data = new Zend_Dojo_Data('id', $this->_items, "name");
		echo $data->toJson();
	}

	// Handle GET and return a specific resource item
	public function getAction() {
	
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