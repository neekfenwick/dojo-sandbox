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

}

// Get static init called.
BaseController::initLogger();
?>
