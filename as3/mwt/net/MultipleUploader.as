/*

 MulitpleUploader.as (an ActionScript 3 File Upload Class)

 Copyright (c) 2007, Mukunda Modell. All rights reserved.

 See LICENSE.txt for terms of use.

*/
package mwt.net
{
	import flash.display.DisplayObject;
	import flash.events.*;
	import flash.net.FileReference;
	import flash.net.FileReferenceList;
	import flash.net.FileFilter;
	import flash.net.URLRequest;
	import mwt.net.UploadEvent;

	/**
		mwt.net.MultipleUploader: A Class for uploading files via http
	*/
	public class MultipleUploader extends FileReferenceList {
		public static var LIST_COMPLETE:String = "listComplete";
		protected var imageTypes:FileFilter;
		public var fileTypes:Array;
		public var request:URLRequest;
		public var pendingFiles:Array = new Array();
		public var currentFile:FileReference;
		public var bytesLoaded:uint;
		public var bytesTotal:uint;

		/* Constructor */
		public function MultipleUploader() {
			this.fileTypes = new Array();
			addEventListener(Event.SELECT, selectHandler);
			addEventListener(Event.CANCEL, cancelHandler);
		}

		/* set the upload url */
		public function setURL(url:String):void {
			this.request = new URLRequest(url);
		}
		/* show the upload dialog */
		public function showDialog():Boolean {
			var success:Boolean = false;
			try {
			    success = this.browse();
			    if (success)
			    {
				    trace("Browse:Success");
				}
			} catch (error:Error) {
			    trace("Browse:Failed");
			    success=false;
			}
			return success;
		}

		private function doOnComplete():void {
			var event:UploadEvent = new UploadEvent("UploadComplete",this);
			dispatchEvent(event);
		}
		private function doFileComplete():void {
			var event:UploadEvent = new UploadEvent("FileComplete",this);
			dispatchEvent(event);
		}

		private function addPendingFile(file:FileReference):void {
			trace("addPendingFile: name=" + file.name);
			pendingFiles.push(file);
			file.addEventListener(Event.OPEN, openHandler);
			file.addEventListener(Event.COMPLETE, completeHandler);
			file.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			file.addEventListener(ProgressEvent.PROGRESS, fileProgressHandler);
			file.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			file.upload(this.request);
		}

		private function removePendingFile(file:FileReference):void {
			for (var i:int; i < pendingFiles.length; i++) {
				if (pendingFiles[i].name == file.name) {
					pendingFiles.splice(i, 1);
					doFileComplete();
					if (pendingFiles.length == 0) {
						doOnComplete();
					}
					return;
				}
			}
		}


		private function selectHandler(event:Event):void {
			trace("selectHandler: " + fileList.length + " files");

			var file:FileReference;
			for (var i:int = 0; i < fileList.length; i++) {
				file = FileReference(fileList[i]);
				addPendingFile(file);
			}
			var newevent:UploadEvent = new UploadEvent("UploadStarted",this);
			dispatchEvent(newevent);
		}

		private function cancelHandler(event:Event):void {
			trace("Browse Canceled");
			var newevent:UploadEvent = new UploadEvent("BrowseCancel",this);
			dispatchEvent(newevent);

		}

		private function openHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			currentFile=file;
			var newevent:UploadEvent = new UploadEvent("FileOpen",this);
			dispatchEvent(newevent);
			trace("openHandler: name=" + file.name);
		}

		private function fileProgressHandler(event:ProgressEvent):void {
			var file:FileReference = FileReference(event.target);
			currentFile=file;
			this.bytesLoaded = event.bytesLoaded;
			this.bytesTotal = event.bytesTotal;
			var newevent:UploadEvent = new UploadEvent("FileProgress",this);
			dispatchEvent(newevent);

			trace("progressHandler: name=" + file.name + " bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
		}

		private function completeHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			trace("completeHandler: name=" + file.name);
			removePendingFile(file);
		}

		private function httpErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			transferErrorHandler(event, "http", file);
		}

		private function ioErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			transferErrorHandler(event, "io", file);
		}

		private function securityErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			transferErrorHandler(event, "security", file);
		}
		private function transferErrorHandler(event:Event, errorType:String, file:FileReference):void {
			trace("(" + file.name + ") " + errorType + " Error: " + event.toString());
			var newevent:UploadEvent = new UploadEvent("TransferError",this);
			dispatchEvent(newevent);
		}
	}
}
