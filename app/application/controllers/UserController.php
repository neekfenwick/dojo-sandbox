<?php

class UserController extends Zend_Rest_Controller {	
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

	// Handle GET and return a list of resources
	public function indexAction() {
		// Get the DatabaseAdapter	
		$db = $this->_helper->database->getAdapter();
			
		// 	see http://framework.zend.com/manual/en/zend.db.select.html	
		//	you could also write the query as plain string lie SELECT * FROM user;
		//
		$select = $db	->select()
					->from('user');
	     						
		$data = new Zend_Dojo_Data('id', $db->fetchAll($select), 'name');

		echo $data->toJson();
	}

	// Handle GET and return a specific resource item
	public function getAction() {
		// Get the Parameters
		$pId = $this->getRequest()->getParam("id");
	
		// Get the DatabaseAdapter	
		$db = $this->_helper->database->getAdapter();
			
		// 	see http://framework.zend.com/manual/en/zend.db.select.html	
		//	you could also write the query as plain string lie SELECT * FROM user;
		//
		$select = $db	->select()
					->from('user')
					->where('id = ?', $pId); // sql-injection save quotation
	     						
		$data = new Zend_Dojo_Data('id', $db->fetchAll($select), 'name');

		echo $data->toJson();
	}

	// Handle POST requests to create a new resource item
	public function postAction() {
	
		// Get the Parameters
		$pName = $this->getRequest()->getParam("name");
		$uniqueId = $this->_helper->database->getUniqueId();
	
		// Get the DatabaseAdapter	
		$db = $this->_helper->database->getAdapter();
					
		// Create the Record
		$db->insert('user', array('id' => $uniqueId, 'name' => $pName));	
		$response = array('lastId' => $uniqueId);
		
		// ... All Errors are Handles by Exceptions. So there is no need to catch the result of $db->insert!
		
		echo Zend_Json::encode($response);
	}

	// Handle PUT requests to update a specific resource item
	public function putAction() {
		// Get the Parameters
		$pId = $this->getRequest()->getParam("id");
		$pName = $this->getRequest()->getParam("name");
	
		// Get the DatabaseAdapter	
		$db = $this->_helper->database->getAdapter();
						
		$where = $db->quoteInto('id = ?', $pId); // sql-injection save quotation
		
		//	Update needs an array with Key/Value 
		$db->update('user', array('name' => $pName), $where);
	}

	// Handle DELETE requests to delete a specific item
	public function deleteAction() {
		// Get the Parameters
		$pId = $this->getRequest()->getParam("id");
	
		// Get the DatabaseAdapter	
		$db = $this->_helper->database->getAdapter();
						
		$where = $db->quoteInto('id = ?', $pId); // sql-injection save quotation
		$db->delete('user', $where);
	}
}