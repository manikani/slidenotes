var newtheme = new Theme("sections");
newtheme.description = "Let you organize content inside sections";

newtheme.helpText = function(dataobject){
  var result = "<h2>Section-block</h2>"+
          "Content inside +++layout +++ Block are considered a section.<br>"+
          "With sections you can organize your content more specific. "+
          "You can use every MD-Code inside a section except new page."+
          "If the first Line of a section is an image it serves as the "+
          "background";
  return result;
}

newtheme.hasInsertMenu = true;
newtheme.insertMenuArea = function(dataobject){
  var selectionline = slidenote.parser.lineAtPosition(slidenote.textarea.selectionEnd);
  //old: only render menu if we are in top-line:
  //if(selectionline!=dataobject.startline && selectionline!=dataobject.endline)return null;
  var result = document.createElement("div");
  var leftbutton = document.createElement("button");
  var rightbutton = document.createElement("button");
  var topbutton = document.createElement("button");
  leftbutton.innerText="<- Left";
  rightbutton.innerText="Right ->";
  topbutton.innerText="Head";
  leftbutton.name="left";
  rightbutton.name="right"
  topbutton.name="head";
  var buttonfunc = function(){
    slidenote.extensions.getThemeByName("sections").changeSectionType(this.name);
  };
  leftbutton.addEventListener("click", buttonfunc);
  rightbutton.addEventListener("click",buttonfunc);
  topbutton.addEventListener("click",buttonfunc);
  result.appendChild(leftbutton);
  result.appendChild(rightbutton);
  result.appendChild(topbutton);
  return result;
  //old stuff??
  var insertlabel = document.createElement("label");
  insertlabel.innerText="INSERT";
  result.appendChild(insertlabel);
  var insertmenu = document.getElementById("standardinsertmenu").cloneNode(true);
  insertmenu.id="";
  var oldsectionbutton = insertmenu.getElementsByClassName("sectionsbutton")[0];
  oldsectionbutton.parentNode.removeChild(oldsectionbutton.parentNode.firstElementChild);
  oldsectionbutton.parentNode.removeChild(oldsectionbutton);
  var oldbuttons = insertmenu.getElementsByTagName("button");
  for(var bx=0;bx<oldbuttons.length;bx++)oldbuttons[bx].addEventListener("click",function(){slidenote.insertbutton(this.value)});
  result.appendChild(insertmenu);
  return result;
}

newtheme.changeSectionType = function(type){
  var selectionstart = slidenote.textarea.selectionStart;
  var selectionend = slidenote.textarea.selectionEnd;
  var actelement = slidenote.parser.CarretOnElement();
  var start = actelement.posinall;
  console.log("change sectiontype to:"+type);
  var end=slidenote.textarea.value.indexOf("\n",start);
  slidenote.textarea.value = slidenote.textarea.value.substring(0,start+3)+
                            "layout:"+type+
                            slidenote.textarea.value.substring(end);
  var diff=type.length+9-(end-start);
  slidenote.textarea.selectionEnd = selectionend+diff;
  slidenote.textarea.selectionStart = selectionstart+diff;
  slidenote.parseneu(); console.log("parseneu after changing sectiontype");
  slidenote.textarea.focus();
}

newtheme.addEditorbutton('<img src="'+slidenote.imagespath+'buttons/layout.png" title="layout/section">'+
  '<span class="buttonmdcode">+++</span>'+
  '<span class="buttonmdtext">layout</span>'+
  '<span class="buttonmdcode">+++</span>',"+++layout","+++");

slidenote.datatypes.push({type:"layout", mdcode:true, theme:newtheme});
slidenote.standarddatablocktype = {type:"layout",mdcode:true,theme:newtheme};

newtheme.addGlobalOption("checkbox","Use Github-Default (``` is codeblock, not section)","githubcodeblock",false);

newtheme.changeGlobalOption = function(optionnr, value){
  if(slidenote.standarddatablocktype && slidenote.standarddatablocktype.type ==="layout"){
    slidenote.standarddatablocktype=null;
  } else{
    slidenote.standarddatablocktype = {type:"layout",mdcode:true,theme:this};
  }
}

newtheme.saveConfigString = function(){
  return (slidenote.standarddatablocktype === null);
}

newtheme.loadConfigString = function(data){
  if(data==="true"){
    slidenote.standarddatablocktype=null;
  }else{
    slidenote.standarddatablocktype = {type:"layout",mdcode:true,theme:this};
  }
}

newtheme.styleThemeSpecials = function(){
  //get all data-blocks:
  var datadivs = slidenote.presentationdiv.getElementsByTagName("section");
  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    if(slidenote.parser.dataobjects[datax].type=="layout"){
      console.log("found section");
      var dataobject = slidenote.parser.dataobjects[datax];
      var sectiondata = datadivs[datax];
      sectiondata.classList.add("section");
      //easy mode - just for testing purpose:
      console.log(dataobject);
      //console.log(sectiondata.childNodes[1].tagName);
      if(sectiondata.childNodes.length<=1)return; //on empty section:
      if(sectiondata.childNodes[1].tagName==="IMG" &&
          dataobject.raw[0].substring(0,2)==="!["){
            //first image is in first line so use it as background:
            //sectiondata.style.backgroundImage = 'url('+sectiondata.childNodes[1].src+')';
            //sectiondata.removeChild(sectiondata.childNodes[1]);
            //use blocks if possible - maybe change it to something more plugable?
            sectiondata.childNodes[1].classList.add("bgimg");
            sectiondata.style.minHeight = sectiondata.childNodes[1].naturalHeight;
      }//end of image as background
      function checkforgridbuild(data){
        //checks if we have to build a grid in the section:
        var childs = data.children;
        console.log(childs);
        var result=false;
        for(var x=0;x<childs.length;x++){
          var child=childs[x];
          console.log(child);
          //on bgimage:
          if(child.classList.contains("bgimg"))result=true;
          //on charts: build grid
          if(child.classList.contains("chart"))result=true;
        }
        return result;
      }

      if(checkforgridbuild(sectiondata)){
        var blocktheme = slidenote.extensions.getThemeByName("blocks");
        if(blocktheme && blocktheme.active){
          blocktheme.buildgrid(sectiondata);
        }
      }
      //section left or right?
      if(dataobject.head.indexOf("left")>-1){
        //seems we found a left
        sectiondata.classList.add("left");
      }else if(dataobject.head.indexOf("right")>-1){
        //we found a right
        sectiondata.classList.add("right");
      }else if(dataobject.head.indexOf("head")>-1){
          sectiondata.classList.add("head");
      }else if(dataobject.head.indexOf("inline")>-1){
          sectiondata.classList.add("inline");
      }


    }
  }
}

slidenote.addTheme(newtheme);
