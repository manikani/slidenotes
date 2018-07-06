var newtheme = new Theme("imgtourl",1);

newtheme.description = "Converts Images to Data-URLs";
newtheme.active=true;

//ergänze javascript-architektur für verwalten von images:
//grundklasse:
function base64Image(name,base64url){
  this.name = name;
  this.base64url = base64url;
}
//objekt base64images
slidenote.base64images = {
  base64images : new Array(),
  imageByName : function(imagename){  //returns fitting base64-image
    for(var x=0;x<this.base64images.length;x++){
        if(this.base64images[x].name===imagename){
          return this.base64images[x];
        }
    }
  },
  rebuildOldImages: function(){
    //displays images in js-database of slidenote in div
    var oldimagestext = "";
    for(var x=0;x<this.base64images.length;x++){
      //oldimagestext+='<a href="Javascript:insertbutton(\'%b64'+this.base64images[x].name+'\')"';
      oldimagestext+= 'Image #'+x+'. Use ![]('+this.base64images[x].name+') in md-code or click on image to insert into editor:';
      oldimagestext+='<img src="'+this.base64images[x].base64url+'" name="'+this.base64images[x].name+'" onclick="slidenote.base64images.insertImage(this.name)">';
      oldimagestext+='<a href="Javascript:slidenote.base64images.deleteImage(\''+this.base64images[x].name+'\')">Delete Image from Database</a>';
      oldimagestext+='<br>';
    }
    document.getElementById("fileOld").innerHTML = oldimagestext;

  },
  addImage: function(name,base64url){
    this.base64images.push(new base64Image(name,base64url)); //adds image to Database
    this.insertImage(name); //adds image to md-code
    this.rebuildOldImages(); //rebuild old images for further use
  },
  deleteImage: function(name){
    for(var x=0;x<this.base64images.length;x++){
      if(this.base64images[x].name===name)this.base64images.splice(x,1);
    }
    this.rebuildOldImages();
  },
  insertImage: function(name){
    //adds image to md-code
    insertbutton('%b64'+name);
    //TODO: "close/hide" the image-selection-div
    document.getElementById("imagesblock").classList.remove("visible");
  },
  lastImage: function(){
    return this.base64images[this.base64images.length-1];
  }

};

newtheme.styleThemeSpecials = function(){
  console.log("imgtourl - scan for images and replace them with data-urls");
  var imgtags = slidenote.presentationdiv.getElementsByTagName("img");
  for(var x=0;x<imgtags.length;x++){
    var imgtagname = imgtags[x].src.substring(imgtags[x].src.lastIndexOf("/")+1);
    console.log("image mit src "+imgtagname+" gefunden");
    var b64image = slidenote.base64images.imageByName(imgtagname);
    if(b64image!=null){
      console.log("image in datenbank gefunden. b64code:"+b64image.base64url);
      imgtags[x].src=b64image.base64url;
    }
  }
}
newtheme.init = function(){
  console.log("imgtourl wird initialisiert");
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('filePreview');
  console.log(fileInput);
  fileInput.addEventListener('change', function(e) {
        //console.log("adding eventlistener to fileinput");
  			var file = fileInput.files[0];
        var nombre = fileInput.files[0].name;
  			var imageType = /image.*/;

  			if (file.type.match(imageType)) {
  				var reader = new FileReader();

  				reader.onload = function(e) {
  					fileDisplayArea.innerHTML = "";

  					var img = new Image();
  					img.src = reader.result;

            img.onclick = function(){slidenote.base64images.addImage(nombre,reader.result);};
  					fileDisplayArea.appendChild(img);
            //add to slidenote:
            //slidenote.base64images.addImage(nombre,reader.result);

  				}

  				reader.readAsDataURL(file);
  			} else {
  				fileDisplayArea.innerHTML = "File not supported!";
  			}
  });
}
slidenote.addTheme(newtheme);
