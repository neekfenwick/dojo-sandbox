<?php

class SecurityController extends Zend_Rest_Controller
{

	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

	public function indexAction() {
    echo "TODO: indexAction()"; // should return error code here.. or just not implement?
	}

	// Handle GET and return a specific resource item
	public function getAction() {
    echo "TODO: getAction()"; // should return error code here.. or just not implement?
	}

	// Handle POST requests to create a new resource item
	public function postAction() {
    // @TODO: how do you log in zend?
      $logger = new Zend_Log();
      $writer = new Zend_Log_Writer_Stream('php://stderr');
      $logger->addWriter($writer);

    //@TODO: handle the query with $this->_getParam(...)
    $action = $this->_getParam("action");
    $logger->info("security handling action ($action)");

    $response = array('success' => false); // fail by default

    if ($action == 'validateToken') {
      // @TODO db lookup to validate token
      $token = $this->_getParam("token");
      $logger->info("XXX validateToken presuming token ($token) is valid");
      $response = array('success' => true);
    } else if ($action == 'login') {
      // @TODO validate username/password against db
      $username = $this->_getParam("username");
      $password = $this->_getParam("password");
      // @TODO if valid, update token for this user
      $newToken = "abcde";

      $response = array('success' => true, 'token' => $newToken);
    } else {
      $logger->error("Unknown action ($action)!");
    }

		//$data = new Zend_Dojo_Data('id', $this->_items, "name");
		//echo $data->toJson();
    echo Zend_Json::encode($response);
	}

	// Handle PUT requests to update a specific resource item
	public function putAction() {
		echo "TODO: putAction()"; // should return error code here.. or just not implement?
	}

	// Handle DELETE requests to delete a specific item
	public function deleteAction() {
		echo "TODO: deleteAction()"; // should return error code here.. or just not implement?
	}
}