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
  preselectedname: null,
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
      oldimagestext+='<img src="'+this.base64images[x].base64url+'" name="'+this.base64images[x].name+'" onclick="slidenote.base64images.addImage(this.name,this.src)">';
      oldimagestext+='<a href="Javascript:slidenote.base64images.deleteImage(\''+this.base64images[x].name+'\')">Delete Image from Database</a>';
      oldimagestext+='<br>';
    }
    document.getElementById("fileOld").innerHTML = oldimagestext;

  },
  addImage: function(name,base64url){
    var nombre = name;
    if(this.preselectedname!=null)nombre=this.preselectedname;
    console.log("add image"+nombre);
    if(this.imageByName(nombre)!=null) {
      this.imageByName(nombre).base64url = base64url;
    } else {
      this.base64images.push(new base64Image(nombre,base64url)); //adds image to Database
    }
    var activeimage =slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
    //if(activeimage==null)activeimage =slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd-1);
    if(activeimage !=null && activeimage.typ==="image"){
      var imgmdcodestring = "!["+activeimage.alt+"]("+nombre+")";
      //slidenote.textarea.value = slidenote.textarea.value.substring(0,activeimage.posinall)+
      //                          imgmdcodestring+
      //                          slidenote.textarea.value.substring(activeimage.posinall+activeimage.mdcode.length);
      document.getElementById("imagesblock").classList.remove("visible");
      slidenote.textarea.focus();
    }else{
      console.log("imageinsert nombre name:"+nombre+"-"+name)
      this.insertImage(name); //adds image to md-code
    }
    this.rebuildOldImages(); //rebuild old images for further use
    console.log("parseneu forced by base64imageadded");
    slidenote.parseneu();
    this.preselectedname=null;
  },
  deleteImage: function(name){
    for(var x=0;x<this.base64images.length;x++){
      if(this.base64images[x].name===name)this.base64images.splice(x,1);
    }
    this.rebuildOldImages();
  },
  insertImage: function(name){
    //adds image to md-code
    console.log("imageinsert name"+name);
    insertbutton('%b64'+name);
    //TODO: "close/hide" the image-selection-div
    document.getElementById("imagesblock").classList.remove("visible");
  },
  lastImage: function(){
    return this.base64images[this.base64images.length-1];
  },
  allImagesAsString: function(){
    let imagestring = "";
    for(let x=0;x<this.base64images.length;x++){
      imagestring+=this.base64images[x].name+'>>>'+this.base64images[x].base64url+'<<<';
    }
    return imagestring;
  },
  loadImageString: function(imagestring){
    let aktpos=0;
    let imgstring = imagestring;
    while(imgstring.indexOf('>>>')>0){
      let aktimg = imgstring.substring(0,imgstring.indexOf('<<<'));
      this.base64images.push(new base64Image(aktimg.substring(0,aktimg.indexOf('>>>')), aktimg.substring(aktimg.indexOf('>>>')+3)));
      imgstring = imgstring.substring(imgstring.indexOf('<<<')+3);
    }
    this.rebuildOldImages();
  },
  notempty: function(){
    return (this.base64images.length>0);
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
  //add imagebutton to texteditorbuttons
  var texteditorbuttons = document.getElementById("texteditorbuttons");
  var button = document.createElement("BUTTON");
  var buttontext = document.createTextNode("Image");
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('filePreview');
  button.appendChild(buttontext);
  button.onclick = function(event){
    slidenote.base64images.preselectedname = null;
    var el = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
    if(el!=null && el.typ==="image"){
      slidenote.base64images.preselectedname = el.src;
      var b64image = slidenote.base64images.imageByName(el.src)
      if(b64image !=null){
        var fprew = document.getElementById("filePreview");
        fprew.innerHTML="";
        var b64img = new Image();
        b64img.src = b64image.base64url;
        b64img.onclick=function(){
          document.getElementById("imagesblock").classList.remove("visible");
          slidenote.textarea.focus();
        };
        fprew.appendChild(b64img);
      }
    }

    document.getElementById('imagesblock').classList.add('visible');
  }
  texteditorbuttons.appendChild(button);

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
  slidenote.textarea.addEventListener("keyup",function(event){
    var key = ""+event.key;
    if(key==="undefined")key=getKeyOfKeyCode(event.keyCode);
    if(key===")"){
      console.log(") pressed");
      slidenote.parseneu();
      var cursorpos = slidenote.textarea.selectionEnd -1;
      var activeelement = slidenote.parser.CarretOnElement(cursorpos);
      if(activeelement!=null &&
            activeelement.typ ==="image" &&
            activeelement.src.substring(0,4)!="http" &&
            slidenote.base64images.imageByName(activeelement.src)==null){
              console.log("image keyup with src "+activeelement.src );
        slidenote.base64images.preselectedname = activeelement.src;
        document.getElementById("filePreview").innerHTML = "";
        //var oldimages = document.querySelectorAll("#fileOld img");
        //for(var oi=0;oi<oldimages.length;oi++)oldimages[oi].onclick = function(event){slidenote.base64images.addImage(this.name, this.src)};
        document.getElementById("imagesblock").classList.add("visible");
        slidenote.textarea.selectionEnd=slidenote.textarea.selectionEnd-1;
        slidenote.textarea.selectionStart = slidenote.textarea.selectionEnd;
      }
    }
  });
  document.getElementById("imagesblock").addEventListener("keyup",function(event){
    var key=""+event.key;
    if(key==="undefined")key=getKeyOfKeyCode(event.keyCode);
    if(key==="Escape")this.classList.remove("visible");
  });
}
slidenote.addTheme(newtheme);
