<?php

include_once('BaseController.php');

class RunController extends BaseController {

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
//      self::$logger = new Zend_Log();
//      $writer = new Zend_Log_Writer_Stream('php://stderr');
//      self::$logger->addWriter($writer);
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

    /* Populate template parameters for the view */

    self::$logger->info("name ($name) - isset (" . isset($name) . ")");
    if (!isset($name) || strlen($name) == 0) {
      $name = 'Unnamed Sandbox ' . $namespace . '/' . $id . '/' . $version;
    }
    $this->view->name = $name;
    $this->view->javascript = $version_data->content_js;
    $this->view->css = $version_data->content_css;
    $this->view->html = $version_data->content_html;
    $this->view->dj_config = $version_data->dj_config;
    $this->view->layers = $version_data->layers; // NB still ## separated
    switch ($version_data->dojo_version) {
      case "1.4.3":
        $this->view->dojo_base_dir = 'dojo-1.4.3'; // @TODO
        break;
      case "1.4.3-nooptimize":
        $this->view->dojo_base_dir = 'dojo-1.4.3-nooptimize'; // @TODO
        break;
      case "1.5.0":
        $this->view->dojo_base_dir = 'dojo-1.5.0'; // @TODO
        break;
      case "1.5.0-nooptimize":
        $this->view->dojo_base_dir = 'dojo-1.5.0-nooptimize'; // @TODO
        break;
      default:
        break;
    };
    $this->view->dojo_theme = 'claro';

	}

	public function postAction(){
		$this->_helper->viewRenderer->setNoRender(true);
    $db = $this->_helper->database->getAdapter();

		$namespace = $this->getRequest()->getParam("namespace");
		$id = $this->getRequest()->getParam("id");
    $version = $this->getRequest()->getParam("version");
    self::$logger->info("postAction namespace ($namespace) id ($id) version ($version)");
    if (!isset($namespace) || $namespace == '') {
      self::$logger->info("namespace not provided, default to 'public'");
      $namespace = 'public';
    }
    if (!isset($id) || $id == '') {
      self::$logger->info("id not provided, default to '1234'");
//      $id = '1234'; // @TODO make me random
      $accepted = false;
      while (!$accepted) {
        $id = substr(md5(uniqid(mt_rand(), true)), 0, 5);
        $rs = $db->fetchRow($db->select()->from('bucket', 'COUNT(*) as count')
            ->where('namespace', $namespace)
            ->where('id', $id));
        self::$logger->info("random id ($id) count " . $rs->count);
        $accepted = ($rs->count == 0);
      }
      self::$logger->info("Accepted new id ($id)");
    }
    if (!isset($version)) {
      self::$logger->info("version not provided, default to 0");
      $version = 0;
    }

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

    // ensure this sandbox exists
    self::$logger->info("Running bucket count for namespace ($namespace) id ($id)...");
		$select = $db	->select()
					->from('bucket', "COUNT(*) as cc")
					->where('namespace = ?', $namespace)
          ->where('id = ?', $id); // sql-injection save quotation

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
//      $response = array('lastId' => $uniqueId);
      // Create the initial version
      self::$logger->info("create bucket_version dojo_version ($dojo_version)");
      $db->insert('bucket_version', array_merge(
          array(
            'bucket_namespace' => $namespace,
            'bucket_id' => $id,
            'version' => 0),
          $bucket_contents));

    } else {
      // sandbox does exist
      self::$logger->info('bucket does exist');


      if (isset($_REQUEST['saveAsNew'])) {
        $version ++;
        self::$logger->info("saveAsNew version becomes ($version)");
        $db->insert('bucket_version', array_merge(
            array(
              'bucket_namespace' => $namespace,
              'bucket_id' => $id,
              'version' => $version),
            $bucket_contents));
      } else {

        self::$logger->info("not saveAsNew, update existing version ($version)");
        $where = array();
        $where[] = $db->quoteInto('bucket_id = ?', $id); // sql-injection save quotation
        $where[] = $db->quoteInto('bucket_namespace = ?', $namespace); // sql-injection save quotation
        $where[] = $db->quoteInto('version = ?', $version); // sql-injection save quotation

        $db->update('bucket_version', $bucket_contents, $where);
      }
    }

/*		$session = new Zend_Session_Namespace("runIframe");
		$session->html = $html;
		$session->javascript = $javascript;
		$session->css = $css;
		$session->id = rand(1,1000000);

		echo Zend_Json::encode(array("id" => $session->id));*/

    /* To get the bucket running, we can either:
     * 1/ return encoded info and let Frontend.js set the iframes src
     * OR
     * 2/ send a 302 Redirect and allow the app to init on startup from the URL
     */
    echo Zend_Json::encode(array("namespace" => $namespace,
        "id" => $id, "version"=>$version));
//    $redir_url = "/$namespace/$id/$version";
//    self::$logger->info("Sending redirect to ($redir_url)");
//    $this->_redirect($redir_url,
//        array( 'exit' => true, 'prependBase' => false));
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