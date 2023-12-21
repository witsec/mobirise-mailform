<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Function to return JSON
function json($success, $errorcode="", $msg="", $args="") {
	$arr = array("success" => $success);

	if ($errorcode) $arr["errorcode"] = $errorcode;
	if ($msg)       $arr["message"]   = $msg;
	if ($args)      $arr["args"]      = $args;

	// Send the JSON and stop the presses
	header("Content-type: application/json");
	echo json_encode($arr);
	die();
}


// reCAPTCHA stuff
function CheckReCAPTCHA($rcpScore, $rcpSecret, $rcpVersion) {
	// Check if reCAPTCHA response is present
	if (!isset($_POST["g-recaptcha-response"]))
		json(false, "E1204", "POST did not contain g-recaptcha-response");

	// Check if function exists (we'll use this later on)
	if (!function_exists("file_get_contents") && !(function_exists("curl_init")))
		json(false, "E1205", "Dependency for reCAPTCHA not available on server");

	// Get reCaptcha response from POST
	$rcpResponse = $_POST["g-recaptcha-response"];
	unset($_POST["g-recaptcha-response"]);	// Remove this, as we don't want this to end up in the template ;)

	// Send reCaptcha
	$rcpResponse = SendReCaptcha($rcpSecret, $rcpResponse);

	// Success is handled differently in v2 and v3
	if ($rcpVersion == "2") {
		if (!$rcpResponse["success"]) {
			json(false, "E1207", "Request did not pass reCAPTCHA", implode(", ", $rcpResponse["error-codes"]));
		}
	} else {
		// Check response ('success' just means it was a valid call with valid tokens)
		if (!$rcpResponse["success"]) {
			json(false, "E1208", "Invalid reCAPTCHA token", implode(", ", $rcpResponse["error-codes"]));
		}

		// Check score if we're using v3
		if ($rcpVersion == "3" && $rcpResponse["score"] < floatval($rcpScore)) {
			json(false, "E1209", "Request did not pass reCAPTCHA score", $rcpResponse["score"]);
		}
	}
}


// Build POST request and execute it
function SendReCaptcha($rcpSecret, $rcpResponse, $statusCheck=false) {
	$rcpUrl = "https://www.google.com/recaptcha/api/siteverify";

	// Let's try with cURL
	if (function_exists("curl_init")) {
		$data = [
			"secret" => $rcpSecret,
			"response" => $rcpResponse
		];

		// Prepare cURL and go for it
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_URL, $rcpUrl);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
		$rcpResponse = curl_exec($curl);
	}

	// Or fallback to file_get_contents (deprecated)
	else {
		$rcpResponse = file_get_contents($rcpUrl . "?secret=" . $rcpSecret . "&response=" . $rcpResponse);
	}

	// Try to decode the response
	$rcpResponse = json_decode($rcpResponse, true);

	// Check if the reponse was valid json
	if (is_array($rcpResponse)) {
		if ($statusCheck)
			return true;
		else
			return $rcpResponse;
	} else {
		if ($statusCheck)
			return false;
		else
			json(false, "E1206", "Did not receive valid JSON from reCAPTCHA verification service or service not available");
	}
}


