var keyboardshortcuts = {
    allkeys : [], //one array to rule them all...
    //ctrlkeys:[],
    //secondkey:[],
    toolbar:[], //all shortcuts attached to toolbar
    insertmenu:[], //all shortcuts attached to insertmenu
    imagegallery:[], //all shortcuts attached to imagegallery
    textarea:[], //all shortcuts attached to textarea
    options:[], //all shortcuts attached to optionsmenu
    globals:[], //all shortcuts attached globaly
    menuload:[], //all shortcuts attached to load slidenotesmenu
    menucloud:[], //all shortcuts attached to cloud-menuload
    menupublish:[],//all shortcuts on publish-menu
    menuimportexport:[],//all shortcuts on import/export menu
    menuoptionspresentation:[],//all shortcuts presentation-options-menu
    menuoptionseditor:[],//all shortcuts editor-options-menu
    pressedkeys:{}, //element that holds all pressed keys at the time - used to check if shortcut is found
    metakey: "Control" //global metakey to check against
}

keyboardshortcuts.shortcut = function(name, element, key, shortcutfunc){
    this.name = name; //unique name of shortcut - if made by a theme it should have theme-name inside of name
    this.element = element; //element the shortcut should be appended to: textarea,global,imagegallery,toolbar,insertmenu...
    this.metakey = true; //metakey is true as standard?
    this.keys = [];
    this.multipleChoiceKeys = [];
    console.log("shortcut keyelement:"+typeof key);
    console.log(key);
    if(typeof key === "string"){
        this.keys = [key]; //sole key-element
    }else if(key.constructor === Array){
        this.keys = key;
    }else{
        if(key.key)this.keys = [key.key]; //sole key in key-object
        if(key.keys)this.keys = key.keys; //array of pressed keys
        if(key.multipleChoiceKeys)this.multipleChoiceKeys = key.multipleChoiceKeys;
        if(key.metakey!=undefined)this.metakey = key.metakey; //if global-metakey should be pressed
    }
    this.activate = shortcutfunc; //"on shortcut entered do this"
    this.active = true; //not active shortcuts will not be used
}

keyboardshortcuts.addShortcut = function(shortcut){
    this.allkeys.push(shortcut);
    //if(shortcut.keys.includes("Control"))this.ctrlkeys.push(shortcut); //not used, can be gone i think and added on later if we really need it
    //TODO: secondkey
    var element = shortcut.element;
    if(element==="toolbar")this.toolbar.push(shortcut);
    if(element==="insertmenu")this.insertmenu.push(shortcut);
    if(element==="imagegallery")this.imagegallery.push(shortcut);
    if(element==="textarea")this.textarea.push(shortcut);
    if(element==="options")this.options.push(shortcut);
    if(element==="global")this.globals.push(shortcut);
    if(element==="menuload")this.menuload.push(shortcut);
    if(element==="menucloud")this.menucloud.push(shortcut);
    if(element==="menupublish")this.menupublish.push(shortcut);
    if(element==="menuimportexport")this.menuimportexport.push(shortcut);
    if(element==="menuoptionseditor")this.menuoptionseditor.push(shortcut);
    if(element==="menuoptionspresentation")this.menuoptionspresentation.push(shortcut);

}

keyboardshortcuts.toggleShortcut = function(shortcutname, state){
    var shortcut = this.shortcutByName(shortcutname);
    if(shortcut===null){console.log("shortcut "+shortcutname+" not found");return;}
    if(state!=undefined && state!=null)shortcut.active=state;else shortcut.active=!shortcut.active;
    console.log("shortcut "+shortcutname+"deactivated");
}

keyboardshortcuts.shortcutByName = function(shortcutname){
   var shortcut = null;
   for(var x=0;x<this.allkeys.length;x++){
        if(this.allkeys[x].name===shortcutname){shortcut=this.allkeys[x];break;}
        console.log(this.allkeys[x].name + "->\n"+shortcutname+"<-");
    }
   return shortcut;
}

