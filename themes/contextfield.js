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
  }//end of isset onObject
}


slidenote.addTheme(newtheme);
