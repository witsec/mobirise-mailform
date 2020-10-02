function witsecSendMail(obj) {
    event.preventDefault();

    var frm = $(obj);

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

    $.ajax({
        type: frm.attr("method"),
        url: frm.attr("action"),
        data: frm.serialize(),
        success: function (data) {
            if (data.success) {
                // Check if we need to redirect or not
                if (frm.find("input[name=redirectURL]").length) {
                    window.location.href = frm.find("input[name=redirectURL]").val();
                } else {
                    frm.find("div .alert-danger").attr("hidden", "hidden");
                    frm.find("div .alert-success").removeAttr("hidden");
                    frm.trigger("reset");
                }
            } else {
                frm.find("div .alert-success").attr("hidden", "hidden");
                frm.find("div .alert-danger").removeAttr("hidden");
                console.error("Mailform: An error occured. " + data.message);
            }

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
        error: function (data) {
            console.error("Mailform: something went wrong somewhere.");

            frm.find("div .alert-success").attr("hidden", "hidden");
            frm.find("div .alert-danger").removeAttr("hidden");

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
    });
}