keyboardshortcuts.buildOptionsMenu = function(){
    if(!this.optionsmenu)this.optionsmenu = document.getElementById("keyboardshortcutstab");
    if(!this.optionsmenu){
        this.optionsmenu = document.createElement("div");
        this.optionsmenu.classList.add("optiontab");
        this.optionsmenu.id = "keyboardshortcutstab";
        document.getElementById("options").appendChild(this.optionsmenu);
        var opentabbutton = document.createElement("a");
        opentabbutton.href="#";
        opentabbutton.innerText="Keyboard Shortcuts";
        opentabbutton.onclick=function(){
            var tabs = document.getElementsByClassName("optiontab");
            for(var t=0;t<tabs.length;t++){
                tabs[t].classList.remove("active");
                if(tabs[t].id==="keyboardshortcutstab")tabs[t].classList.add("active");
            }

        }
        document.getElementById("options").getElementsByClassName("tabbar")[0].appendChild(document.createElement("h2").appendChild(opentabbutton));
    }
    this.optionsmenu.innerHTML = "";
    var allinone = document.createElement("ul"); //change later with different groups
    for(var x=0;x<this.allkeys.length;x++){
        var shortcut = this.allkeys[x];
        var li = document.createElement("li");
        var check = document.createElement("input");
        check.type = "checkbox";
        check.name = shortcut.name;
        check.checked = shortcut.active;
        check.onchange = function(){
            keyboardshortcuts.toggleShortcut(this.name, this.checked);
        }
        li.appendChild(check);
        var label = document.createElement("label");
        label.innerText = shortcut.name;
        li.appendChild(label);
        var changebutton = document.createElement("button");
        var buttontext = "";
        if(shortcut.metakey)buttontext += this.metakey+" + ";
        buttontext+=shortcut.keys.join(" + ");
        if(shortcut.multipleChoiceKeys.length>0)buttontext+="+ ["+shortcut.multipleChoiceKeys.join(" | ")+"]";
        changebutton.innerText = buttontext;
        //ToDo: add changefunction
        li.appendChild(changebutton);
        //ToDo: append on different parrents, depending element
        allinone.appendChild(li);
    }
    this.optionsmenu.appendChild(allinone);
}

