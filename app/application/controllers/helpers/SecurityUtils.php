<?php

require_once("UtilsBase.php");

class SecurityUtils extends UtilsBase {

    static public function getUsernameForToken($db, $token) {
        $select = $db->select('username')
                ->from('user')
                ->where('token = ?', $token);
        $token_rs = $db->fetchRow($select);
        if ($token_rs) {
            return $token_rs->username;
        }
        
        return null;
    }
    
    static public function generateToken() {
        return md5(uniqid(mt_rand(), true));
    }

    static public function verifyToken($db, $token, $namespace) {
      // If namespace is not 'public', verify that the provided token is valid
      if ($namespace != 'public') {
          self::$logger->debug("Verifying token ($token) for namespace ($namespace)...");
          if (!isset($token)) {
              self::$logger->debug("Token not provided! Barf.");
              throw new SecurityException('Invalid token');
          }
          $select = $db->select('token')->from('user')->where('username = ?', $namespace);
          $token_rs = $db->fetchRow($select);
          if (!$token_rs || $token_rs->token != $token) {
              self::$logger->debug("Token ($token) should be (" . $token_rs->token . ") for namespace ($namespace)! Barf.");
              throw new SecurityException('Invalid token');
          }
          self::$logger->debug("token verified OK.");
      }
    }
}

?>