<?php

include_once('BaseController.php');
include_once('helpers/SecurityUtils.php');

class LogoutController extends BaseController
{
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

    public function indexAction() {
	}
    public function getAction() {
	}
    public function putAction() {
	}
    public function deleteAction() {
	}

    public function postAction() {
        $db = $this->_helper->database->getAdapter();
        
        $token = $this->getRequest()->getParam("token");
        
        self::$logger->info("Logout requested for token ($token).");
        $response = array(
            'success' => false,
            'message' => 'An unknown error occurred');
        
        $token_username = SecurityUtils::getUsernameForToken($db, $token);
        
        if (!isset($token_username)) {
                $response['success'] = false;
                $response['message'] = "Token ($token) does not match a user";
            //throw new SecurityException("Token ($token) does not match a user");
        } else {
        
            //$db->update('user', array('token' => null), 'username = ?');
            $db->update('user', array('token' => null),
                    $db->quoteInto('username = ?', $token_username));

            $response['success'] = true;
            $response['message'] = "Logged out successfully.";

            setcookie('token', '', 0, '/');
        }
        
        sleep(2); // simulate network lag
        echo Zend_Json::encode($response);
	}

}