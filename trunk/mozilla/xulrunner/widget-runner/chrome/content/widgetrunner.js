/*
 The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.

The Original Code is WebRunner

The Initial Developer of the Original Code is Mark Finkle,
Portions created by Mark Finkle are Copyright (C) 2007
Mozilla, Inc. All Rights Reserved.

Contributor(s): Mukunda Modell, http://www.developerfriendly.com.
*/

const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;
window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);

var widgetRunner = {
		cron: {
			schedules: [],
			add: function(newSchedule) {
				this.schedules.push(newSchedule);
			},
			getRunnable: function() {
				return this.schedules;
			}
		}
};


function cronRunner() {
	var runnable = widgetRunner.cron.getRunnable();
	for (var i=0; i < runnable.length; i++) {
		runnable[i].run();
	}
	setTimeout( cronRunner, 600000);
}
function widgetLoaded(widgetWindow) {
	
}

function startup()
{
	setTimeout( cronRunner, 600000 );
	window.sizeToContent();	
  //window.resizeTo(400,400);
  //alert(document.documentElement.tagName);
}

function shutdown()
{
  window.removeEventListener("load", startup, false);
  window.removeEventListener("unload", shutdown, false);
  setTimeout(shutdownApplication,1000);
}

/* menu controller / command handler */
function menucmd(cmd) {
	if (cmd == "quit") {
		window.close();
		shutdownApplication(true);
	} else if (cmd=="ticker") {
		loadWidget("ticker");
	} else if (cmd=="extensions") {
        var url="chrome://mozapps/content/extensions/extensions.xul?type=extensions";
        var features = "chrome,alwaysRaised,resizable=yes,dialog=yes,dependent=yes";
        window.openDialog(url,name,features);
    } else if (cmd=="console") {
        toJavaScriptConsole();
    } else if (cmd=="about") {
        window.openDialog("chrome://widgetrunner/content/about.xul","about:widgetrunner","chrome,alwaysRaised,dialog,denendent,resizable=no");
    }
               
}

function loadWidget(name,url) {
	features = "chrome,z-lock,alwaysLowered,resizable=yes,dialog=yes,dependent=yes";
	if (!url) {
		url = "chrome://widgetrunner/content/widgets/"+name+".xul";
	}
	window.openDialog(url,name,features);
}