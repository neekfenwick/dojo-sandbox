<?php

include_once('BaseController.php');
include_once('helpers/SecurityUtils.php');
include_once('helpers/BucketUtils.php');

class SecurityException extends Exception {
}

class RunController extends BaseController {

  /*
   * Respond to e.g. /backend/run/index/namespace/public/id/1234/version/2
   * or /backend/run/index/session_id/a1b2c3
   * session_id -
   * namespace, id - mandatory bucket identifiers
   * version - optional version number of the bucket
   */
	public function indexAction(){
    $db = $this->_helper->database->getAdapter();

    // get params from request
    $session_id = $this->getRequest()->getParam("session_id");
    $session = new Zend_Session_Namespace("runIframe");
    if (isset($session->session_id) && isset($session_id) &&
        $session_id == $session->session_id) {
      self::$logger->info("Populating view from session variable, e.g. html: " . $session->content_html . ".");
      $name = $session->name;
      $bucket_contents = array(
          'content_html' => $session->content_html,
          'content_js' => $session->content_js,
          'content_css' => $session->content_css,
          'dojo_version' => $session->dojo_version,
          'dj_config' => $session->dj_config,
          'layers' => $session->layers
      );
    } else {
      $namespace = $this->getRequest()->getParam("namespace");
      $id = $this->getRequest()->getParam("id");
      self::$logger->info("index fetching bucket namespace ($namespace) id ($id)");

      // fetch overall bucket info
      $select = $db	->select()
            ->from('bucket', array('name', 'latest_version'))
            ->where('namespace = ?', $namespace)
            ->where('id = ?', $id);
      $bucket_rs = $db->fetchRow($select);

      // we may have been given a version number
      $version = $this->getRequest()->getParam("version");
      if (!isset($version)) {
        $version = $bucket_rs->latest_version;
        self::$logger->info("version not provided.. Fetched latest version ($version)");
      }

      $name = $bucket_rs->name;

      self::$logger->info("index fetching bucket_version where namespace ($namespace) id ($id) version ($version)");
      $select = $db	->select()
            ->from('bucket_version')
            ->where('bucket_namespace = ?', $namespace)
            ->where('bucket_id = ?', $id)
            ->where('version = ?', $version);
      $version_data = $db->fetchRow($select);
      self::$logger->info("html (" . $version_data->content_html . ")");

      self::$logger->info("name ($name) - isset (" . isset($name) . ")");
      if (!isset($name) || strlen($name) == 0) {
        $name = 'Unnamed Sandbox ' . $namespace . '/' . $id . '/' . $version;
      }
      
      $bucket_contents = array(
        'dojo_version' => $version_data->dojo_version,
        'content_html' => $version_data->content_html,
        'content_css' => $version_data->content_css,
        'content_js' => $version_data->content_js,
        'dj_config' => $version_data->dj_config,
        'layers' => $version_data->layers);
    }

    /* Populate template parameters for the view */

    $this->populateView($name, $bucket_contents);
	}

