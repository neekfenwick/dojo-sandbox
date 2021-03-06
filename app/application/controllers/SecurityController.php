<?php

include_once('BaseController.php');
include_once('helpers/SecurityUtils.php');

class SecurityController extends BaseController
{

	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

	public function indexAction() {
        $db = $this->_helper->database->getAdapter();
        //@TODO: handle the query with $this->_getParam(...)
        $action = $this->getRequest()->getParam("action");
        self::$logger->info("security handling action ($action)");

        $response = array('success' => false); // fail by default
//    if ($action == 'validateToken') {
        // @TODO db lookup to validate token
        $token = $this->getRequest()->getParam("token");

        $token_username = SecurityUtils::getUsernameForToken($db, $token);
        if (isset($token_username)) {
            $response = array('success' => true, 'username' => $token_username);
        } else {
            $response = array('success' => false, 'message' => 'Could not validate token');
            setcookie('token', '', 0, '/');
        }
//    } else {
//      self::$logger->emerg("Unknown action ($action)!");
//    }

        echo Zend_Json::encode($response);
    }

	// Handle GET and return a specific resource item
	public function getAction() {
    echo "TODO: getAction()"; // should return error code here.. or just not implement?
	}

	// Handle POST requests to create a new resource item
	public function postAction() {
    echo "TODO: postAction()"; // should return error code here.. or just not implement?
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