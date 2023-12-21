<?php
try { error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE); } catch(Exception $e) {}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Check if required core files (or lowercase variants) are present
foreach (["PHPMailer.php", "Exception.php", "SMTP.php", "settings.php", "functions.php"] as $f) {
	if (file_exists($f))
		require $f;
	else {
		if (file_exists(strtolower($f)))
			require strtolower($f);
		else
			json(false, "E1218", "Required file is missing", $f);
	}
}

// If the old "mail.php" exists, clean it up
if (file_exists("mail.php"))
	@unlink("mail.php");

// Some settings require some additional formatting
FormatSettings();


// We only do stuff if there's a POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	try {
		// Sanitize user input
		SanitizeUserInput();

		// reCAPTCHA (only really does anything if reCAPTCHA is enabled)
		if ($_SETTINGS["rcp"] && $_SETTINGS["rcpVersion"] != "captcha")
			CheckReCAPTCHA($_SETTINGS["rcpScore"], $_SETTINGS["rcpSecret"], $_SETTINGS["rcpVersion"]);

		// Check captcha
		if ($_SETTINGS["rcp"] && $_SETTINGS["rcpVersion"] == "captcha") {
			session_start();
			if (isset($_SESSION["captchaCode"]) && isset($_POST["captcha"]) && $_SESSION["captchaCode"] == $_POST["captcha"]) {
				// Captcha passed!
			}
			else
				json(false, "E1200", "Request did not pass Captcha");
		}

		// Determine the correct recipient
		$to = DetermineRecipient($_SETTINGS["to"], $_SETTINGS["toAlt"]);

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

		// Replace any date/time fields with a formatted date/time
		FormatDateTime();

		// Replace BB tags with HTML
		$_POST = BBtoHTML($_POST);

		// Replace any \n breakline with a html breakline
		$_POST = replaceNewlinesWithBr($_POST);

		// Send mail (to-address, Sender as From Email or predefined From Email, Sender as From Name or predefined From Name, subject, template)
		SendPHPMail($to, ($_SETTINGS["fromThem"] ? $_POST["email"] : $_SETTINGS["from"]), ($_SETTINGS["fromThemReplyTo"] ? $_POST["email"] : null), SetFromName(), $subject, $_SETTINGS["template"], false);

		// Send autorespond
		if ($autorespond) {
			$arSubject = $autorespondSubject ?: trim($autorespondSubjectPrefix . " " . $subject);
			SendPHPMail($_POST["email"], $_SETTINGS["from"], null, $_SETTINGS["fromName"], $arSubject, $_SETTINGS["autorespondTemplate"], true);
		}

		// If we ended up here, it's all good
		json(true);
	}
	catch (Exception $e) {
		json(false, "E1203", "An unknown error occured");
	}
}
?>