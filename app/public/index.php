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
$dojo_path = $lib_path.'/dojo-1.6.1-sandbox'; // our default sandbox profile 'build' dir
$djConfig = '';
$sandbox_path = '../sandbox';
if (isset($_REQUEST['debug']) && $_REQUEST['debug'] == '1') {
  $debug = true;
  $dojo_path = '/lib/dojo-release-1.6.1-src'; // use the non-built dojo release
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
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dojox/widget/Dialog/Dialog.css">
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
    dojo.require("dojo.fx");
    dojo.require("dojox.validate.regexp");
  </script>
</head>
<body class="claro">
  <div dojoType="sandbox.Frontend" class="frontend"<?php
    if (array_key_exists('token', $_COOKIE))
            echo " credentials='{token: \"" . $_COOKIE['token'] . "\"}'";
    error_log("DEBUG changelog mtime: " . filemtime('changelog.html'));
    // If there is no cookie, or the cookie exists but has a value less than the changelog mod time..
    if (!array_key_exists('lastviewedchangelog', $_COOKIE) ||
            $_COOKIE['lastviewedchangelog'] < filemtime('changelog.html')) {
        setcookie('lastviewedchangelog', time(), time() + 3600*24*7*30, '/');
        echo " showChangelog='true'";
    }
  ?>></div>
  <div id="loginDialog" style="display: none">
      <!-- want to redir to: https://<?php echo $_SERVER['SERVER_NAME']?>
      BUT currently cannot host https for dojo-sandbox as it's a shared server. -->
      <!-- form method="POST" action="/backend/login" -->
    <div id="dijitDialogPaneContentArea">
      <fieldset id="loginFields"><legend>Log in</legend>
          <label for="login_username">Username:</label>
          <div dojoType="dijit.form.ValidationTextBox" required="true"
            id="login_username" name="username" promptMessage="username"></div><br/>
          <label for="login_password">Password:</label>
          <div dojoType="dijit.form.ValidationTextBox" required="true"
            id="login_password" name="password" type="password"></div>
      </fieldset>
        <div data-dojo-type="dijit.form.CheckBox" data-dojo-props="name:'register'" id="registerCB">
            <script type="dojo/event" event="onClick" args="e">
                console.log("Register clicked! ", e, " value ", e.target.value, " this ", this, " value ", this.get('value'));
                var req = function(val) {
                    dojo.map([ 'login_firstname', 'login_lastname', 'login_email' ], function(id) {
                    console.log("set id " + id + " to " + val);
                    dijit.byId(id).set('required', val);
                    });
                };
                if (this.get('value') !== false) {
                    dijit.byId('loginSubmit').set('label', 'Register new account');
                    req(true);
                    dojo.fx.wipeIn( { node: 'loginRegisterFields',
                      onEnd: function() {
                        dijit.byId('loginDlg').layout();
                      }
                    }).play();
                } else {
                    dijit.byId('loginSubmit').set('label', 'Login');
                    req(false);
                    dojo.fx.wipeOut( { node: 'loginRegisterFields',
                      onEnd: function() {
                        dijit.byId('loginDlg').layout();
                      }
                    }).play();
                }
            </script>
        </div>
        <label for="registerCB" style="width: auto;">Register a New Account</label>
        <div style="display:none;" id="loginRegisterFields">
          <fieldset><legend>New Account Details</legend>
            <p>Creating a new account is as simple as filling in these fields as you log in.</p>
            <p>Please fill in <b>both</b> the username and password fields above <b>and</b> the fields below.</p>
            <label for="login_firstname">First Name:</label>
            <div dojoType="dijit.form.ValidationTextBox"
                 style="display: inline-block;"
              id="login_firstname" name="first_name" promptMessage="Your first name..."></div><br/>
            <label for="login_lastname">Last Name:</label>
            <div dojoType="dijit.form.ValidationTextBox"
              id="login_lastname" name="last_name" promptMessage="Your last name..."></div>
            <label for="login_email">Email:</label>
            <div dojoType="dijit.form.ValidationTextBox"
              rexExpGen="dojox.validate.regexp.emailAddress"
              id="login_email" name="email" promptMessage="Your email address..."></div>
          </fieldset>
        </div>
        <div style="display: none;" id="loginFeedback"></div>
    </div>
    <div class="dijitDialogPaneActionBar">
      <button id="loginSubmit" data-dojo-type="dijit.form.Button" data-dojo-props='type:"submit", name:"loginButton", value:"login", onClick:function() { return dijit.byId("loginDlg").validate(); }'>OK</button>
      <button data-dojo-type="dijit.form.Button" data-dojo-props='type:"button", onClick:function(){ dijit.byId("loginDlg").onCancel(); } '>Cancel</button>
    </div>
      <!-- /form -->
  </div>
      
</body>
</html>
