defineM("witsec-mailform", function (g, mbrApp, TR) {
	mbrApp.regExtension({
		name: "witsec-mailform",
		events: {

			load: function () {
				var a = this;
				var php = "";

				// Stop processing if the current website is AMP
				if (mbrApp.isAMP())
					return;

				// Add site settings
				a.addFilter("sidebarProjectSettings", function (b) {
					var wm = a.projectSettings["witsec-mailform"] || false;

					var c = {
						title: "witsec",
						name: "witsec-site-settings",
						html: [
							'<div class="form-group col-md-12">',
							'  <div class="row">',
							'    <label for="witsec-mailform" class="control-label col">Mailform</label>',
							'    <div class="togglebutton col-auto">',
							'      <label>',
							'        <input type="checkbox" name="witsec-mailform" id="witsec-mailform" ' + (wm ? "checked" : "") + '>',
							'        <span class="toggle" style="margin:0;"></span>',
							'      </label>',
							'    </div>',
							'  </div>',
							'</div>',
							'<div class="form-group col-md-12" id="witsec-mailform-editbtn-div" ' + (wm ? "" : 'style="display:none;"') + '>',
							'  <div class="row">',
							'    <div class="col-md-12">',
							'      <button class="btn btn-primary pull-right" id="witsec-mailform-editbtn" type="button">' + TR("Edit") + '</button>',
							'    </div>',
							'  </div>',
							'</div>'
						].join("\n")
					};
					b.push(c);
					return b
				});

				// Respond to enabling/disabling mailform by showing/hiding the edit button
				mbrApp.$body.on("change", "#witsec-mailform", function () {
					if ($("#witsec-mailform").prop("checked")) {
						$("#witsec-mailform-editbtn-div").show();

						// Open the settings window
						$("#witsec-mailform-editbtn").trigger("click");
					}
					else {
						$("#witsec-mailform-editbtn-div").hide();
						a.projectSettings["witsec-mailform"] = false;
					}
				});

				// Respond to enabling/disabling "Sender as From Email"
				mbrApp.$body.on("change", "#witsec-mailform-from-them", function () {
					if ($("#witsec-mailform-from-them").prop("checked")) {
						$("#witsec-mailform-from-them-replyto").prop("checked", false);
					}
				});

				// Respond to enabling/disabling "Sender as Reply-To"
				mbrApp.$body.on("change", "#witsec-mailform-from-them-replyto", function () {
					if ($("#witsec-mailform-from-them-replyto").prop("checked")) {
						$("#witsec-mailform-from-them").prop("checked", false);
					}
				});

				// Respond to enabling/disabling "Sender as From Name"
				mbrApp.$body.on("change", "#witsec-mailform-from-name-them", function () {
					if ($("#witsec-mailform-from-name-them").prop("checked")) {
						$(".witsec-mailform-from-name-them-field-div").show();
					}
					else {
						$(".witsec-mailform-from-name-them-field-div").hide();
					}
				});

				// Respond to "Subject Type" changing
				mbrApp.$body.on("change", "#witsec-mailform-autorespond-subjecttype", function () {
					if ( $("#witsec-mailform-autorespond-subjecttype").val() == "0") {
						$(".witsec-mailform-autorespond-subjectprefix-div").show();
						$(".witsec-mailform-autorespond-customsubject-div").hide();
					}
					else {
						$(".witsec-mailform-autorespond-customsubject-div").show();
						$(".witsec-mailform-autorespond-subjectprefix-div").hide();
					}
				});

				// Respond to enabling/disabling "Use reCAPTCHA"
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha", function () {
					if ($("#witsec-mailform-recaptcha").prop("checked")) {
						$(".witsec-mailform-recaptcha-div").show();

						if ($("#witsec-mailform-recaptcha-version option:selected").val() == "3")
							$(".witsec-mailform-recaptchav3-div").show();

						if ($("#witsec-mailform-recaptcha-version option:selected").val() == "2" || $("#witsec-mailform-recaptcha-version option:selected").val() == "3")
							$(".witsec-mailform-recaptchaKeys-div").show();
					}
					else {
						$(".witsec-mailform-recaptcha-div").hide();
						$(".witsec-mailform-recaptchav3-div").hide();
						$(".witsec-mailform-recaptchaKeys-div").hide();
					}
				});

				// Respond to changing reCAPTCHA version
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha-version", function () {
					switch($("#witsec-mailform-recaptcha-version option:selected").val()) {
						case "captcha":	$(".witsec-mailform-recaptchav3-div").hide();
										$(".witsec-mailform-recaptchaKeys-div").hide();
										break
						case "2":		$(".witsec-mailform-recaptchav3-div").hide();
										$(".witsec-mailform-recaptchaKeys-div").show();
										break
						case "3":		$(".witsec-mailform-recaptchav3-div").show();
										$(".witsec-mailform-recaptchaKeys-div").show();
										break;
					}
				});

				// Respond to hiding the reCAPTCHA badge
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha-hidebadge", function () {
					if ($("#witsec-mailform-recaptcha-hidebadge").prop("checked")) {
						mbrApp.alertDlg("<h4>" + TR("Warning") + "</h4>" + TR("When you hide the reCAPTCHA badge, make sure to provide links to the Privacy and Terms pages of Google. The 'Terms' switch under the block options (gear icon) will do this for you. If you completely hide it, Google may choose to discontinue further spam checking."));
					}
				});

				// Respond to enabling/disabling "Use SMTP"
				mbrApp.$body.on("change", "#witsec-mailform-smtp", function () {
					if ($("#witsec-mailform-smtp").prop("checked"))
						$(".witsec-mailform-smtp-div").show();
					else
						$(".witsec-mailform-smtp-div").hide();
				});

				// Respond to enabling/disabling "Use Attachments"
				mbrApp.$body.on("change", "#witsec-mailform-attachments", function () {
					if ($("#witsec-mailform-attachments").prop("checked"))
						$(".witsec-mailform-attachments-div").show();
					else
						$(".witsec-mailform-attachments-div").hide();
				});

				// Respond to clicking the 'default' button for mime types
				var defaultMimeTypes = "application/gzip\napplication/java-archive\napplication/javascript\napplication/json\napplication/ld+json\napplication/msword\napplication/ogg\napplication/pdf\napplication/rtf\napplication/vnd.amazon.ebook\napplication/vnd.api+json\napplication/vnd.apple.installer+xml\napplication/vnd.mozilla.xul+xml\napplication/vnd.ms-excel\napplication/vnd.ms-fontobject\napplication/vnd.ms-powerpoint\napplication/vnd.oasis.opendocument.presentation\napplication/vnd.oasis.opendocument.spreadsheet\napplication/vnd.oasis.opendocument.text\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\napplication/vnd.rar\napplication/vnd.visio\napplication/x-7z-compressed\napplication/x-abiword\napplication/x-bzip\napplication/x-bzip2\napplication/x-freearc\napplication/x-httpd-php\napplication/x-tar\napplication/x-www-form-urlencoded\napplication/xhtml+xml\napplication/xml\napplication/zip\napplication/zstd\naudio/*\nfont/*\nimage/*\nmultipart/form-data\ntext/*\nvideo/*";
				mbrApp.$body.on("click", "#witsec-mailform-attachments-mimetypes-default", function () {
					$("#witsec-mailform-attachments-mimetypes").val(defaultMimeTypes);
				});

				// Respond to clicking the 'question mark' for allowed Mime Types
				mbrApp.$body.on("click", "#witsec-mailform-attachments-mimetypes-help", function () {
					mbrApp.openUrl("https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types");
				});

				// Show settings window
				a.$body.on("click", "#witsec-mailform-editbtn", function () {
					// Do a check if mailform values have been set, otherwise set it to something default
					a.projectSettings["witsec-mailform-to"]                        = a.projectSettings["witsec-mailform-to"] || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-to-alt"]                    = a.projectSettings["witsec-mailform-to-alt"] || "";
					a.projectSettings["witsec-mailform-from"]                      = a.projectSettings["witsec-mailform-from"] || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from-them"]                 = a.projectSettings["witsec-mailform-from-them"] || false;
					a.projectSettings["witsec-mailform-from-them-replyto"]         = a.projectSettings["witsec-mailform-from-them-replyto"] || false;
					a.projectSettings["witsec-mailform-from-name"]                 = a.projectSettings["witsec-mailform-from-name"] || "Your Name";
					a.projectSettings["witsec-mailform-from-name-them"]            = a.projectSettings["witsec-mailform-from-name-them"] || false;
					a.projectSettings["witsec-mailform-from-name-them-field"]      = a.projectSettings["witsec-mailform-from-name-them-field"] || "{name}";
					a.projectSettings["witsec-mailform-template"]                  = a.projectSettings["witsec-mailform-template"] || "Hi,\n\nYou have received a new message from your website.\n\n{formdata}\n\nDate: {date}\nRemote IP: {ip}\n\n---\nHave a nice day.";
					a.projectSettings["witsec-mailform-autorespond-subjectprefix"] = a.projectSettings["witsec-mailform-autorespond-subjectprefix"] || "Re:";
					a.projectSettings["witsec-mailform-autorespond-subject"]       = a.projectSettings["witsec-mailform-autorespond-subject"] || "";
					a.projectSettings["witsec-mailform-autorespond-template"]      = a.projectSettings["witsec-mailform-autorespond-template"] || "Hi {name},\n\nThank you for your message. We'll get back to you as soon as we can.\nHere's the information you sent us:\n\n{formdata}\n\n---\nHave a nice day.";
					a.projectSettings["witsec-mailform-recaptcha"]                 = a.projectSettings["witsec-mailform-recaptcha"] || false;
					a.projectSettings["witsec-mailform-recaptcha-version"]         = a.projectSettings["witsec-mailform-recaptcha-version"] || "3";
					a.projectSettings["witsec-mailform-recaptcha-sitekey"]         = a.projectSettings["witsec-mailform-recaptcha-sitekey"] || "";
					a.projectSettings["witsec-mailform-recaptcha-secretkey"]       = a.projectSettings["witsec-mailform-recaptcha-secretkey"] || "";
					a.projectSettings["witsec-mailform-recaptcha-score"]           = a.projectSettings["witsec-mailform-recaptcha-score"] || "0.5";
					a.projectSettings["witsec-mailform-disable-button"]            = a.projectSettings["witsec-mailform-disable-button"] || false;
					a.projectSettings["witsec-mailform-smtp"]                      = a.projectSettings["witsec-mailform-smtp"] || false;
					a.projectSettings["witsec-mailform-smtp-debug"]                = a.projectSettings["witsec-mailform-smtp-debug"] || false;
					a.projectSettings["witsec-mailform-smtp-host"]                 = a.projectSettings["witsec-mailform-smtp-host"] || "";
					a.projectSettings["witsec-mailform-smtp-port"]                 = a.projectSettings["witsec-mailform-smtp-port"] || "";
					a.projectSettings["witsec-mailform-smtp-secure"]               = a.projectSettings["witsec-mailform-smtp-secure"] || "";
					a.projectSettings["witsec-mailform-smtp-username"]             = a.projectSettings["witsec-mailform-smtp-username"] || "";
					a.projectSettings["witsec-mailform-smtp-password"]             = a.projectSettings["witsec-mailform-smtp-password"] || "";
					a.projectSettings["witsec-mailform-attachments"]               = a.projectSettings["witsec-mailform-attachments"] || false;
					a.projectSettings["witsec-mailform-attachments-mimetypes"]     = a.projectSettings["witsec-mailform-attachments-mimetypes"] || defaultMimeTypes;

					// Show or hide the "Sender Form Name Field" field, based on whether "Sender as From Name" is checked
					var hideFromNameThemField = (a.projectSettings["witsec-mailform-from-name-them"] == false ? "style='display:none'" : "");

					// Show or hide Subject Prefix
					var hideSubjectPrefix = (a.projectSettings["witsec-mailform-autorespond-subject"] != "" ? "style='display:none'" : "");

					// Show or hide Subject Prefix
					var hideCustomSubject = (a.projectSettings["witsec-mailform-autorespond-subject"] ? "" : "style='display:none'");

					// Show or hide extra reCAPTCHA fields
					var hideReCaptcha = (a.projectSettings["witsec-mailform-recaptcha"] ? "" : "style='display:none'");
					var hideReCaptchaV3 = (a.projectSettings["witsec-mailform-recaptcha"] && a.projectSettings["witsec-mailform-recaptcha-version"] == "3" ? "" : "style='display:none'");
					var hideReCaptchaKeys = (a.projectSettings["witsec-mailform-recaptcha"] && a.projectSettings["witsec-mailform-recaptcha-version"] != "captcha" ? "" : "style='display:none'");

					// Show or hide SMTP fields
					var hideSMTP = (a.projectSettings["witsec-mailform-smtp"] ? "" : "style='display:none'");

					// Show or hide SMTP fields
					var hideAttachments = (a.projectSettings["witsec-mailform-attachments"] ? "" : "style='display:none'");

					// Display modal window with settings
					mbrApp.showDialog({
						title: TR("Mailform Settings"),
						className: "witsec-mailform-modal",
						body: [
							'<style>',
							'.witsec-mailform-modal .modal-dialog { width: 660px; }',
							'.nav .active .ws-mf-pills { background-color:#69c9d6 !important }',
							'.nav :not(.active) .ws-mf-pills { color:' + (mbrApp.appSettings["darkMode"] ? "#fff" : "#000") + ' !important }',
							'.nav :not(.active) .ws-mf-pills:hover { background-color: #a8a8a8 !important }',
							'</style>',

							'<ul class="nav nav-pills">',
							'  <li class="active"><a href="#ws-mf-tab-general" data-toggle="tab" class="ws-mf-pills">' + TR("General") + '</a></li>',
							'  <li><a href="#ws-mf-tab-sender" data-toggle="tab" class="ws-mf-pills">' + TR("Sender") + '</a></li>',
							'  <li><a href="#ws-mf-tab-autorespond" data-toggle="tab" class="ws-mf-pills">' + TR("Autorespond") + '</a></li>',
							'  <li><a href="#ws-mf-tab-recaptcha" data-toggle="tab" class="ws-mf-pills">' + TR("CAPTCHA") + '</a></li>',
							'  <li><a href="#ws-mf-tab-smtp" data-toggle="tab" class="ws-mf-pills">' + TR("SMTP") + '</a></li>',
							'  <li><a href="#ws-mf-tab-attachments" data-toggle="tab" class="ws-mf-pills">' + TR("File Attachments") + '</a></li>',
							'</ul>',

							'<!-- TABS -->',
							'<form>',
							'<div class="tab-content">',

							'  <!-- TAB GENERAL -->',
							'  <div class="tab-pane active fade in" id="ws-mf-tab-general">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-to" class="col-sm-5 col-form-label">' + TR("Default Recipient(s)") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-to" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-to"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-to-alt" class="col-sm-5 col-form-label">' + TR("Address Book") + '</label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px; white-space:nowrap" id="witsec-mailform-to-alt" placeholder="john:j.doe@domain.com">' + a.projectSettings["witsec-mailform-to-alt"] + '</textarea>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-from-div">',
							'      <label for="witsec-mailform-from" class="col-sm-5 col-form-label">' + TR("From Email") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-name" class="col-sm-5 col-form-label">' + TR("From Name") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from-name" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from-name"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-template" class="col-sm-5 col-form-label">' + TR("Email Template") + '</label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px" id="witsec-mailform-template">' + a.projectSettings["witsec-mailform-template"] + '</textarea>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-disable-button" class="col-sm-5 col-form-label">' + TR("Disable Button after Submit") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-disable-button" name="witsec-mailform-disable-button" ' + (a.projectSettings["witsec-mailform-disable-button"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'  </div>',

							'  <!-- TAB SENDER -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-sender">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-them" class="col-sm-5 col-form-label">' + TR("Sender as From Email") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-from-them" name="witsec-mailform-from-them" ' + (a.projectSettings["witsec-mailform-from-them"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-them-replyto" class="col-sm-5 col-form-label">' + TR("Sender as Reply-To") + ' *</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-from-them-replyto" name="witsec-mailform-from-them-replyto" ' + (a.projectSettings["witsec-mailform-from-them-replyto"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-name-them" class="col-sm-5 col-form-label">' + TR("Sender as From Name") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-from-name-them" name="witsec-mailform-from-name-them" ' + (a.projectSettings["witsec-mailform-from-name-them"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-from-name-them-field-div" ' + hideFromNameThemField + '>',
							'      <label for="witsec-mailform-from-name-them-field" class="col-sm-5 col-form-label">' + TR("Sender Name Form Field(s)") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from-name-them-field" placeholder="{name}" value="' + a.projectSettings["witsec-mailform-from-name-them-field"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <div class="col-sm-12">',
							'        <small>* ' + TR("using reply-to instead of from often avoids emails being marked as spam") + '</small>',
							'      </div>',
							'    </div>',
							'  </div>',

							'  <!-- TAB AUTORESPOND -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-autorespond">',
							'    <div class="form-group row">',
							'      <label class="col-sm-5 col-form-label">' + TR("Subject") + '</label>',
							'      <div class="col-sm-5">',
							'        <select id="witsec-mailform-autorespond-subjecttype" class="form-control" style="color:#fff">',
							'          <option value="0">' + TR("Use form subject") + '</option>',
							'          <option value="1">' + TR("Use custom subject") + '</option>',
							'        </select>',
							'        <script>',
							'        $("#witsec-mailform-autorespond-subjecttype").val("' + (a.projectSettings["witsec-mailform-autorespond-subject"] != "" ? "1" : "0") + '");',
							'        </script>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-autorespond-subjectprefix-div" ' + hideSubjectPrefix + '>',
							'      <label for="witsec-mailform-autorespond-subjectprefix" class="col-sm-5 col-form-label">' + TR("Optional Subject Prefix") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-autorespond-subjectprefix" value="' + a.projectSettings["witsec-mailform-autorespond-subjectprefix"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-autorespond-customsubject-div" ' + hideCustomSubject + '>',
							'      <label for="witsec-mailform-autorespond-subject" class="col-sm-5 col-form-label">' + TR("Custom Subject") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-autorespond-subject" value="' + a.projectSettings["witsec-mailform-autorespond-subject"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-autorespond-template" class="col-sm-5 col-form-label">' + TR("Email Template") + '</label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px" id="witsec-mailform-autorespond-template">' + a.projectSettings["witsec-mailform-autorespond-template"] + '</textarea>',
							'      </div>',
							'    </div>',
							'  </div>',

							'  <!-- TAB CAPTCHA -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-recaptcha">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-recaptcha" class="col-sm-5 col-form-label">' + TR("Enable CAPTCHA") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-recaptcha" name="witsec-mailform-recaptcha" ' + (a.projectSettings["witsec-mailform-recaptcha"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
							'      <label class="col-sm-5 col-form-label">' + TR("Type") + '</label>',
							'      <div class="col-sm-5">',
							'        <select id="witsec-mailform-recaptcha-version" name="witsec-mailform-recaptcha-version" class="form-control" style="color:#fff">',
							'          ' + (mbrApp.theme.type === "secondary" ? `<option value="captcha">Simple CAPTCHA</option>` : ""),
							'          <option value="2">reCAPTCHA v2</option>',
							'          <option value="3">reCAPTCHA v3</option>',
							'        </select>',
							'        <script>',
							'        $("#witsec-mailform-recaptcha-version").val("' + a.projectSettings["witsec-mailform-recaptcha-version"] + '");',
							'        </script>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptchaKeys-div" ' + hideReCaptchaKeys + '>',
							'      <label for="witsec-mailform-recaptcha-sitekey" class="col-sm-5 col-form-label">' + TR("Site Key") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-sitekey" value="' + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptchaKeys-div" ' + hideReCaptchaKeys + '>',
							'      <label for="witsec-mailform-recaptcha-secretkey" class="col-sm-5 col-form-label">' + TR("Secret Key") + ' *</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-secretkey" value="' + a.projectSettings["witsec-mailform-recaptcha-secretkey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptchav3-div" ' + hideReCaptchaV3 + '>',
							'      <label class="col-sm-5 col-form-label">' + TR("Score") + '</label>',
							'      <div class="col-sm-5">',
							'        <select id="witsec-mailform-recaptcha-score" name="witsec-mailform-recaptcha-score" class="form-control" style="color:#fff">',
							'          <option value="0.1">0.1</option>',
							'          <option value="0.2">0.2</option>',
							'          <option value="0.3">0.3</option>',
							'          <option value="0.4">0.4</option>',
							'          <option value="0.5">0.5 (' + TR("default") + ')</option>',
							'          <option value="0.6">0.6</option>',
							'          <option value="0.7">0.7</option>',
							'          <option value="0.8">0.8</option>',
							'          <option value="0.9">0.9</option>',
							'          <option value="1">1</option>',
							'        </select>',
							'        <script>',
							'        $("#witsec-mailform-recaptcha-score").val("' + a.projectSettings["witsec-mailform-recaptcha-score"] + '");',
							'        </script>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptchav3-div" ' + hideReCaptchaV3 + '>',
							'      <label for="witsec-mailform-recaptcha-hidebadge" class="col-sm-5 col-form-label">' + TR("Hide Badge") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-recaptcha-hidebadge" name="witsec-mailform-recaptcha-hidebadge" ' + (a.projectSettings["witsec-mailform-recaptcha-hidebadge"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptchaKeys-div" ' + hideReCaptchaKeys + '>',
							'      <div class="col-sm-12">',
							'        <small>* ' + TR("the secret key will be removed from the published project.mobirise file") + '</small>',
							'      </div>',
							'    </div>',
							'  </div>',

							'  <!-- TAB SMTP -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-smtp">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-smtp" class="col-sm-5 col-form-label">' + TR("Enable SMTP") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-smtp" name="witsec-mailform-smtp" ' + (a.projectSettings["witsec-mailform-smtp"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-host" class="col-sm-5 col-form-label">' + TR("Host") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-smtp-host" value="' + a.projectSettings["witsec-mailform-smtp-host"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-port" class="col-sm-5 col-form-label">' + TR("Port") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="number" class="form-control" id="witsec-mailform-smtp-port" min="0" max="65535" step="1" placeholder="25" value="' + a.projectSettings["witsec-mailform-smtp-port"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-secure" class="col-sm-5 col-form-label">' + TR("Use SSL/TLS") + '</label>',
							'      <div class="col-sm-5">',
							'        <select id="witsec-mailform-smtp-secure" name="witsec-mailform-smtp-secure" class="form-control" style="color:#fff">',
							'          <option value="">Off</option>',
							'          <option value="ssl">SSL</option>',
							'          <option value="tls">TLS</option>',
							'        </select>',
							'        <script>',
							'        $("#witsec-mailform-smtp-secure").val("' + a.projectSettings["witsec-mailform-smtp-secure"] + '");',
							'        </script>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-username" class="col-sm-5 col-form-label">' + TR("Username") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-smtp-username" value="' + a.projectSettings["witsec-mailform-smtp-username"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-password" class="col-sm-5 col-form-label">' + TR("Password") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="password" class="form-control" id="witsec-mailform-smtp-password" value="' + a.projectSettings["witsec-mailform-smtp-password"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <label for="witsec-mailform-smtp-debug" class="col-sm-5 col-form-label">' + TR("Enable Debug") + '</label>',
							'      <div class="col-sm-1">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-smtp-debug" name="witsec-mailform-smtp-debug" ' + (a.projectSettings["witsec-mailform-smtp-debug"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'      <small class="col-sm-6">Only enable this when testing</small>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-smtp-div" ' + hideSMTP + '>',
							'      <div class="col-sm-12">',
							'        <small>* ' + TR("all SMTP details will be removed from the published project.mobirise file") + '</small><br>',
							'        <small>* ' + TR("SMTP may not work due to (firewall) settings on the web server") + '</small>',
							'      </div>',
							'    </div>',
							'  </div>',

							'  <!-- TAB ATTACHMENTS -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-attachments">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-attachments" class="col-sm-5 col-form-label">' + TR("Allow Attachments") + '</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-attachments" name="witsec-mailform-attachments" ' + (a.projectSettings["witsec-mailform-attachments"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-attachments-div" ' + hideAttachments + '>',
							'      <label for="witsec-mailform-attachments-mimetypes" class="col-sm-5 col-form-label">' + TR("Allowed Mime Types") + ' <a href="#" id="witsec-mailform-attachments-mimetypes-help">(?)</a></label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px; white-space:nowrap; text-transform:lowercase;" id="witsec-mailform-attachments-mimetypes">' + a.projectSettings["witsec-mailform-attachments-mimetypes"] + '</textarea>',
							'        <small id="witsec-mailform-attachments-mimetypes-default"><a href="#">' + TR("back to default") + '</a></small>',
							'      </div>',
							'    </div>',

							'</div>',
							'</form>'
						].join("\n"),
						buttons: [
							{
								label: TR("HELP"),
								default: !1,
								callback: function () {
									var help = "";

									if ( $("#ws-mf-tab-general").hasClass("active") ) {
										help = `
										<h4>Help - General</h4>

										<i>Default Recipient(s)</i><br>
										Enter one or more email addresses to which emails will be sent. Use commas to separate addresses.<br><br>

										<i>Address Book</i><br>
										You can store alternative recipients in the address book. First you choose an 'identifier' (ID), consisting of letters and/or numbers. The identifier is followed by a colon.
										After that, you can add one or more email addresses. Use commas to separate addresses.<br><br>

										Valid examples:<br>
										<code>john:j.doe@domain.com<br>
										support:customer.support@mydomain.com<br>
										management:cindy@business.com,dave@business.com,angela@business.com</code><br><br>

										You can refer to address book entries from a contact form block, using the identifier. In above examples, this would be <code>john</code>, <code>support</code> or
										<code>management</code>.<br><br>

										<i>From Email</i><br>
										This is the default email address that will be used as the sender of the form. This can be overridden under the 'Sender' tab.<br><br>

										<i>From Name</i><br>
										This is the default name that will be used as the sender of the form. This can be overridden under the 'Sender' tab.<br><br>

										<i>Email Template</i><br>
										This is the template that's used for all emails to the recipient(s). You can customize this text to your liking, you can even use HTML tags to style it.<br>
										It's possible to use variables in this template. The default template contains a field "{formdata}", which will be replaced with all a list of all form fields that were submitted.<br>
										You can also use specific form fields, for example "{name}". Any form field you define, will not be displayed when using "{formdata}", so they won't end up twice in the email.<br><br>

										<i>Disable Button after Submit</i><br>
										To prevent a form from being submited twice, you can disable the submit button after it's clicked. When the submit action is finished, the button will be enabled again. This also
										allows you to style the disabled state of the button using a Code Editor.
										`;
									}
									
									if ( $("#ws-mf-tab-sender").hasClass("active") ) {
										help = `
										<h4>Help - Sender</h4>

										<i>Sender as From Email</i><br>
										Use the sender's email address as the from address.<br><br>

										<i>Sender as Reply-To</i><br>
										Use the sender's email address as the reply-to address. When disabled, the default "From Email" will be used as the from address.<br><br>

										<i>Sender as From Name</i><br>
										Use the name of the sender as the email sender, if the name field(s) is/are part of the form data. When disabled, the default "From Name" will be used.<br><br>

										<i>Sender Name Form Field(s)</i><br>
										This option is only visible if "Sender as From Name" is enabled. This field contains the name(s) of the input field(s) that contain the name of the sender. For example, one
										form can have an input field named "name" where another form could have two input fields that make up the name; "firstname" and "lastname". You can use all those names here
										if you like: {name} {firstname} {lastname}. The script will check what fields are present in the form data and make up the name based on what you defined. The default value
										of this field is "{name}".
										`;
									}

									if ( $("#ws-mf-tab-autorespond").hasClass("active") ) {
										help = `
										<h4>Help - Autorespond</h4>

										<i>Subject</i><br>
										You can choose what the subject of the autorespond email should be. You can either use the form's subject or choose a "Custom Subject" which will be used for all forms. If
										you use the form's subject, you can also use an "Optional Form Prefix".<br><br>

										<i>Optional Subject Prefix</i><br>
										This option is only available if you use the form's subject. The prefix is optional and can be left empty. Example: if the prefix is "Re:" and the subject of the form is
										"A message from your website", the autorespond subject will be "Re: A message from your website".<br><br>

										<i>Custom Subject</i><br>
										This option is only available if you use a custom subject. The custom subject will be used for all autorespond emails.<br><br>

										<i>Email Template</i><br>
										This is the template that's used for all autorespond emails. You can customize this text to your liking, you can even use HTML tags to style it.<br>
										It's possible to use variables in this template. The default template contains a field "{formdata}", which will be replaced with all a list of all form fields that were submitted.<br>
										You can also use specific form fields, for example "{name}". Any form field you define, will not be displayed when using "{formdata}", so they won't end up twice in the email.
										`;
									}

									if ( $("#ws-mf-tab-recaptcha").hasClass("active") ) {
										help = `
										<h4>Help - CAPTCHA</h4>

										<i>Enable reCAPTCHA</i><br>
										Switch to enable/disable a CAPTCHA. You can choose to use Google's reCAPTCHA (v2 or v3) or choose the simple built-in CAPTCHA.<br><br>

										<i>Type</i><br>
										There are three types of CAPTCHAs to choose from. First there's the "Simple CAPTCHA", which displays a CAPTCHA code that the user has to enter. The form will only submit if the
										code is valid. The other two options are Google's reCAPTCHA v2 (which displays a visible checkbox) and reCAPTCHA v3 (which is invisible).<br><br>

										<i>Site Key</i><br>
										The site key is used to invoke reCAPTCHA service on your website. Both the site and secret keys can be generated from https://www.google.com/recaptcha/admin.<br><br>

										<i>Secret Key</i><br>
										The secret key authorizes communication between your website (through PHP) and the reCAPTCHA server to verify the user's response. The secret key needs to be kept safe for
										security purposes and will be removed from the published project.mobirise file.<br><br>

										<i>Score</i><br>
										reCAPTCHA v3 returns a score (1.0 is very likely a good interaction, 0.0 is very likely a bot). Based on the score, you can take variable action in the context of your site.<br><br>

										<i>Hide Badge</i><br>
										By default, reCAPTCHA v3 displays a badge on your website. This badge tells the visitor that reCAPTCHA is used (since it's invisible) and provides links to the Terms and Privacy
										pages of Google. You can choose to hide this badge, but you have to make sure to provide links to the Terms and Privacy pages, or Google may choose to discontinue further spam
										checking.
										`;
									}

									if ( $("#ws-mf-tab-smtp").hasClass("active") ) {
										help = `
										<h4>Help - SMTP</h4>

										<i>Enable SMTP</i><br>
										Switch to enable/disable SMTP. When enabled, emails will be sent from the SMTP server of your choice. For example, this could be the SMTP server of your domain or the SMTP
										server that's often offered by internet providers. Using SMTP to send emails is often more reliable than using the mail sending capabilities of web servers.<br><br>

										<i>Host</i><br>
										Hostname of the SMTP server. Check your hosting provider for the correct hostname.<br><br>

										<i>Port</i><br>
										Port number, this is often 25. It's recommended to use an encrypted connection, if your SMTP server supports this. TLS uses 587, SSL uses port 465. Check your SMTP provider
										for the correct port number.<br><br>

										<i>Use SSL/TLS</i><br>
										The SSL/TLS protocol encrypts internet traffic of all types, making secure internet communication possible. Use TLS if you can, SSL if you can't and 'None' when you must. Contact
										your SMTP provider about these settings if unsure.<br><br>

										<i>Username</i><br>
										The username of your SMTP account. Leave empty if authentication is not required.<br><br>

										<i>Password</i><br>
										The password of your SMTP account. Leave empty if authentication is not required.<br><br>

										<i>Enable Debug</i><br>
										When you run into issues using SMTP, consider enabling debug to try to help solve them. Only have this enabled when testing, turn this setting OFF when running in production.<br><br>

										<b>Important</b><br>
										SMTP may not work due to (firewall) settings on the web server. Be sure to check the status page: <code>assets/witsec-mailform/mail.php?status</code>.<br>
										SMTP details will be removed from a published project.mobirise file and are ONLY stored inside the "mail.php" file, located in assets/witsec-mailform/.
										`;
									}

									if ( $("#ws-mf-tab-attachments").hasClass("active") ) {
										help = `
										<h4>Help - File Attachments</h4>

										<i>Enable Attachments</i><br>
										Switch to allow/disallow file attachments. When this option is enabled and a form has one or more file inputs, these files will be processed and validated when the form is
										submitted. If a file matches any of the allowed Mime Types, it will be added as attachment to the email that's sent to the recipient(s). When this option is switched off,
										any file inputs a form may have will be ignored.<br><br>

										<i>Allowed Mime Types</i><br>
										Mime Types are labels used to identify types of data. For security reasons, you decide what types of files someone can send from your forms. Mime types are much more reliable
										than file extensions.<br>
										A default set of commonly used (and safe) mime types is provided. It's possible to use wildcards (*), but only at the end. For example <code>image/*</code>.
										`;
									}

									// Display the help dialog
									mbrApp.alertDlg(help);
									return false;
								}
							},
							{
								label: TR("CANCEL"),
								default: !1,
								callback: function () {
								}
							},
							{
								label: TR("OK"),
								default: !0,
								callback: function () {
									// Validate TO email address
									if (/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/i.test($("#witsec-mailform-to").val()) == false) {
										mbrApp.alertDlg( TR("Please supply a valid email address for Recipient(s).") );
										return false;
									}

									// Validate additional TO email addresses
									if ($("#witsec-mailform-to-alt").val() != "") {
										let mt = $("#witsec-mailform-to-alt").val().split("\n");

										for (let i=0; i<mt.length; i++) {
											if ( !/^[0-9a-zA-Z]+:(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/.test(mt[i]) ) {
												mbrApp.alertDlg( TR("Additional Recipient '%recipient%' contains one or more invalid characters.").replace(/%(.+)%/, mt[i]) );
												return false;
											}
										}
									}

									// Validate FROM email address
									if (/^\s?[^\s,]+@[^\s,]+\.[^\s,]+$/i.test($("#witsec-mailform-from").val()) == false) {
										mbrApp.alertDlg( TR("Please supply a valid email address for From Email.") );
										return false;
									}

									// Make sure the name is set
									if ($("#witsec-mailform-from-name").val().trim() == "") {
										mbrApp.alertDlg( TR("The From Name cannot be empty.") );
										return false;
									}

									// Don't allow the use of double quotes in the from name
									if (/"/.test($("#witsec-mailform-from-name").val()) == true) {
										mbrApp.alertDlg( TR("You can't use double quotes in the From Name.") );
										return false;
									}

									// Check if autorespond Custom Subject contains a value if it's active
									if ($("#witsec-mailform-autorespond-subjecttype").val() == "1" && $("#witsec-mailform-autorespond-subject").val().trim() == "") {
										mbrApp.alertDlg( TR("The Custom Subject cannot be empty.") );
										return false;
									}

									// If reCAPTCHA is enabled and v2 or v3 is selected, check if the keys are set
									if ($("#witsec-mailform-recaptcha").prop("checked") && $("#witsec-mailform-recaptcha-version option:selected").val() != "captcha" && ($("#witsec-mailform-recaptcha-sitekey").val().trim() == "" || $("#witsec-mailform-recaptcha-secretkey").val().trim() == "")) {
										mbrApp.alertDlg( TR("The reCAPTCHA Site Key and Secret Key must contain a value.") );
										return false;
									}

									// If SMTP is enabled, check if all required fields have been filled in
									if ($("#witsec-mailform-smtp").prop("checked") && ($("#witsec-mailform-smtp-host").val().trim() == "" || $("#witsec-mailform-smtp-port").val().trim() == "")) {
										mbrApp.alertDlg( TR("Please supply all required SMTP fields.") );
										return false;
									}

									// Check if Mime Types only allowed characters
									if ($("#witsec-mailform-attachments").prop("checked") && /^[\na-z0-9\+\*\-\.\/]*$/.test($("#witsec-mailform-attachments-mimetypes").val()) == false) {
										mbrApp.alertDlg( TR("Mime Types contain one or more invalid characters.") );
										return false;
									}

									// Everything seems OK, let's save it
									a.projectSettings["witsec-mailform-to"]                        =  $("#witsec-mailform-to").val();
									a.projectSettings["witsec-mailform-to-alt"]                    =  $("#witsec-mailform-to-alt").val();
									a.projectSettings["witsec-mailform-from"]                      =  $("#witsec-mailform-from").val();
									a.projectSettings["witsec-mailform-from-them"]                 =  $("#witsec-mailform-from-them").prop("checked");
									a.projectSettings["witsec-mailform-from-them-replyto"]         =  $("#witsec-mailform-from-them-replyto").prop("checked");
									a.projectSettings["witsec-mailform-from-name"]                 =  $("#witsec-mailform-from-name").val();
									a.projectSettings["witsec-mailform-from-name-them"]            =  $("#witsec-mailform-from-name-them").prop("checked");
									a.projectSettings["witsec-mailform-from-name-them-field"]      =  $("#witsec-mailform-from-name-them-field").val();
									a.projectSettings["witsec-mailform-template"]                  =  $("#witsec-mailform-template").val();
									a.projectSettings["witsec-mailform-autorespond-subjectprefix"] =  $("#witsec-mailform-autorespond-subjectprefix").val();
									a.projectSettings["witsec-mailform-autorespond-subject"]       = ($("#witsec-mailform-autorespond-subjecttype").val() == "0" ? "" : $("#witsec-mailform-autorespond-subject").val().trim());
									a.projectSettings["witsec-mailform-autorespond-template"]      =  $("#witsec-mailform-autorespond-template").val();
									a.projectSettings["witsec-mailform-recaptcha"]                 =  $("#witsec-mailform-recaptcha").prop("checked");
									a.projectSettings["witsec-mailform-recaptcha-version"]         =  $("#witsec-mailform-recaptcha-version option:selected").val();
									a.projectSettings["witsec-mailform-recaptcha-sitekey"]         =  $("#witsec-mailform-recaptcha-sitekey").val();
									a.projectSettings["witsec-mailform-recaptcha-secretkey"]       =  $("#witsec-mailform-recaptcha-secretkey").val();
									a.projectSettings["witsec-mailform-recaptcha-score"]           =  $("#witsec-mailform-recaptcha-score option:selected").val();
									a.projectSettings["witsec-mailform-recaptcha-hidebadge"]       =  $("#witsec-mailform-recaptcha-hidebadge").prop("checked");
									a.projectSettings["witsec-mailform-disable-button"]            =  $("#witsec-mailform-disable-button").prop("checked");
									a.projectSettings["witsec-mailform-smtp"]                      =  $("#witsec-mailform-smtp").prop("checked");
									a.projectSettings["witsec-mailform-smtp-debug"]                = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-debug").prop("checked") : false);
									a.projectSettings["witsec-mailform-smtp-host"]                 = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-host").val() : "");
									a.projectSettings["witsec-mailform-smtp-port"]                 = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-port").val() : "");
									a.projectSettings["witsec-mailform-smtp-secure"]               = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-secure option:selected").val() : "");
									a.projectSettings["witsec-mailform-smtp-username"]             = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-username").val() : "");
									a.projectSettings["witsec-mailform-smtp-password"]             = ($("#witsec-mailform-smtp").prop("checked") ? $("#witsec-mailform-smtp-password").val() : "");
									a.projectSettings["witsec-mailform-attachments"]               =  $("#witsec-mailform-attachments").prop("checked");
									a.projectSettings["witsec-mailform-attachments-mimetypes"]     =  $("#witsec-mailform-attachments-mimetypes").val().replace(/(\n){2,}/g, "$1").trim();
									mbrApp.runSaveProject();
								}
							}
						]
					})
				});

				// Do things for a single block only
				a.Core.addFilter("getResultHTMLcomponent", function (html, block) {

					// Only do things if the mailform has been enabled AND the current section contains a witsec form (aka a form tag containing 'witsecSendMail')
					//if (a.projectSettings["witsec-mailform"] && /<\s*form[^>]*witsecSendMail[^>]*>/gmi.test(html)) {
					if (a.projectSettings["witsec-mailform"] && /<\s*section[^>]*witsec-mailform[^>]*>/gmi.test(html)) {

						// Make sure the 'witsec-mailform' plugin is loaded (forms prior to v11 don't have this). Not required for M3
						if (mbrApp.theme.type === "secondary")
							CheckForPlugin(block);

						// Read the php file from this addon's directory, we'll write the contents later (in publishTemplating)
						$.get(mbrApp.getAddonsDir() + '/witsec-mailform/scripts/mail.php', function (data) {
							// Replace the variables with the correct values
							php = data;
							php = php.replace(/{to}/g, a.projectSettings["witsec-mailform-to"]);
							php = php.replace(/{to-alt}/g, a.projectSettings["witsec-mailform-to-alt"].replace(/\n/g, "\\n") );
							php = php.replace(/{from}/g, a.projectSettings["witsec-mailform-from"]);
							php = php.replace(/{from-them}/g, (a.projectSettings["witsec-mailform-from-them"] ? "1" : "0"));
							php = php.replace(/{from-them-replyto}/g, (a.projectSettings["witsec-mailform-from-them-replyto"] ? "1" : "0"));
							php = php.replace(/{from-name}/g, a.projectSettings["witsec-mailform-from-name"]);
							php = php.replace(/{from-name-them}/g, (a.projectSettings["witsec-mailform-from-name-them"] ? "1" : "0"));
							php = php.replace(/{from-name-them-field}/g, (a.projectSettings["witsec-mailform-from-name-them-field"] ? a.projectSettings["witsec-mailform-from-name-them-field"] : "{name}"));
							php = php.replace(/{autorespond-subjectprefix}/g, a.projectSettings["witsec-mailform-autorespond-subjectprefix"]);
							php = php.replace(/{autorespond-subject}/g, a.projectSettings["witsec-mailform-autorespond-subject"]);
							php = php.replace(/{autorespond-template}/g, a.projectSettings["witsec-mailform-autorespond-template"].replace(/\n/g, "<br>").replace(/"/g, "\\\""));
							php = php.replace(/{template}/g, a.projectSettings["witsec-mailform-template"].replace(/\n/g, "<br>").replace(/"/g, "\\\""));
							php = php.replace(/{recaptcha}/g, (a.projectSettings["witsec-mailform-recaptcha"] ? "1" : "0"));
							php = php.replace(/{recaptcha-version}/g, (a.projectSettings["witsec-mailform-recaptcha-version"] || "3") );
							php = php.replace(/{recaptcha-secretkey}/g, a.projectSettings["witsec-mailform-recaptcha-secretkey"]);
							php = php.replace(/{recaptcha-score}/g, a.projectSettings["witsec-mailform-recaptcha-score"]);
							php = php.replace(/{smtp}/g, (a.projectSettings["witsec-mailform-smtp"] ? "1" : "0"));
							php = php.replace(/{smtp-debug}/g, (a.projectSettings["witsec-mailform-smtp-debug"] ? "1" : "0"));
							php = php.replace(/{smtp-host}/g, a.projectSettings["witsec-mailform-smtp-host"]);
							php = php.replace(/{smtp-port}/g, a.projectSettings["witsec-mailform-smtp-port"]);
							php = php.replace(/{smtp-secure}/g, a.projectSettings["witsec-mailform-smtp-secure"]);
							php = php.replace(/{smtp-username}/g, a.projectSettings["witsec-mailform-smtp-username"]);
							php = php.replace(/{smtp-password}/g, a.projectSettings["witsec-mailform-smtp-password"]);
							php = php.replace(/{attachments}/g, (a.projectSettings["witsec-mailform-attachments"] ? "1" : "0"));
							php = php.replace(/{attachments-mimetypes}/g, a.projectSettings["witsec-mailform-attachments-mimetypes"].replace(/\n/g, ",").trim());
						});

						// If simple CAPTCHA or reCAPTCHA v2 is used, but the "g-recaptcha" <div> isn't present, we can add it. This is the var we use for that
						var rcpCaptchaDiv = "";

						// If CAPTCHA is enabled...
						if (a.projectSettings["witsec-mailform-recaptcha"]) {

							// If we're dealing with reCAPTCHA v2 or v3
							if (a.projectSettings["witsec-mailform-recaptcha-version"] == "2" || a.projectSettings["witsec-mailform-recaptcha-version"] == "3") {
								// Add reCAPTCHA Javascript and sitekey to the page
								var scripts = "";
								if (a.projectSettings["witsec-mailform-recaptcha-version"] == "3") {
									scripts = "\n<script>var witsecRcpSitekey = \"" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\";</script>";
									scripts += "\n<script src=\"https://www.google.com/recaptcha/api.js?render=" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\"></script>";

									// If the user chose to hide the badge
									if (a.projectSettings["witsec-mailform-recaptcha-hidebadge"]) {
										scripts += "\n<style>.grecaptcha-badge { display: none !important;}</style>";
									}
								} else
									scripts = "\n<script src=\"https://www.google.com/recaptcha/api.js\" async defer></script>";

								// Replace the section tag with 'itself' and add the scripts
								html = html.replace(/(<\s*section[^>]*>)/gmi, "$1\n" + scripts);
							}

							// If we're using reCAPTCHA v2, check if the "g-recaptcha" <div> exists. If it doesn't, add it
							if (a.projectSettings["witsec-mailform-recaptcha-version"] == "2") {
								var patternAll = /<\s*div[^>]*class=['"][^>]*g-recaptcha[^>]*['"][^>]*>[\w\W]*?<\/div>/mi;	// Grab entire element
								var patternBegin = /(<\s*div[^>]*class=['"][^>]*g-recaptcha[^>]*['"][^>]*)>/mi;				// Grab begin tag only
	
								if (patternAll.test(html))
									html = html.replace(patternBegin, "$1 data-sitekey=\"" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\">");
								else
									rcpCaptchaDiv = "<div class=\"g-recaptcha\" data-sitekey=\"" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\"></div>" + "\n";
							}

							// If we're using simple CAPTCHA, check if the "g-recaptcha" <div> exists. If it doesn't, add it
							if (a.projectSettings["witsec-mailform-recaptcha-version"] == "captcha") {
								var pattern = /(<\s*div[^>]*class=['"][^>]*g-recaptcha)()([^>]*['"][^>]*>)([\w\W]*?)(<\/div>)/mi;
								var captcha = `
									<div class="input-group-prepend">
										<div class="input-group-text captcha" style="background: url(assets/witsec-mailform/captcha.php) repeat-y left center; background-repeat: no-repeat; background-color: #cccccc; width: 72px; flex:none;"></div>
									</div>
									<input type="text" class="form-control" name="captcha" required maxlength="6" placeholder="Captcha" style="flex:none; width:120px; font-family:monospace; font-size:12pt">
									<div class="captchaReload" style="display: flex; align-items: center; border: none; background-color: inherit; padding-left: 5px; cursor: pointer">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
											<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"></path>
											<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"></path>
										</svg>
									</div>`;

								if (pattern.test(html))
									html = html.replace(pattern, "$1 input-group$3" + captcha + "$4$5");
								else
									rcpCaptchaDiv = `<div class="input-group col-md-12 mb-3 p-0">` + captcha + `</div>` + "\n";
							}
						}
						
						// If reCAPTCHA is disabled or if it's enabled AND we're using v3, remove the "g-recaptcha" <div>
						if ( !a.projectSettings["witsec-mailform-recaptcha"] || (a.projectSettings["witsec-mailform-recaptcha"] && a.projectSettings["witsec-mailform-recaptcha-version"] == "3") )
							html = html.replace(/<\s*div[^>]*class=['"][^>]*g-recaptcha[^>]*['"][^>]*>[\w\W]*?<\/div>/mi, "");
						
						// If the submit button needs to be disabled when the form is sent
						if (a.projectSettings["witsec-mailform-disable-button"]) {
							html = html.replace(/(<\s*form[^>]*>)/gmi, "$1\n" + "<input type=\"hidden\" name=\"disableButton\" value=\"1\">");
						}

						// Change the <a> submit button to an actual <button> and if applicable, add the "g-recaptcha" <div> (if we made that earlier)
						html = html.replace(/(<\s*)a([^>]*type=['"]{1}submit['"]{1}[^>]*>[\w\W]*?)(<\/a>)/gmi, rcpCaptchaDiv + "$1button$2</button>");

						// Put the values of the witsec-html attribute inside the tag that has it
						html = html.replace(/(<\s*(\w+)[^<]*?)\s+witsec-html=['"]([^"']*)['"]([^>]*?)\s*>[\w\W]*?(<\/\2>)/gm, "$1$4>$3$5");

						// Replace mbr-required with "required" or ""
						html = html.replace(/(<\s*[^>]*)(witsec-required=['"](true|false)['"])/gmi, function(match, $1, $2, $3) {
							return $1 + ($3 == "true" ? "required": "");
						});
					}

					return html;
				});

				// Add our own files to the list of to-publish files
				a.addFilter("publishFiles", function (b, c) {
					// Only add this file to the export list if the mailform is enabled
					if (a.projectSettings["witsec-mailform"]) {
						b.push(
							{ srcList: [{ src: "mail.php", filter: "template" }], dest: "assets/witsec-mailform/mail.php" }
						);
					}

					return b
				});

				// Loop through all the files that need to be published (this is all the files of the website, plus whatever we defined ourselves), this saves the 'parsed' php to an actual file
				a.addFilter("publishTemplating", function (b, filename) {
					if (a.projectSettings["witsec-mailform"]) {
						// Return the 'parsed' PHP
						if (filename == "mail.php") {
							return php;
						}

						// Empty sensitive variables from the (exported) project.mobirise file
						if (filename == "project.mobirise")
							b = b.replace(/("witsec-mailform-recaptcha-secretkey": ")(.+)(",)/g, "$1$3");
							b = b.replace(/("witsec-mailform-smtp-host": ")(.+)(",)/g, "$1$3");
							b = b.replace(/("witsec-mailform-smtp-port": ")(.+)(",)/g, "$1$3");
							b = b.replace(/("witsec-mailform-smtp-secure": ")(.+)(",)/g, "$1$3");
							b = b.replace(/("witsec-mailform-smtp-username": ")(.+)(",)/g, "$1$3");
							b = b.replace(/("witsec-mailform-smtp-password": ")(.+)(",)/g, "$1$3");
							return b;
					}

					// Return the default
					return b
				});

				// Function to check for 'witsec-mailform' plugin
				function CheckForPlugin(block) {
					// Let's read the 'plugins' attribute, if present
					var attr = $(block._customHTML).attr("plugins");
					if (typeof attr !== typeof undefined && attr !== false && attr.includes("witsec-mailform"))	{ // Has attribute
						// All good!
					} else {
						// Plugin not present, we're dealing with an older form
						mbrApp.showDialog({
							title: "Change required to witsec Mail Form section",
							className: "",
							body: [
								"From v11 of the witsec Mailform extension, all required Javascript and PHP files are automatically loaded. This requires the 'witsec-mailform' plugin to be loaded. You can add this yourself using a Code Editor:<br><br>",
								"",
								"Example:<br>",
								"<code>&lt;section class=\"witsec-mailform\" plugins=\"witsec-mailform\"&gt;</code><br><br>",
								"",
								"Alternatively, if you want us to change it for you, simply click the 'CHANGE' button below and republish your website. To be on the safe side, make sure you have backups of your project before continuing.",
							].join("\n"),
							buttons: [
								{
									label: "CHANGE",
									default: !1,
									callback: function() {
										try {
											// Check if 'plugins' attribute was present
											if (typeof attr !== typeof undefined && attr !== false)
												block._customHTML = block._customHTML.replace(/(<\s*section[^>]*plugins=['"])([^>]*>)/gmi, "$1witsec-mailform $2");
											else
												block._customHTML = block._customHTML.replace(/(<\s*section)/gmi, "$1 plugins=\"witsec-mailform\"");

											mbrApp.alertDlg("Change succesful. Please republish your website.");
										}
										catch(err) {
											mbrApp.alertDlg(err.name + ': ' + err.message);
										}
									}
								},
								{
									label: "OK",
									default: !0,
									callback: function() {
									}
								}
							]
						});
					}
				}

			}
		}
	})
}, ["jQuery", "mbrApp", "TR()"]);