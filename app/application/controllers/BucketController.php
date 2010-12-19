<?php

include_once('BaseController.php');

class BucketController extends BaseController
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
    return self::getAction();
	}

	// Handle GET and return a specific resource item
	public function getAction() {
	
		//@TODO: handle the query with $this->_getParam(...)
    $db = $this->_helper->database->getAdapter();
    $namespace = $this->getRequest()->getParam("namespace");
    $id = $this->getRequest()->getParam("id");
    self::$logger->info("index fetching bucket namespace ($namespace) id ($id)");

    $select = $db->select()
          ->from('bucket', array('name', 'description', 'latest_version'))
          ->where('namespace = ?', $namespace)
          ->where('id = ?', $id); // sql-injection save quotation
    $bucket_data = $db->fetchRow($select);

    // we may have been given a version number
    $version = $this->getRequest()->getParam("version");
    if (!isset($version)) {
      $version = $bucket_data->latest_version;
      self::$logger->info("version not provided.. Fetched latest version ($version)");
    }

    self::$logger->info("index fetching bucket_version where namespace ($namespace) id ($id) version ($version)");
    $select = $db->select()
          ->from('bucket_version')
          ->where('bucket_namespace = ?', $namespace)
          ->where('bucket_id = ?', $id)
          ->where('version = ?', $version);
    $version_data = $db->fetchRow($select);

    if ($version_data) {
      self::$logger->info("html (" . $version_data->content_html . ")");

      $response_data = array(
          'namespace'    => $namespace,
          'id'           => $id,
          'version'      => $version,
          'name'         => $bucket_data->name,
          'description'  => $bucket_data->description,
          'dojo_version' => $version_data->dojo_version,
          'dj_config'    => $version_data->dj_config,
          'layers'       => $version_data->layers,
          'content_html' => $version_data->content_html,
          'content_js'   => $version_data->content_js,
          'content_css'  => $version_data->content_css
      );
    } else {
      // Want to return a 5xx error code here?
      $response_data = array(
          'error'   => true,
          'message' => "The requested bucket did not exist (namespace ($namespace) id ($id) version ($version))");
    }

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