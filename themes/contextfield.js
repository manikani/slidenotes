var newtheme = new Theme("contextfield");
newtheme.description = "Contextfield: Adds a Field with helpfull Information to the MD-Code-Editor";


newtheme.init = function(){
  this.contextFieldContainer = document.createElement("div");
  var contextTitle = document.createElement("h1");
  contextTitle.innerHTML = "Context-Field Helper";
  this.contextFieldContainer.appendChild(contextTitle);
  this.Field = document.createElement("div");
  this.Field.id="contextfield";
  this.contextFieldContainer.appendChild(this.Field);
  this.contextFieldContainer.id="contextfieldcontainer";
};
newtheme.changeThemeStatus = function(status){
  this.active = status;
  if(this.active && slidenote.texteditorerrorlayer){
    if(document.getElementById("contextfieldcontainer")==null){
      console.log(this.contextFieldContainer);
      if(this.contextFieldContainer===undefined)this.init();
      document.getElementById("editorblock").appendChild(this.contextFieldContainer);
    }
  }
  if(!this.active){
    //delete contextfieldcontainer:
    var cfc = document.getElementById("contextfieldcontainer");
    if(cfc)cfc.parentNode.removeChild(cfc);
  }
}

newtheme.styleThemeMDCodeEditor = function(){
  //clear contextfield
  var Field = document.getElementById("contextfield");
  Field.innerHTML = "";
  //test if we are on an object:
  var onObject = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
  console.log("styleThemeMDCodeEditor mit Objekt:"); console.log(onObject);
  if(onObject){
    if(onObject.typ === "image"){
      Field.innerHTML = "![<i>imagealttext</i>](<b>imagename or url</b>)<br>"
      + "Example: ![](my_image1)<br> Current image:<br>";
      var cfimage = new Image();
      cfimage.id = "contextfieldimage";
      cfimage.name = onObject.src;
      cfimage.onclick = function(){
        slidenote.base64images.preselectedname = this.name;
        document.getElementById("imagesblock").classList.add("visible");
      }
      //check if image is inside base64:
      if(slidenote.base64images && slidenote.base64images.imageByName(onObject.src)){
        //image is in base64 so use it for context-field-helper:
        cfimage.src = slidenote.base64images.imageByName(onObject.src).base64url;
      }else if(onObject.src.substring(0,4)==="http"){
        //http image: try to load it:
        cfimage.src = onObject.src;
      } else{
        //no image found - use upload-image
        var noimagetext = document.createElement("div");
        noimagetext.innerHTML = "No image uploaded by the name <i>"+onObject.src+"</i> <br>";
        var uploadlink = document.createElement("a");
        uploadlink.href="#";
        uploadlink.name = onObject.src;
        uploadlink.onclick=function(){
          slidenote.base64images.preselectedname = this.name;
          document.getElementById("imagesblock").classList.add("visible");
        };
        uploadlink.innerHTML = "Upload an Image to the slidenote";
        Field.appendChild(noimagetext);
        Field.appendChild(uploadlink);
        cfimage.src = "images/imageupload.png";
      }

      Field.appendChild(cfimage);
    }//end of type = image
    if(onObject.dataobject){
      //element has dataobject so it should use themes help-text:
      var cftheme = slidenote.datatypes.elementOfType(onObject.dataobject.type).theme;
      console.log("on object has dataobject. Theme:");
      console.log(cftheme);
      console.log(typeof cftheme.helpText + " - " +cftheme.helpText(onObject.dataobject));
      if(cftheme.helpText && typeof cftheme.helpText ==="function"){
        Field.innerHTML = cftheme.helpText(onObject.dataobject);

      }
    }//end of type = dataObject
    if(onObject.typ ==="pagebreak"){
      Field.innerHTML = "--- 3 or more minus set a pagebreak, starting a new slide and ending the last."+
      "<br> To put an image to the background you can put it as sole element on next line."+
      "<br> Example: <br>---<br>![](mybackgroundimage)<br>";
    }
    if(onObject.tag ==="title"){
      Field.innerHTML = "<h1>#Title</h1><h2>##Subtitle</h2><h3>###Subsubtitle</h3>";

    }
  } else { //end of isset onObject
    //no object found


  }//end of isset onObject else
}


slidenote.addTheme(newtheme);
