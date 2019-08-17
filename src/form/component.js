mbrApp.loadComponents(
    "witsec-mailform",
    {
        "form": {
            _group: "witsec",
            _params: {
                showTitle: {
                    type: "switch",
                    title: "Show Title",
                    default: !0
                },
                showSubTitle: {
                    type: "switch",
                    title: "Show Subtitle",
                    default: !0
                },
                labelsColor: {
                    type: "color",
                    title: "Form Labels Color",
                    default: "#232323"
                },
                paddingTop: {
                    type: "range",
                    title: "Top Padding",
                    min: 0,
                    max: 4,
                    step: 1,
                    default: 2,
                    halfWidth: !0
                },
                paddingBottom: {
                    type: "range",
                    title: "Bottom Padding",
                    min: 0,
                    max: 4,
                    step: 1,
                    default: 2,
                    halfWidth: !0
                },
                bgImageRadio: {
                    type: "radio",
                    title: "Background Image",
                    name: "bgType",
                    default: !1
                },
                bgImage: {
                    type: "image",
                    title: "",
                    default: "@ADDON_DIR@_images/background.jpg",
                    condition: ["bgImageRadio"]
                },
                parallax: {
                    type: "switch",
                    title: "Parallax",
                    default: !0,
                    condition: ["bgImageRadio"]
                },
                bgColorRadio: {
                    type: "radio",
                    title: "Background Color",
                    name: "bgType",
                    default: !0
                },
                bgColor: {
                    type: "color",
                    title: "Color",
                    default: "#fff",
                    condition: ["bgColorRadio"]
                },
                overlay: {
                    type: "switch",
                    title: "Overlay",
                    default: !1,
                    condition: ["!bgColorRadio"]
                },
                overlayColor: {
                    type: "color",
                    title: "Color",
                    default: "#222",
                    condition: ["overlay",
                        "!bgColorRadio"
                    ]
                },
                overlayOpacity: {
                    type: "range",
                    title: "Opacity",
                    min: 0,
                    max: 1,
                    step: .1,
                    default: .5,
                    condition: ["overlay", "!bgColorRadio"]
                }
            },
            _onParamsChange: function(b, a, c) {
                void 0 === a && b.find("section.mbr-section").css({
                    "padding-top": 40 * this._params.paddingTop + "px",
                    "padding-bottom": 40 * this._params.paddingBottom + "px"
                });
                if (void 0 === a || "labelsColor" === a) this._styles || (this._styles = {}), this._styles[".form-control-label"] = {
                    color: this._params.labelsColor
                }, mbrApp.Core.renderComponentsStyles();
                "paddingTop" != a &&
                    "paddingBottom" != a || b.find("section.mbr-section").css("paddingTop" == a ? "padding-top" : "padding-bottom", 40 * c + "px")
            },
            _publishFilter: function(b, a) {
                // Check if the mailform setting is enabled under Site Settings
                if (mbrApp.projectSettings["witsec-mailform"] != "on") {
                    mbrApp.alertDlg("Please activate the custom mailform under Site Settings, or the required PHP file will not be exported.");
                }

                // Put the subject in the hidden field
                b.find("input[name=subject]").attr("value", this.form.fields.subject.customTitle);

                // To avoid Formoid taking over, we remove the mbr-form attribute
                b.find("form").removeAttr("mbr-form");

                // Change the <a> submit button to an actual <button>
                b.find("a[data-app-btn=true]").replaceWith(function () {
                    return $('<button type="submit" class="btn btn-primary display-4">' + this.innerHTML + '</button>');
                });

                // Set placeholder text to inputs
                b.find("input[name='name']" ).attr("placeholder", this.form.fields.name.customTitle);
                b.find("input[name='email']" ).attr("placeholder", this.form.fields.email.customTitle);
                b.find("input[name='phone']" ).attr("placeholder", this.form.fields.phone.customTitle);
                b.find("textarea[name='message']" ).attr("placeholder", this.form.fields.message.customTitle);

                // Padding
                b.find("section.mbr-section").css({
                    "padding-top": 40 * this._params.paddingTop + "px",
                    "padding-bottom": 40 * this._params.paddingBottom + "px"
                });
            },
            title: "CONTACT FORM",
            subtitle: "Easily add independent contact forms to your website.",
            from: "Name",
            email: "Email",
            phone: "Phone",
            message: "Message",
            buttons: '<a data-app-btn="true" type="submit" class="btn btn-primary display-4">SEND FORM</a>',
            form: {
                action: "mail.php",
                alerts: {
                    success: "Don't use an e-mail address."
                },
                fields: {
                    name: {
                        visible: !0,
                        title: "Name",
                        customTitle: ""
                    },
                    email: {
                        visible: !0,
                        title: "Email",
                        customTitle: ""
                    },
                    phone: {
                        visible: !0,
                        title: "Phone",
                        customTitle: ""
                    },
                    message: {
                        visible: !0,
                        title: "Message",
                        customTitle: ""
                    },
                    subject: {
                        title: "Subject",
                        customTitle: "Message from your website"
                    },
                    successmessage: {
                        title: "Success Message",
                        customTitle: "Thanks for filling out the form!"
                    },
                    errormessage: {
                        title: "Error Message",
                        customTitle: "An error occured. Please try again."
                    }
                }
            },
            _styles: {
                ".mbr-section-subtitle": {
                    "text-align": "center",
                    "color": "#767676"
                },
                ".form-control-textarea": {
                    "min-height": "188px"
                }
            }
        }
    }
);