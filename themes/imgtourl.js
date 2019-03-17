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
  lastuploadedimage : null,
  preselectedname: null,
  quality: 0.8,
  imagetype: "image/jpeg",
  maxwidth: 1280, //1920,
  maxheight: 720, //1080,
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
  deleteAllImages: function(){
    this.base64images.length = 0;
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
      //check if imagename is yet in database - if so replace image-data:
      let aktimgname = aktimg.substring(0,aktimg.indexOf(">>>"));
      let existingimage = this.imageByName(aktimgname);
      if(existingimage!=null)
            existingimage.base64url = aktimg.substring(aktimg.indexOf('>>>')+3); else
            this.base64images.push(new base64Image(aktimg.substring(0,aktimg.indexOf('>>>')), aktimg.substring(aktimg.indexOf('>>>')+3)));
      imgstring = imgstring.substring(imgstring.indexOf('<<<')+3);
    }
    this.rebuildOldImages();
  },
  notempty: function(){
    return (this.base64images.length>0);
  },
  resizeImage: function(img){
    var maxwidth = slidenote.base64images.maxwidth;
    var width = maxwidth;
    var maxheight = slidenote.base64images.maxheight;
    if(img.width<maxwidth){
      console.log("image has only width:"+img.width);
      document.getElementById("downsizedimage").src = img.src;
      return;
    }
     var canvas = document.createElement('canvas'),
         ctx = canvas.getContext("2d"),
         oc = document.createElement('canvas'),
         octx = oc.getContext('2d');

     canvas.width = maxwidth; // destination canvas size
     canvas.height = canvas.width * img.height / img.width;

     if(canvas.height > maxheight){
       canvas.height = maxheight;
       canvas.width = canvas.height * img.width / img.height;
       width = canvas.width;
     }

     var cur = {
       width: Math.floor(img.width * 0.5),
       height: Math.floor(img.height * 0.5)
     }

     oc.width = cur.width;
     oc.height = cur.height;

     octx.drawImage(img, 0, 0, cur.width, cur.height);

     while (cur.width * 0.5 > width) {
       cur = {
         width: Math.floor(cur.width * 0.5),
         height: Math.floor(cur.height * 0.5)
       };
       octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
     }

     ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
     //document.getElementById("downsizedimage").src = canvas.toDataURL();
     document.getElementById("downsizedimage").src = canvas.toDataURL(slidenote.base64images.imagetype,slidenote.base64images.quality);
  },//end of resizeImage
  changeMaxSize: function(size){
    if(size){
      var mw = size.substring(0,size.indexOf("x"));
      var mh = size.substring(size.indexOf("x")+1);
      this.maxwidth = mw;
      this.maxheight = mh;
      var targetimg = document.getElementById("downsizedimage");
      if(targetimg){
        if(this.lastuploadedimage)this.resizeImage(this.lastuploadedimage);
      }
    }else{
      this.maxwidth=1024;
      this.maxheight=768;
    }
  }

};//end of new object slidenote.base64images

newtheme.insideFinalizeHtml = function(template){
  console.log("imgtourl - scan for images and replace them with data-urls");
  var imgtags =  template.content.querySelectorAll("img");//slidenote.presentationdiv.getElementsByTagName("img");
  for(var x=0;x<imgtags.length;x++){
    var imgtagname =  decodeURIComponent(imgtags[x].src);//imgtags[x].src.substring(imgtags[x].src.lastIndexOf("/")+1);
    var baseurl = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
    if(imgtagname.substring(0,baseurl.length)===baseurl)imgtagname=imgtagname.substring(baseurl.length);
    console.log("image mit src "+imgtagname+" gefunden");
    var b64image = slidenote.base64images.imageByName(imgtagname);
    if(b64image!=null){
      console.log("image in datenbank gefunden. b64code:"+b64image.base64url);
      imgtags[x].src=b64image.base64url;
    }
  }
};
newtheme.init = function(){
  console.log("imgtourl wird initialisiert");
  //add imagebutton to texteditorbuttons
  var texteditorbuttons = document.getElementById("texteditorbuttons");
  var button = document.createElement("BUTTON");
  var buttontext = new Image();
  buttontext.src=slidenote.basepath+"images/buttons/image.png";
  //var buttontext = document.createTextNode("Image");
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('filePreview');
  button.appendChild(buttontext);
  button.onclick = function(event){
    slidenote.base64images.preselectedname = null;
    var el = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
    if(el!=null && el.typ==="image"){
      slidenote.base64images.preselectedname = el.src;
      var b64image = slidenote.base64images.imageByName(el.src);
      if(b64image !=null){
        var fprew = document.getElementById("filePreview");
        fprew.innerHTML="";
        var b64img = new Image();
        b64img.src = b64image.base64url;
        b64img.id = "downsizedimage";
        b64img.onclick=function(){
          document.getElementById("imagesblock").classList.remove("visible");
          slidenote.textarea.focus();
        };
        fprew.appendChild(b64img);
      }
    }

    document.getElementById('imagesblock').classList.add('visible');
  };
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
            img.onload = function() {
              slidenote.base64images.resizeImage(img);
            }
            var targetimg = new Image();
            targetimg.id = "downsizedimage";
            targetimg.name = nombre;
            targetimg.onclick = function(){slidenote.base64images.addImage(this.name,this.src);};

  					fileDisplayArea.appendChild(targetimg);

            //load image
            img.src = reader.result;
            //save last uploaded image in orig size:
            slidenote.base64images.lastuploadedimage = img;
            //add to slidenote:
            //slidenote.base64images.addImage(nombre,reader.result);

  				}

  				reader.readAsDataURL(file);
  			} else {
  				fileDisplayArea.innerHTML = "File not supported!";
  			}
  });
  slidenote.textarea.addEventListener("drop", function(e){
    console.log("dropevent:");
    console.log(e);
    var dt = e.dataTransfer;
    var file = dt.files[0];
    var nombre = file.name;
    var imageType = /image.*/;
    if(file.type.match(imageType)){
      //check if on actual image if so use that images src as name:
      var activeelement = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
      if(activeelement && activeelement.typ==="image"){
        slidenote.base64images.preselectedname=activeelement.src;
        nombre = activeelement.src;
      }
      var reader = new FileReader();
      reader.onload = function(e){
        fileDisplayArea.innerHTML = "";
        var img = new Image();
        img.onload = function(){slidenote.base64images.resizeImage(img);};
        var targetimg = new Image();
        targetimg.id="downsizedimage";
        targetimg.name=nombre;
        targetimg.onclick = function(){slidenote.base64images.addImage(this.name, this.src);};
        fileDisplayArea.appendChild(targetimg);
        img.src = reader.result;
        slidenote.base64images.lastuploadedimage = img;
      }
      reader.readAsDataURL(file);
      document.getElementById("imagesblock").classList.add("visible");
    }
  },false);
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
