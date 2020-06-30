function witsecSendMail(obj) {
    event.preventDefault();

    var frm = $(obj);

    // Disable submit button, if needed
    if (frm.find("input[name=disableButton]").val() == "1")
        frm.find("button[type=submit]").attr("disabled", true);

    // Check if a reCAPTCHA site key is defined
    if (typeof witsecRcpSitekey !== 'undefined') {
        grecaptcha.ready(function() {
            grecaptcha.execute(witsecRcpSitekey, {action: "homepage"}).then(function(token) {
                frm.find("input[name=g-recaptcha-response]").remove();
                frm.prepend("<input type='hidden' name='g-recaptcha-response' value='" + token + "'>");
                witsecSendMailAjax(frm);
            });
        });
    } else {
        witsecSendMailAjax(frm);
    }
}

function witsecSendMailAjax(frm) {
    frm.attr("action", "assets/witsec-mailform/mail.php");
    frm.attr("method", "POST");

    $.ajax({
        type: frm.attr("method"),
        url: frm.attr("action"),
        data: frm.serialize(),
        success: function (data) {
            if (data.success) {
                frm.find("div .alert-danger").attr("hidden", "hidden");
                frm.find("div .alert-success").removeAttr("hidden");
                frm.trigger("reset");
            } else {
                frm.find("div .alert-success").attr("hidden", "hidden");
                frm.find("div .alert-danger").removeAttr("hidden");
            }

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
        error: function (data) {
            frm.find("div .alert-success").attr("hidden", "hidden");
            frm.find("div .alert-danger").removeAttr("hidden");

            // Enable submit button
            frm.find("button[type=submit]").attr("disabled", false);
        },
    });
}