# Changelog

All notable changes to this project will be documented in this file.

## v12.1 (2021-10-14)

- Fixed bug where mini response template didn't end up in the response email

## v12 (2021-09-19)

- Replaced jQuery with native JavaScript, because Mobirise won't be using that with Bootstrap 5 projects anymore
- Updated PHPMailer to 6.5.1
- Added callback functionality to `witsecSendMail` function, so a developer can decide what to do with a response and handle everything from there. Simply call `witsecSendMail(form object, callback function)`
- Added `curl` and made that the preferred method of calling the reCAPTCHA service (`file_get_contents` will likely be removed in a future version)
- Added UTF-8 header to status page
- If the `mime_content_type` function isn't present, it will now skip mime type checks and proceed handling file attachments
- Added (customizable) file upload button to contact form blocks
- Added code to allow multiple files at once (when a file input uses the `multiple` attribute)
- Removed the need to enable file attachments

## v11.1 (2021-06-08)

- Updated PHPMailer to 6.4.1
- Fixed checks in 'From' email address where German characters weren't accepted

## v11 (2021-04-05)

- Added SMTP support (site settings)
- Added support for attachments / file uploads (site settings), including a white list for Mime Types
- Added additional recipients (site settings, point to a 'recipient ID' in the block parameters)
- Added simple status page (when you access `http(s)://<yourdomain>/assets/witsec-mailform/mail.php?status`)
- Added simple in-app Form Builder (block)
- Added simple CAPTCHA (for M4/M5) as alternative to reCAPTCHA
- Improved all M4/M5 blocks (error messages can now be edited and styled for example)
- Improved error handling
- Upgraded PHPMailer to v6.3.0
- All required files (except mail.php) are plugins again
- Added notification on preview/publish for Mailform blocks that don't contain `plugins="witsec-mailform"`. This notification contains a 'CHANGE' button that fixes the code for the user, if they choose to
- Fixed a bug where forms containing checkbox arrays weren't processed properly (and didn't end up in the email)
- Fixed bug in M3 block where if you had GDPR -or- autorespond user decision enabled, you'd get both checkboxes on preview/publish. Re-add the block if you're using this already
- Added GDPR option to forms (when one doesn't want to use the in-app feature)
- Using `onsubmit="witsecSendMail(this)"` in form tags is no longer necessary (as long as the "witsec-mailform" class is used in the section)
- Added error codes, AJAX calls now return error codes too. The messages can also be customized
- Added "mtxt" and "rtxt", which are form specific mini-template variables. Variable "mtxt" ends up in the normal mail only, while "rtxt" only ends up in the response email. Using variables in the mini-template is allowed.

## v10.1 (2020-12-16)

- Fixed variable in PHP causing issues

## v10 (2020-10-02)

- Improved error handling in PHP regarding recaptcha to help find issues if/when they occur
- Errors (detected) in Javascript now write to the browser's console
- Required javascript files only get added when extension is enabled and a form is actually used
- Added feature to redirect after succesfully submitting a form
- Added possibility to change the background and text colors of the success and error messages
- Added M3 block for M3 lovers
- Added support for reCAPTCHA v2
- Added feature to change background and font colors of alerts
- Added feature to align submit button
- Added feature to align the text of the alerts

## v9 (unreleased)

## v8 (2020-06-30)

- Switched from using PHP's mail function to PHPMailer to make life a lot easier
- Now using tabs in Mailform Settings window to make things more clear and less cluttered
- Added autorespond, which allows you to automatically send an e-mail back to the sender (using variables like in the default e-mail template is possible as well)
- Added feature to override the subject of an autorespond email
- Added localization (only English available so far), not implemented everywhere yet
- Added reply-to feature, so emails can be sent from your own domain, but with the sender's address as reply-to. This will reduce the chance of e-mails being marked as spam
- Added feature to disable the submit button after submitting a form. It will be enabled when that action is finished. This prevents forms from being submitted twice and developers can style the disabled state of the button as well
- Generated PHP files are no longer placed in the root of the website, but can now be found under assets/witsec-mailform/
- If the reCAPTCHA Secret Key is set, it will be removed from the (published) project.mobirise file

## v7 (2020-03-14)

- Fixed compatibility with Mobirise v5

## v6 (2020-02-08)

- Overhauled some internal workings. The extension is now using regex rather than transform html to a DOM object and back, so we no longer have to worry about PHP being present or not. This actually made the code a whole lot better to read and we removed a bunch of classes and such that weren't needed anymore
- Put some extra checks in place to see if the Mobirise block that's being processed contains a witsec mailform. If it doesn't, don't bother with the block
- Added a check to see if the current project is AMP. This prevents the Mailform from being added to the Site Settings of AMP projects
- Added a feature where you can specify the html tag (or tags) that contain the sender's name. For example, if your form field is named "nom" or it's a combination of "first_name" and "last_name", you can now specify that in the Mailform settings.

## v5 (2020-01-02)

- Fixed a bug so code before !DOCTYPE is handled properly

## v4 (2019-12-30)

- Fixed issue where submit/send button didn't keep the intended classes

## v3 (2019-12-29)

- Added feature to use sender's name as "From Name", if "name" is a POST variable. Otherwise the predefined "From Name" will be used
- Added fix to stop PHP code from getting crippled
- Added GitHub Actions CI pipeline to automatically generate mbrext files

## v2 (2019-11-30)

- Added reCAPTCHA v3 support
- Overhauled mailform block, this breaks backward compatibility with v1, but the new form can be customized now
- "To" field can contain multiple e-mail addresses now
- Added ability to use sender's e-mail address as from address
- Improved templating functionality, fields that aren't "defined" in the template can still be displayed
- Added simple newsletter subscription form

## v1 (2019-08-17)

This is the initial release of the Mailform extension for Mobirise.