keyboardshortcuts.init = function(){
    //add basic shortcuts:
    this.addShortcut(new keyboardshortcuts.shortcut("Toggle Presentation","textarea", "Escape", function(){slidenote.parseneu();slidenote.presentation.showpresentation();}));
    //select element - just for testuse:
    this.addShortcut(new this.shortcut("select element", "textarea","m",function(){
        var el = slidenote.parser.CarretOnElement();
        var selstart;
        var selend;
        if(el && el.parentelement){
          selstart = el.parentelement.posinall;
          selend = slidenote.parser.map.lineend[el.parentelement.lastline];
        }else if(el){ selstart=el.posinall;
            if(el.brotherelement)selend=el.brotherelement.posinall+el.brotherelement.mdcode.length;
            if(el.brotherelement===undefined){
              selend = slidenote.parser.map.lineend[el.line];
            }
            if(el.typ === "image")selend=selstart+el.mdcode.length;
            if(el.tag==="linkend"){
              selstart = el.brotherelement.posinall;
              selend = el.posinall+el.mdcode.length;
            }
        }
        if(selstart && selend){
          slidenote.textarea.selectionStart = selstart;
          slidenote.textarea.selectionEnd = selend;
        }
    }));
    //jump to next/last element:
    this.addShortcut(new this.shortcut("jump to element","textarea",{multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:true},function(e){
      var actel = slidenote.parser.CarretOnElement();
      var actline = slidenote.parser.lineAtPosition(slidenote.textarea.selectionEnd);
      if(e.key==="ArrowDown"){
        if(actel && actel.parentelement)actline=actel.parentelement.lastline+1;
        var elines = slidenote.parser.map.insertedhtmlinline;
        if(actline>elines.length)return;
        for(var x=actline;x<elines.length;x++){
          var found=false;
          for(var y=0;y<elines[x].length;y++){
            var el=elines[x][y];
            if((el.typ==="start" || el.typ==="image")&&el!=actel && (!actel || el.posinall>actel.posinall)){
              actel=el;
              found=true;
              break;
            }
          }
          if(found)break;
        }
      }else{
        if(actel && actel.parentelement)actline=actel.parentelement.line-1;
        var elines = slidenote.parser.map.insertedhtmlinline;
        if(actline<0)actline=0;
        for(var x=actline;x>=0;x--){
          var found=false;
          for(var y=elines[x].length-1;y>=0;y--){
            var el=elines[x][y];
            if((el.typ==="start" || el.typ==="image")&&el!=actel && (!actel || el.posinall<actel.posinall)){
              actel=el;
              found=true;
              break;
            }
          }
          if(found)break;
        }
      }

      if(actel){
        var pos = actel.posinall;
        slidenote.textarea.selectionEnd = pos;
        slidenote.textarea.selectionStart=pos;
        var carret = document.getElementById("carret");
        if(carret)carret.parentNode.removeChild(carret);
        slidenote.parser.renderNewCursorInCodeeditor();
        slidenote.textarea.blur();
        slidenote.textarea.focus();
      }
    }));
    //automatic closure in simple tags:
    this.addShortcut(new this.shortcut("automatic closure on selection", "textarea",{multipleChoiceKeys:["*","~","`"],metakey:true},function(e){
      var selstart = slidenote.textarea.selectionStart;
      var selend = slidenote.textarea.selectionEnd;
      //if(selstart===selend)return; //only on selection
      var txt = slidenote.textarea.value;
      txt = txt.substring(0,selstart)+e.key+
            txt.substring(selstart,selend)+e.key+
            txt.substring(selend);
      slidenote.textarea.value=txt;
      slidenote.textarea.selectionStart = selstart+1;
      slidenote.textarea.selectionEnd = selend+1;
      slidenote.textarea.blur();
      slidenote.textarea.focus();
      slidenote.parseneu();
    }));
    //insertmenu:
    this.addShortcut(new this.shortcut("open insertmenu", "textarea", "ContextMenu", function(){
        slidenote.presentation.showInsertMenu();
        var b=document.getElementById("insertarea").getElementsByTagName("button");
        if(b && b[0])b[0].focus();
    }));
    this.addShortcut(new this.shortcut("arrownavigate insertmenu","insertmenu",{multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:false},function(event){
        var insmen = document.getElementById("insertarea");
        var buttons = insmen.getElementsByTagName("button");
        var bnr=0;
        for(var x=0;x<buttons.length;x++)if(buttons[x]===document.activeElement)bnr=x;
        if(event.key==="ArrowUp")bnr--; else bnr++;
        if(bnr<0)bnr=buttons.length-1;
        if(bnr>=buttons.length)bnr=0;
        buttons[bnr].focus();
        console.log("move to button no"+bnr);
    }));
    this.addShortcut(new this.shortcut("escape insertmenu","insertmenu",{key:"Escape",metakey:false},function(e){slidenote.textarea.focus();}));

    //toolbar:
    this.addShortcut(new this.shortcut("open toolbar", "textarea", " ", function(e){
      var toolbar = document.getElementById("toolbar");
      if(!toolbar.classList.contains("active"))toolbar.classList.add("active");
      setTimeout("document.getElementById('toolbar').getElementsByTagName('button')[0].focus()",20);
    }));
    /*this.addShortcut(new this.shortcut("arrownavigate toolbar", "toolbar", {multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:false}, function(e){
      var toolbar = document.getElementById("texteditorbuttons");
      var toolbarbuttons = toolbar.getElementsByTagName("button");
      var actnr = 0;
      for(var x=0;x<toolbarbuttons.length;x++)if(toolbarbuttons[x]===document.activeElement)actnr=x;
      if(e.key==="ArrowUp")actnr--;else actnr++;
      if(actnr<0)actnr=toolbarbuttons.length-1;
      if(actnr>=toolbarbuttons.length)actnr=0;
      toolbarbuttons[actnr].focus();
      console.log("move to button no "+actnr);
    }));
    this.addShortcut(new this.shortcut("escape toolbar","toolbar",{key:"Escape",metakey:false},function(e){slidenote.textarea.focus();}));
*/
    //optionsmenu:
    this.addShortcut(new this.shortcut("open options", "textarea", "o",function(e){
      var optionmenu = document.getElementById("optionmenu");
      if(optionmenu.classList.contains("active")){
        //focus on optionmenu-element... not implemented yet
      }else{
        slidenote.extensions.buildOptionsMenu();
      }
    }));
    this.addShortcut(new this.shortcut("escape optionsmenu","options",{key:"Escape",metakey:false},function(e){
      slidenote.textarea.focus();
      slidenote.extensions.optionmenu.classList.remove("active");
    }));
    /*
    this.addShortcut(new this.shortcut("arrownavigate insertmenu","insertmenu",["ArrowDown"],false,function(){
        var insmen = document.getElementById("insertarea");
        var buttons = insmen.getElementsByTagName("button");
        var bnr=0;
        for(var x=0;x<buttons.length;x++)if(buttons[x]===document.activeElement)bnr=x;
        bnr++;
        if(bnr>=buttons.length)bnr=0;
        buttons[bnr].focus();
    }));*/
    //general arrow-keys on menus:
    var arrownav = function(e){
      //we presume that "this" is the calling object: wrong!
      console.log(e);
      var element = e.currentTarget;
      var buttons = element.getElementsByClassName("menuitem");
      if(buttons.length<1)buttons = element.getElementsByTagName("button");
      if(buttons.length<1)return;
      var actpos = 0;
      var actel = document.activeElement;
      for(var x=0;x<buttons.length;x++){
        actpos=x; if(actel===buttons[x])break;
      }
      if(e.key==="ArrowUp")actpos--;
      if(e.key==="ArrowDown")actpos++;
      if(actpos>=buttons.length)actpos=0;
      if(actpos<0)actpos=buttons.length-1;
      buttons[actpos].focus();
    }
    var standardmenus = slidenote.menumanager.standardmenus;
    if(standardmenus===undefined)return;
    for(var x=0;x<standardmenus.length;x++){
      var menuname = standardmenus[x];
      this.addShortcut(new this.shortcut("arrownavigate "+menuname,
        menuname,
        {multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:false},
        arrownav));
      this.addShortcut(new this.shortcut("arrownavigate "+menuname,
          menuname,
          {key:["Escape"],metakey:false},
          function(e){slidenote.textarea.focus();}));
    }

}
keyboardshortcuts.pressKey = function(e){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    this.pressedkeys[e.key]=true;
    if(e.ctrlKey && e.srcElement===slidenote.textarea){
      //prevent default from the following, hardcoded for speed:
      if(e.key==="ArrowUp"|| e.key==="ArrowDown" ||
        "tTpPeErRlLSsOo`".indexOf(e.key)>=0){
        e.preventDefault();
        //e.stopPropagation();
      }
    }
}
keyboardshortcuts.preventDefaultOnKeypress = function(e){
  if(e.ctrlKey && e.srcElement===slidenote.textarea){
    //prevent default from the following, hardcoded for speed:
    if("tTpPeErRlLSsOo`".indexOf(e.key)>=0){
      e.preventDefault();
    }
  }
}
keyboardshortcuts.releaseKey = function(e){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    this.pressedkeys[e.key]=false;
}

