<?php
// We only do stuff if there's a POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	try {
		// Sanitize user input
		$_POST = array_map("strip_tags", $_POST);
		$_POST = array_map("htmlspecialchars", $_POST);

		// Subject
		$subject = $_POST["subject"];

		// Search and replace variables (and whatever else)
		$arrS = [
			"{name}",
			"{email}",
			"{phone}",
			"{message}",
			"{date}",
			"{ip}"
		];
		$arrR = [
			$_POST["name"],
			$_POST["email"],
			$_POST["phone"],
			str_replace("\n", "<br />", $_POST["message"]),
			date('Y-m-d H:i:s'),
			$_SERVER["REMOTE_ADDR"]
		];
		$template = "{template}";
		$template = str_replace($arrS, $arrR, $template);

		// Body
		$body = "<html><body>" . $template . "</body></html>";
			
		// Set headers
		$headers  = "MIME-Version: 1.0\r\n";
		$headers .= "Content-type:text/html;charset=UTF-8\r\n";
		$headers .= "From: \"{from-name}\" <{from}>\r\n";
		$headers .= "Reply-To: {from}";

		// Send the mail
		if ( mail("{to}", $subject, $body, $headers) ) {
			echo "1";
		}
	}
	catch (Exception $e) {
	}
}
?>