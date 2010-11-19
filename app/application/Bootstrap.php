<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

	protected function _initRest()
	{
		$front = Zend_Controller_Front::getInstance();
		$router = $front->getRouter();

		// Specifying all controllers as RESTful:
		$restRoute = new Zend_Rest_Route($front);
		$router->addRoute('default', $restRoute);

		// Specifying the "api" module only as RESTful:
		$restRoute = new Zend_Rest_Route($front, array(), array(
		    'api',
		));
		$router->addRoute('rest', $restRoute);
	}
	
	protected function _initView()    
	{
		// Initialize view
	    $view = new Zend_View();       
	    $view->doctype('XHTML1_STRICT');        
	    //$view->headTitle('more evis - mobile');
	    $view->setEncoding('utf-8');
	    $view->headMeta()->appendHttpEquiv('Content-Type','text/html; charset=utf-8');
	     
	    // Add it to the ViewRenderer        
	    $viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('ViewRenderer');
	    $viewRenderer->setView($view);   

	    // Return it, so that it can be stored by the bootstrap        
	    return $view;    
	}
	
	/**
	* Bootstrap autoloader for application resources
	* 
	* @return Zend_Application_Module_Autoloader
	*/
	protected function _initAutoload()
	{
		$autoloader = new Zend_Application_Module_Autoloader(array(
		    'namespace' => '',
		    'basePath'  => dirname(__FILE__),
		));


		return $autoloader;
	}	
    
	protected function _initDB()
	{    		
	    //this is the database from the pitFM-Connection!
		// Check that the config contains the correct database array.
		if ($this->getOption('database')) 
		{
			// Instantiate the DB factory
			$database = $this->getOption('database');
			$dbAdapter = Zend_Db::factory($database['adapter'], $database['params']);
			// Set the DB Table default adaptor for auto connection in the models        
			Zend_Db_Table::setDefaultAdapter($dbAdapter);  

			Zend_Registry::set("dbAdapter", $dbAdapter);
			
			$dbAdapter->setFetchMode(Zend_Db::FETCH_OBJ); 
			
			//setup metadata-caching
			$frontendOptions = array(
			    'automatic_serialization' => true,
				 'lifetime' => 30,
			    );
			
			$backendOptions  = array(
			    'cache_dir'                => dirname(__FILE__).'/cache/'
			    );
			
			$cache = Zend_Cache::factory('Core',
						     'File',
						     $frontendOptions,
						     $backendOptions);
			
			// Next, set the cache to be used with all table objects
			Zend_Db_Table_Abstract::setDefaultMetadataCache($cache);

			//create a 2nd databaseadapter for internal usage
		$db = Zend_Db::factory('Pdo_Sqlite', array(
		    'dbname' => dirname(__FILE__).'/database/tracker.s3db'
		));
		
		Zend_Registry::set('sqliteAdapter', $db);  
		}
	}  
	
	
}