  private function populateView($name, $bucket_contents) {

    self::$logger->info("populateView given name ($name) version_data for html (" . $bucket_contents['content_html'] . ")");
    
    $dojoLibOverrideUrl = $this->getRequest()->getParam("dojoLibOverrideUrl");
    $dojoLibOverrideSDK = $this->getRequest()->getParam("dojoLibOverrideSDK");
    $dojoLibOverrideLoader = $this->getRequest()->getParam("dojoLibOverrideLoader");
    $dojoThemeOverride = $this->getRequest()->getParam("dojoThemeOverride");
    $onLoadHandler = $this->getRequest()->getParam("onLoadHandler");
    self::$logger->info("given ($dojoLibOverrideUrl) ($dojoLibOverrideSDK) ($dojoLibOverrideLoader) ($onLoadHandler)");

    $this->view->name = $name;
    $this->view->javascript = $bucket_contents['content_js'];
    $this->view->css = $bucket_contents['content_css'];
    $this->view->html = $bucket_contents['content_html'];
    $this->view->dj_config = $bucket_contents['dj_config'];
    $this->view->layers = $bucket_contents['layers']; // NB still ## separated
    if (isset($dojoLibOverrideUrl)) {
      $this->view->dojo_base_url = $dojoLibOverrideUrl;
    } else {
      $this->view->dojo_base_url = "";
    }
    if (isset($dojoLibOverrideSDK)) {
      // Use the dojo lib we were given in the request
      $this->view->dojo_base_dir = $dojoLibOverrideSDK;
    } else {
      // Use the dojo lib stored against this bucket
      $this->view->dojo_base_dir = '/lib/dojo-' . $bucket_contents['dojo_version'];
    }
    if (isset($dojoLibOverrideLoader)) {
      $this->view->dojo_loader = $dojoLibOverrideLoader;
    } else {
      $this->view->dojo_loader = "/dojo/dojo.js";
    }
    if (isset($dojoThemeOverride)) {
      $this->view->dojo_theme = $dojoThemeOverride;
    } else {
      $this->view->dojo_theme = 'claro'; // TODO no theme support yet
    }
    self::$logger->info("onLoadHandler ($onLoadHandler)");
    if (isset($onLoadHandler)) {
      self::$logger->info("setting to on_load_handler.");
      $this->view->on_load_handler = $onLoadHandler;
    }

  }
	public function postAction(){
		$this->_helper->viewRenderer->setNoRender(true);

        $db = $this->_helper->database->getAdapter();

        // retrieve the guts of the bucket
        $name = $this->getRequest()->getParam("name");
        $description = $this->getRequest()->getParam("description");
        $dojo_version = $this->getRequest()->getParam("dojo_version");
        $dj_config = $this->getRequest()->getParam("dj_config");
        $html = $this->getRequest()->getParam("html");
            $javascript = $this->getRequest()->getParam("javascript");
            $css = $this->getRequest()->getParam("css");
        $layers = $this->getRequest()->getParam("layers");

        // prepare the guts of the bucket, used in each kind of insert/update later
        $bucket_contents = array(
          'dojo_version' => $dojo_version,
          'content_html' => $html,
          'content_css' => $css,
          'content_js' => $javascript,
          'dj_config' => $dj_config,
          'layers' => $layers);

        $response = array();
        try {

            // We may not have been passed any identifying info
            $token = $this->getRequest()->getParam("token");
            $namespace = $this->getRequest()->getParam("namespace");
            $id = $this->getRequest()->getParam("id");
            $version = $this->getRequest()->getParam("version");
            self::$logger->info("postAction namespace ($namespace) id ($id) version ($version)");

            if (isset($_REQUEST['save'])) {

                // sanitize $namespace - may be empty for new buckets
                if (!isset($namespace) || $namespace == ''
                        || $_REQUEST['save'] === 'fork') {
                    self::$logger->debug("namespace not set or forking.  Check token ($token)");
                    if (isset($token) && $token != '') {
                        $token_namespace = BucketUtils::getNamespaceForToken($db, $token);
                        if ($token_namespace) {
                            $namespace = $token_namespace;
                        }
                    } else {
                        self::$logger->info("namespace not provided, default to 'public'");
                        $namespace = 'public';
                    }
                }

                SecurityUtils::verifyToken($db, $token, $namespace);

                if (!isset($id) || $id == '' || $_REQUEST['save'] === 'fork') {
                    self::$logger->info("id not provided or forking, generating new random id");
                    $id = BucketUtils::generateId($db, $namespace);
                }
                if (!isset($version) || $_REQUEST['save'] === 'fork') {
                    self::$logger->info("version not provided or forking, default to 0");
                    $version = 0;
                }
                if ($_REQUEST['save'] == 'new_version') {
                    $version++;
                }


                // The bucket may not yet exist
                self::$logger->info("Running bucket count for namespace ($namespace) id ($id)...");
                $select = $db->select()
                        ->from('bucket', "COUNT(*) as cc")
                        ->where('namespace = ?', $namespace)
                        ->where('id = ?', $id);

                if ($db->fetchRow($select)->cc == 0) {
                    // sandbox does not yet exist, create it
                    self::$logger->info('bucket does not yet exist');
                    // Create the bucket
                    $db->insert('bucket', array(
                        'namespace' => $namespace,
                        'id' => $id,
                        'name' => $name,
                        'description' => $description,
                        'latest_version' => $version));
                }

                self::$logger->info("Running bucket_version count for namespace ($namespace) id ($id) version ($version)...");
                $select = $db->select()
                        ->from('bucket_version', "COUNT(*) as cc")
                        ->where('bucket_namespace = ?', $namespace)
                        ->where('bucket_id = ?', $id)
                        ->where('version = ?', $version);
                if ($db->fetchRow($select)->cc == 0) {
                    // Create the initial version
                    self::$logger->info("insert bucket_version");
                    $db->insert('bucket_version', array_merge(
                                    array(
                                'bucket_namespace' => $namespace,
                                'bucket_id' => $id,
                                'version' => $version), $bucket_contents));
                } else {

                    self::$logger->info("update bucket_version ($version)");
                    $db->update('bucket_version', $bucket_contents, array(
                        'bucket_namespace = ?' => $namespace,
                        'bucket_id = ?' => $id,
                        'version = ?' => $version
                    ));
                }

                // inform the caller of the new identity
                $response = array(
                    "success" => true,
                    "namespace" => $namespace,
                    "id" => $id,
                    "version" => $version
                );
            } else if (isset($_REQUEST['save'])) {
                // save_as_new was false, so overwrite existing version.
                $db->update('bucket_version', array_merge(
                                array(
                            'bucket_namespace' => $namespace,
                            'bucket_id' => $id,
                            'version' => $version), $bucket_contents));
                $response = array(
                    "success" => true,
                    "namespace" => $namespace,
                    "id" => $id,
                    "version" => $version
                );
            }

            $session = new Zend_Session_Namespace("runIframe");
            $session->name = $name;
            $session->content_html = $bucket_contents['content_html'];
            $session->content_js = $bucket_contents['content_js'];
            $session->content_css = $bucket_contents['content_css'];
            $session->dojo_version = $bucket_contents['dojo_version'];
            $session->dj_config = $bucket_contents['dj_config'];
            $session->layers = $bucket_contents['layers'];
            $session->session_id = rand(1,1000000);
            $response['session_id'] = $session->session_id;
        } catch (SecurityException $e) {
            $response['success'] = false;
            $response['exception'] = 'SecurityException';
            $response['message'] = $e->getMessage();

        }
		echo Zend_Json::encode($response);
	}
	
	public function deleteAction() {}
	public function putAction() {}
	public function getAction() {}

}