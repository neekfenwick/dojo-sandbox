<?php

require_once("UtilsBase.php");

class BucketUtils extends UtilsBase {
  
    static public function generateId($db, $namespace) {
        $accepted = false;
        while (!$accepted) {
            $id = substr(md5(uniqid(mt_rand(), true)), 0, 5);
            $rs = $db->fetchRow($db->select()->from('bucket', 'COUNT(*) as count')
                            ->where('namespace', $namespace)
                            ->where('id', $id));
            self::$logger->info(" .. try random id ($id) count " . $rs->count);
            $accepted = ($rs->count == 0);
        }
        self::$logger->info("Accepted new id ($id)");
        return $id;
    }
  
    static public function getNamespaceForToken($db, $token) {
        $select = $db->select('username')
                ->from('user')
                ->where('token = ?', $token);
        $token_rs = $db->fetchRow($select);
        if ($token_rs) {
            $namespace = $token_rs->username;
            self::$logger->info("token provided, going to use namespace $namespace");
        } else {
            self::$logger->emerg("Token ($token) could not be found in the database!");
            $namespace = 'public';
        }
        return $namespace;
    }

}
?>