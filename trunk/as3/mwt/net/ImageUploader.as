package mwt.net
{
	import flash.events.*;
	import flash.net.FileReference;
	import flash.net.FileReferenceList;
	import flash.net.FileFilter;
	import flash.net.URLRequest;

	/**
		mwt.net.ImageUploader: A Class for uploading files via http
	*/
	public class ImageUploader extends MultipleUploader {
		public function ImageUploader() {
			var imageTypes:FileFilter = new FileFilter("Images (jpg, tiff, png)", "*.jpg; *.jpeg; *.tif; *.tiff; *.png; *.JPG; *.JPEG; *.TIF; *.TIFF; *.PNG");
			this.fileTypes.push(imageTypes)
		}
	}

}