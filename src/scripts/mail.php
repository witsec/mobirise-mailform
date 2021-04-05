<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Check if required core files (or lowercase variants) are present
foreach (["PHPMailer.php", "Exception.php", "SMTP.php"] as $f) {
	if (file_exists($f))
		require $f;
	else {
		if (file_exists(strtolower($f)))
			require strtolower($f);
		else
			json(false, "E1218", "Required file '" . $f . "' is missing");
	}
}

// All mailform settings
$to = "{to}";														// To Address
$toAlt = "{to-alt}";												// Additional Recipients
$from = "{from}";													// From Address
$fromName = "{from-name}";											// From Name
$fromThem = ("{from-them}" == "1" ? true : false);					// Use Sender as From Address
$fromThemReplyTo = ("{from-them-replyto}" == "1" ? true : false);	// Use Sender as Reply-To
$fromNameThem = ("{from-name-them}" == "1" ? true : false);			// Use Sender Name as From Name
$fromNameThemField = "{from-name-them-field}";						// Name of the field(s) that can contain the Sender Name
$template = "{template}";											// Mail Template
$autorespondSubjectPrefix = "{autorespond-subjectprefix}";			// Autorespond Form Subject Prefix
$autorespondSubject = "{autorespond-subject}";						// Autorespond Custom Subject
$autorespondTemplate = "{autorespond-template}";					// Autorespond Template
$rcp = ("{recaptcha}" == "1" ? true : false);						// Use reCAPTCHA
$rcpVersion = "{recaptcha-version}";								// reCAPTCHA Version
$rcpScore = "{recaptcha-score}";									// reCAPTCHA Score
$rcpSecret = "{recaptcha-secretkey}";								// reCAPTCHA Secret Key
$smtp = ("{smtp}" == "1" ? true : false);							// Use SMTP
$smtpDebug = ("{smtp-debug}" == "1" ? 3 : 0);						// SMTP Debug
$smtpHost = "{smtp-host}";											// SMTP Host
$smtpPort = "{smtp-port}";											// SMTP Port
$smtpSecure = "{smtp-secure}";										// SMTP Use SSL/TLS (empty, ssl or tls)
$smtpUsername = "{smtp-username}";									// SMTP Username
$smtpPassword = "{smtp-password}";									// SMTP Password
$attachments = ("{attachments}" == "1" ? true : false);				// Process Attachments
$attachmentsMimeTypes = explode(",", "{attachments-mimetypes}");	// Mime Types


// Simple status page
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["status"])) {
	echo "<!doctype html><head><title>Status</title></head><body>";

	// Check PHP version
	echo (phpversion() >= 7.3 ? "✔️" : "❌") . " PHP Version<br>";

	// Check if OpenSSL is enabled
	echo (extension_loaded("openssl") ? "✔️" : "❌") . " OpenSSL<br>";

	// Check if function 'file_get_contents' exists
	echo (function_exists("file_get_contents") ? "✔️" : "❌") . " Required functions<br>";

	// Check if image functions for CAPTCHA exist
	echo (function_exists("imagecreatetruecolor") && function_exists("imagecolorallocate") && function_exists("imagejpeg") ? "✔️" : "❌") . " Required functions for CAPTCHA<br>";

	// Check if image functions for CAPTCHA exist
	echo (function_exists("mime_content_type") ? "✔️" : "❌") . " Required functions for handling file attachments<br>";

	// Check if Google can be contacted
	if (extension_loaded("openssl") && function_exists("file_get_contents")) {
		$res = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=12345&response=67890");
		json_decode($res);
		echo (json_last_error() == JSON_ERROR_NONE ? "✔️" : "❌") . " Connection to Google reCAPTCHA service<br>";
	} else
		echo "❌ Connection to Google reCAPTCHA services (missing OpenSSL)<br>";

	// Check connection to SMTP server
	if ($smtp) {
		if (function_exists("fsockopen") && extension_loaded("openssl")) {
			$socket = fsockopen( ($smtpSecure == "ssl" ? "ssl://" : "") . $smtpHost, $smtpPort, $errno, $errstr, 5);
			echo ($socket ? "✔️" : "❌") . " SMTP Server Connection";
		} else
			echo "❌ SMTP Server Connection (missing functions and/or openSSL)<br>";
	}

	echo "</body></html>";
	die();
}