keyboardshortcuts.shortcutFound = function(event, shortcut){
    if(shortcut.metakey && !this.pressedkeys[this.metakey])return false;
    for(var x=0;x<shortcut.keys.length;x++)if(!this.pressedkeys[shortcut.keys[x]])return false;
    if(!shortcut.multipleChoiceKeys ||shortcut.multipleChoiceKeys.length===0)return true;
    for(var x=0;x<shortcut.multipleChoiceKeys.length;x++)if(this.pressedkeys[shortcut.multipleChoiceKeys[x]])return true;
    return false;
}

keyboardshortcuts.reactOn = function(e, element){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    if(this[element]!=undefined){
        var preventDefault=false;
        var list = this[element];
        for(var x=0;x<list.length;x++)if(list[x].active && this.shortcutFound(e,list[x])){
            list[x].activate(e);
            preventDefault=true;
        }
        if(preventDefault)e.preventDefault();
    }

}

keyboardshortcuts.attachShortcuts = function(){
    window.addEventListener("keydown",function(e){slidenote.keyboardshortcuts.pressKey(e);});
    slidenote.textarea.addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e, "textarea");});
    slidenote.textarea.addEventListener("keypress",function(e){slidenote.keyboardshortcuts.preventDefaultOnKeypress(e, "textarea");});
    document.getElementById("insertarea").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e, "insertmenu");console.log("shortcut insmenu");console.log(e);});
    //document.getElementById("texteditorbuttons").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"toolbar");console.log("shortcut toolbar");console.log(e);});
    document.getElementById("menuload").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menuload")});
    document.getElementById("menucloud").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menucloud")});
    document.getElementById("menupublish").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menupublish")});
    document.getElementById("menuimportexport").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menuimportexport")});
    document.getElementById("menuoptionseditor").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menuoptionseditor")});
    document.getElementById("menuoptionspresentation").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"menuoptionspresentation")});
    document.getElementById("toolbar").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"toolbar")});

    //document.getElementById("optionmenu").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e,"options");console.log("shortcut options");console.log(e);});

//    window.addEventListener("keyup", function(e){slidenote.keyboardshortcuts.reactOn(e,"globals");});
    window.addEventListener("keyup", function(e){slidenote.keyboardshortcuts.releaseKey(e);});
}

slidenote.keyboardshortcuts = keyboardshortcuts;

keyboardshortcuts.init();
keyboardshortcuts.attachShortcuts();

/*
keyboardshortcuts.toolbarReaction = function(e){
    for(var x=0;x<this.toolbar.length;x++){
        if(this.shortcutFound(e,toolbar[x]))this.toolbar[x].activate();
    }
}

keyboardshortcuts.insertmenuReaction = function(e){
    for(var x=0;x<this.insertmenu.length;x++){
        if(this.shortcutFound(e,insertmenu[x]))this.insertmenu[x].activate();
    }
}

keyboardshortcuts.imagegalleryReaction = function(e){
    for(var x=0;x<this.imagegallery.length;x++)if(this.shortcutFound(e,this.imagegallery[x]))this.imagegallery[x].activate();
}

keyboardshortcuts.textareaReaction = function(e){
    for(var x=0;x<this.textarea.length;x++)if(this.shortcutFound(e,this.textarea[x]))this.textarea[x].activate();
}

keyboardshortcuts.globalReaction = function(e){
    for(var x=0;x<this.globals.length;x++)if(this.shortcutFound(e,this.globals[x]))this.globals[x].activate();
}

*/
