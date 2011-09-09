<?php

class SecurityUtils {

    public function getUsernameForToken($db, $token) {
        $select = $db->select('username')
                ->from('user')
                ->where('token = ?', $token);
        $token_rs = $db->fetchRow($select);
        if ($token_rs) {
            return $token_rs->username;
        }
        
        return null;
    }

}

?>