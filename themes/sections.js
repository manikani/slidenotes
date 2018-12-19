var newtheme = new Theme("sections");
newtheme.description = "Let you organize content inside sections";

newtheme.helpText = function(dataobject){
  var result = "<h2>Section-block</h2>"+
          "Content inside ```layout ``` Block are considered a section.<br>"+
          "With sections you can organize your content more specific. "+
          "You can use every MD-Code inside a section except new page."+
          "If the first Line of a section is an image it serves as the "+
          "background";
  return result;
}

newtheme.addEditorbutton('Layout',"```layout","```");

slidenote.datatypes.push({type:"layout", mdcode:true, theme:newtheme});

newtheme.styleThemeSpecials = function(){
  //get all data-blocks:
  var datadivs = slidenote.presentationdiv.getElementsByTagName("section");
  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    if(slidenote.parser.dataobjects[datax].type=="section"){
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
            var blocktheme = slidenote.presentation.getThemeByName("blocks");
            if(blocktheme){
              sectiondata.style.minHeight = sectiondata.childNodes[1].naturalHeight;
              blocktheme.buildgrid(sectiondata);
            }
      }//end of image as background
      //section left or right?
      if(dataobject.head.indexOf("left")>-1){
        //seems we found a left
        sectiondata.classList.add("left");
      }else if(dataobject.head.indexOf("right")>-1){
        //we found a right
        sectiondata.classList.add("right");
      }


    }
  }
}

slidenote.addTheme(newtheme);