// Render Template
function RenderTemplate($template, $isAutorespond) {
	global $_SETTINGS;

	// Use a copy of $_POST, so we don't pollute the original
	$POST = $_POST;

	// Replace BB tags with HTML
	$template = BBtoHTML($template);

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
	$POST["date"] = ( isset($_POST["date"]) ? $_POST["date"] : date($_SETTINGS["dateFormat"] . " " . $_SETTINGS["timeFormat"]) );	// Only include 'date' if it wasn't used in the form

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
function SendPHPMail($to, $from, $replyTo, $fromName, $subject, $template, $isAutorespond) {
	global $_SETTINGS, $debug;

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
		if ($_SETTINGS["smtp"]) {
			$mail->isSMTP();
			$mail->Host = $_SETTINGS["smtpHost"];
			$mail->Port = $_SETTINGS["smtpPort"];

			// Debugging
			if ($_SETTINGS["smtpDebug"]) {
				$mail->SMTPDebug = $_SETTINGS["smtpDebug"];
				$mail->Debugoutput = function($str, $level) {
					$GLOBALS["debug"] .= "\n" . $str;
				};
			}

			// If a username and password are provided
			if ($_SETTINGS["smtpUsername"] && $_SETTINGS["smtpPassword"]) {
				$mail->SMTPAuth = true;
				$mail->Username = $_SETTINGS["smtpUsername"];
				$mail->Password = $_SETTINGS["smtpPassword"];
			}

			// Use SSL/TLS?
			if ($_SETTINGS["smtpSecure"])
				$mail->SMTPSecure = $_SETTINGS["smtpSecure"];
		}

		// Add attachments, if enabled and if there are any
		if (isset($_FILES) && count($_FILES) > 0) {
			// Loop through all files
			foreach ($_FILES as $file) {

				// If multiple files are uploaded at the same time (using "multiple" attribute on file input), let's rearrange that array a bit
				if (is_array($file["name"]))
					$files = rearrangeFiles($file);
				else
					$files[] = $file;

				// Loop through files
				foreach ($files as $f) {
					// Let's do some error handling
					switch($f["error"]) {
						case 0:		// 0 = No errors with upload
							// Check if the file was uploaded via HTTP POST
							if (!is_uploaded_file($f["tmp_name"]))
								json(false, "E1210", "Error uploading file", $f["name"]);

							// Check file extension
							CheckFileExtension($f);

							// Check mime type
							CheckMimeType($f);

							// All is well, add it to the e-mail
							$mail->AddAttachment($f["tmp_name"], $f["name"]);
							break;
						case 4:		// 4 = No file was uploaded, just continue
							break;
						default:	// Any other error
							json(false, "E1212", "Error uploading file", $f["name"] . " (" . $f["error"] . ")");
					}
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
	global $_SETTINGS;
	$fn = "";

	// If we want to use the sender's name as the From Name, parse all name-{fields}
	if ($_SETTINGS["fromNameThem"]) {
		$fn = $_SETTINGS["fromNameThemField"];

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
	$fn = ($fn ? $fn : $_SETTINGS["fromName"]);
	$fn = preg_replace('/(["“”‘’„”«»]|&quot;)/', "", $fn, -1);

	return $fn;
}


// Sanitize user input
function SanitizeUserInput() {
	global $_SETTINGS;

	array_walk_recursive($_POST, function(&$input) { $input = strip_tags($input); });
	array_walk_recursive($_POST, function(&$input) { $input = htmlspecialchars($input); });

	// Check if at least "subject" and "email" exist in the $_POST vars
	if ( !isset($_POST["subject"] ) || !isset($_POST["email"]) )
		json(false, "E1216", "Not all required fields are present");

	// Check if a valid e-mail address is provided
	if ( !filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) )
		json(false, "E1217", "Invalid email address");
}


// Determine the correct recipient
function DetermineRecipient($to, $toAlt) {
	// If no additional recipients are set, then leave
	if ($toAlt === "")
		return $to;

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


// Check file extension of a file
function CheckFileExtension($f) {
	global $_SETTINGS;

	$fext = strtolower(pathinfo($f["name"], PATHINFO_EXTENSION));

	// Let's check if the file extension is part of the allowed extensions array
	if (!in_array($fext, $_SETTINGS["attachmentsExtensions"])) {
		json(false, "E1219", "Error uploading file (file extension is not allowed)", $f["name"]);
	}
}


// Check mime type of a file (if the function is available)
function CheckMimeType($f) {
	global $_SETTINGS;

	// If function is not available, skip the checks
	if (!function_exists("mime_content_type"))
		return;

	$fmime = strtolower(mime_content_type($f["tmp_name"]));

	// Let's check if the mime type is part of the allowed mime types array
	$found = false;
	if (!in_array($fmime, $_SETTINGS["attachmentsMimeTypes"])) {
		// Apparently not, so let's go through all wildcards
		foreach($_SETTINGS["attachmentsMimeTypes"] as $amt) {
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
			json(false, "E1211", "Error uploading file (mime type is not allowed)", $f["name"] . " (" . $fmime . ")");
	}
}


// Function to rearrange files when multiple files are uploaded at once
function rearrangeFiles($file) {
	$file_ary = array();
	$file_count = count($file["name"]);
	$file_keys = array_keys($file);

	for ($i=0; $i<$file_count; $i++) {
		foreach ($file_keys as $key) {
			$file_ary[$i][$key] = $file[$key][$i];
		}
	}

	return $file_ary;
}


// Check if string ends with a specific string (PHP 8 has this built-in, but many still run 7.x)
function endsWith($haystack, $needle) {
	$length = strlen($needle);
	if(!$length)
		return true;
	return substr($haystack, -$length) === $needle;
}


// Replace any date/time fields with a formatted date/time
function FormatDateTime() {
	global $_SETTINGS;

	foreach ($_POST as $k => $v) {
		// Check if it's a date/time field
		$f = "";
		if (endsWith($k, "-date"))
			$f = $_SETTINGS["dateFormat"];
		elseif (endsWith($k, "-time"))
			$f = $_SETTINGS["timeFormat"];
		elseif (endsWith($k, "-datetime"))
			$f = $_SETTINGS["dateFormat"] . " " . $_SETTINGS["timeFormat"];

		// It's a date/time field, so let's format it, replace the original value and rename the key (remove "-date", "-time" and "-datetime")
		if ($f) {
			$_POST[$k] = date($f, strtotime($v));

			// Rename current key
			$newKey = preg_replace("/-(datetime|date|time)$/", "", $k);
			$_POST = RenameArrayKey($_POST, $k, $newKey);
		}
	}
}


// Rename key in associative array
function RenameArrayKey($arr, $oldkey, $newkey) {
	if(array_key_exists( $oldkey, $arr)) {
		$keys = array_keys($arr);
    	$keys[array_search($oldkey, $keys)] = $newkey;
	    return array_combine($keys, $arr);	
	}
    return $arr;    
}


// Convert allowed BB tags to HTML
function BBtoHTML($bb) {
	global $_SETTINGS;

	if ($_SETTINGS["allowedHTML"] !== "") {
		$tags = explode(",", $_SETTINGS["allowedHTML"]);

		// We need an array
		$isArr = false;
		if (!is_array($bb)) {
			$isArr = true;
			$bb = (array) $bb;
		}

		// Replace BB with HTML
		array_walk_recursive($bb, function(&$input) use ($tags) {
			foreach ($tags as $tag) {
				$input = str_replace("[{$tag}]", "<{$tag}>", $input);
				$input = str_replace("[/{$tag}]", "</{$tag}>", $input);
			}
		});

		// Turn back into string
		if ($isArr)
			$bb = $bb[0];
	}

	return $bb;
}


// Format settings
function FormatSettings() {
	global $_SETTINGS;

	$_SETTINGS["fromThem"]				= ($_SETTINGS["fromThem"] == "1" ? true : false);
	$_SETTINGS["fromThemReplyTo"]		= ($_SETTINGS["fromThemReplyTo"] == "1" ? true : false);
	$_SETTINGS["fromNameThem"]			= ($_SETTINGS["fromNameThem"] == "1" ? true : false);
	$_SETTINGS["dateFormat"]			= ($_SETTINGS["dateFormat"] ?: "F j, Y");
	$_SETTINGS["timeFormat"]			= ($_SETTINGS["timeFormat"] ?: "g:i a");
	$_SETTINGS["rcp"]					= ($_SETTINGS["rcp"] ==  1 ? true : false);
	$_SETTINGS["smtp"]					= ($_SETTINGS["smtp"] ==  1 ? true : false);
	$_SETTINGS["smtpDebug"]				= ($_SETTINGS["smtpDebug"] ==  1 ? 3 : 0);
	$_SETTINGS["attachmentsExtensions"]	= explode(",", $_SETTINGS["attachmentsExtensions"]);
	$_SETTINGS["attachmentsMimeTypes"]	= explode(",", $_SETTINGS["attachmentsMimeTypes"]);
}


// Replace new lines with <br> (str_replace behaves differently in PHP 8, so can't use str_replace on a multidimensional array anymore)
function replaceNewlinesWithBr($array) {
    $newArray = [];

    foreach ($array as $key => $value) {
        if (is_array($value)) {
            // Als $value een subarray is, roep de functie opnieuw aan
            $newArray[$key] = replaceNewlinesWithBr($value);
        } elseif (is_string($value)) {
            // Als $value een string is, vervang "\n" door "<br>"
            $newArray[$key] = str_replace("\n", "<br>", $value);
        } else {
            // Als $value geen array of string is, kopieer het gewoon naar de nieuwe array
            $newArray[$key] = $value;
        }
    }

    return $newArray;
}
?>