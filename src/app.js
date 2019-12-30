(function(jQuery, mbrApp) {
	mbrApp.regExtension({
		name: "witsec-mailform",
		events: {
			
			load: function() {
				var a = this;
				var php = "";

				// Add site settings
				a.addFilter("sidebarProjectSettings",function(b){
					var wm = a.projectSettings["witsec-mailform"] || false;

					var c = {
						title:"witsec",
						name:"witsec-site-settings",
						html:[
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
							'      <button class="btn btn-primary pull-right" id="witsec-mailform-editbtn" type="button">Edit</button>',
							'    </div>',
							'  </div>',
							'</div>'
						].join("\n")
					};
					b.push(c);
					return b
				});				

				// Respond to enabling/disabling mailform by showing/hiding the edit button
				mbrApp.$body.on("change", "#witsec-mailform", function() {
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

				// Respond to enabling/disabling "Use reCAPTCHA"
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha", function() {
					if ($("#witsec-mailform-recaptcha").prop("checked")) {
						$(".witsec-mailform-recaptcha-div").show();
					}
					else {
						$(".witsec-mailform-recaptcha-div").hide();
					}
				});

				// Respond to enabling/disabling "Sender as From Email"
				mbrApp.$body.on("change", "#witsec-mailform-from-them", function() {
					if ($("#witsec-mailform-from-them").prop("checked")) {
						$(".witsec-mailform-from-div").hide();
					}
					else {
						$(".witsec-mailform-from-div").show();
					}
				});

				// Respond to hiding the reCAPTCHA badge
				mbrApp.$body.on("change", "#witsec-mailform-recaptcha-hidebadge", function() {
					if ($("#witsec-mailform-recaptcha-hidebadge").prop("checked")) {
						mbrApp.alertDlg("<h4>Warning</h4>When you hide the reCAPTCHA badge, make sure to provide links to the Privacy and Terms pages of Google. The 'Terms' switch under the block options (gear icon) will do this for you. If you completely hide it, Google may choose to discontinue further spam checking.");
					}
				});

				// Show settings window
				a.$body.on("click", "#witsec-mailform-editbtn", function() {
					// Set default e-mail template
					template = "Hi,\n\nYou have received a new message from your website.\n\n{formdata}\n\nDate: {date}\nRemote IP: {ip}\n\nHave a nice day.";

					// Do a check if mailform values have been set, otherwise set it to something default
					a.projectSettings["witsec-mailform-to"]                  = a.projectSettings["witsec-mailform-to"]                   || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from"]                = a.projectSettings["witsec-mailform-from"]                 || mbrApp.getUserInfo()["email"];
					a.projectSettings["witsec-mailform-from-them"]           = a.projectSettings["witsec-mailform-from-them"]            || false;
					a.projectSettings["witsec-mailform-from-name"]           = a.projectSettings["witsec-mailform-from-name"]            || "Your Name";
					a.projectSettings["witsec-mailform-from-name-them"]      = a.projectSettings["witsec-mailform-from-name-them"]       || false;
					a.projectSettings["witsec-mailform-template"]            = a.projectSettings["witsec-mailform-template"]             || template;
					a.projectSettings["witsec-mailform-recaptcha"]           = a.projectSettings["witsec-mailform-recaptcha"]            || false;
					a.projectSettings["witsec-mailform-recaptcha-sitekey"]   = a.projectSettings["witsec-mailform-recaptcha-sitekey"]    || "";
					a.projectSettings["witsec-mailform-recaptcha-secretkey"] = a.projectSettings["witsec-mailform-recaptcha-secretkey"]  || "";
					a.projectSettings["witsec-mailform-recaptcha-score"]     = a.projectSettings["witsec-mailform-recaptcha-score"]      || "0.5";

					// Show or hide extra reCAPTCHA fields
					var hideReCaptcha = (a.projectSettings["witsec-mailform-recaptcha"] ? "" : "style='display:none'");

					// Show or hide the "From Email" field, based on whether "Sender as From Email" is checked
					var hideFromMail  = (a.projectSettings["witsec-mailform-from-them"] ? "style='display:none'" : "");

					// Display modal window with settings
					mbrApp.showDialog({
						title: "Mailform Settings",
						className: "",
						body: [
							'<form>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-to" class="col-sm-4 col-form-label">To Email</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-to" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-to"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-them" class="col-sm-4 col-form-label">Sender as From Email</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-from-them" name="witsec-mailform-from-them" ' + (a.projectSettings["witsec-mailform-from-them"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-from-div" ' + hideFromMail + '>',
							'      <label for="witsec-mailform-from" class="col-sm-4 col-form-label">From Email</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-name-them" class="col-sm-4 col-form-label">Sender as From Name</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-from-name-them" name="witsec-mailform-from-name-them" ' + (a.projectSettings["witsec-mailform-from-name-them"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'          (only if "name" is a POST variable, otherwise "From Name" will be used)',
							'        </div>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-from-name" class="col-sm-4 col-form-label">From Name</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-from-name" placeholder="' + mbrApp.getUserInfo()["email"] + '" value="' + a.projectSettings["witsec-mailform-from-name"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label for="witsec-mailform-template" class="col-sm-4 col-form-label">Email Template</label>',
							'      <div class="col-sm-7">',
							'        <textarea class="form-control" style="height:188px" id="witsec-mailform-template">' + a.projectSettings["witsec-mailform-template"] + '</textarea>',
							'      </div>',
							'    </div>',
							'    <div class="form-group row">',
							'      <label class="col-sm-4 col-form-label">reCAPTCHA v3</label>',
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
							'      <label for="witsec-mailform-sitekey" class="col-sm-4 col-form-label">Site Key</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-sitekey" value="' + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
							'      <label for="witsec-mailform-secretkey" class="col-sm-4 col-form-label">Secret Key</label>',
							'      <div class="col-sm-7">',
							'        <input type="text" class="form-control" id="witsec-mailform-recaptcha-secretkey" value="' + a.projectSettings["witsec-mailform-recaptcha-secretkey"] + '">',
							'      </div>',
							'    </div>',
							'    <div class="form-group row witsec-mailform-recaptcha-div" ' + hideReCaptcha + '>',
							'      <label for="witsec-mailform-score" class="col-sm-4 col-form-label">Score</label>',
							'      <div class="col-sm-4">',
							'        <select id="witsec-mailform-recaptcha-score" name="witsec-mailform-recaptcha-score" class="form-control" style="color:#fff">',
							'          <option value="0.1">0.1</option>',
							'          <option value="0.2">0.2</option>',
							'          <option value="0.3">0.3</option>',
							'          <option value="0.4">0.4</option>',
							'          <option value="0.5">0.5 (default)</option>',
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
							'      <label class="col-sm-4 col-form-label">Hide Badge</label>',
							'      <div class="col-sm-7">',
							'        <div class="togglebutton">',
							'          <label style="width: 100%">',
							'            <input type="checkbox" id="witsec-mailform-recaptcha-hidebadge" name="witsec-mailform-recaptcha-hidebadge" ' + (a.projectSettings["witsec-mailform-recaptcha-hidebadge"] ? "checked" : "") + ">",
							'            <span class="toggle" style="margin-top: -6px;"></span>',
							'          </label>',
							'        </div>',
							'      </div>',
							'    </div>',
							'</form>'
						].join("\n"),
						buttons: [
						{
							label: "HELP",
							default: !1,
							callback: function() {
								var help = `
								<h4>Help</h4>

								<i>Template variables</i><br>
								The default template contains a field "{formdata}". This represents all the fields that are used in the form and they will all automatically end up in the e-mail body. In other words,
								you don't have to specify every field.<br>
								However, if you want to do something with a specific field, you can simply name said field in your template. For example, let's say you have a field "name" in your form:<br><br>

								You have received a message from {name}.<br><br>

								There are two predefined fields available that can also be used in the template: {date} and {ip}. These will be replaced with the current date/time (of the server) and IP address
								of the sender.<br><br>

								Keep in mind you can only specify one template, which will be used by all 'witsec' forms.<br><br>

								<i>Customization</i><br>
								You can completely customize the form with a Code Editor, as long as the form contains a subject and email field as form data.<br><br>
								
								<i>Styling</i><br>
								You can style the body of the e-mail by using HTML tags in the mail template.
								`;
								mbrApp.alertDlg(help);
								return false;
							}
						},
						{
							label: "CANCEL",
							default: !1,
							callback: function() {
							}
						},
						{
							label: "OK",
							default: !0,
							callback: function() {
								// Validate TO e-mail address
								if ( /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/i.test( $("#witsec-mailform-to").val() ) == false ) {
									mbrApp.alertDlg("Please supply a valid e-mail address for To Email.");
									return false;
								}

								// Validate FROM e-mail address
								if ( !$("#witsec-mailform-from-them").prop("checked") && /^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i.test( $("#witsec-mailform-from").val() ) == false ) {
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

								// If reCAPTCHA is enabled, check if any values have been set
								if ( $("#witsec-mailform-recaptcha").prop("checked") && ( $("#witsec-mailform-recaptcha-sitekey").val().trim() == "" || $("#witsec-mailform-recaptcha-secretkey").val().trim() == "" )) {
									mbrApp.alertDlg("The reCAPTCHA Site Key and Secret Key must contain a value.");
									return false;
								}

								// Everything seems OK, let's save it
								a.projectSettings["witsec-mailform-to"]                  = $("#witsec-mailform-to").val();
								a.projectSettings["witsec-mailform-from"]                = $("#witsec-mailform-from").val();
								a.projectSettings["witsec-mailform-from-them"]           = $("#witsec-mailform-from-them").prop("checked");
								a.projectSettings["witsec-mailform-from-name"]           = $("#witsec-mailform-from-name").val();
								a.projectSettings["witsec-mailform-from-name-them"]      = $("#witsec-mailform-from-name-them").prop("checked");
								a.projectSettings["witsec-mailform-template"]            = $("#witsec-mailform-template").val();
								a.projectSettings["witsec-mailform-recaptcha"]           = $("#witsec-mailform-recaptcha").prop("checked");
								a.projectSettings["witsec-mailform-recaptcha-sitekey"]   = $("#witsec-mailform-recaptcha-sitekey").val();
								a.projectSettings["witsec-mailform-recaptcha-secretkey"] = $("#witsec-mailform-recaptcha-secretkey").val();
								a.projectSettings["witsec-mailform-recaptcha-score"]     = $("#witsec-mailform-recaptcha-score option:selected").val();
								a.projectSettings["witsec-mailform-recaptcha-hidebadge"] = $("#witsec-mailform-recaptcha-hidebadge").prop("checked");
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

				// Do things on publish
				a.addFilter("publishHTML", function(b) {

					// Only do things if the mailform has been enabled
					if (a.projectSettings["witsec-mailform"]) {

						// Read the php file from this addon's directory, we'll write the contents later (in publishTemplating)
						$.get(mbrApp.getAddonsDir() + '/witsec-mailform/php/mail.php', function(data) {
							// Replace the variables with the correct values
							php = data;
							php = php.replace(/{to}/g, a.projectSettings["witsec-mailform-to"]);
							php = php.replace(/{from}/g, a.projectSettings["witsec-mailform-from"]);
							php = php.replace(/{from-them}/g, (a.projectSettings["witsec-mailform-from-them"] ? "1" : "0") );
							php = php.replace(/{from-name}/g, a.projectSettings["witsec-mailform-from-name"]);
							php = php.replace(/{from-name-them}/g, (a.projectSettings["witsec-mailform-from-name-them"] ? "1" : "0") );
							php = php.replace(/{template}/g, a.projectSettings["witsec-mailform-template"].replace(/\n/g, "<br>").replace(/"/g, "\\\""));
							php = php.replace(/{recaptcha}/g, (a.projectSettings["witsec-mailform-recaptcha"] ? "3" : "0") );
							php = php.replace(/{recaptcha-secretkey}/g, a.projectSettings["witsec-mailform-recaptcha-secretkey"]);
							php = php.replace(/{recaptcha-score}/g, a.projectSettings["witsec-mailform-recaptcha-score"]);
						});

						// Rename html/head/body elements and remove DOCTYPE, so we don't lose them when we want to get them back from jQuery (there must be a better way, right?)
						b = b.replace(/<!DOCTYPE html>/igm, "");					
						b = b.replace(/<([/]?)(html|head|body)/igm, "<$1$2x");

						// Hide PHP using HTML comment tags, as jQuery doesn't understand these tags and distorts them beyond repair
						b = b.replace(/(<\?[\w\W]+?\?>)/gmi, "<!--$1-->");

						// jQuery that B
						j = $(b);

						// Add reCAPTCHA Javascript and sitekey to the page, if reCAPTCHA is enabled
						if (a.projectSettings["witsec-mailform-recaptcha"]) {

							// Add reCAPTCHA script and sitekey to the pages that contain a witsec mailform
							j.find(".witsec-mailform").first().prepend("\n<script>var witsecRcpSitekey = \"" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\";</script>");
							j.find(".witsec-mailform").first().prepend("\n<script src=\"https://www.google.com/recaptcha/api.js?render=" + a.projectSettings["witsec-mailform-recaptcha-sitekey"] + "\"></script>");

							// If the user chose to hide the badge
							if (a.projectSettings["witsec-mailform-recaptcha-hidebadge"]) {
								j.find(".witsec-mailform").first().prepend("\n<style>.grecaptcha-badge { display: none !important;}</style>");
							}
						}

						// Remove the witsec-mailform class from any element
						j.find(".witsec-mailform").removeClass("witsec-mailform");

						// Change the <a> submit button to an actual <button> and copy all classes along
						j.find('a[type="submit"].witsec-btn-submit').replaceWith(function () {
							return $('<button type="submit">' + this.innerHTML + '</button>').attr("class", $(this).attr("class") );
						});

						// Put the values of the witsec-html attribute inside the tag that has it
						j.find("[witsec-html]").each(function(){
							$(this).html( $(this).attr("witsec-html") );
						});
						j.find("[witsec-html]").removeAttr("witsec-html");

						// Step out of jQuery
						b = j.prop("outerHTML");

						// Restore PHP tags to their former glory
						b = b.replace(/<!--(<\?[\w\W]+?\?>)-->/gmi, "$1");

						// Rename the elements back	and re-add DOCTYPE				
						b = b.replace(/<([/]?)(html|head|body)x/igm, "<$1$2");
						b = "<!DOCTYPE html>\n" + b;
					}

					return b
				});
			}
		}
	})
})(jQuery, mbrApp);