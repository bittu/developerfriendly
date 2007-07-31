/*************************************************************************
	``The contents of this file are subject to the Mozilla Public License
	Version 1.1 (the "License"); you may not use this file except in
	compliance with the License. You may obtain a copy of the License at
	http://www.mozilla.org/MPL/

	Software distributed under the License is distributed on an "AS IS"
	basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
	License for the specific language governing rights and limitations
	under the License.

	The Original Code is
		xulapp.js

	The Initial Developer of the Original Code is:
		Mukunda Modell
	
	Portions created by Mukunda Modell are
		Copyright (C) 2007,	All Rights Reserved.

	Contributor(s):
		TJ Laurenzo, provided inspiration for openJavaScriptConsole()
		http://tjlaurenzo.blogspot.com/2006/03/getting-dev-tools-working-with.html

	Alternatively, the contents of this file may be used under the terms
	of the GNU General Public License version 2 (the  "GPL License"),
	in which case the provisions of GPL License are applicable instead
	of those above.  If you wish to allow use of your version of this file
	only under the terms of the GPL License and not to allow others to use
	your version of this file under the MPL, indicate your decision by
	deleting  the provisions above and replace  them with the notice and
	other provisions required by the GPL License.  If you do not delete
	the provisions above, a recipient may use your version of this file
	under either the MPL or the GPL License."
**************************************************************************/

function shutdownApplication(forceQuit) {
    var appControl = Components.classes['@mozilla.org/toolkit/app-startup;1']
        .getService(Components.interfaces.nsIAppStartup);

    if (forceQuit)
        appControl.quit(Components.interfaces.nsIAppStartup.eForceQuit);
    else
        appControl.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);

}

/* show the advanced preferences window (similar to the "about:config" page in firefox) */
function showAboutConfig() {
	var aboutWinUrl = "chrome://global/content/config.xul";
	var features = "chrome,statusbar=yes,titlebar=yes,close=yes,modal=no";
	var aboutwin = window.open(aboutWinUrl,"About:Config",features);
}

/* show the javascript console window (in order to see debug output/error messages) */

function toJavaScriptConsole()
{
	toOpenWindowByType("global:console", "chrome://global/content/console.xul");
}

function toOpenWindowByType(inType, uri, features)
{
	var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
	var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
	var topWindow = windowManagerInterface.getMostRecentWindow(inType);
	
	if (topWindow)
	  topWindow.focus();
	else if (features)
	  window.open(uri, "_blank", features);
	else
	  window.open(uri, "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
}

function getPref(pref, isBool) {
	
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService);
	var prefBranch = prefs.getBranch("webrunner.");
	
	
	var res = null;
	if (isBool) {
		try { res = prefBranch.getBoolPref(pref); } catch(err) { 	}
	} else {
		try { res = prefBranch.getCharPref(pref); } catch(err) { 	}
	}
	return res;
}