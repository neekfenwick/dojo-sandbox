<?php

abstract class BaseController extends Zend_Rest_Controller {
  protected static $logger = null;

  public static function initLogger() {
    self::$logger = new Zend_Log();
    $writer = new Zend_Log_Writer_Stream('php://stderr');
    self::$logger->addWriter($writer);
  }

}

// Get static init called.
BaseController::initLogger();
?>