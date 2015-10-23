# Introduction #

This is WebRunner, a simple XULRunner application which implements a minimal web browser for use with your favorite web application. The code is based on [this code](http://starkravingfinkle.org/blog/2007/03/site-specific-browser-using-webrunner/) by Mark Finkle and Benjamin Smedberg.

# Details #

## Purpose ##
The main use for WebRunner is to experiment with XULRunner application development. There is very little functionality provided beyond an example application structure for an over-simplified web browser application.

## Online Application Wrapper ##
You might find WebRunner to be useful for wrapping an online application into it's own separate browser window with it's own unique process. This can make a web application feel more like a regular desktop application.

## Changes ##
The following changes have been made to the original WebRunner code:

  * Wrapped the app with a Mac OS X Application Bundle
  * Implemented a simple Preferences dialog
  * Created a spiffy icon: ![http://www.developerfriendly.com/files/nodeimage/1/68bf614014e3fe16ded7108b7ea61848_tn.png](http://www.developerfriendly.com/files/nodeimage/1/68bf614014e3fe16ded7108b7ea61848_tn.png)

## Source ##

http://developerfriendly.googlecode.com/svn/trunk/mozilla/xulrunner/WebRunner_app/