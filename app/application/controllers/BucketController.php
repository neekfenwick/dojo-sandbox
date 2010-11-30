<?php

class BucketController extends Zend_Rest_Controller
{
	//	Test Array.
	//	@TODO: use Database
	private $_items = array(
			array("id" => "0", "name" => "theme",  "value" => "claro"), 
			array("id" => "1", "name" => "dojo_versions",  "value" => "1.5.0")
		);
	
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

	// Handle GET and return a list of resources
	public function indexAction() {
    echo "TODO: indexAction()"; // should return error code here.. or just not implement?
	}

	// Handle GET and return a specific resource item
	public function getAction() {
	
		//@TODO: handle the query with $this->_getParam(...)
		   $db = $this->_helper->database->getAdapter();
    // @TODO: how do you log in zend?
      $logger = new Zend_Log();
      $writer = new Zend_Log_Writer_Stream('php://stderr');
      $logger->addWriter($writer);
    $namespace = $this->getRequest()->getParam("namespace");
    $id = $this->getRequest()->getParam("id");
    $logger->info("index fetching bucket namespace ($namespace) id ($id)");

    $select = $db->select()
          ->from('bucket', array('name', 'description', 'latest_version'))
          ->where('namespace = ?', $namespace)
          ->where('id = ?', $id); // sql-injection save quotation
    $bucket_data = $db->fetchRow($select);

    // we may have been given a version number
    $version = $this->getRequest()->getParam("version");
    if (!isset($version)) {
      $version = $bucket_data->latest_version;
      $logger->info("version not provided.. Fetched latest version ($version)");
    }

    $logger->info("index fetching bucket_version where namespace ($namespace) id ($id) version ($version)");
    $select = $db->select()
          ->from('bucket_version')
          ->where('bucket_namespace = ?', $namespace)
          ->where('bucket_id = ?', $id)
          ->where('version = ?', $version);
    $version_data = $db->fetchRow($select);
    $logger->info("html (" . $version_data->content_html . ")");

    $response_data = array(
        'name' => $bucket_data->name,
        'description' => $bucket_data->description,
        'dojo_version' => $version_data->dojo_version,
        'dj_config' => $version_data->dj_config,
        'content_html' => $version_data->content_html,
        'content_js' => $version_data->content_js,
        'content_css' => $version_data->content_css
    );

		echo Zend_Json::encode($response_data);
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