<?php
// We only do stuff if there's a POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	// Let the browser know JSON is coming
	header("Content-type: application/json");

	try {
		// Sanitize user input
		$_POST = array_map("strip_tags", $_POST);
		$_POST = array_map("htmlspecialchars", $_POST);

		// Check if at least "subject" and "email" exist in the $_POST vars
		if ( !isset($_POST["subject"] ) || !isset($_POST["email"]) )
			json(false, "Not all required fields are present");

		// Check if a valid e-mail address is provided
		if ( !filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) )
			json(false, "Invalid e-mail address");


		// Subject
		$subject = $_POST["subject"];
		unset($_POST["subject"]);


		// If "message" exists, replace \n with <br>
		if ( isset($_POST["message"]) )
			$_POST["message"] = str_replace("\n", "<br>", $_POST["message"]);


		// reCaptcha
		$recaptcha = "{recaptcha}";
		$rcpScore = "{recaptcha-score}";

		if ($recaptcha == "3") {
			if (!isset($_POST["g-recaptcha-response"])) {
				json(false, "POST did not contain g-recaptcha-response");
			}

			// Build POST request and execute it
			$rcpUrl = 'https://www.google.com/recaptcha/api/siteverify';
			$rcpSecret = "{recaptcha-secretkey}";
			$rcpResponse = $_POST["g-recaptcha-response"];
			unset($_POST["g-recaptcha-response"]);	// Remove this, as we don't want this to end up in the template ;)
			$rcpResponse = file_get_contents($rcpUrl . "?secret=" . $rcpSecret . "&response=" . $rcpResponse);
			$rcpResponse = json_decode($rcpResponse, true);

			// Check response
			if (!$rcpResponse["success"]) {
				json(false, "Invalid reCAPTCHA token");
			}

			// Check score
			if ($rcpResponse["score"] < intval($rcpScore)) {
				json(false, "Request did not pass reCAPTCHA");
			}
		}


		// Get the template in order (Mobirise puts an actual template in there)
		$template = "{template}";

		// Extract all variables from the template
		preg_match_all("/\{([a-zA-Z0-9_-]+)\}/", $template, $matches);

		// Check what postvars don't exist in the template vars and put that in {formdata}
		$formdata = "";
		foreach ($_POST as $k => $v) {
			if ( !in_array($k, $matches[1]) ) {
				$formdata .= ($formdata ? "<br><br>" : "") . ucfirst($k) . ":<br>" . $v;
			}
		}
		$_POST["formdata"] = $formdata;

		// Add some additional variables to the play
		$_POST["ip"] = $_SERVER["REMOTE_ADDR"];
		$_POST["date"] = date('Y-m-d H:i:s');

		// Loop through all variables of the template
		foreach($matches[1] as $val) {
			// Try to replace all variables in the template with the corresponding postvars (if they exist)
			$template = str_replace("{" . $val . "}", (isset($_POST[$val]) ? $_POST[$val] : ""), $template);
		}


		// Body
		$body = "<html><body>" . $template . "</body></html>";

		// Sender as From Email or predefined From Email
		$from = ("{from-them}" == "1" ? $_POST["email"] : "{from}");

		// Sender as From name or predefined From Name (remove all double quotes, if any)
		$name = preg_replace('/(["“”‘’„”«»]|&quot;)/', "", $_POST["name"], -1);
		$fromName = ("{from-name-them}" == "1" && $name ? $name : "{from-name}");

		// Set headers
		$headers  = "MIME-Version: 1.0\r\n";
		$headers .= "Content-type:text/html;charset=UTF-8\r\n";
		$headers .= "From: \"" . $fromName . "\" <" . $from . ">\r\n";
		$headers .= "Reply-To: " . $from;

		// Send the mail
		if ( mail("{to}", $subject, $body, $headers) ) {
			json(true);
		}
	}
	catch (Exception $e) {
		json(false, "An error occured");
	}
}

// Function to return JSON
function json($success, $msg="") {
	$arr = array("success" => $success);

	if ($msg)
		$arr["message"] = $msg;

	echo json_encode($arr);

	die();
}
?>