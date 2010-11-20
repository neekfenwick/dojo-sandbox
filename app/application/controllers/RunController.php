<?php

class RunController extends Zend_Rest_Controller {

	public function indexAction(){
		$sessionId = $this->getRequest()->getParam("id");
		$session = new Zend_Session_Namespace("runIframe");

		if($sessionId == $session->id){
			$this->view->html = $session->html;
			$this->view->css = $session->css;
			$this->view->javascript = $session->javascript;
		}
	}

	public function postAction(){
		$this->_helper->viewRenderer->setNoRender(true);

		$html = $this->getRequest()->getParam("html");
		$javascript = $this->getRequest()->getParam("javascript");
		$css = $this->getRequest()->getParam("css");

		$session = new Zend_Session_Namespace("runIframe");
		$session->html = $html;
		$session->javascript = $javascript;
		$session->css = $css;
		$session->id = rand(1,1000000);

		echo Zend_Json::encode(array("id" => $session->id));
	}
	
	public function deleteAction() {}
	public function putAction() {}
	public function getAction() {}
    
}