function witsecSendMail(obj) {
    event.preventDefault();

    var frm = $(obj);

    // Check if site uses Captcha
	if (frm.find("input[name='captcha']").length && !frm.find("input[name='captcha']").hasClass("is-valid")) {
        console.error("Not sending the form, because the Captcha is incorrect.");
    	frm.find(".captcha").focus();
        return false;
    }

    // Check if a reCAPTCHA site key is defined (v3)
    if (typeof witsecRcpSitekey !== 'undefined') {
        grecaptcha.ready(function() {
            grecaptcha.execute(witsecRcpSitekey, {action: "homepage"}).then(function(token) {
                frm.find("input[name=g-recaptcha-response]").remove();
                frm.prepend("<input type='hidden' name='g-recaptcha-response' value='" + token + "'>");
                witsecSendMailAjax(frm);
            });
        });
    }
    else {
        // If reCAPTCHA v2 is used, check if the checkbox is checked
        if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0)
            return false;
        else
            witsecSendMailAjax(frm);

    }
}

function witsecSendMailAjax(frm) {
    frm.attr("action", "assets/witsec-mailform/mail.php");
    frm.attr("method", "POST");

    // Disable submit button, if needed
    if (frm.find("input[name=disableButton]").val() == "1")
        frm.find("button[type=submit]").attr("disabled", true);

    // Let's try to send the form
    $.ajax({
        type: frm.attr("method"),
        url: frm.attr("action"),
        data:        ( typeof FormData !== "undefined" ? new FormData(frm[0]) : frm.serialize() ), // Ancient browsers can't handle FormData (file uploads won't work, but the form is still sent)
        contentType: ( typeof FormData !== "undefined" ? false : "application/x-www-form-urlencoded; charset=UTF-8" ),
        processData: ( typeof FormData !== "undefined" ? false : true ),
        success: function (data) {
            if (data.success) {
                // Check if we need to redirect or not
                if (frm.find("input[name=redirectURL]").length) {
                    window.location.href = frm.find("input[name=redirectURL]").val();
                } else {
                    frm.find("div .alert-danger").attr("hidden", "hidden");
                    frm.find("div .alert-success").removeAttr("hidden");
                    frm.find("input[name='captcha']").removeClass("is-valid is-invalid");
                    frm.find(".captcha").css("background-image", "url(assets/witsec-mailform/captcha.php" + "?" + Date.now() + ")");
                    frm.trigger("reset");
                }
            } else {
                frm.find("div .alert-success").attr("hidden", "hidden");
                frm.find("div .alert-danger").removeAttr("hidden");
                witsecMfSetErrors(frm.find("div .alert-danger"), data);
                console.error("Mailform error: [" + data.errorcode + "] " + data.message);
            }

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
        error: function (data) {
            console.error("Mailform: something went wrong somewhere.");

            frm.find("div .alert-success").attr("hidden", "hidden");
            frm.find("div .alert-danger").removeAttr("hidden");
            witsecMfSetErrors(frm.find("div .alert-danger"), false);

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
    });
}

var wsMfErrorOrg = "";
function witsecMfSetErrors(div, data) {
    // Default error values
    let m = "Something went wrong somewhere.";
    let e = "E1201";

    // Save the original error message, in case another error occurs
    if (wsMfErrorOrg)
        div.html(wsMfErrorOrg);
    else
        wsMfErrorOrg = div.html();

    if (data) {
        e = data.errorcode;
        m = (typeof wsMfErrors !== "undefined" && wsMfErrors[data.errorcode] ? wsMfErrors[data.errorcode] : data.message);
    }

    // Set error code and message
    div.text(function(index, text) {
        return text.replace("{errorcode}", e).replace("{errormsg}", m);
    });
}

// Valide the captcha
function witsecValidateCaptcha(f) {
	f = $(f);

    $.ajax({
        type: "get",
        url: "assets/witsec-mailform/captcha.php?check=" + f.val(),
        success: function (data) {
            if (data.success) {
                f.removeClass("is-invalid").addClass("is-valid");
            } else {
                f.removeClass("is-valid").addClass("is-invalid");
                console.error("Captcha incorrect");
            }
        },
        error: function (data) {
            console.error("Captcha failed");
            f.removeClass("is-valid").addClass("is-invalid");
        },
    });
}

// Listeners
document.addEventListener("DOMContentLoaded", function(event) {
    // When someone entered a CAPTCHA code
    $(".witsec-mailform form input[name='captcha']").change(function() {
        var f = $(this);

        $.ajax({
            type: "get",
            url: "assets/witsec-mailform/captcha.php?check=" + f.val(),
            success: function (data) {
                if (data.success) {
                    f.removeClass("is-invalid").addClass("is-valid");
                } else {
                    f.removeClass("is-valid").addClass("is-invalid");
                    console.error("Captcha incorrect");
                }
            },
            error: function (data) {
                console.error("Captcha failed");
                f.removeClass("is-valid").addClass("is-invalid");
            },
        });
    });

    // When CAPTCHA reload has been clicked
    $(".witsec-mailform form .captchaReload").click(function() {
        let p = $(this).closest("form");
        if (p) {
            p.find(".captcha").css("background-image", "url(assets/witsec-mailform/captcha.php" + "?" + Date.now() + ")");
            p.find("input[name='captcha']").removeClass("is-valid is-invalid");
            p.find("input[name='captcha']").val("");
        }
    });

    // Listen for form submits
    $(".witsec-mailform form").not("[onsubmit]").submit(function(event) {
        witsecSendMail( $(this)[0] );
    });
});