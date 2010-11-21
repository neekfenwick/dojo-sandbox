<?php

class RunController extends Zend_Rest_Controller {

  /*
   * Respond to e.g. /backend/run/index/namespace/public/id/1234/version/2
   * namespace, id - mandatory bucket identifiers
   * version - optional version number of the bucket
   */
	public function indexAction(){
/*		$sessionId = $this->getRequest()->getParam("id");
		$session = new Zend_Session_Namespace("runIframe");

		if($sessionId == $session->id){
			$this->view->html = $session->html;
			$this->view->css = $session->css;
			$this->view->javascript = $session->javascript;
		}*/
    $db = $this->_helper->database->getAdapter();
    // @TODO: how do you log in zend?
      $logger = new Zend_Log();
      $writer = new Zend_Log_Writer_Stream('php://stderr');
      $logger->addWriter($writer);
    $namespace = $this->getRequest()->getParam("namespace");
    $id = $this->getRequest()->getParam("id");
    $logger->info("index fetching bucket namespace ($namespace) id ($id)");

    // we may have been given a version number
    $version = $this->getRequest()->getParam("version");
    if (!isset($version)) {
      $select = $db	->select()
            ->from('bucket', "latest_version")
            ->where('namespace = ?', $namespace)
            ->where('id = ?', $id); // sql-injection save quotation
      $version = $db->fetchRow($select)->latest_version;
    }

    $logger->info("index fetching bucket_version where namespace ($namespace) id ($id) version ($version)");
    $select = $db	->select()
          ->from('bucket_version')
          ->where('bucket_namespace = ?', $namespace)
          ->where('bucket_id = ?', $id)
          ->where('version = ?', $version);
    $version_data = $db->fetchRow($select);

    /* Build response that will go into the iframe */

    $response_src = "<html><head>";
    // @TODO: build links here from bucket_resource

    $response_src = "<style type='text/css'>\n" .
      $version_data->content_js . "</style>\n";
    $response_src = "<script type='text/javascript'>\n" .
      $version_data->content_css . "</script>\n";

    $response_src .= "</head><body>" . $version_data->content_html . "</body></html";

    echo $response_src;

	}

	public function postAction(){
		$this->_helper->viewRenderer->setNoRender(true);

    // @TODO: how do you log in zend?
      $logger = new Zend_Log();
      $writer = new Zend_Log_Writer_Stream('php://stderr');
      $logger->addWriter($writer);

		$namespace = $this->getRequest()->getParam("namespace");
		$id = $this->getRequest()->getParam("id");
    $version = 		$id = $this->getRequest()->getParam("id");
    $logger->info("postAction namespace ($namespace) id ($id) version ($version)");
    if (!isset($version)) {
      $logger->info("version not provided, default to 0");
      $version = 0;
    }

    // retrieve the guts of the sandbox
    $name = $this->getRequest()->getParam("name");
    $description = $this->getRequest()->getParam("description");
    $dojo_version = $this->getRequest()->getParam("dojo_version");
    $dj_config = $this->getRequest()->getParam("dj_config");
    $html = $this->getRequest()->getParam("html");
		$javascript = $this->getRequest()->getParam("javascript");
		$css = $this->getRequest()->getParam("css");

    // ensure this sandbox exists
    $db = $this->_helper->database->getAdapter();
    $logger->info('Running bucket count...');
		$select = $db	->select()
					->from('bucket', "COUNT(*) as cc")
					->where('namespace = ?', $namespace)
          ->where('id = ?', $id)
          ->where('version = ?', $version); // sql-injection save quotation

    if ($db->fetchRow($select)->cc == 0) {
      // sandbox does not yet exist, create it
      $logger->info('bucket does not yet exist');
      // Create the bucket
      $db->insert('bucket', array(
          'namespace' => $namespace,
          'id' => $id,
          'name' => $name,
          'description' => $description,
          'latest_version' => $version));
//      $response = array('lastId' => $uniqueId);
      // Create the initial version
      $logger->info("create bucket_version dojo_version ($dojo_version)");
      $db->insert('bucket_version', array(
          'bucket_namespace' => $namespace,
          'bucket_id' => $id,
          'version' => 0,
          'dojo_version' => $dojo_version,
          'content_html' => $html,
          'content_css' => $css,
          'content_js' => $javascript,
          'dj_config' => $dj_config));

    } else {
      // sandbox does exist
      $logger->info('bucket does exist');

      // @TODO update the row in bucket_version with new data
      // Note - we do not increment bucket_version.version here.. that is done
      //  by a Save or Update action, not Run.
    }

/*		$session = new Zend_Session_Namespace("runIframe");
		$session->html = $html;
		$session->javascript = $javascript;
		$session->css = $css;
		$session->id = rand(1,1000000);

		echo Zend_Json::encode(array("id" => $session->id));*/
    echo Zend_Json::encode(array("namespace" => $namespace,
        "id" => $id, "version"=>$version));
	}
	
	public function deleteAction() {}
	public function putAction() {}
	public function getAction() {
    
// This seems the wrong place, see index method at top
//    /* Build response that will go into the iframe */
//
//    $response_src = "<html><head>";
//    // @TODO: build links here from bucket_resource
//
//    $response_src = "<script type='text/javascript'>\n" .
//      $javascript . "</script>\n";
//
//    $response_src .= "</head><body>" . $html . "</body></html";
//
//    echo $response_src;
  }
    
}