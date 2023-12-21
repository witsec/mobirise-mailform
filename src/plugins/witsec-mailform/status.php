<?php
require "settings.php";
require "functions.php";

// Some settings require some additional formatting
FormatSettings();

// Simple status page
echo "<!doctype html><head><title>Status</title><meta charset='UTF-8'></head><body>";

// Check PHP version
echo (phpversion() >= 7.3 ? "✔️" : "❌") . " PHP Version<br>";

// Check if OpenSSL is enabled
echo (extension_loaded("openssl") ? "✔️" : "❌") . " OpenSSL<br>";

// Check if function 'file_get_contents' or 'curl_init' exists
echo (function_exists("file_get_contents") || function_exists("curl_init") ? "✔️" : "❌") . " Required functions<br>";

// Check if image functions for CAPTCHA exist
echo (function_exists("imagecreatetruecolor") && function_exists("imagecolorallocate") && function_exists("imagejpeg") ? "✔️" : "❌") . " Required functions for CAPTCHA<br>";

// Check if image functions for CAPTCHA exist
echo (function_exists("mime_content_type") ? "✔️" : "❌") . " Required functions for checking file mime types " . (function_exists("mime_content_type") ? "" : "(maybe fileinfo extension is disabled, attachments will still work)") . "<br>";

// Check if Google can be contacted
if (extension_loaded("openssl") && (function_exists("file_get_contents") || function_exists("curl_init"))) {
    $s = SendReCaptcha("12345", "67890", true);
    echo ($s ? "✔️" : "❌") . " Connection to Google reCAPTCHA service<br>";
} else
    echo "❌ Connection to Google reCAPTCHA services (missing OpenSSL)<br>";

// Check connection to SMTP server
if ($_SETTINGS["smtp"]) {
    if (function_exists("fsockopen") && extension_loaded("openssl")) {
        $socket = fsockopen( ($_SETTINGS["smtpSecure"] == "ssl" ? "ssl://" : "") . $_SETTINGS["smtpHost"], $_SETTINGS["smtpPort"], $errno, $errstr, 5);
        echo ($socket ? "✔️" : "❌") . " SMTP Server Connection";
    } else
        echo "❌ SMTP Server Connection (missing functions and/or openSSL)<br>";
}

echo "</body></html>";
?>