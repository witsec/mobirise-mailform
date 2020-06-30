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
					}
					else {
						$(".witsec-mailform-recaptcha-div").hide();
					}
				});

				// Respond to hiding the reCAPTCHA badge
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha-hidebadge", function () {
					if ($("#witsec-mailform-recaptcha-hidebadge").prop("checked")) {
						mbrApp.alertDlg("<h4>" + TR("Warning") + "</h4>" + TR("When you hide the reCAPTCHA badge, make sure to provide links to the Privacy and Terms pages of Google. The 'Terms' switch under the block options (gear icon) will do this for you. If you completely hide it, Google may choose to discontinue further spam checking."));
					}
				});

				// Show settings window
				a.$body.on("click", "#witsec-mailform-editbtn", function () {
					// Do a check if mailform values have been set, otherwise set it to something default
					a.projectSettings["witsec-mailform-to"] = a.projectSettings["witsec-mailform-to"] || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from"] = a.projectSettings["witsec-mailform-from"] || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from-them"] = a.projectSettings["witsec-mailform-from-them"] || false;
					a.projectSettings["witsec-mailform-from-them-replyto"] = a.projectSettings["witsec-mailform-from-them-replyto"] || false;
					a.projectSettings["witsec-mailform-from-name"] = a.projectSettings["witsec-mailform-from-name"] || "Your Name";
					a.projectSettings["witsec-mailform-from-name-them"] = a.projectSettings["witsec-mailform-from-name-them"] || false;
					a.projectSettings["witsec-mailform-from-name-them-field"] = a.projectSettings["witsec-mailform-from-name-them-field"] || "{name}";
					a.projectSettings["witsec-mailform-template"] = a.projectSettings["witsec-mailform-template"] || "Hi,\n\nYou have received a new message from your website.\n\n{formdata}\n\nDate: {date}\nRemote IP: {ip}\n\n---\nHave a nice day.";
					a.projectSettings["witsec-mailform-autorespond-subjectprefix"] = a.projectSettings["witsec-mailform-autorespond-subjectprefix"] || "Re:";
					a.projectSettings["witsec-mailform-autorespond-subject"] = a.projectSettings["witsec-mailform-autorespond-subject"] || "";
					a.projectSettings["witsec-mailform-autorespond-template"] = a.projectSettings["witsec-mailform-autorespond-template"] || "Hi {name},\n\nThank you for your message. We'll get back to you as soon as we can.\nHere's the information you sent us:\n\n{formdata}\n\n---\nHave a nice day.";
					a.projectSettings["witsec-mailform-recaptcha"] = a.projectSettings["witsec-mailform-recaptcha"] || false;
					a.projectSettings["witsec-mailform-recaptcha-sitekey"] = a.projectSettings["witsec-mailform-recaptcha-sitekey"] || "";
					a.projectSettings["witsec-mailform-recaptcha-secretkey"] = a.projectSettings["witsec-mailform-recaptcha-secretkey"] || "";
					a.projectSettings["witsec-mailform-recaptcha-score"] = a.projectSettings["witsec-mailform-recaptcha-score"] || "0.5";
					a.projectSettings["witsec-mailform-disable-button"] = a.projectSettings["witsec-mailform-disable-button"] || false;

					// Show or hide the "Sender Form Name Field" field, based on whether "Sender as From Name" is checked
					var hideFromNameThemField = (a.projectSettings["witsec-mailform-from-name-them"] == false ? "style='display:none'" : "");

					// Show or hide Subject Prefix
					var hideSubjectPrefix = (a.projectSettings["witsec-mailform-autorespond-subject"] != "" ? "style='display:none'" : "");

					// Show or hide Subject Prefix
					var hideCustomSubject = (a.projectSettings["witsec-mailform-autorespond-subject"] ? "" : "style='display:none'");

					// Show or hide extra reCAPTCHA fields
					var hideReCaptcha = (a.projectSettings["witsec-mailform-recaptcha"] ? "" : "style='display:none'");

					// Display modal window with settings
					mbrApp.showDialog({
						title: TR("Mailform Settings"),
						className: "",
						body: [
							'<style>',
							'.nav .active .ws-mf-pills { background-color:#69c9d6 !important }',
							'.nav :not(.active) .ws-mf-pills { color:#000 !important }',
							'</style>',

							'<ul class="nav nav-pills">',
							'  <li class="active"><a href="#ws-mf-tab-general" data-toggle="tab" class="ws-mf-pills">' + TR("General") + '</a></li>',
							'  <li><a href="#ws-mf-tab-sender" data-toggle="tab" class="ws-mf-pills">' + TR("Sender") + '</a></li>',
							'  <li><a href="#ws-mf-tab-autorespond" data-toggle="tab" class="ws-mf-pills">' + TR("Autorespond") + '</a></li>',
							'  <li><a href="#ws-mf-tab-recaptcha" data-toggle="tab" class="ws-mf-pills">reCAPTCHA</a></li>',
							'</ul>',

							'<!-- TABS -->',
							'<form>',
							'<div class="tab-content">',

							'  <!-- TAB GENERAL -->',
							'  <div class="tab-pane active fade in" id="ws-mf-tab-general">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-to" class="col-sm-5 col-form-label">' + TR("Recipient(s)") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-to" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-to"] + '">',
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
							'        <small>* ' + TR("using reply-to instead of from often avoids e-mails being marked as spam") + '</small>',
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

							'  <!-- TAB RECAPTCHA -->',
							'  <div class="tab-pane fade" id="ws-mf-tab-recaptcha">',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-recaptcha" class="col-sm-5 col-form-label">reCAPTCHA v3</label>',
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
							'      <label for="witsec-mailform-recaptcha-sitekey" class="col-sm-5 col-form-label">' + TR("Site Key") + '</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-sitekey" value="' + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
							'      <label for="witsec-mailform-recaptcha-secretkey" class="col-sm-5 col-form-label">' + TR("Secret Key") + ' *</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-secretkey" value="' + a.projectSettings["witsec-mailform-recaptcha-secretkey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
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
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
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
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
							'      <div class="col-sm-12">',
							'        <small>* ' + TR("the secret key will be removed from the published project.mobirise file") + '</small>',
							'      </div>',
							'    </div>',
							'  </div>',
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

										<i>Recipient(s)</i><br>
										Enter one or more e-mail addresses to which e-mails will be sent. Use commas to separate addresses.<br><br>

										<i>From Email</i><br>
										This is the default e-mail address that will be used as the sender of the form. This can be overridden under the 'Sender' tab.<br><br>

										<i>From Name</i><br>
										This is the default name that will be used as the sender of the form. This can be overridden under the 'Sender' tab.<br><br>

										<i>Email Template</i><br>
										This is the template that's used for all e-mails to the recipient(s). You can customize this text to your liking, you can even use HTML tags to style it.<br>
										It's possible to use variables in this template. The default template contains a field "{formdata}", which will be replaced with all a list of all form fields that were submitted.<br>
										You can also use specific form fields, for example "{name}". Any form field you define, will not be displayed when using "{formdata}", so they won't end up twice in the e-mail.<br><br>

										<i>Disable Button after Submit</i><br>
										To prevent a form from being submited twice, you can disable the submit button after it's clicked. When the submit action is finished, the button will be enabled again. This also
										allows you to style the disabled state of the button using a Code Editor.
										`;
									}
									
									if ( $("#ws-mf-tab-sender").hasClass("active") ) {
										help = `
										<h4>Help - Sender</h4>

										<i>Sender as From Email</i><br>
										Use the sender's e-mail address as the from address.<br><br>

										<i>Sender as Reply-To</i><br>
										Use the sender's e-mail address as the reply-to address. When disabled, the default "From Email" will be used as the from address.<br><br>

										<i>Sender as From Name</i><br>
										Use the name of the sender as the e-mail sender, if the name field(s) is/are part of the form data. When disabled, the default "From Name" will be used.<br><br>

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
										You can choose what the subject of the autorespond e-mail should be. You can either use the form's subject or choose a "Custom Subject" which will be used for all forms. If
										you use the form's subject, you can also use an "Optional Form Prefix".<br><br>

										<i>Optional Subject Prefix</i><br>
										This option is only available if you use the form's subject. The prefix is optional and can be left empty. Example: if the prefix is "Re:" and the subject of the form is
										"A message from your website", the autorespond subject will be "Re: A message from your website".<br><br>

										<i>Custom Subject</i><br>
										This option is only available if you use a custom subject. The custom subject will be used for all autorespond e-mails.<br><br>

										<i>Email Template</i><br>
										This is the template that's used for all autorespond e-mails. You can customize this text to your liking, you can even use HTML tags to style it.<br>
										It's possible to use variables in this template. The default template contains a field "{formdata}", which will be replaced with all a list of all form fields that were submitted.<br>
										You can also use specific form fields, for example "{name}". Any form field you define, will not be displayed when using "{formdata}", so they won't end up twice in the e-mail.<br><br>
										`;
									}

									if ( $("#ws-mf-tab-recaptcha").hasClass("active") ) {
										help = `
										<h4>Help - Recaptcha</h4>

										<i>reCAPTCHA v3</i><br>
										Switch to enable/disabled reCAPTCHA.<br><br>

										<i>Site Key</i><br>
										The site key is used to invoke reCAPTCHA service on your website.<br><br>

										<i>Secret Key</i><br>
										The secret key authorizes communication between your website (through PHP) and the reCAPTCHA server to verify the user's response. The secret key needs to be kept safe for
										security purposes and will be removed from the published project.mobirise file.<br><br>

										<i>Score</i><br>
										reCAPTCHA v3 returns a score (1.0 is very likely a good interaction, 0.0 is very likely a bot). Based on the score, you can take variable action in the context of your site.<br><br>

										<i>Hide Badge</i><br>
										By default, reCAPTCHA v3 displays a badge on your website. This badge tells the visitor that reCAPTCHA is used (since it's invisible) and provides links to the Terms and Privacy
										pages of Google. You can choose to hide this badge, but you have to make sure to provide links to the Terms and Privacy pages, or Google may choose to discontinue further spam
										checking.<br><br>
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
									// Validate TO e-mail address
									if (/^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/i.test($("#witsec-mailform-to").val()) == false) {
										mbrApp.alertDlg( TR("Please supply a valid e-mail address for Recipient(s).") );
										return false;
									}

									// Validate FROM e-mail address
									if (/^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i.test($("#witsec-mailform-from").val()) == false) {
										mbrApp.alertDlg( TR("Please supply a valid e-mail address for From Email.") );
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

									// If reCAPTCHA is enabled, check if any values have been set
									if ($("#witsec-mailform-recaptcha").prop("checked") && ($("#witsec-mailform-recaptcha-sitekey").val().trim() == "" || $("#witsec-mailform-recaptcha-secretkey").val().trim() == "")) {
										mbrApp.alertDlg( TR("The reCAPTCHA Site Key and Secret Key must contain a value.") );
										return false;
									}

									// Everything seems OK, let's save it
									a.projectSettings["witsec-mailform-to"] = $("#witsec-mailform-to").val();
									a.projectSettings["witsec-mailform-from"] = $("#witsec-mailform-from").val();
									a.projectSettings["witsec-mailform-from-them"] = $("#witsec-mailform-from-them").prop("checked");
									a.projectSettings["witsec-mailform-from-them-replyto"] = $("#witsec-mailform-from-them-replyto").prop("checked");
									a.projectSettings["witsec-mailform-from-name"] = $("#witsec-mailform-from-name").val();
									a.projectSettings["witsec-mailform-from-name-them"] = $("#witsec-mailform-from-name-them").prop("checked");
									a.projectSettings["witsec-mailform-from-name-them-field"] = $("#witsec-mailform-from-name-them-field").val();
									a.projectSettings["witsec-mailform-template"] = $("#witsec-mailform-template").val();
									a.projectSettings["witsec-mailform-autorespond-subjectprefix"] = $("#witsec-mailform-autorespond-subjectprefix").val();
									a.projectSettings["witsec-mailform-autorespond-subject"] = ($("#witsec-mailform-autorespond-subjecttype").val() == "0" ? "" : $("#witsec-mailform-autorespond-subject").val().trim());
									a.projectSettings["witsec-mailform-autorespond-template"] = $("#witsec-mailform-autorespond-template").val();
									a.projectSettings["witsec-mailform-recaptcha"] = $("#witsec-mailform-recaptcha").prop("checked");
									a.projectSettings["witsec-mailform-recaptcha-sitekey"] = $("#witsec-mailform-recaptcha-sitekey").val();
									a.projectSettings["witsec-mailform-recaptcha-secretkey"] = $("#witsec-mailform-recaptcha-secretkey").val();
									a.projectSettings["witsec-mailform-recaptcha-score"] = $("#witsec-mailform-recaptcha-score option:selected").val();
									a.projectSettings["witsec-mailform-recaptcha-hidebadge"] = $("#witsec-mailform-recaptcha-hidebadge").prop("checked");
									a.projectSettings["witsec-mailform-disable-button"] = $("#witsec-mailform-disable-button").prop("checked");
								}
							}
						]
					})
				});

				// Do things for a single block only
				a.Core.addFilter("getResultHTMLcomponent", function (html, block) {

					// Only do things if the mailform has been enabled AND the current section contains a witsec form (aka a form tag containing 'witsecSendMail')
					if (a.projectSettings["witsec-mailform"] && /<\s*form[^>]*witsecSendMail[^>]*>/gmi.test(html)) {

						// Read the php file from this addon's directory, we'll write the contents later (in publishTemplating)
						$.get(mbrApp.getAddonsDir() + '/witsec-mailform/php/mail.php', function (data) {
							// Replace the variables with the correct values
							php = data;
							php = php.replace(/{to}/g, a.projectSettings["witsec-mailform-to"]);
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
							php = php.replace(/{recaptcha}/g, (a.projectSettings["witsec-mailform-recaptcha"] ? "3" : "0"));
							php = php.replace(/{recaptcha-secretkey}/g, a.projectSettings["witsec-mailform-recaptcha-secretkey"]);
							php = php.replace(/{recaptcha-score}/g, a.projectSettings["witsec-mailform-recaptcha-score"]);
						});

						// If reCAPTCHA is enabled...
						if (a.projectSettings["witsec-mailform-recaptcha"]) {

							// Add reCAPTCHA Javascript and sitekey to the page
							var scripts = "\n<script>var witsecRcpSitekey = \"" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\";</script>";
							scripts += "\n<script src=\"https://www.google.com/recaptcha/api.js?render=" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\"></script>";

							// If the user chose to hide the badge
							if (a.projectSettings["witsec-mailform-recaptcha-hidebadge"]) {
								scripts += "\n<style>.grecaptcha-badge { display: none !important;}</style>";
							}

							// Replace the section tag with 'itself' and add the scripts
							html = html.replace(/(<\s*section[^>]*>)/gmi, "$1\n" + scripts);
						}

						// If the submit button needs to be disabled when the form is sent
						if (a.projectSettings["witsec-mailform-disable-button"]) {
							html = html.replace(/(<\s*form[^>]*>)/gmi, "$1\n" + "<input type=\"hidden\" name=\"disableButton\" value=\"1\">");
						}

						// Change the <a> submit button to an actual <button>
						html = html.replace(/(<\s*)a([^>]*type=['"]{1}submit['"]{1}[^>]*>[\w\W]*?)(<\/a>)/gmi, "$1button$2</button>");

						// Put the values of the witsec-html attribute inside the tag that has it
						html = html.replace(/(<\s*[^<]+?)witsec-html=['"]{1}(.+)['"]{1}([^>]*>)[\w\W]*?(<\/.+>)/gmi, "$1$3$2$4");
					}

					return html;
				});

				// Add our own files to the list of to-publish files
				a.addFilter("publishFiles", function (b, c) {
					// Only add this file to the export list if the mailform is enabled
					if (a.projectSettings["witsec-mailform"]) {
						b.push({
							srcList: [{
								src: "mail.php",
								filter: "template"
							}],
							dest: "assets/witsec-mailform/mail.php"
						});
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

						// Remove the secret key from the published project.mobirise file if it's present
						if (filename == "project.mobirise" && a.projectSettings["witsec-mailform-recaptcha-secretkey"] != "")
							return b.replace(/("witsec-mailform-recaptcha-secretkey": ")(.+)(",)/g, "$1$3");
					}

					// Return the default
					return b
				});
			}
		}
	})
}, ["jQuery", "mbrApp", "TR()"]);