// We only do stuff if there's a POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	try {
		// Sanitize user input
		SanitizeUserInput();

		// reCAPTCHA (only really does anything if reCAPTCHA is enabled)
		if ($rcp && $rcpVersion != "captcha")
			CheckReCAPTCHA();

		// Check captcha
		if ($rcp && $rcpVersion == "captcha") {
			session_start();
			if (isset($_SESSION["captchaCode"]) && isset($_POST["captcha"]) && $_SESSION["captchaCode"] == $_POST["captcha"]) {
				// Captcha passed!
			}
			else
				json(false, "E1200", "Request did not pass Captcha.");
		}

		// Determine the correct recipient
		$to = DetermineRecipient($to, $toAlt);

		// Set subject (and take it out of $_POST, so it doesn't end up in the body as well)
		$subject = $_POST["subject"];

		// Determine if we need to autorespond
		$autorespond = (isset($_POST["autorespond"]) && $_POST["autorespond"] == "1" ? true : false);

		// Unset some fields that are no longer needed
		unset($_POST["subject"]);
		unset($_POST["disableButton"]);
		unset($_POST["autorespond"]);
		unset($_POST["redirectURL"]);
		unset($_POST["captcha"]);

		// Replace any \n breakline with a html breakline
		$_POST = str_replace("\n", "<br>", $_POST);

		// Send mail (to-address, Sender as From Email or predefined From Email, Sender as From Name or predefined From Name, subject, template)
		SendPHPMail($to, ($fromThem ? $_POST["email"] : $from), ($fromThemReplyTo ? $_POST["email"] : null), SetFromName(), $subject, $template, $attachments, false);

		// Send autorespond
		if ($autorespond) {
			$arSubject = $autorespondSubject ?: trim($autorespondSubjectPrefix . " " . $subject);
			SendPHPMail($_POST["email"], $from, null, $fromName, $arSubject, $autorespondTemplate, false, true);
		}

		// If we ended up here, it's all good
		json(true);
	}
	catch (Exception $e) {
		json(false, "E1203", "An unknown error occured.");
	}
}


// Function to return JSON
function json($success, $errorcode="", $msg="") {
	$arr = array("success" => $success);

	if ($errorcode)
		$arr["errorcode"] = $errorcode;

	if ($msg)
		$arr["message"] = $msg;

	// Send the JSON and stop the presses
	header("Content-type: application/json");
	echo json_encode($arr);
	die();
}


// reCAPTCHA stuff
function CheckReCAPTCHA() {
	global $rcpScore, $rcpSecret, $rcpVersion;

	// Check if reCAPTCHA response is present
	if (!isset($_POST["g-recaptcha-response"]))
		json(false, "E1204", "POST did not contain g-recaptcha-response.");

	// Check if function exists (we'll use this later on)
	if (!function_exists("file_get_contents"))
		json(false, "E1205", "Dependency for reCAPTCHA not available on server.");

	// Build POST request and execute it
	$rcpUrl = 'https://www.google.com/recaptcha/api/siteverify';
	$rcpResponse = $_POST["g-recaptcha-response"];
	unset($_POST["g-recaptcha-response"]);	// Remove this, as we don't want this to end up in the template ;)
	$rcpResponse = file_get_contents($rcpUrl . "?secret=" . $rcpSecret . "&response=" . $rcpResponse);
	$rcpResponse = json_decode($rcpResponse, true);

	// Check if the reponse was valid json
	if (!is_array($rcpResponse))
		json(false, "E1206", "Did not receive valid JSON from reCAPTCHA verification service or service not available.");

	// Success is handled differently in v2 and v3
	if ($rcpVersion == "2") {
		if (!$rcpResponse["success"]) {
			json(false, "E1207", "Request did not pass reCAPTCHA: " . implode(", ", $rcpResponse["error-codes"]));
		}
	} else {
		// Check response ('success' just means it was a valid call with valid tokens)
		if (!$rcpResponse["success"]) {
			json(false, "E1208", "Invalid reCAPTCHA token: " . implode(", ", $rcpResponse["error-codes"]));
		}

		// Check score if we're using v3
		if ($rcpVersion == "3" && $rcpResponse["score"] < floatval($rcpScore)) {
			json(false, "E1209", "Request did not pass reCAPTCHA score.");
		}
	}
}


