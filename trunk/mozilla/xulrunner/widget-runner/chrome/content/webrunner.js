const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);

var params;

if (window.arguments && window.arguments[0])
  params = new Params(window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine));
else
  params = new Params(null);
  

function getBrowser() {
  return document.getElementById('main-browser');
}

function startup()
{
  // Process parameters
  document.documentElement.setAttribute("id", params.icon);

  document.getElementById("statusbar").hidden = !params.showstatus;
  document.getElementById("locationbar").hidden = !params.showlocation;

  if (!params.enablenavigation) {
    var keys = document.getElementsByTagName("key");
    for (var i = keys.length - 1; i >= 0; i--)
      if (keys[i].className == "nav")
        keys[i].parentNode.removeChild(keys[i]);
  }

  // hookup the browser window callbacks
  window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIWebNavigation)
        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
        .treeOwner
        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        .getInterface(Components.interfaces.nsIXULWindow)
        .XULBrowserWindow = gXULBrowserWindow;

  var cl = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine);
  var startURI = cl.handleFlagWithParam("uri", false);
  if (startURI == null) {
    startURI = "http://mozilla.org"
  }

  var browser = getBrowser();
  browser.addEventListener("DOMTitleChanged", domTitleChanged, false)
  browser.webProgress.addProgressListener(browserProgressListener, nsIWebProgress.NOTIFY_ALL);
  browser.loadURI(params.uri, null, null);

  var browserContext = document.getElementById("main-popup");
  browserContext.addEventListener("popupshowing", popupShowing, false);
}

function shutdown()
{
  window.removeEventListener("load", startup, false);
  window.removeEventListener("unload", shutdown, false);
  
  var browserContext = document.getElementById("main-popup");
  browserContext.removeEventListener("popupshowing", popupShowing, false);
}

function popupShowing(aEvent) {
  var cut = document.getElementById("cut-menuitem");
  var copy = document.getElementById("copy-menuitem");
  var paste = document.getElementById("paste-menuitem");
  var del = document.getElementById("delete-menuitem");

  var isContentSelected = !document.commandDispatcher.focusedWindow.getSelection().isCollapsed;

  var target = document.popupNode;
  var isTextField = target instanceof HTMLTextAreaElement;
  if (target instanceof HTMLInputElement && (target.type == "text" || target.type == "password"))
    isTextField = true;
  var isTextSelectied= (isTextField && target.selectionStart != target.selectionEnd);

  cut.setAttribute("disabled", ((!isTextField || !isTextSelectied) ? "true" : "false"));
  copy.setAttribute("disabled", (((!isTextField || !isTextSelectied) && !isContentSelected) ? "true" : "false"));
  paste.setAttribute("disabled", (!isTextField ? "true" : "false"));
  del.setAttribute("disabled", (!isTextField ? "true" : "false"));
}

function showAbout() {
  window.openDialog("chrome://widgetrunner/content/about.xul", "about", "centerscreen,modal");
}

function domUnload(aEvent) {
  aEvent.target.ownerDocument.removeEventListener("click", domClick, true);
  aEvent.target.ownerDocument.removeEventListener("DOMActivate", domActivate, true);
  aEvent.target.ownerDocument.removeEventListener("unload", domUnload, false);
}

function domTitleChanged(aEvent) {
  if (aEvent.target != this.contentDocument)
    return;

  document.title = aEvent.target.title;
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
    if (aStateFlags & nsIWebProgressListener.STATE_IS_REQUEST) {
      if (aStateFlags & nsIWebProgressListener.STATE_START) {
        this._requestsStarted++;
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
        this._requestsFinished++;
      }
      
      if (this._requestsStarted > 1) {
        var value = (100 * this._requestsFinished) / this._requestsStarted;

        var progress = document.getElementById("progress");
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", value + "%");
      }
    }

    if (aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
      var progress = document.getElementById("progress");
      if (aStateFlags & nsIWebProgressListener.STATE_START) {
        progress.hidden = false;
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
        progress.hidden = true;
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
    document.getElementById("location").value = aLocation.spec;
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
        security.setAttribute("level", "high");
        break;
      case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_MEDIUM:
        security.setAttribute("level", "med");
        break;
      case nsIWebProgressListener.STATE_IS_SECURE | nsIWebProgressListener.STATE_SECURE_LOW:
        security.setAttribute("level", "low");
        break;
      case nsIWebProgressListener.STATE_IS_BROKEN:
        security.setAttribute("level", "broken");
        break;
      case nsIWebProgressListener.STATE_IS_INSECURE:
      default:
        security.removeAttribute("level");
        break;
    }
  }
};

/* advanced tools menu handler added by Mukunda Modell */
function menuCommand(cmd) {
	var winUrl;
	var features;
	if (cmd == "cmd_gohome") {
		
	}
	else if (cmd == 'cmd_about') {
		winUrl = "chrome://widgetrunner/content/about.xul";
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
		window.open(winUrl,"passwordmanager",features);
	} else if (cmd == 'cmd_pref') {
		winUrl = "chrome://widgetrunner/content/prefs.xul";
		features = "chrome,titlebar,toolbar,centerscreen,modal";
		window.openDialog(winUrl, "Preferences", features);
	} else if (cmd == 'cmd_jsconsole') {
		toJavaScriptConsole();
	}
}
