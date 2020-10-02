defineM("witsec-mailform", function(d, mbrApp, TR) {
	mbrApp.loadComponents(
		"witsec-mailform/components",
		{
			"witsec-mailform-m3": {
				_group: "witsec",
				_params: {
					paddingTop:      { type: "range",  title: "Top Padding",                 min: 0, max: 8, step: 1, default: 4 },
					paddingBottom:   { type: "range",  title: "Bottom Padding",              min: 0, max: 8, step: 1, default: 4 },
					alignSubmit:     { type: "select", title: "Align Submit",                default: "", values: { "": "Left", "align-center": "Center", "align-right": "Right" } },
					showTitle:       { type: "switch", title: "Show Title",                  default: true },
					showSubTitle:    { type: "switch", title: "Show Subtitle",               default: true },
					showPhone:       { type: "switch", title: "Show Phone",                  default: true },
					showTerms:       { type: "switch", title: "Show reCAPTCHA Terms",        default: false },
					autorespond:     { type: "select", title: "Autorespond",                 default: 0, values: { 0: "Off", 1: "On", 2: "User Decision" } },
					onsuccess:       { type: "select", title: "On Success",                  default: 0, values: { 0: "Stay", 1: "Redirect" } },
					redirectURL:	 { type: "text",   title: "Redirect to (if applicable)", default: "thanks.html" },
					txtSubject:      { type: "text",   title: "Subject",                     default: "A message from your website." },
					txtSuccess:      { type: "text",   title: "Success Message",             default: "Thanks for filling out the form!" },
					txtError:        { type: "text",   title: "Error Message",               default: "An error occured. Please try again." },
					alignAlert:      { type: "select", title: "Align",                       default: "", values: { "": "Left", "align-center": "Center", "align-right": "Right" } },
					bgColorSuccess:  { type: "color",  title: "Success BG Color",            default: "#70c770" },
					txtColorSuccess: { type: "color",  title: "Success Text Color",          default: "#ffffff" },
					bgColorError:    { type: "color",  title: "Error BG Color",              default: "#ff4a52" },
					txtColorError:   { type: "color",  title: "Error BG Color",              default: "#ffffff" },
					bgImageRadio:    { type: "radio",  title: "Background Image",            name: "bgType", default: false },
					bgImage:         { type: "image",  title: "",                            default: "@ADDON_DIR@_images/background.jpg", condition: ["bgImageRadio"] },
					parallax:        { type: "switch", title: "Parallax",                    default: true, condition: ["bgImageRadio"] },
					bgColorRadio:    { type: "radio",  title: "Background Color",            name: "bgType", default: true },
					bgColor:         { type: "color",  title: "Color",                       default: "#fff",  condition: ["bgColorRadio"] },
					overlay:         { type: "switch", title: "Overlay",                     default: false, condition: ["!bgColorRadio"] },
					overlayColor:    { type: "color",  title: "Color",                       default: "#222", condition: ["overlay", "!bgColorRadio"] },
					overlayOpacity:  { type: "range",  title: "Opacity",                     min: 0, max: 1, step: .1, default: .5, condition: ["overlay", "!bgColorRadio"] }
				},
				_onParamsChange: function(b, a, c) {
					"paddingTop" != a &&
						"paddingBottom" != a || b.find("section.mbr-section").css("paddingTop" == a ? "padding-top" : "padding-bottom", 15 * c + "px")

					// Set colors of alert boxes
					if (void 0 === a || "bgColorSuccess"  === a) this._styles || (this._styles = {}), this._styles[".alert-success"] = { "background-color": this._params.bgColorSuccess  }, mbrApp.Core.renderComponentsStyles();
					if (void 0 === a || "txtColorSuccess" === a) this._styles || (this._styles = {}), this._styles[".alert-success"] = { color: this._params.txtColorSuccess }, mbrApp.Core.renderComponentsStyles();
					if (void 0 === a || "bgColorError"    === a) this._styles || (this._styles = {}), this._styles[".alert-danger"]  = { "background-color": this._params.bgColorError    }, mbrApp.Core.renderComponentsStyles();
					if (void 0 === a || "txtColorError"   === a) this._styles || (this._styles = {}), this._styles[".alert-danger"]  = { color: this._params.txtColorError   }, mbrApp.Core.renderComponentsStyles();
				},
				_publishFilter: function(b, a) {
					// Put the subject in the hidden field
					b.find("input[name=subject]").attr("value", this._params.txtSubject);

					// Padding
					b.find("section.mbr-section").css({
						"padding-top": 15 * this._params.paddingTop + "px",
						"padding-bottom": 15 * this._params.paddingBottom + "px"
					});
				},
				title: "CONTACT FORM",
				subtitle: "Easily add independent contact forms to your website.",
				showName: true,
				showEmail: true,
				name: "Name",
				email: "Email",
				phone: "Phone",
				message: "Message",
				autorespond: "<p class='mbr-section-autorespond mbr-fonts-style'><input type='checkbox' name='autorespond' value='1'> Send me a copy</p>",
				showTerms: "This form uses Google's reCAPTCHA. By continuing you agree to the <a href='https://policies.google.com/privacy' target='_blank'>Privacy</a> and <a href='https://policies.google.com/terms' target='_blank'>Terms</a>.",
				buttons: '<a data-app-btn="true" type="submit" class="btn btn-primary">SEND FORM</a>',
				_styles: {
					".mbr-section-title": {
						"text-align": "center",
						"color": "#232323"
					},
					".mbr-section-subtitle": {
						"text-align": "center",
						"color": "#767676"
					},
					".mbr-section-labels": {
						"color": "#000",
						"padding": "0",
						"margin-bottom": ".357em"
					},
					".form-control-textarea": {
						"min-height": "188px"
					},
					".mbr-section-autorespond": {
						"text-align": "center",
						"color": "#232323",
						"margin-bottom": "0"
					},
					".mbr-section-terms": {
						"text-align": "center",
						"color": "#232323",
						"margin-bottom": "0"
					},
					".alert": {
						"margin-bottom": "0"
					},
					".g-recaptcha": {
						"margin-bottom": "1rem"
					},
					".align-right": {
						"text-align": "right"
					}
				}
			}
		}
	)
}, ["jQuery", "mbrApp", "TR()"]);