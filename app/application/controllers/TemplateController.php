<?php

include_once('BaseController.php');
include_once('helpers/SecurityUtils.php');
include_once('helpers/BucketUtils.php');

class TemplateController extends BaseController
{
		
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
    self::$logger->info("fetching templates");

//    $select = $db->select()
//          ->from('bucket_version', array(new Zend_Db_Expr("MAX(version) AS maxversion")))
//          ->where('bucket_namespace = \'template\'');
    $select = $db->select()
            ->from('bucket', array('namespace', 'id', 'name'))
            ->join('bucket_version', 'id = bucket_id and namespace = bucket_namespace', array('version'))
            ->where('version = latest_version')
            ->where('namespace = \'template\'');
//    $template_data = $db->fetchRow($select);
    $template_data = $db->fetchAll($select);

		echo Zend_Json::encode($template_data);
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