# Changelog

All notable changes to this project will be documented in this file.

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