<?php

abstract class BaseController extends Zend_Rest_Controller {
  protected static $logger = null;

  public static function initLogger() {
    self::$logger = new Zend_Log();
    #$writer = new Zend_Log_Writer_Stream('php://stderr');
    #$writer = new Zend_Log_Writer_Syslog(array('facility' => 'sandbox'));
    #$options = Zend_Controller_Front::getInstance()->getParam('bootstrap')->getOptions();
    #error_log("option: " . $options->logfile->path);
    $writer = new Zend_Log_Writer_Stream('php://stderr');
    self::$logger->addWriter($writer);
  }
  
  
    public function gatherBucketFromRequest() {
        // retrieve the guts of the bucket
        $name = $this->getRequest()->getParam('name') == null ? '' : $this->getRequest()->getParam("name");
        $description = $this->getRequest()->getParam('description') == null ? '' : $this->getRequest()->getParam("description");
        $namespace = $this->getRequest()->getParam("namespace");
        $id = $this->getRequest()->getParam("id");
        $version = $this->getRequest()->getParam("version");
        $dojo_version = $this->getRequest()->getParam("dojo_version");
        $dj_config = $this->getRequest()->getParam("dj_config");
        $html = $this->getRequest()->getParam("html");
        $javascript = $this->getRequest()->getParam("javascript");
        $css = $this->getRequest()->getParam("css");
        $layers = $this->getRequest()->getParam("layers");

        // prepare the guts of the bucket, used in each kind of insert/update later
        $bucket = array(
            'name' => $name,
            'description' => $description,
            'namespace' => $namespace,
            'id' => $id,
            'contents' => array(
                'version' => $version,
                'dojo_version' => $dojo_version,
                'content_html' => $html,
                'content_css' => $css,
                'content_js' => $javascript,
                'dj_config' => $dj_config,
                'layers' => $layers
            )
        );
        return $bucket;
    }


}

// Get static init called.
BaseController::initLogger();
?>
