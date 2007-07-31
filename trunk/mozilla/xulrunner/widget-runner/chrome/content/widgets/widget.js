/* widget.js - shared code used in all widgets.
*/


window.addEventListener("load", startup, false);


if (window.opener)
{
	window.widgetRunenr = window.opener.widgetRinner;
}

function startup() {
	try {
		window.opener.widgetLoaded(window);
		if (loadWidget) {
			loadWidget();
		}
	} catch(ex) { }

	var startPos=0;
	var mouseDown = function(event) {
		if (event.button == 0) {
			startPos = [ event.clientX, event.clientY];
		} else {
			startPos=0;
		}
		//cancel default action
		return false;
	}
	
	var mouseMove = function(event) {
		if (startPos != 0) {
			var newX = event.screenX-startPos[0];
			var newY = event.screenY-startPos[1];
			window.moveTo(newX,newY);
		}
	}
	
	var mouseUp = function(event) {
		startPos=0;
	}

	// look for jQuery
	if (typeof($) == "function") {
		//bind to the mousedown event on elements matching the css class .dragHandle
		$(".dragHandle").bind("mousedown", mouseDown);
	} else {
		//if there is no jQuery, bind to the window's mousedown event
		window.addEventListener("mousedown",mouseDown, false);
	}
	window.addEventListener("mouseup",mouseUp, false);
	window.addEventListener("mousemove",mouseMove, false);
}
