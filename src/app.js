(function(jQuery, mbrApp) {
	mbrApp.regExtension({
		name: "witsec-mailform",
		events: {
			
			load: function() {
				var a = this;
				var php = "";

				a.addFilter("publishHTML", function(b) {
					// If you make use of the custom mailform...
					if (a.projectSettings["witsec-mailform"] == "on" && a.projectSettings["witsec-mailform-to"] != "") {
						// Read the php file from this addon's directory, we'll write the contents later (in publishTemplating)
						$.get(mbrApp.getAddonsDir() + '/witsec-mailform/php/mail.php', function(data) {
							// Replace the variables with the correct values
							php = data;
							php = php.replace(/{to}/g, a.projectSettings["witsec-mailform-to"]);
							php = php.replace(/{from}/g, a.projectSettings["witsec-mailform-from"]);
							php = php.replace(/{from-name}/g, a.projectSettings["witsec-mailform-from-name"]);
							php = php.replace(/{template}/g, a.projectSettings["witsec-mailform-template"].replace(/\n/g, "<br />").replace(/"/g, "\\\""));
						});
					}

					return b
				});

				// Add the Custom Mailform switch to the Site Settings menu
				a.addFilter("additionalPageSettings", function(b) {
					return b + [
						'<hr />',
						'<div class="form-group row clearfix">',
						'  <label class="col-md-3 control-label" style="white-space:nowrap">Custom Mailform</label>',
						'  <div class="col-md-6">',
						'    <div class="togglebutton">',
						'      <label style="width: 100%">',
						'        <input type="checkbox" id="witsec-mailform" name="witsec-mailform" ' + (a.projectSettings["witsec-mailform"] == "on" ? "checked" : "") + ">",
						'        <span class="toggle" style="margin-top: -6px;"></span>',
						'      </label>',
						'    </div>',
						'  </div>',
						'  <div class="col-md-2">',
						'    <button class="btn btn-primary" id="witsec-mailform-editbtn" type="button" ' + (a.projectSettings["witsec-mailform"] == "on" ? "" : 'style="display:none;"') + ' data-toggle="tooltip" data-placement="top" title="Edit mailform settings">Edit</button>',
						'  </div>',
						'  <div class="col-md-1" style="font-size:10px" data-toggle="tooltip" data-placement="top" title="This extension features a Contact Form block, accompanied with a PHP mailform, which will be generated within Mobirise.">witsec&nbsp;</div>',
						'</div>'
					].join("")
				});

				// Respond to enabling/disabling mailform by showing/hiding the edit button
				mbrApp.$body.on("change", "#witsec-mailform", function() {
					if ($("#witsec-mailform").prop("checked")) {
						$("#witsec-mailform-editbtn").show();

						// Open the settings window
						$("#witsec-mailform-editbtn").trigger("click");
					}
					else {
						$("#witsec-mailform-editbtn").hide();
						a.projectSettings["witsec-mailform"] = "";
					}
				});

				// Show settings window
				a.$body.on("click", "#witsec-mailform-editbtn", function() {
					// Set default e-mail template
					template = "Hi,\n\nYou have received a new message from your website.\n\nName: {name}\nE-mail: {email}\nPhone: {phone}\nMessage:\n{message}\n\nDate: {date}\nRemote IP: {ip}\n\nHave a nice day.";

					// Do a check if mailform values have been set, otherwise set it to something default
					a.projectSettings["witsec-mailform-to"]        = a.projectSettings["witsec-mailform-to"]        || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from"]      = a.projectSettings["witsec-mailform-from"]      || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from-name"] = a.projectSettings["witsec-mailform-from-name"] || "Your Name";
					a.projectSettings["witsec-mailform-template"]  = a.projectSettings["witsec-mailform-template"]  || template;

					// Display modal window with settings
					mbrApp.showDialog({
						title: "Mailform Settings",
						className: "",
						body: [
							'<form>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-to" class="col-sm-3 col-form-label">To Email</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-to" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-to"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from" class="col-sm-3 col-form-label">From Email</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-name" class="col-sm-3 col-form-label">From Name</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from-name" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from-name"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-template" class="col-sm-3 col-form-label">Email Template</label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px" id="witsec-mailform-template">' + a.projectSettings["witsec-mailform-template"] + '</textarea>',
							'      </div>',
							'    </div>',
							'</form>'
						].join("\n"),
						buttons: [
						{
							label: "HELP",
							default: !0,
							callback: function() {
								mbrApp.alertDlg("<b>Variables</b><br />You can use the following variables in the mail template:<br /><br />{name}, {email}, {phone}, {message}, {date} and {ip}<br /><br />These variables will automatically be replaced with the values entered by the sender. Except for {date} and {ip}, those will be replaced with the server time and visitor's IP address.<br /><br /><b>Styling</b><br />You can style the body of the e-mail by using HTML tags in the mail template.");
								return false;
							}
						},
						{
							label: "SAVE",
							default: !0,
							callback: function() {
								// Validate TO e-mail address
								if ( /^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i.test( $("#witsec-mailform-to").val() ) == false ) {
									mbrApp.alertDlg("Please supply a valid e-mail address for To Email.");
									return false;
								}

								// Validate FROM e-mail address
								if ( /^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i.test( $("#witsec-mailform-from").val() ) == false ) {
									mbrApp.alertDlg("Please supply a valid e-mail address for From Email.");
									return false;
								}

								// Make sure the name is set
								if ( $("#witsec-mailform-from-name").val().trim() == "" ) {
									mbrApp.alertDlg("The From Name cannot be empty.");
									return false;
								}

								// Don't allow the use of double quotes in the from name
								if ( /"/.test( $("#witsec-mailform-from-name").val() ) == true ) {
									mbrApp.alertDlg("You can't use double quotes in the From Name.");
									return false;
								}

								// Everything seems OK, let's save it
								a.projectSettings["witsec-mailform-to"]        = $("#witsec-mailform-to").val();
								a.projectSettings["witsec-mailform-from"]      = $("#witsec-mailform-from").val();
								a.projectSettings["witsec-mailform-from-name"] = $("#witsec-mailform-from-name").val();
								a.projectSettings["witsec-mailform-template"]  = $("#witsec-mailform-template").val();
							}
						},
						{
							label: "CANCEL",
							default: !0,
							callback: function() {
							}
						}
						]
					})
				});

				// Add our own file to the list of to-publish files
				a.addFilter("publishFiles", function(b, c) {
					a.projectSettings["witsec-mailform"] && b.push({
						srcList: [{
							src: "mail.php",
							filter: "template"
						}],
						dest: "mail.php"
					});
					return b
				});

				// Loop through all the files that need to be published (this is all the files of the website, plus whatever we defined ourselves), this saves the 'parsed' php to an actual file
				a.addFilter("publishTemplating", function(b, pageName) {
					return pageName == "mail.php" ? php : b
				})
			}
		}
	})
})(jQuery, mbrApp);