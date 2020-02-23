function witsecSendMail(obj) {
    event.preventDefault();

    var frm = $(obj);

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
    frm.attr("action", "mail.php");
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
        },
        error: function (data) {
            frm.find("div .alert-success").attr("hidden", "hidden");
            frm.find("div .alert-danger").removeAttr("hidden");
        },
    });
}