// Render Template
function RenderTemplate($template, $isAutorespond) {
	// Use a copy of $_POST, so we don't pollute the original
	$POST = $_POST;

	// Handle "mtxt" and "rtxt"
	if (!$isAutorespond && isset($POST["mtxt"]))
		$template = str_replace("{mtxt}", $POST["mtxt"], $template);
	if ($isAutorespond && isset($POST["rtxt"]))
		$template = str_replace("{rtxt}", $POST["rtxt"], $template);
	unset($POST["mtxt"]);
	unset($POST["rtxt"]);

	// Replace spaces in template variables with underscores, because the same thing happens with POST vars and we want them to match
	$template = preg_replace_callback("/\{(.+?)\}/", function ($matches) { return "{" . str_replace(" ", "_", $matches[1]) . "}"; }, $template);

	// Extract all variables from the template
	preg_match_all("/\{(.+?)\}/", $template, $matches);

	// Check what postvars don't exist in the template vars and put that in {formdata}
	$formdata = "";
	foreach ($POST as $k => $v) {
		if ( !in_array($k, $matches[1]) ) {
			// Implode array to make it look better
			if (is_array($v))
				$v = implode(", ", $v);

			// Replace some chars
			$k = str_replace("_", " ", $k);

			// Add to formdata
			$formdata .= ($formdata ? "<br><br>" : "") . ucfirst($k) . ":<br>" . $v;
		}
	}
	$POST["formdata"] = $formdata;

	// Add some additional variables to the play
	$POST["ip"] = GetClientIP(); // Get user's IP address
	$POST["date"] = ( isset($_POST["date"]) ? $_POST["date"] : date('Y-m-d H:i:s') );	// Only include 'date' if it wasn't used in the form

	// Loop through all variables of the template
	foreach($matches[1] as $val) {
		// Try to replace all variables in the template with the corresponding postvars (if they exist)
		$template = str_replace("{" . $val . "}", (isset($POST[$val]) ? $POST[$val] : ""), $template);
	}

	$template = "<html><body>" . $template . "</body></html>";
	return $template;
}


// Use PHPMailer to send the e-mail
$debug = "";
function SendPHPMail($to, $from, $replyTo, $fromName, $subject, $template, $attachments, $isAutorespond) {
	global $smtp, $smtpDebug, $smtpHost, $smtpPort, $smtpSecure, $smtpUsername, $smtpPassword, $attachmentsMimeTypes, $debug;

	try {
		$mail = new PHPMailer(true);
		$mail->CharSet = "UTF-8";

		if ($replyTo)
			$mail->addReplyTo($replyTo);

		$mail->setFrom($from, $fromName);
		$mail->Subject = $subject;
		$mail->isHTML(true);
		$mail->Body = RenderTemplate($template, $isAutorespond);

		// Set 'to' address (there can be multiple e-mail addresses here, so we need to add all of them)
		$to = explode(",", $to);
		foreach ($to as $address) {
			$mail->addAddress(trim($address));
		}

		// If SMTP
		if ($smtp) {
			$mail->isSMTP();
			$mail->Host = $smtpHost;
			$mail->Port = $smtpPort;

			// Debugging
			if ($smtpDebug) {
				$mail->SMTPDebug = $smtpDebug;
				$mail->Debugoutput = function($str, $level) {
					$GLOBALS["debug"] .= "\n" . $str;
				};
			}

			// If a username and password are provided
			if ($smtpUsername && $smtpPassword) {
				$mail->SMTPAuth = true;
				$mail->Username = $smtpUsername;
				$mail->Password = $smtpPassword;
			}

			// Use SSL/TLS?
			if ($smtpSecure)
				$mail->SMTPSecure = $smtpSecure;
		}

		// Add attachments, if enabled and if there are any, loop through them and attach 'em all
		if ($attachments && isset($_FILES) && count($_FILES) > 0) {
			// Check if required function is available (not always the case on Windows servers)
			if (!function_exists("mime_content_type"))
				json(false, "E1202", "Dependency for file attachments not available on server.");
	
			foreach ($_FILES as $f) {
				// Let's do some error handling
				switch($f["error"]) {
					case 0:		// 0 = No errors with upload
						// Check if the file was uploaded via HTTP POST
						if (!is_uploaded_file($f["tmp_name"]))
							json(false, "E1210", "Error uploading file '" . $f["name"] . "'");

						$fmime = strtolower(mime_content_type($f["tmp_name"]));

						// Let's check if the mime type is part of the allowed mime types array
						$found = false;
						if (!in_array($fmime, $attachmentsMimeTypes)) {
							// Apparently not, so let's go through all wildcards
							foreach($attachmentsMimeTypes as $amt) {
								if (substr($amt, -1) == "*") {
									$amt = substr($amt, 0, -1);
						
									if (stripos($fmime, $amt) !== false) {
										$found = true;
										break;
									}
								}
							}

							// If no match has been found, the mime type is not allowed
							if (!$found)
								json(false, "E1211", "Error uploading file '" . $f["name"] . "' (mime type '" . $fmime . "' is not allowed)");
						}

						// All is well, add it to the e-mail
						$mail->AddAttachment($f["tmp_name"], $f["name"]);
						break;
					case 4:		// 4 = No file was uploaded, just continue
						break;
					default:	// Any other error
						json(false, "E1212", "Error uploading file '" . $f["name"] . "' (" . $f["error"] . ")");
				}
			}
		}

		// Let's try to send the mail
		if($mail->Send())
			return true;
		else
			json(false, ($isAutorespond ? "E1214" : "E1213"), $mail->ErrorInfo);
	}
	catch (Exception $e) {
		json(false, "E1215", $e->getMessage() . ($smtp ? $debug : ""));
	}
}


