/*************************************************************************
	``The contents of this file are subject to the Mozilla Public License
	Version 1.1 (the "License"); you may not use this file except in
	compliance with the License. You may obtain a copy of the License at
	http://www.mozilla.org/MPL/

	Software distributed under the License is distributed on an "AS IS"
	basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
	License for the specific language governing rights and limitations
	under the License.

	The Original Code is WebRunner

	The Initial Developer of the Original Code is:
		Benjamin Smedberg and 
	
	Portions created by Mukunda Modell are Copyright (C) 2007, All Rights Reserved.

	Contributor(s): Mark Finkle, Mukunda Modell

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

const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);

function startup()
{
  // hookup the browser window callbacks
  window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIWebNavigation)
        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
        .treeOwner
        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIXULWindow)
        .XULBrowserWindow = gXULBrowserWindow;

  // hookup global webprogress listener
  var dls = Components.classes["@mozilla.org/docloaderservice;1"].
                       getService(Components.interfaces.nsIWebProgress);
  dls.addProgressListener(browserProgressListener, nsIWebProgress.NOTIFY_ALL);


  var browserContext = document.getElementById("main-popup");
  browserContext.addEventListener("popupshowing", popupShowing, false);

  goHome();
}

function shutdown(event)
{
  window.removeEventListener("load", startup, false);
  window.removeEventListener("unload", shutdown, false);
  
  var browserContext = document.getElementById("main-popup");
  browserContext.removeEventListener("popupshowing", popupShowing, false);
}


function goHome()
{
	var cl = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine);
	//default to the -uri command line argument
	var startURI = cl.handleFlagWithParam("uri", false);
	
	if (startURI == null) {
	  //fall back to the webrunner.startURI preference
	  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	  getService(Components.interfaces.nsIPrefBranch);
	  startURI = prefs.getCharPref("webrunner.startURI");
	  if (startURI == null) {
		//if all else fails, fall back to this url:
		startURI = "http://mozilla.org"
	  }
	}
	
	var browser = document.getElementById("main-browser");
	browser.webNavigation.loadURI(startURI, 0, null, null, null);
}

function popupShowing(aEvent) {
  var cut = document.getElementById("cut-menuitem");
  var paste = document.getElementById("paste-menuitem");
  var del = document.getElementById("delete-menuitem");

  var target = document.popupNode;
  if (target instanceof HTMLTextAreaElement) {
    cut.setAttribute("disabled", "false");
    paste.setAttribute("disabled", "false");
    del.setAttribute("disabled", "false");
  }
  else if (target instanceof HTMLInputElement) {
    cut.setAttribute("disabled", "false");
    paste.setAttribute("disabled", "false");
    del.setAttribute("disabled", "false");
  }
  else {
    cut.setAttribute("disabled", "true");
    paste.setAttribute("disabled", "true");
    del.setAttribute("disabled", "true");
  }
}

function domUnload(aEvent) {
  aEvent.target.ownerDocument.removeEventListener("click", domClick, true);
  aEvent.target.ownerDocument.removeEventListener("DOMActivate", domActivate, true);
  aEvent.target.ownerDocument.removeEventListener("unload", domUnload, false);
}

function domClick(aEvent)
{
  var link = aEvent.target;

  if (link instanceof HTMLAnchorElement && 
      link.target != "" &&
      link.target != "_self" &&
      link.target != "_top") {
    aEvent.stopPropagation();
  }
}

function domActivate(aEvent)
{
  var link = aEvent.target;

  if (link instanceof HTMLAnchorElement && 
      link.target != "" &&
      link.target != "_self" &&
      link.target != "_top") {

    // We don't want to open external links in this process: do so in the
    // default browser.
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);

    var resolvedURI = ios.newURI(link.href, null, null);

    var extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                          .getService(Components.interfaces.nsIExternalProtocolService);

    extps.loadURI(resolvedURI, null);
    aEvent.preventDefault();
    aEvent.stopPropagation();
  }
}

// nsIXULBrowserWindow implementation to display link destinations in the statusbar
var gXULBrowserWindow = {
  QueryInterface: function(aIID) {
    if (aIID.Equals(Components.interfaces.nsIXULBrowserWindow) ||
        aIID.Equals(Components.interfaces.nsISupports))
     return this;

    throw Components.results.NS_NOINTERFACE;
  },

  setJSStatus: function() { },
  setJSDefaultStatus: function() { },

  setOverLink: function(aStatusText, aLink) {
    var statusbar = document.getElementById("status");
    statusbar.label = aStatusText;
  }
};


// nsIWebProgressListener implementation to monitor activity in the browser.
var browserProgressListener = {
  _requestsStarted: 0,
  _requestsFinished: 0,

  // We need to advertize that we support weak references.  This is done simply
  // by saying that we QI to nsISupportsWeakReference.  XPConnect will take
  // care of actually implementing that interface on our behalf.
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
        iid.equals(Components.interfaces.nsISupportsWeakReference) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;
    
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // This method is called to indicate state changes.
  onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
    var progress = document.getElementById("progress");

    if (aStateFlags & nsIWebProgressListener.STATE_IS_REQUEST) {
      if (aStateFlags & nsIWebProgressListener.STATE_START) {
        this._requestsStarted++;
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
        this._requestsFinished++;
      }
      
      if (this._requestsStarted > 1) {
        var value = (100 * this._requestsFinished) / this._requestsStarted;
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", value + "%");
      }
    }

    if (aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
      if (aStateFlags & nsIWebProgressListener.STATE_START) {
        progress.setAttribute("style", "");
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
        progress.setAttribute("style", "display: none");
        this.onStatusChange(aWebProgress, aRequest, 0, "Done");
        this._requestsStarted = this._requestsFinished = 0;
      }      
    }
    
    if (aStateFlags & nsIWebProgressListener.STATE_IS_DOCUMENT) {
      if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
        var domDocument = aWebProgress.DOMWindow.document;
        domDocument.addEventListener("click", domClick, true);
        domDocument.addEventListener("DOMActivate", domActivate, true);
        domDocument.addEventListener("unload", domUnload, false);

        if (domDocument.title && domDocument.title.length > 0)
          document.title = domDocument.title;
      }
    }
  },

  // This method is called to indicate progress changes for the currently
  // loading page.
  onProgressChange: function(aWebProgress, aRequest, aCurSelf, aMaxSelf, aCurTotal, aMaxTotal) {
    if (this._requestsStarted == 1) {
      var progress = document.getElementById("progress");
      if (aMaxSelf == -1) {
        progress.setAttribute("mode", "undetermined");
      }
      else {
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", ((100 * aCurSelf) / aMaxSelf) + "%");
      }
    }
  },

  // This method is called to indicate a change to the current location.
  onLocationChange: function(aWebProgress, aRequest, aLocation) {
//XXX we could add a read-only label to display the URL
    var urlbar = document.getElementById("tool_url");
    urlbar.value = aLocation.spec;
  },

  // This method is called to indicate a status changes for the currently
  // loading page.  The message is already formatted for display.
  onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
    var statusbar = document.getElementById("status");
    statusbar.setAttribute("label", aMessage);
  },

  // This method is called when the security state of the browser changes.
  onSecurityChange: function(aWebProgress, aRequest, aState) {
    var security = document.getElementById("security");

    var level = "unknown";
    switch (aState) {
      case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_HIGH:
        level = "high";
        break;
      case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_MEDIUM:
        level = "medium";
        break;
      case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_LOW:
        level = "low";
        break;
      case nsIWebProgressListener.STATE_IS_BROKEN:
        level = "broken";
        break;
      case nsIWebProgressListener.STATE_IS_INSECURE:
      default:
        level = "none";
        break;
    }
    if (level == "none")
      security.removeAttribute("level");
    else
      security.setAttribute("level", level);
    security.setAttribute("label", level);
  }
};

/* added by Mukunda Modell to suppoer some menu bar features on Mac OS X */
function menuCommand(cmd) {
	var winUrl;
	var features;
	if (cmd == "cmd_gohome") {
		
	}
	else if (cmd == 'cmd_about') {
		winUrl = "chrome://webrunner/content/about.xul";
		features = "titlebar=yes,toolbar=no,resizable=no,close=yes,modal=yes";
		window.openDialog(winUrl,"AboutWebRunner",features);
	} else if (cmd == 'cmd_quit') {
		try {
			shutdownApplication(false);
		} catch(err) {
			alert(err);
		}
	} else if(cmd == 'cmd_config') {
		//show about:config (Advanced config)
		winUrl = "chrome://global/content/config.xul";
		features = "chrome,statusbar=yes,titlebar=yes,centerscreen,close=yes,modal=yes";
		window.open(winUrl,"About:Config",features);
	} else if (cmd == 'cmd_passwordmanager') {
		//show Password Manager dialog
		winUrl = "chrome://passwordmgr/content/passwordManager.xul";
		features = "chrome,statusbar=yes,titlebar=yes,close=yes,modal=yes";
		window.open(winUrl,"About:Config",features);
	} else if (cmd == 'cmd_pref') {
		winUrl = "chrome://webrunner/content/prefs.xul";
		features = "chrome,titlebar,toolbar,centerscreen,modal";
		window.openDialog(winUrl, "Preferences", features);
	} else if (cmd == 'cmd_jsconsole') {
		toJavaScriptConsole();
	}
}

