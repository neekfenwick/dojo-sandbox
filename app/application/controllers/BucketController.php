<?php

include_once('BaseController.php');
include_once('helpers/SecurityUtils.php');
include_once('helpers/BucketUtils.php');

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

// TODO: remove this block once we're happy validating tokens is completely useless here.
//    if ($namespace != 'public') {
//        $token = $this->getRequest()->getParam('token');
//        if ($token != null && strlen($token) > 0) {
//            self::$logger->debug("namespace is not public, validate token ($token)...");
//
//            $token_username = SecurityUtils::getUsernameForToken($db, $token);
//            if ($token_username != $namespace) {
//                self::$logger->info("Token failed validation, token_username ($token_username) does not match namespace ($namespace).");
//                throw new SecurityException("Token does not match namespace user");
//            }
//            self::$logger->debug("token validated OK for username ($token_username).");
//        } else {
//            self::$logger->debug("namespace is not public and no token provided.  Carry on.");
//        }
//    }
    
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
        $db = $this->_helper->database->getAdapter();

        // We use POST to fork buckets.  Rather non-standard, perhaps move into its
        //  own Controller?
        // We use the posted bucket rather than what might be in the database, so any
        //  unsaved changes are retained.
        $bucket = $this->gatherBucketFromRequest();

        // We always fork into the current token's namespace, not the one the bucket
        //  is coming from.  That way we can load another user's bucket and fork it
        //  into our own namespace.
        $token = $this->getRequest()->getParam("token");
        $namespace = isset($token) ? BucketUtils::getNamespaceForToken($db, $token) : 'public';
//        if (!isset($token)) {
//            $namespace = 'public';
//        } else {
//            $namespace = BucketUtils::getNamespaceForToken($db, $token);
//        }

        // Come up with a new id for the bucket
        $id = BucketUtils::generateId($db, $namespace);

        $version = 0;
        
        self::$logger->info("forking incoming bucket " . $bucket['namespace'] . "/" . $bucket['id'] . "/" . $bucket['contents']['version'] . " to $namespace/$id/$version");
        $db->insert('bucket', array(
            'namespace' => $namespace,
            'id' => $id,
            'name' => $bucket['name'],
            'description' => $bucket['description'],
            'latest_version' => $version));

        // Merge arrays so our new info overwrites the old
        $db->insert('bucket_version', array_merge(
            $bucket['contents'],
            array(
                'bucket_namespace' => $namespace,
                'bucket_id' => $id,
                'version' => $version
            )));
        
        /* TODO fork files and resources table rows too? */
        
        $response = array(
            "success" => true,
            "namespace" => $namespace,
            "id" => $id,
            "version" => $version
        );
        echo Zend_Json::encode($response);
	}

	// Handle PUT requests to update a specific resource item
	public function putAction() {
		echo "TODO: putAction()";
	}

	// Handle DELETE requests to delete a specific item
	public function deleteAction() {
    $db = $this->_helper->database->getAdapter();
    $namespace = $this->getRequest()->getParam("namespace");
    $id = $this->getRequest()->getParam("id");
    
    $db->delete('bucket', array(
        'namespace' => $namespace,
        'id' => $id));
    $db->delete('bucket_version', array(
        'bucket_namespace' => $namespace,
        'bucket_id' => $id));
    $db->delete('bucket_file', array(
        'bucket_namespace' => $namespace,
        'bucket_id' => $id));
    $db->delete('bucket_resource', array(
        'bucket_namespace' => $namespace,
        'bucket_id' => $id));
    
    echo Zend_Json::encode(array(
        'success' => true
    ));
	}
}