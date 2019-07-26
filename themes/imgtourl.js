var newtheme = new Theme("imgtourl",1);

newtheme.description = "Converts Images to Data-URLs";
newtheme.active=true;

//ergänze javascript-architektur für verwalten von images:
//grundklasse:
function base64Image(name,base64url,filename){
  //this.name = name;
  this.base64url = base64url;
  //this.id = ???;
  this.names = [];
  if(name){
    if(typeof name==="string")this.names.push(name);
    else this.names = name;
  }
  this.filename = filename;
}
//objekt base64images
slidenote.base64images = {
  base64images : new Array(),
  lastuploadedimage : null,
  preselectedname: null,
  quality: 0.8,
  imagetype: "image/jpeg",
  maxwidth: 1920,//1280, //1920,
  maxheight: 1080,//720, //1080,
  imageByName : function(imagename){  //returns fitting base64-image
    for(var x=0;x<this.base64images.length;x++){
      for(var y=0;y<this.base64images[x].names.length;y++){
        if(this.base64images[x].names[y]===imagename){
          return this.base64images[x];
        }
      }
    }
  },
  imageBySource : function(base64url){
    for(var x=0;x<this.base64images.length;x++){
      if(this.base64images[x].base64url === base64url){
        return this.base64images[x];
      }
    }
  },
  rebuildOldImages: function(){
    //will be replaced soon i think:
    if(!document.getElementById("fileOld"))return;
    //displays images in js-database of slidenote in div
    var oldimagestext = "";
    for(var x=0;x<this.base64images.length;x++){
      //oldimagestext+='<a href="Javascript:insertbutton(\'%b64'+this.base64images[x].name+'\')"';
      oldimagestext+= 'Image #'+x+'. <br>';
      for(var y=0;y<this.base64images[x].names.length;y++){
          oldimagestext+='Use ![]('+this.base64images[x].names[y]+') in md-code or click on image to insert into editor<br>';
      }
      oldimagestext+='<img src="'+this.base64images[x].base64url+'" name="'+this.base64images[x].filename+'" onclick="slidenote.base64images.addImage(this.name,this.src)">';
      oldimagestext+='<a href="Javascript:slidenote.base64images.deleteImage(\''+this.base64images[x].base64url+'\')">Delete Image from Database</a>';
      oldimagestext+='<br>';
    }
    document.getElementById("fileOld").innerHTML = oldimagestext;

  },
  addImage: function(name,base64url){
    var nombre = name;
    if(this.preselectedname!=null)nombre=this.preselectedname;
    console.log("add image"+nombre);
    /*
    if(this.imageByName(nombre)!=null) {
      this.imageByName(nombre).base64url = base64url;
    } else {
      this.base64images.push(new base64Image(nombre,base64url)); //adds image to Database
    }*/
    var imgbysrc = this.imageBySource(base64url);
    var imgbyname = this.imageByName(nombre);
    if(imgbysrc && imgbysrc != imgbyname){
      //image found in database, so add name to it:
      imgbysrc.names.push(nombre);
      //delete old connection if exists:
      if(imgbyname)for(var x=0;x<imgbyname.names.length;x++){
        if(imgbyname.names[x]===nombre)imgbyname.names.splice(x,1);
      }
    }else if(!imgbysrc){
      //image not found in database - add new image:
      this.base64images.push(new base64Image(nombre,base64url,name)); //adds image to Database
      //delete old connection if exists:
      if(imgbyname)for(var x=0;x<imgbyname.names.length;x++){
        if(imgbyname.names[x]===nombre)imgbyname.names.splice(x,1);
      }
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
  deleteImage: function(base64url){
    for(var x=0;x<this.base64images.length;x++){
      if(this.base64images[x].base64url===base64url)this.base64images.splice(x,1);
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
    let allimages = [];
    for(var x=0;x<this.base64images.length;x++){
      let b=this.base64images[x];
      allimages.push({names:b.names,filename:b.filename,
                base64url:b.base64url});
      //i do this to avoid including hash & encrypted image
    }
    return JSON.stringify(allimages);
  },
  loadImageString: function(jsonstring){
    let loadimages = JSON.parse(jsonstring);
    if(!loadimages.length)return; //something went wrong
    for(var x=0;x<loadimages.length;x++){
        let loadi = loadimages[x];
        let existingimage = this.imageBySource(loadi.base64url);
        if(!existingimage){ //image does not exist yet
          this.base64images.push(new base64Image(loadi.names,loadi.base64url,loadi.filename));
        }else{ //image is in database, put name to it:
          for(var n=0;n<loadi.names.length;n++){
            if(this.imageByName(loadi.names[n])===null){
              existingimage.names.push(loadi.names[n]);
            }
          }
        }
    }
    this.rebuildOldImages();
  },
  allImagesAsStringold: function(){
    let imagestring = "";
    for(let x=0;x<this.base64images.length;x++){
      imagestring+=this.base64images[x].names.join("§€§")+
                  "§$§"+this.base64images[x].filename+
                  '>>>'+this.base64images[x].base64url+'<<<';
    }
    return imagestring;
  },
  loadImageStringold: function(imagestring){
    let aktpos=0;
    let imgstring = imagestring;
    while(imgstring.indexOf('>>>')>0){
      let aktimg = imgstring.substring(0,imgstring.indexOf('<<<'));
      //check if imagename is yet in database - if so replace image-data:
      let aktimgmeta = aktimg.substring(0,aktimg.indexOf(">>>"));
      let aktimgbase64 = aktimg.substring(aktimgmeta.length+3);
      let aktimgnames = aktimgmeta.substring(0,aktimgmeta.indexOf("§$§")).split("§€§");
      let aktimgfilename = aktimgmeta.substring(aktimgmeta.indexOf("§$§")+3);
      let existingimage = this.imageBySource(aktimgbase64);
      if(!existingimage){
        //only load image if not existend in database:
        this.base64images.push(new base64Image(aktimgnames, aktimgbase64, aktimgfilename));
      }else{
        //image exists
        for(var x=0;x<aktimgnames.length;x++){
          if(this.imageByName(aktimgnames[x])===null){
            existingimage.names.push(aktimgnames[x]);//add name to it
          }
        }
      }
      /*let existingimage = this.imageByName(aktimgname);
      if(existingimage!=null)
            existingimage.base64url = aktimg.substring(aktimg.indexOf('>>>')+3); else
            this.base64images.push(new base64Image(aktimg.substring(0,aktimg.indexOf('>>>')), aktimg.substring(aktimg.indexOf('>>>')+3)));
            */

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
    var baseurl;
    baseurl = window.location.origin+window.location.pathname;
    if(imgtagname.substring(0,baseurl.length)===baseurl)imgtagname=imgtagname.substring(baseurl.length);
    baseurl = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
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
  if(!document.getElementById('fileInput')){
    console.log("imgtourl: no fileinput found");
    return;//do nothing if no fileinput is present, therefore no editor
  }
  console.log("imgtourl wird initialisiert");
  //add imagebutton to texteditorbuttons
  var texteditorbuttons = document.getElementById("texteditorbuttons");
  var button = document.createElement("BUTTON");
  var buttonimage = new Image();
  buttonimage.src=slidenote.imagespath+"buttons/image.png";
  buttonimage.title = "Image";
  //var buttontext = document.createTextNode("Image");
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('filePreview');
  button.appendChild(buttonimage);
  var buttonpretext = document.createElement("span");
  buttonpretext.classList.add("buttonmdcode");
  buttonpretext.innerText = "![](";
  var buttonintext = document.createElement("span");
  buttonintext.classList.add("buttonmdtext");
  buttonintext.innerText="image";
  var buttonendtext = document.createElement("span");
  buttonendtext.classList.add("buttonmdcode");
  buttonendtext.innerText=")";
  button.appendChild(buttonpretext);
  button.appendChild(buttonintext);
  button.appendChild(buttonendtext);
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
  //texteditorbuttons.appendChild(button);
  var li=document.createElement("li");
  li.appendChild(button);
  document.getElementById("toolbarbuttons").appendChild(li);

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

newtheme.insertMenu = function(element){
  var b64img = slidenote.base64images.imageByName(element.src);
  var result = document.createElement("div");
  var previewimage = new Image();
  previewimage.classList.add("insertmenu-preview-image");
  if(b64img){
    previewimage.src = b64img.base64url;
  }else{
    previewimage.src = slidenote.imagespath+"/imageupload.png";
  }
  result.appendChild(previewimage);

  var uploadlink = document.createElement("a");
  uploadlink.href="#";
  uploadlink.name = element.src;
  uploadlink.title = "open library";
  uploadlink.onclick=function(){
    slidenote.base64images.preselectedname = this.name;
    document.getElementById("imagesblock").classList.add("visible");
  };
  //uploadlink.innerHTML = "Upload an Image to the slidenote";
  var uploadlinkimg = new Image();
  uploadlinkimg.classList.add("uploadlink");
  uploadlinkimg.src=slidenote.imagespath+"/buttons/image.png";
  uploadlink.appendChild(uploadlinkimg);
  result.appendChild(uploadlink);

  var descriptionlink = document.createElement("button");
  //descriptionlink.href = "#";
  descriptionlink.title = "set Description";
  descriptionlink.innerText = "set Description";
  var descpos = element.posinall+2;
  descriptionlink.name = descpos;
  descriptionlink.onclick = function(){
    slidenote.textarea.selectionEnd = this.name;
    slidenote.textarea.selectionStart = this.name;
    slidenote.textarea.focus();
  }
  result.appendChild(descriptionlink);

  var setAsBackgroundLink = document.createElement("button");
  setAsBackgroundLink.title="Set Image as Background of current Page or Layoutsection";
  setAsBackgroundLink.innerText = "set as Background";
  setAsBackgroundLink.onclick = function(){
    var el = slidenote.parser.CarretOnElement();
    var elpos = el.posinall;
    var elpage = slidenote.parser.map.pageAtPosition(elpos);
    var lastpagestart = slidenote.parser.map.pagestart[elpage].posinall;
    var dobj = slidenote.parser.dataobjects;
    var lastlayoutstart;
    for(var x=0;x<dobj.length;x++){
      var dob = dobj[x];
      if(dob.type==="layout" && dob.startline<el.line && dob.endline>el.line){
        lastlayoutstart = slidenote.parser.map.linestart[dob.startline+1];
        break;
      }
    }
    var inspos = lastpagestart;
    if(lastlayoutstart)inspos = lastlayoutstart;
    var newtext = slidenote.textarea.value.substring(0,inspos)+
                  el.mdcode + "\n\n"+
                  slidenote.textarea.value.substring(inspos,el.posinall)+
                  slidenote.textarea.value.substring(el.posinall+el.mdcode.length);
    slidenote.textarea.value = newtext;
    slidenote.textarea.selectionEnd = inspos;
    slidenote.textarea.selectionStart = inspos;
    slidenote.textarea.focus();
    slidenote.parseneu();
  }
  result.appendChild(setAsBackgroundLink);

  return result;
}
slidenote.addTheme(newtheme);
