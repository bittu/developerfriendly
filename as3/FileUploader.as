/*
 Copyright (c) 2007, Mukunda Modell. All rights reserved.

 See LICENSE.txt for terms of use.
*/
package
{
	import mwt.net.MultipleUploader;
	import mwt.net.ImageUploader;
    import flash.display.Sprite;
    import flash.text.TextField;
    import flash.events.*;
    import flash.net.FileReference;
    import flash.net.FileReferenceList;


    public class FileUploader extends Sprite {

		public var uploader:ImageUploader;
		private var params:Object;
        public function FileUploader()
        {
			params = this.root.loaderInfo.parameters;
			uploader = new ImageUploader();
			var url:String = "upload.php";
			try {
				url = params.uploadURL;
			} catch(err:Error) { }
			uploader.setURL(url);
			uploader.showDialog();
        }


    }
}