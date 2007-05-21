/*
	Useful utility functions for XUL Applications
	Copyright (C) 2007 by Mukunda Modell
	You may use this code under the following terms:
	
	Tri-licensed, choose one of: MPL v1.1, GPL v2 or LGPL v2
*/


/* Close the application and exit */
function shutdownApplication() {
	Components.classes['@mozilla.org/toolkit/app-startup;1']
		.getService(Components.interfaces.nsIAppStartup)
		.quit(Components.interfaces.nsIAppStartup.eAttemptQuit)
}
/* show the advanced preferences window (similar to the "about:config" page in firefox) */
function showAboutConfig() {
	var aboutWinUrl = "chrome://global/content/config.xul";
	var features = "chrome,statusbar=yes,titlebar=yes,close=yes,modal=no";
	var aboutwin = window.open(aboutWinUrl,"About:Config",features);
}