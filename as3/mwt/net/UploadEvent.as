package mwt.net
{
	import flash.events.Event;
	import mwt.net.MultipleUploader;

	public class UploadEvent extends Event {
		public var msg:String;
		public var bytesLoaded:uint;
		public var bytesTotal:uint;
		public var queueSize:uint;
		public var currentFile:String="";

		public function UploadEvent(msg:String, uploader:MultipleUploader) {
			super("UploadEvent");
			this.msg=msg;

			bytesLoaded	= uploader.bytesLoaded;
			bytesTotal	= uploader.bytesTotal;
			queueSize	= uploader.pendingFiles.length;
			if (uploader.currentFile) {
				currentFile = uploader.currentFile.name;
			}

		}

	}
}