// Set the From Name (this depends on a couple of factors, hence it gets its own function)
function SetFromName() {
	global $fromName, $fromNameThem, $fromNameThemField;

	$fn = "";

	// If we want to use the sender's name as the From Name, parse all name-{fields}
	if ($fromNameThem) {
		$fn = $fromNameThemField;

		// Extract variable names from the name field
		preg_match_all("/\{([a-zA-Z0-9_-]+)\}/", $fn, $nameMatches);

		// Loop through all variables of the name field
		foreach($nameMatches[1] as $val) {
			// Try to replace all variables with the corresponding postvars (if they exist, otherwise it'll make it empty)
			$fn = str_replace("{" . $val . "}", (isset($_POST[$val]) ? $_POST[$val] : ""), $fn);
		}
	}

	// Double check if fromName isn't empty, otherwise fill it with the predefined name
	$fn = trim($fn);
	$fn = ($fn ? $fn : $fromName);
	$fn = preg_replace('/(["“”‘’„”«»]|&quot;)/', "", $fn, -1);

	return $fn;
}


// Sanitize user input
function SanitizeUserInput() {
	array_walk_recursive($_POST, function(&$input) { $input = strip_tags($input); });
	array_walk_recursive($_POST, function(&$input) { $input = htmlspecialchars($input); });

	// Check if at least "subject" and "email" exist in the $_POST vars
	if ( !isset($_POST["subject"] ) || !isset($_POST["email"]) )
		json(false, "E1216", "Not all required fields are present");

	// Check if a valid e-mail address is provided
	if ( !filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) )
		json(false, "E1217", "Invalid email address.");
}


// Determine the correct recipient
function DetermineRecipient($to, $toAlt) {
	// Split up additional recipients into an array containing 'identifier' and email address(es)
	$toAltRec = [];
	foreach(explode("\n", $toAlt) as $rec) {
		$e = explode(":", $rec, 2);
		$toAltRec[$e[0]] = $e[1];
	}

	// Is an alternative recipient set?
	if (isset($_POST["recipient"])) {
		$r = trim($_POST["recipient"]);
		unset($_POST["recipient"]);

		// Check if the POST-ed recipient is valid
		if (preg_match("/^[0-9a-zA-Z]+$/", $r) === 1 && array_key_exists($r, $toAltRec))
			$to = $toAltRec[$r];
	}

	return $to;
}


// Get client IP
function GetClientIP() {
	foreach (array("HTTP_CF_CONNECTING_IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR", "HTTP_X_FORWARDED", "HTTP_X_CLUSTER_CLIENT_IP", "HTTP_FORWARDED_FOR", "HTTP_FORWARDED", "REMOTE_ADDR") as $key){
		if (array_key_exists($key, $_SERVER) === true){
			foreach (explode(",", $_SERVER[$key]) as $ip){
				if (filter_var(trim($ip), FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false)
					return $ip;
			}
		}
	}
	
	// You shouldn't get here, but OK
	return "127.0.0.1";
}
?>