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
  //$djConfig = ', debug: true, debugAtAllCosts: true';
  $djConfig = ', debug: true';
}
error_log("debug $debug dojo_path $dojo_path sandbox_path $sandbox_path");
$no_dojodeps_layer = (isset($_REQUEST['nodojodepslayer']) && $_REQUEST['nodojodepslayer'] == '1');
$no_sandbox_layer = (isset($_REQUEST['nosandboxlayer']) && $_REQUEST['nosandboxlayer'] == '1');
$no_designer_layer = (isset($_REQUEST['nodesignerlayer']) && $_REQUEST['nodesignerlayer'] == '1');
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
<?php if (!$no_designer_layer) { ?>
  <script type="text/javascript" src="<?php echo $dojo_path; ?>/dojo/designer.js"></script>
<?php } ?>
  <script type="text/javascript" src="<?php echo $lib_path; ?>/wuhi/ExtendedDnd.js"></script>
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dojo/resources/dojo.css">
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dijit/themes/claro/claro.css">
  <link rel="stylesheet" href="<?php echo $lib_path; ?>/sandbox/sandbox.css">
  <!-- designer stuff -->
  <style>
	@import "<?php echo $lib_path; ?>/wuhi/Designer.css";
	@import "<?php echo $dojo_path; ?>/dojox/grid/resources/claroGrid.css";
</style>
  <script type="text/javascript">
<?php if ($debug) { ?>
    dojo.registerModulePath("sandbox", "../../sandbox");
    dojo.registerModulePath("wuhi", "../../wuhi");
<?php } ?>
    dojo.require("sandbox.Frontend");
    
    // designer widgets
    // @TODO: create a single file
	dojo.require("wuhi.designer.Designer");
	dojo.require("wuhi.designer.dijit.form.TextBox");
	dojo.require("wuhi.designer.dijit.form.Button");
	dojo.require("wuhi.designer.dijit.form.CheckBox");
	dojo.require("wuhi.designer.dijit.form.RadioButton");
	dojo.require("wuhi.designer.dijit.form.DateTextBox");
	dojo.require("wuhi.designer.dijit.form.TimeTextBox");
	dojo.require("wuhi.designer.dijit.form.Textarea");
	dojo.require("wuhi.designer.dijit.form.SimpleTextarea");
	dojo.require("wuhi.designer.dijit.Editor");
	dojo.require("wuhi.designer.dijit.layout.ContentPane");
	dojo.require("wuhi.designer.dijit.layout.TabContainer");
	dojo.require("wuhi.designer.dijit.layout.BorderContainer");
	dojo.require("wuhi.designer.dijit.layout.AccordionContainer");
	dojo.require("wuhi.designer.html.Text");
	dojo.require("wuhi.designer.html.HorizontalRule");
	dojo.require("wuhi.designer.dijit.form.HorizontalSlider");
	dojo.require("wuhi.designer.dijit.form.VerticalSlider");
	dojo.require("wuhi.designer.dijit.form.DropDownButton");
	dojo.require("wuhi.designer.dijit.Toolbar");
	dojo.require("wuhi.designer.dijit.Menu");
	dojo.require("wuhi.designer.dijit.MenuItem");
	dojo.require("wuhi.designer.dijit.PopupMenuItem");
	dojo.require("dojox.fx");
  </script>
</head>
<body class="claro">
  <div dojoType="sandbox.Frontend" class="frontend"></div>
</body>
</html>