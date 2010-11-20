<?php

class IndexController extends Zend_Controller_Action
{
    public function init()
    {
        $this->_helper->viewRenderer->setNoRender(true);
    }

    public function indexAction()
    {
    	echo "nothing to see here"; 
    }
    
}