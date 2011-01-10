<?php
header('Content-Type: application/json');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

echo json_encode(array(
    'identifier' => 'id',
    'items' => array(
        array(
          'id' => 1,
          'foo' => 'bar',
          'test1' => $_GET['test1'],
          'test2' => $_GET['test2']
        )
    )
));
?>
