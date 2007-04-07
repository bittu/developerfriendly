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
//		public var fileRefList:FileReferenceList = new FileReferenceList();
		public var request:URLRequest;
		public var pendingFiles:Array = new Array();
		public var progressHandler:DisplayObject;
		public var currentFile:FileReference;
		public var bytesLoaded:uint;
		public var bytesTotal:uint;
		//public var progressHandler:Function;

		public function MultipleUploader() {
			this.fileTypes = new Array();
			initializeListListeners();
		}

		public function setURL(url:String):void {
			this.request = new URLRequest(url);
		}

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

		private function initializeListListeners():void {
			addEventListener(Event.SELECT, selectHandler);
			addEventListener(Event.CANCEL, cancelHandler);
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
		public function addProgressHandler(handler:DisplayObject):void {
			this.progressHandler = handler;
		}

		private function selectHandler(event:Event):void {
			trace("selectHandler: " + fileList.length + " files");

			var file:FileReference;
			for (var i:int = 0; i < fileList.length; i++) {
				file = FileReference(fileList[i]);
				addPendingFile(file);
			}
			if (progressHandler) {
				var newevent:UploadEvent = new UploadEvent("UploadStarted",this);
				progressHandler.dispatchEvent(newevent);
			}
		}

		private function cancelHandler(event:Event):void {
			trace("Browse Canceled");
			if (progressHandler) {
				var newevent:UploadEvent = new UploadEvent("BrowseCancel",this);
				progressHandler.dispatchEvent(newevent);
			}
		}

		private function openHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			currentFile=file;
			if (progressHandler) {
				var newevent:UploadEvent = new UploadEvent("FileOpen",this);
				progressHandler.dispatchEvent(newevent);
			}
			trace("openHandler: name=" + file.name);
		}

		private function fileProgressHandler(event:ProgressEvent):void {
			var file:FileReference = FileReference(event.target);
			currentFile=file;
			this.bytesLoaded = event.bytesLoaded;
			this.bytesTotal = event.bytesTotal;
			if (progressHandler) {
				var newevent:UploadEvent = new UploadEvent("FileProgress",this);
				progressHandler.dispatchEvent(newevent);
			}
			trace("progressHandler: name=" + file.name + " bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
		}

		private function completeHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			trace("completeHandler: name=" + file.name);
			removePendingFile(file);
		}

		private function httpErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			trace("httpErrorHandler: name=" + file.name);
		}

		private function ioErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			trace("ioErrorHandler: name=" + file.name);
		}

		private function securityErrorHandler(event:Event):void {
			var file:FileReference = FileReference(event.target);
			trace("securityErrorHandler: name=" + file.name + " event=" + event.toString());
		}

	}
}
