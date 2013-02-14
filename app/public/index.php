<?php
/* Request parameters (0 is default):
 * debug: 1 = load a -src release of dojo.  Sandbox widgets are still expected
 *            to reside within that dojo directory.
 *        0 = load a custom built dojo with the sandbox dijits inside it.
 */
$debug = false;
$lib_path = '/lib';
$dojo_path = $lib_path.'/dojo-sandbox'; // our default sandbox profile 'build' dir
$djConfig = 'async: true';
if (isset($_REQUEST['debug']) && $_REQUEST['debug'] == '1') {
  $debug = true;
  $dojo_path = '/lib/dojo'; // use the non-built dojo release
  //$djConfig = ', debug: true, debugAtAllCosts: true';
  $djConfig .= ', isDebug: true';
}
error_log("debug $debug dojo_path $dojo_path");
?><!DOCTYPE html>
<html>
<head><title>Dojo sandbox</title>
  <?php if ($debug) {
    // Load compressed 2.34 codemirror with: jaascript-hint, xml-hint, match-highlighter.
    //  See http://codemirror.net/doc/compress.html
  ?>
  <script src="<?php echo $lib_path; ?>/codemirror/codemirror-compressed.js" type="text/javascript"></script>
  <?php } else { ?>
  <script src="<?php echo $lib_path; ?>/codemirror/lib/codemirror.js" type="text/javascript"></script>
  <script src="<?php echo $lib_path; ?>/codemirror/mode/javascript/javascript.js" type="text/javascript"></script>
  <script src="<?php echo $lib_path; ?>/codemirror/mode/css/css.js" type="text/javascript"></script>
  <script src="<?php echo $lib_path; ?>/codemirror/mode/xml/xml.js" type="text/javascript"></script>
  <script src="<?php echo $lib_path; ?>/codemirror/mode/htmlmixed/htmlmixed.js" type="text/javascript"></script>
  <?php } ?>
  <!--script src="<?php echo $lib_path; ?>/vital/jsbeautify.js" type="text/javascript"></script -->
  <script type="text/javascript" src="<?php echo $dojo_path; ?>/dojo/dojo.js"
          data-dojo-config="<?php echo $djConfig; ?>"></script>

  <!-- script type="text/javascript" src="<?php echo $lib_path; ?>/wuhi/ExtendedDnd.js"></script -->
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dojo/resources/dojo.css">
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dojox/widget/Dialog/Dialog.css">
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/dijit/themes/claro/claro.css">
  <link rel="stylesheet" href="<?php echo $lib_path; ?>/codemirror/lib/codemirror.css">
  <link rel="stylesheet" href="<?php echo $dojo_path; ?>/sandbox/sandbox.css">

  <script type="text/javascript">
    require(/*{
  trace:{
    "loader-inject":1, // turn the loader-inject group on
    "loader-define":0, // turn the loader-define group off
    "loader-run-factory": 1
  }
    }, */[
        'dojo/parser', 'sandbox/Frontend', 'dijit/form/ValidationTextBox', 'dijit/form/Button', 'dojo/domReady!'
    ], function(parser) {
          parser.parse();
    })
    
  </script>
</head>
<body class="claro">
  <div data-dojo-type="sandbox/Frontend" class="frontend"<?php
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
      <form data-dojo-type="dijit/form/Form" data-dojo-id="loginForm">

    <div id="dijitDialogPaneContentArea">
      <fieldset id="loginFields"><legend>Log in</legend>
          <label for="login_username">Username:</label>
          <div data-dojo-type="dijit/form/ValidationTextBox" required="true"
            id="login_username" name="username" promptMessage="username"></div><br/>
          <label for="login_password">Password:</label>
          <div data-dojo-type="dijit/form/ValidationTextBox" required="true"
            id="login_password" name="password" type="password"></div>
      </fieldset>
        <div data-dojo-type="dijit/form/CheckBox" data-dojo-props="name:'register'" id="registerCB">
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
                      dijit.byId('loginDlg').resize();
                      }
                    }).play();
                } else {
                    dijit.byId('loginSubmit').set('label', 'Login');
                    req(false);
                    dojo.fx.wipeOut( { node: 'loginRegisterFields',
                      onEnd: function() {
                        dijit.byId('loginDlg').resize();
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
            <p>Please also note that <strong>your password is sent in the clear</strong> as our hosting doesn't easily allow us to do HTTPS posts at this time.  We advise you not to use a password you care about.</p>
            <label for="login_firstname">First Name:</label>
            <div data-dojo-type="dijit/form/ValidationTextBox"
                 style="display: inline-block;"
              id="login_firstname" name="first_name" promptMessage="Your first name..."></div><br/>
            <label for="login_lastname">Last Name:</label>
            <div data-dojo-type="dijit/form/ValidationTextBox"
              id="login_lastname" name="last_name" promptMessage="Your last name..."></div>
            <label for="login_email">Email:</label>
            <div data-dojo-type="dijit/form/ValidationTextBox"
              rexExpGen="dojox.validate.regexp.emailAddress"
              id="login_email" name="email" promptMessage="Your email address..."></div>
          </fieldset>
        </div>
        <div style="display: none;" id="loginFeedback"></div>
    </div>
    <div class="dijitDialogPaneActionBar">
      <button id="loginSubmit" data-dojo-type="dijit/form/Button"
              type="submit" name="loginButton" value="login"
              data-dojo-props='onClick:function() { return dijit.byId("loginDlg").validate(); }'>OK</button>
      <button data-dojo-type="dijit/form/Button" data-dojo-props='type:"button", onClick:function(){ dijit.byId("loginDlg").onCancel(); } '>Cancel</button>
    </div>
      </form>
  </div>
      
</body>
</html>
