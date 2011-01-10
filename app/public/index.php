<?php
/* Request parameters (0 is default):
 * debug: 1 = load a -src release of dojo and look outside of that tree for the
 *            sandbox dijits.
 *        0 = load a custom built dojo with the sandbox dijits inside it.
 * nolayer: 1 = don't load the sandbox.js layer, causing all sandbox dijits to be
 *              fetched individually for easier debugging.
 *          0 = load the sandbox.js custom build layer.
 */
$debug = false;
$lib_path = '/lib';
$dojo_path = $lib_path.'/dojo-1.5.0-sandbox'; // our default sandbox profile 'build' dir
$djConfig = '';
$sandbox_path = '../sandbox';
if (isset($_REQUEST['debug']) && $_REQUEST['debug'] == '1') {
  $debug = true;
  $dojo_path = '/lib/dojo-release-1.5.0-src'; // use the non-built dojo release
  $sandbox_path = '../../sandbox';
  $djConfig = ', debug: true';
}
error_log("debug $debug dojo_path $dojo_path sandbox_path $sandbox_path");
$no_dojodeps_layer = (isset($_REQUEST['nodojodepslayer']) && $_REQUEST['nodojodepslayer'] == '1');
$no_sandbox_layer = (isset($_REQUEST['nosandboxlayer']) && $_REQUEST['nosandboxlayer'] == '1');
?>
<html>
<head><title>Dojo sandbox</title>
  <script src="<?php echo $lib_path; ?>/codemirror/js/codemirror.js" type="text/javascript"></script>
  <script src="<?php echo $lib_path; ?>/vital/jsbeautify.js" type="text/javascript"></script>
  <script type="text/javascript" src="<?php echo $dojo_path; ?>/dojo/dojo.js"
          djConfig="parseOnLoad: true<?php echo $djConfig; ?>"></script>
<?php if (!$no_dojodeps_layer) { ?>
  <script type="text/javascript" src="<?php echo $dojo_path; ?>/dojo/dojodeps.js"></script>
<?php } ?>
<?php if (!$no_sandbox_layer) { ?>
  <script type="text/javascript" src="<?php echo $dojo_path; ?>/dojo/sandbox.js"></script>
<?php } ?>

  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dojo/resources/dojo.css">
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dijit/themes/claro/claro.css">
  <link rel="stylesheet" href="<?php echo $lib_path; ?>/sandbox/sandbox.css">
  <script type="text/javascript">
<?php if ($debug) { ?>
    dojo.registerModulePath("sandbox", "../../sandbox");
<?php } ?>
    dojo.require("sandbox.Frontend");
  </script>
</head>
<body class="claro">
  <div dojoType="sandbox.Frontend" class="frontend"></div>
</body>
</html>