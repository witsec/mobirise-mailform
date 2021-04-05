<?php
session_start();

// Check if captcha matches or return a new captcha
if (isset($_GET["check"]))
    CheckCaptcha();
else
    GenerateCaptcha();


// Check a captcha
function CheckCaptcha() {
    if (isset($_SESSION["captchaCode"]) && $_GET["check"] == $_SESSION["captchaCode"])
        json(true);
    else
        json(false);
}

// Generate a captcha image
function GenerateCaptcha() {
    // Generate captcha code
    $chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $code = "";
    for ($i=0; $i<6; $i++)
    $code .= $chars[rand(0, strlen($chars))];

    // Save code to session
    $_SESSION["captchaCode"] = $code;

    // Generate captcha image
    $img = imagecreatetruecolor(72,28);
    $imgBG = imagecolorallocate($img, 204, 204, 204);
    imagefill($img, 0, 0, $imgBG);
    $imgTxtColor = imagecolorallocate($img, 0, 0, 0);
    imagestring($img, 5, 10, 5, $code, $imgTxtColor);
    
    // Send image to client
    header("Content-type: image/jpeg");
    imagejpeg($img);
}


// Function to return JSON
function json($success, $msg="") {
	$arr = array("success" => $success);

	if ($msg)
		$arr["message"] = $msg;

	// Send the JSON and stop the presses
	header("Content-type: application/json");
	echo json_encode($arr);
	die();
}
?>