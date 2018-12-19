var newtheme = new Theme("contextfield");
newtheme.description = "Contextfield: Adds a Field with helpfull Information to the MD-Code-Editor";


newtheme.init = function(){
  this.contextFieldContainer = document.createElement("div");
  //var contextTitle = document.createElement("h1");
  //contextTitle.innerHTML = "Context-Field Helper";
  //this.contextFieldContainer.appendChild(contextTitle);
  this.Field = document.getElementById("contextfield");
  if(this.Field===null){
    this.Field = document.createElement("div");
    this.Field.id="contextfield";
  }//this.contextFieldContainer.appendChild(this.Field);
  //this.contextFieldContainer.id="contextfieldcontainer";
  document.getElementById("sidebarcontainer").appendChild(this.Field);
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

newtheme.styleThemeMDCodeEditor = function(mode){
  //clear contextfield
  var Field = document.getElementById("contextfield");
  Field.innerHTML = "";
  //test if we are on an object:
  var onObject = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
  console.log("styleThemeMDCodeEditor mit Objekt:"); console.log(onObject);
  //check if insertmenu is available - if not, do nothing:
  var insertarea = document.getElementById("insertarea");
  //if(!insertarea || insertarea.style.visibility==="hidden"){
  if(mode!="insertAreaVisible"){
    console.log("make contextfield visible after insert")
    Field.style.visibility="hidden";
    return;
  }
    Field.style.visibility="visible";

  if(onObject){
    Field.classList.remove("empty");
    if(onObject.typ === "image"){
      //Field.innerHTML = "![<i>imagealttext</i>](<b>imagename or url</b>)<br>"
      //+ "Example: ![](my_image1)<br> Current image:<br>";
      var fieldtext = document.createElement("div");
      fieldtext.innerText="choose a picture from your library for the current selection";
      Field.appendChild(fieldtext);
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
        noimagetext.innerHTML = "No image uploaded by the name <i>"+onObject.src+"</i>";
        //Field.appendChild(noimagetext);
        cfimage.src = "images/imageupload.png";
      }

      Field.appendChild(cfimage);
      var uploadlink = document.createElement("a");
      uploadlink.href="#";
      uploadlink.name = onObject.src;
      uploadlink.onclick=function(){
        slidenote.base64images.preselectedname = this.name;
        document.getElementById("imagesblock").classList.add("visible");
      };
      //uploadlink.innerHTML = "Upload an Image to the slidenote";
      var uploadlinkimg = new Image();
      uploadlinkimg.classList.add("uploadlink");
      uploadlinkimg.src="images/buttons/imageneg.png";
      uploadlink.appendChild(uploadlinkimg);
      Field.appendChild(uploadlink);
      var morelink = document.createElement("a");
      morelink.href="#";
      morelink.innerText="more...";
      Field.appendChild(morelink);

    }//end of type = image
    if(onObject.dataobject){
      //element has dataobject so it should use themes help-text:
      var cftheme = slidenote.datatypes.elementOfType(onObject.dataobject.type).theme;
      console.log("on object has dataobject. Theme:");
      console.log(cftheme);
      //console.log(typeof cftheme.helpText + " - " +cftheme.helpText(onObject.dataobject));
      if(cftheme.helpText && typeof cftheme.helpText ==="function"){
        var helptext = cftheme.helpText(onObject.dataobject);
        console.log(typeof helptext);
        if(typeof helptext ==="string")Field.innerHTML = helptext;
        else Field.appendChild(helptext);
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
    console.log("object found:"+onObject.typ +"/"+onObject.tag);
  } else { //end of isset onObject
    //no object found
    console.log("no object found");
    Field.classList.add("empty");
    var emptytext = document.createElement("div");
    emptytext.innerText="select a markup or insert a section for the current paragraph";
    if(slidenote.textarea.selectionStart!=slidenote.textarea.selectionEnd)
        emptytext.innerText="select a markup for the current text selection";
    Field.appendChild(emptytext);
    var morelink = document.createElement("a");
    morelink.innerText="more...";
    morelink.href="#";
    Field.appendChild(morelink);
  }//end of isset onObject else
  //setting top of contextfield:
  var newtop = insertarea.offsetTop;
  if(newtop>slidenote.textarea.offsetHeight/2){
    //up on insertarea:
    newtop -= (Field.offsetHeight + 10);
  } else{
    newtop+= insertarea.offsetHeight+10;
  }
  console.log("newtop:"+newtop + "insmenu: "+insertarea.offsetTop + "fieldheight:"+Field.offsetHeight);
  Field.style.top = newtop+"px";

}


slidenote.addTheme(newtheme);
