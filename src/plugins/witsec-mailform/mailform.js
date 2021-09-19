function witsecSendMail(frm, callback) {
	event.preventDefault();

	// Check if the simple Captcha is correct
	if (frm.querySelector("input[name='captcha']") && frm.querySelector("input[name='captcha']").length && frm.querySelector("input[name='captcha']").hasClass("is-invalid")) {
		console.error("Not sending the form, because the Captcha is incorrect.");
		frm.querySelector(".captcha").focus();
		return false;
	}

	// Check if a reCAPTCHA site key is defined (v3)
	if (typeof witsecRcpSitekey !== 'undefined') {
		grecaptcha.ready(function() {
			grecaptcha.execute(witsecRcpSitekey, {action: "homepage"}).then(function(token) {
				if (frm.querySelector("input[name=g-recaptcha-response]"))
					frm.querySelector("input[name=g-recaptcha-response]").remove();

				let inp = document.createElement("input");
				inp.type  = "hidden";
				inp.name  = "g-recaptcha-response";
				inp.value = token;
				frm.appendChild(inp);

				witsecSendMailAjax(frm, callback);
			});
		});
	}
	else {
		// If reCAPTCHA v2 is used, check if the checkbox is checked
		if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0)
			return false;
		else
			witsecSendMailAjax(frm, callback);
	}
}


// Send an email
function witsecSendMailAjax(frm, callback) {
	// Disable submit button, if needed
	if (frm.querySelector("input[name=disableButton]") && frm.querySelector("input[name=disableButton]").value == "1" && frm.querySelector("button[type=submit]"))
		frm.querySelector("button[type=submit]").disabled = true;

	// Let's try to send the form
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "assets/witsec-mailform/mail.php", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				try {
					let data = JSON.parse(xhr.responseText);

					if (data.success) {
						if (callback)
							callback(data);
						else {
							// Check if we need to redirect or not
							if (frm.querySelector("input[name=redirectURL]") && frm.querySelector("input[name=redirectURL]").value != "") {
								window.location.href = frm.querySelector("input[name=redirectURL]").value;
							} else {
								frm.querySelector("div.alert-success").hidden = false;
								frm.querySelector("div.alert-danger").hidden = true;

								// Reset the captcha, if it was used
								if (frm.querySelector("input[name='captcha']") && frm.querySelector(".captcha")) {
									frm.querySelector("input[name='captcha']").classList.remove("is-valid", "is-invalid");
									frm.querySelector(".captcha").style.backgroundImage = "url(assets/witsec-mailform/captcha.php" + "?" + Date.now() + ")";
								}

								frm.reset();
							}
						}
					} else {
						console.error("Mailform error: [" + data.errorcode + "] " + data.message + (data.args ? " - " + data.args: "") );

						// Call callback function or do our own thing
						if (callback)
							callback(data);
						else {
							if (frm.querySelector("div.alert-success"))
								frm.querySelector("div.alert-success").hidden = true;
							witsecMfSetErrors(frm.querySelector("div.alert-danger"), data);
							frm.querySelector("div.alert-danger").hidden = false;
						}
					}
				} catch(e) {
					if (callback)
						callback(data);
					else {
						console.error("Mailform: unexpected return data (" + e + ")");
						witsecMfSetErrors(frm.querySelector("div.alert-danger"), false);
						frm.querySelector("div.alert-danger").hidden = false;
					}
				}
			} else {
				console.error("Mailform: an error occured.");

				// Call callback function or do our own thing
				if (callback) {
					callback();
				} else {
					if (frm.querySelector("div.alert-success"))
						frm.querySelector("div.alert-success").hidden = true;
					frm.querySelector("div.alert-danger").hidden = false;
					witsecMfSetErrors(frm.querySelector("div.alert-danger"), false);
				}
			}

			// Enable submit button
			if (!callback && frm.querySelector("button[type=submit]"))
				frm.querySelector("button[type=submit]").disabled = false;
		}
	};
	xhr.send( new FormData(frm) );
}


// Set (custom) errors
var wsMfErrorOrg = "";
function witsecMfSetErrors(div, data) {
	// Default error values
	let m = "An error occured";
	let e = "E1201";
	let a = "";

	// Save the original error message, in case another error occurs
	if (wsMfErrorOrg)
		div.innerHTML = wsMfErrorOrg;
	else
		wsMfErrorOrg = div.innerHTML;

	if (data) {
		e = data.errorcode;
		m = (typeof wsMfErrors !== "undefined" && wsMfErrors[data.errorcode] ? wsMfErrors[data.errorcode] : data.message);
		a = (data.args ? data.args : "");
	}

	// Set error code and message
	div.innerText = div.innerText.replace("{errorcode}", e).replace("{errormsg}", m).replace("{errorargs}", a);
}


/* LISTENERS */

// When someone entered a CAPTCHA code
listen(".witsec-mailform form input[name='captcha']", "change", function(event) {
	f = event.target;

	let xhr = new XMLHttpRequest();
	xhr.open("GET", "assets/witsec-mailform/captcha.php?check=" + f.value, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			let data = JSON.parse(xhr.responseText);

			if (xhr.status == 200 && data.success) {
				f.classList.remove("is-invalid");
				f.classList.add("is-valid");
			} else {
				f.classList.remove("is-valid");
				f.classList.add("is-invalid");
				console.error("Captcha incorrect");
			}
		}
	};
	xhr.send();
});


// When CAPTCHA reload has been clicked
listen(".witsec-mailform form .captchaReload", "click", function(event) {
	let p = event.target.closest("form");

	if (p && p.querySelector(".captcha") && p.querySelector("input[name='captcha']")) {
		p.querySelector(".captcha").style.backgroundImage = "url(assets/witsec-mailform/captcha.php" + "?" + Date.now() + ")";
		p.querySelector("input[name='captcha']").classList.remove("is-valid", "is-invalid");
		p.querySelector("input[name='captcha']").value = "";
	}
});


// Listen for form submits
listen("section.witsec-mailform form", "submit", function(event) {
	if (event.target.hasAttribute("onsubmit"))
		return;

	event.preventDefault();
	witsecSendMail(event.target);
});


/* Some IE 11 compatibility (perhaps even lower, but that's just gross...) */

// Check if we're dealing with IE
function isIE() {
	let ua = window.navigator.userAgent;
	if (ua.indexOf("MSIE ") > 0 || ua.indexOf("Trident/") > 0)
		return true;
	return false;
}

// If ready and we're dealing with IE, then add some functions that proper browsers all support
document.addEventListener("DOMContentLoaded", function(event) {
	if (isIE()) {
		// Register 'closest' function
		Object.prototype.closest = function (selector) {
			let el = this;

			// Search for the selector while moving up the DOM
			while (el) {
				if (el.querySelector(selector))
					return el.querySelector(selector);
				else
					el = el.parentElement;
			}

			return null;
		};

		// Register 'matches' function
		Object.prototype.matches = function (selector) {
			return this.msMatchesSelector(selector);
		};
	}
});


/* HELPERS */

// Function to quickly register an event listener using a selector
function listen(selector, event, func) {
	var el = document.querySelectorAll(selector);
	for (var i = 0; i < el.length; i++)
		el[i].addEventListener(event, func);
}