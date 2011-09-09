<?php

include_once('BaseController.php');

class LoginController extends BaseController
{
	public function init(){
		$this->_helper->viewRenderer->setNoRender(true);
	}

    public function indexAction() {
	}
    public function getAction() {
	}
    public function putAction() {
	}
    public function deleteAction() {
	}

    public function postAction() {
        $db = $this->_helper->database->getAdapter();
        
        $username = $this->getRequest()->getParam("username");
        $password = $this->getRequest()->getParam("password");

//        $loginButton = $this->getRequest()->getParam("loginButton");
//        $registerButton = $this->getRequest()->getParam("registerButton");
       
        $register = $this->getRequest()->getParam("register") == 'on';
        
//        self::$logger->debug("loginButton $loginButton registerButton $registerButton");
        self::$logger->debug("register? ($register)");
        
        $token = null;
        
        /* We set up token either by logging in, or registering a new account. */
        $response = array(
            'success' => false,
            'message' => 'An unknown error occurred');

        if (!$register) {

            self::$logger->debug("validate username (" . $username . ") password (" . $password . ")");

//            $select_rs = $db->select()
//                ->from('user', 'id')
//                ->where('username = ?', $username)->fetchAll();
            $sql = $db->quoteInto('select id, password from user where username = ?', $username);
            $select_rs = $db->fetchAll($sql);
            self::$logger->debug("found " . count($select_rs) . " rows for username ($username)");

            if (count($select_rs) == 0) {
                $response['success'] = false;
                $response['message'] = "Unknown user account '$username'.";
            } else if (count($select_rs) > 1) {
                $response['success'] = false;
                $response['message'] = "Duplicate user account '$username'.";
            } else {
              
                $user_id = $select_rs[0]->id;
                self::$logger->debug("Found user id $user_id for username $username");
                
                // check password against what's in DB
                //self::$logger->debug("first row: " . json_encode($select_rs[0]));
                if ($this->validate_password($password, $select_rs[0]->password)) {
                    $response['success'] = true;
                    $response['username'] = $username;
                    $response['message'] = "You have logged on successfully.";
                    
                } else {
                    $response['success'] = false;
                    $response['message'] = "Username or Password was not valid.";
                }

            }
            
        } else {

            self::$logger->debug("CREATE NEW ACCOUNT username $username password $password");

            $select = $db	->select()
                ->from('user', "COUNT(*) as cc")
                ->where('username = ?', $username);

            if ($db->fetchRow($select)->cc == 0) {

                self::$logger->debug("Username doesn't already exist, OK to create account.");

                $first_name = $this->getRequest()->getParam("first_name");
                $last_name = $this->getRequest()->getParam("last_name");
                $email = $this->getRequest()->getParam("email");
                
                if (!$first_name || strlen($first_name) == 0 ||
                        !$last_name || strlen($last_name) == 0 ||
                        !$email || strlen($email) == 0) {
                    $response['message'] = "A required field was missing";
                } else {

                    self::$logger->debug("Inserting new user into database, password $password encrypts to (" . $this->encrypt_password($password) . ")...");
                    $db->insert('user', array(
                      'username' => $username,
                      'password' => $this->encrypt_password($password),
                      'role' => 'user',
                      'first_name' => $first_name,
                      'last_name' => $last_name,
                      'email' => $email));
                    $user_id = $db->lastInsertId();
                    
                    self::$logger->debug("Returning success.");
                    $response['success'] = true;
                    $response['username'] = $username;
                    $response['message'] = "Your user account was created successfully.";
                }

            } else {
                $response['success'] = false;
                $response['message'] = "The username already exists.";
            }
        }
        
        if ($response['success'] == true) {
            $token = md5(uniqid(mt_rand(), true));
            
            self::$logger->debug("Updating username ($username) with token ($token)...");
            $db->update('user', array('token' => $token), "id = $user_id");
            
            // 2 weeks = 60*60*24*7 = 604800
            setcookie('token', $token, time() + 604800, '/'); // TODO pass 'secure' when we support https
//            $cookie = new Zend_Http_Cookie('token',
//                               $token,
//                               $_SERVER['SERVER_NAME'],
//                               time() + 604800,
//                               '/; secure');
//            
//            $client->setCookie($cookie);
            $response['token'] = $token;
        }
        
        sleep(2); // simulate network lag

        echo Zend_Json::encode($response);
	}
    
      function rand($min = null, $max = null) {
    static $seeded;

    if (!$seeded) {
      mt_srand((double)microtime()*1000000);
      $seeded = true;
    }

    if (isset($min) && isset($max)) {
      if ($min >= $max) {
        return $min;
      } else {
        return mt_rand($min, $max);
      }
    } else {
      return mt_rand();
    }
  }
    /* Validate a plaintext password against an encrypted one */
    function validate_password($plain, $encrypted) {
        if (!is_null($plain) && !is_null($encrypted)) {
            // split apart the hash / salt
            $stack = explode(':', $encrypted);

            if (sizeof($stack) != 2)
                return false;

            if (md5($stack[1] . $plain) == $stack[0]) {
                return true;
            }
        }

        return false;
    }

    /* This function makes a new password from a plaintext password. */
    function encrypt_password($plain) {
        $password = '';

        for ($i = 0; $i < 10; $i++) {
            $password .= $this->rand();
        }

        $salt = substr(md5($password), 0, 2);

        $password = md5($salt . $plain) . ':' . $salt;

        return $password;
    }

}