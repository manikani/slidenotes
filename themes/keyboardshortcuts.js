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
    menusearchbox:[],//all shortcuts searchbox
    dialog:[], //all shortcuts on dialog
    arrowleftright:[], //shortcuts arrownav left-right
    menuoptionseditor:[],//all shortcuts editor-options-menu
    pressedkeys:{}, //element that holds all pressed keys at the time - used to check if shortcut is found
    metakey: "Control", //global metakey to check against
    automaticClosure:true //global boolean if automatic closure is active or not
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

keyboardshortcuts.configString = function(){
  var saveobject = {
    metakey:this.metakey,
    automaticClosure:this.automaticClosure
  };
  saveobject.changedkeys = new Array();
  for(var x=0;x<this.allkeys.length;x++){
    var sc = this.allkeys[x];
    if(sc.standardkeys)saveobject.changedkeys.push({name:sc.name,keys:sc.keys,standardkeys:sc.standardkeys});
  }
  return JSON.stringify(saveobject);
}
keyboardshortcuts.loadConfigString = function(configstring){
  var confobject = JSON.parse(configstring);
  this.metakey = confobject.metakey;
  this.automaticClosure = confobject.automaticClosure;
  for(var x=0;x<confobject.changedkeys.length;x++){
    var sc = confobject.changedkeys[x];
    var shortcut = this.shortcutByName(sc.name);
    shortcut.keys = sc.keys;
    shortcut.standardkeys = sc.standardkeys;
  }
  this.buildOptionsMenu();
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
    if(element==="menusearchbox")this.menusearchbox.push(shortcut);
    if(element==="dialog")this.dialog.push(shortcut);
    if(element==="arrowleftright")this.arrowleftright.push(shortcut);

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
    //meta-key:
    let metali = document.createElement("li");
    let metabutton = document.createElement("button");
    metali.innerText = "Metakey: ";
    metabutton.innerText = this.metakey;
    metabutton.changingactive = false;
    metabutton.onclick = function(){
        this.changingactive=false;
      if(confirm("press ok and then the key you want to use to change metakey")){
        this.changingactive=true;
        metabutton.classList.add("changingactive");
      }else{
        metabutton.classList.remove("changingactive");
      }
    }
    metabutton.onkeyup = function(e){
      var key = e.key+"";
      if(key==="undefined")key=getKeyOfKeyCode(e.keyCode);
      if(key===" ")key="Space";
      if(this.changingactive){
        this.changingactive=false;
        if(confirm("set metakey to "+key)){
          if(key==="Space")key=" ";
          slidenote.keyboardshortcuts.metakey = key;
          slidenote.keyboardshortcuts.buildOptionsMenu();
        }
      }
    }
    metali.appendChild(metabutton);
    allinone.appendChild(metali);
    for(var x=0;x<this.allkeys.length;x++){
        var shortcut = this.allkeys[x];
        if(shortcut.name.indexOf("arrow")>-1 || shortcut.name.indexOf("escape")>-1)continue;
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
        if(shortcut.keys[0]===" ")buttontext+='Space';
        if(shortcut.multipleChoiceKeys.length>0)buttontext+="+ ["+shortcut.multipleChoiceKeys.join(" | ")+"]";
        changebutton.innerText = buttontext;
        changebutton.name = shortcut.name;

        //add changefunction
        //new:
        changebutton.changingactive=false;
        changebutton.onclick = function(){
            this.changingactive=false;
          if(confirm("press ok and then the key you want to use to change metakey")){
            this.changingactive=true;
            this.classList.add("changingactive");
          }else{
            this.classList.remove("changingactive");
          }
        }
        changebutton.onkeyup = function(e){
          var shortcut = slidenote.keyboardshortcuts.shortcutByName(this.name);
          var pressedkeys = slidenote.keyboardshortcuts.pressedkeys;
          var objindex = Object.keys(pressedkeys);
          var pressedkeyarray = new Array();
          var metakey = slidenote.keyboardshortcuts.metakey;
          for(var x=0;x<objindex.length;x++){
            if(objindex[x]===metakey)continue;
            if(pressedkeys[objindex[x]])pressedkeyarray.push(objindex[x]);
          }
          var previewtext = "";
          if(shortcut.metakey)previewtext+=metakey + " + ";
          previewtext += pressedkeyarray.join(" + ");
          if(this.changingactive){
            this.changingactive=false;
            if(confirm("set "+this.name+" to "+previewtext)){
              if(shortcut.standardkeys===undefined)shortcut.standardkeys = shortcut.keys;
              shortcut.keys = pressedkeyarray;
              slidenote.keyboardshortcuts.buildOptionsMenu();
            }
            this.classList.remove("changingactive");
          }
        }
        /*old:
        changebutton.onclick = function(){
          var shortcut = slidenote.keyboardshortcuts.shortcutByName(this.name);
          slidenote.keyboardshortcuts.changeKeyByUserInput(shortcut);
        }*/
        li.appendChild(changebutton);
        if(shortcut.standardkeys){
          var revertbutton = document.createElement("button");
          revertbutton.innerText = "revert to standard";
          revertbutton.name = shortcut.name;
          revertbutton.onclick = function(){
            var shortcut = slidenote.keyboardshortcuts.shortcutByName(this.name);
            if(shortcut.standardkeys){
              shortcut.keys = shortcut.standardkeys;
              shortcut.standardkeys = undefined;
              slidenote.keyboardshortcuts.buildOptionsMenu();
            }
          }
          li.appendChild(revertbutton);
        }
        //ToDo: append on different parrents, depending element
        allinone.appendChild(li);
    }//for-to
    //automagic closure:
    var amli = document.createElement("li");
    var amcheck = document.createElement("input");
    amcheck.type = "checkbox";
    amcheck.name = "automagic closure";
    amcheck.checked = this.automaticClosure;
    amcheck.onchange = function(){
        slidenote.keyboardshortcuts.automaticClosure = this.checked;
    }
    amli.appendChild(amcheck);
    var amlabel = document.createElement("label");
    amlabel.innerText = "Automatic Closure on * ~ ` _";
    amli.appendChild(amlabel);
    allinone.appendChild(amli);
    this.optionsmenu.appendChild(allinone);
}
/*old:
keyboardshortcuts.changeKeyByUserInput = function(shortcuttochange){
  var wrapper = document.createElement("div");
  var changearea = document.createElement("div");
  var preview = document.createElement("div");
  var oldview = document.createElement("div");
  var shortcut = shortcuttochange;
  var title= document.createElement("h1");
  title.innerText = "change key for shortcut "+ shortcut.name;
  wrapper.id = "keyboardshortcutprompt";
  changearea.classList.add("keyboardshortcutchange");
  preview.classList.add("preview-keyboardshortcuts");
  preview.id = "keyboardshortcutpromptpreview";
  var changebutton = document.createElement("button");
  var cancelbutton = document.createElement("button");
  cancelbutton.innerText = "cancel";
  var okbutton = document.createElement("button");
  okbutton.innerText = "ok";
  okbutton.name = shortcut.name;
  var buttontext = "";
  if(shortcut.metakey)buttontext += this.metakey+" + ";
  buttontext+=shortcut.keys.join(" + ");
  if(shortcut.keys[0]===" ")buttontext+='Space';
  preview.innerText = buttontext;
  oldview.innerHTML = "Old Combo: "+buttontext;
  changebutton.innerHTML="<span>navigate here and </span>click buttons to use";
  changebutton.id="keyboardshortcutpromptchangebutton";
  changebutton.onkeyup = function(e){
    var key = e.key+"";
    if(key==="undefined")e.key=getKeyOfKeyCode(e.keyCode);
    var metakey = keyboardshortcuts.metakey;
    if(e.key==="Escape"||e.key==="ArrowLeft"||e.key==="ArrowRight" || e.key==="Shift")return;
    var preview = document.getElementById("keyboardshortcutpromptpreview");
    var pressedkeys = slidenote.keyboardshortcuts.pressedkeys;
    var objindex = Object.keys(pressedkeys);
    var pressedkeyarray = new Array();
    for(var x=0;x<objindex.length;x++){
      if(objindex[x]===metakey)continue;
      if(pressedkeys[objindex[x]])pressedkeyarray.push(objindex[x]);
    }
    var previewtext = "";
    if(shortcut.metakey)previewtext+=metakey + " + ";
    previewtext += pressedkeyarray.join(" + ");
    preview.innerText = previewtext;
    slidenote.keyboardshortcuts.UserInputResolveToChange = pressedkeyarray;
  };
  okbutton.onclick = function(){
    if(slidenote.keyboardshortcuts.UserInputResolveToChange){
      var shortcut = slidenote.keyboardshortcuts.shortcutByName(this.name);
      if(shortcut.standardkeys===undefined)shortcut.standardkeys=shortcut.keys;
      shortcut.keys = slidenote.keyboardshortcuts.UserInputResolveToChange;
      slidenote.keyboardshortcuts.UserInputResolveToChange=null;
      slidenote.keyboardshortcuts.buildOptionsMenu();
    }
    var prompt = document.getElementById("keyboardshortcutprompt");
    prompt.parentNode.removeChild(prompt);
  };
  cancelbutton.onclick = function(){
    slidenote.keyboardshortcuts.UserInputResolveToChange = null;
    var prompt = document.getElementById("keyboardshortcutprompt");
    prompt.parentNode.removeChild(prompt);
  };
  changearea.appendChild(title);
  changearea.appendChild(oldview);
  changearea.appendChild(preview);
  changearea.appendChild(changebutton);
  changearea.appendChild(cancelbutton);
  changearea.appendChild(okbutton);
  wrapper.appendChild(changearea);
  document.getElementById("slidenotediv").appendChild(wrapper);

}
*/

keyboardshortcuts.selectCurrentElement = function(){
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
  if(selstart!=null && selend!=null){
    slidenote.textarea.selectionStart = selstart;
    slidenote.textarea.selectionEnd = selend;
  }
}

keyboardshortcuts.init = function(){
    //add basic shortcuts:
    this.addShortcut(new keyboardshortcuts.shortcut("Toggle Presentation","textarea", "Escape", function(){slidenote.parseneu();slidenote.presentation.showpresentation();}));
    //select element - just for testuse:
    /*
    this.addShortcut(new this.shortcut("select element", "textarea","m",function(){
        slidenote.keyboardshortcuts.selectCurrentElement();
    }));
    */
    //jump to next/last element:
    this.addShortcut(new this.shortcut("jump to element","textarea",{multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:true},function(e){
      var actline = slidenote.parser.lineAtPosition(slidenote.textarea.selectionStart);
      var selstart = slidenote.textarea.selectionStart;
      var selend = slidenote.textarea.selectionEnd;
      var actel = slidenote.parser.CarretOnElement(selstart);
      var endel = actel;
      var seldirection = slidenote.textarea.selectionDirection;
      var selisforward = (seldirection === "forward");
      if(selend-selstart!=0){
        endel=slidenote.parser.CarretOnElement(selend);
        if(selisforward){
          actel=endel;
          actline = slidenote.parser.lineAtPosition(slidenote.textarea.selectionEnd);
        }
      }

      if(e.shiftKey && selend-selstart===0){
        slidenote.keyboardshortcuts.selectCurrentElement();
        if(e.key==="ArrowDown")slidenote.textarea.selectionDirection="forward";
          else slidenote.textarea.selectionDirection="backward";
        return; //do nothing more
      }
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
        actel = slidenote.parser.CarretOnElement(selstart);
        if(actel && actel.parentelement)actline=actel.parentelement.line-1;
        var elines = slidenote.parser.map.insertedhtmlinline;
        if(actline<0)actline=0;
        for(var x=actline;x>=0;x--){
          var found=false;
          for(var y=elines[x].length-1;y>=0;y--){
            var el=elines[x][y];
            if((el.typ==="start" || el.typ==="image" || el.typ==="pagebreak")&&el!=actel && (!actel || el.posinall<actel.posinall)){
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
        if(e.shiftKey){
          slidenote.keyboardshortcuts.selectCurrentElement();
          if(selisforward){
            if(e.key==="ArrowUp"){
              if(pos<selstart){
                //selection turns backward
                slidenote.textarea.selectionEnd = selstart;
                slidenote.textarea.selectionDirection="backward";
              }else{
                //selection stays forward
                slidenote.textarea.selectionStart = selstart;
                slidenote.textarea.selectionDirection = "forward";
              }
            }else{ //Arrow-Down
              //selection stays forward
              slidenote.textarea.selectionStart = selstart;
              slidenote.textarea.selectionDirection = "forward";
            }
          }else{ //selisbackward
            if(e.key==="ArrowDown" && pos>selend){
              //selection changes selectionDirection
              slidenote.textarea.selectionStart=selend;
              slidenote.textarea.selectionDirection="forward";
            }else{
              //selection does not change selectionDirection
              slidenote.textarea.selectionEnd = selend;
              slidenote.textarea.selectionDirection="backward";
            }
          }
        }
        var carret = document.getElementById("carret");
        if(carret)carret.parentNode.removeChild(carret);
        slidenote.parser.renderNewCursorInCodeeditor();
        var pressedkeys = slidenote.keyboardshortcuts.pressedkeys;
        slidenote.textarea.blur();
        slidenote.textarea.focus();
        slidenote.keyboardshortcuts.pressedkeys=pressedkeys;
      }
    }));
    //automatic closure on dead key:

    this.addShortcut(new this.shortcut("automatic closure for (deadkey)", "textarea",{multipleChoiceKeys:["Dead","`"],metakey:false},function(e){
      if(e.key===undefined)e.key=getKeyOfKeyCode(e.keyCode);
      if(!(e.key==="Dead" && e.shiftKey))return;
      var selstart = slidenote.textarea.selectionStart; //its the one after inserted `
      var selend = slidenote.textarea.selectionEnd;
      //if(selstart===selend)return; //only on selection
      var tmpselection = slidenote.keyboardshortcuts.tmpSelection;
      var txt = slidenote.textarea.value;
      if(txt.substring(selstart-2,selstart-1)!="\n"){
        txt = txt.substring(0,selend)+
        tmpselection + "`"+
        txt.substring(selend);
      }else{
        txt = txt.substring(0,selend)+ "``\n"+tmpselection+"\n```"+txt.substring(selend);
        selstart+=2;
      }
      slidenote.textarea.value=txt;

      slidenote.textarea.selectionStart = selstart;
      slidenote.textarea.selectionEnd = selstart+tmpselection.length;

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
      document.getElementById("imagegallery").classList.remove("active");
      document.getElementById("menusearchbox").classList.remove("active");
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
      document.getElementById("optionsbutton").click();
    }));
    /*this.addShortcut(new this.shortcut("escape optionsmenu","options",{key:"Escape",metakey:false},function(e){
      slidenote.textarea.focus();
      slidenote.extensions.optionmenu.classList.remove("active");
    }));*/
    this.addShortcut(new this.shortcut("open publish menu", "textarea", "p",function(e){
      document.getElementById("publishbutton").click();
    }));
    this.addShortcut(new this.shortcut("open import/export menu", "textarea", ["Shift","S"],function(e){
      document.getElementById("importexportbutton").click();
    }));
    this.addShortcut(new this.shortcut("open cloud menu", "textarea","s",function(e){
      document.getElementById("cloud").click();
    }));
    this.addShortcut(new this.shortcut("open noteload menu", "textarea","l",function(e){
      document.getElementById("loadnote").click();
    }));
    this.addShortcut(new this.shortcut("open imagegallery", "textarea","i",function(e){
      document.getElementById("imagegallerybutton").click();
    }));
    this.addShortcut(new this.shortcut("open search menu", "textarea","f",function(e){
      document.getElementById("searchbutton").click();
    }));

    //history:
    this.addShortcut(new this.shortcut("undo last change", "textarea","z",function(e){
      document.getElementById("historyBackButton").click();
    }));
    this.addShortcut(new this.shortcut("redo last undone change", "textarea","y",function(e){
      document.getElementById("historyForwardButton").click();
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
    //dialog-key-nav:
    this.addShortcut(new this.shortcut("arrownavigate dialog leftright", "arrowleftright",
        {multipleChoiceKeys:["ArrowLeft","ArrowRight"],metakey:false},function(e){
          var element = e.currentTarget;
          var buttons = element.getElementsByClassName("menuitem");
          if(buttons.length<1)buttons = element.getElementsByTagName("button");
          if(buttons.length<1)return;
          var actpos = 0;
          var actel = document.activeElement;
          for(var x=0;x<buttons.length;x++){
            actpos=x; if(actel===buttons[x])break;
          }
          if(e.key==="ArrowLeft")actpos--;
          if(e.key==="ArrowRight")actpos++;
          if(actpos>=buttons.length)actpos=0;
          if(actpos<0)actpos=buttons.length-1;
          buttons[actpos].focus();
    }));
    this.addShortcut(new this.shortcut("arrownavigate dialog",
      "dialog",
      {multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:false},
      arrownav));
    this.addShortcut(new this.shortcut("arrownavigate dialog escape",
        "dialog",
        {key:["Escape"],metakey:false},
        function(e){
          var dialog = document.getElementById("dialogcontainer");
          if(dialog)dialog.parentElement.removeChild(dialog);
          slidenote.textarea.focus();
        }));


    var standardmenus = slidenote.menumanager.standardmenus;
    if(standardmenus===undefined)return;
    for(var x=0;x<standardmenus.length;x++){
      var menuname = standardmenus[x];
      this.addShortcut(new this.shortcut("arrownavigate "+menuname,
        menuname,
        {multipleChoiceKeys:["ArrowUp","ArrowDown"],metakey:false},
        arrownav));
      this.addShortcut(new this.shortcut("arrownavigate "+menuname+" escape",
          menuname,
          {key:["Escape"],metakey:false},
          function(e){
            slidenote.textarea.focus();
            slidenote.textarea.click();
      }));
    }
    this.shortcutByName("arrownavigate menusearchbox escape").activate = function(e){
      slidenote.textarea.focus();
      document.getElementById("menusearchbox").classList.remove("active");
    }
    //letter-navigation in toolbar:
    this.addShortcut(new this.shortcut("letter navigation in toolbar","toolbar",{multipleChoiceKeys:["c","t","l","q","n","f","i","o","h","b","d"],metakey:false},function(e){
      //["c","t","l","q","n","f","i","o","h","b","d"]
      var nametable = {
        c:["code","chart","comment"],
        t:["table","title","headline"],
        l:["list","link","latex","layout"],
        q:["quote"],
        n:["new slide"],
        f:["footnote"],
        i:["image","italic"],
        o:["ordered list"],
        h:["hidden","headline","title"],
        b:["bold"],
        d:["deleted","crossed"]
      };
      var key = e.key;
      if(nametable[key]===undefined)return;
      var toolbar = document.getElementById("toolbar");
      var buttons = toolbar.getElementsByTagName("button");
      var beforeactiveelement = true;
      for(var x=0;x<buttons.length;x++){
        if(buttons[x]===document.activeElement){
          beforeactiveelement=false;
          continue;
        }
        if(beforeactiveelement)continue;
        for(var y=0;y<nametable[key].length;y++){
          if(buttons[x].title.indexOf(nametable[key][y])>-1||
            buttons[x].value.indexOf(nametable[key][y])>-1){
            buttons[x].focus();
            return;
          }
        }
      }
      for(var x=0;x<buttons.length;x++){
        if(buttons[x]===document.activeElement)return;
        for(var y=0;y<nametable[key].length;y++){
          if(buttons[x].title.indexOf(nametable[key][y])>-1||
            buttons[x].value.indexOf(nametable[key][y])>-1){
            buttons[x].focus();
            return;
          }
        }
      }


    }));
    //build options-Menu:
    this.buildOptionsMenu();
    //garbage-cleaning for pressedkeys:
    slidenote.textarea.addEventListener("focusout",function(){
      slidenote.keyboardshortcuts.pressedkeys = {};
    });
    slidenote.textarea.addEventListener("focus",function(){
      slidenote.keyboardshortcuts.pressedkeys = {};
    });
}
keyboardshortcuts.pressKey = function(e){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    this.pressedkeys[e.key]=true;
    console.log(e);
    if(e.ctrlKey && e.srcElement===slidenote.textarea){
      //prevent default from the following, hardcoded for speed:
      if(e.key==="ArrowUp"|| e.key==="ArrowDown" || //e.key==="Dead" ||
        "tTpPeErRlLSsOozZyYiI`".indexOf(e.key)>=0){
        e.preventDefault();
        e.stopPropagation();
      }
    }
}
keyboardshortcuts.preventDefaultOnKeypress = function(e){
  if(e.ctrlKey && e.srcElement===slidenote.textarea){
    //prevent default from the following, hardcoded for speed:
    //tn doesnt work,
    if("tTpPeErRlLSsOozZyYiI`".indexOf(e.key)>=0){
      e.preventDefault();
      e.stopPropagation();
    }
  }
}
keyboardshortcuts.releaseKey = function(e){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    console.log(e);
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
keyboardshortcuts.closeAutomagic = function(event){
  if(!this.automaticClosure)return;
  var key = event.key+"";
  console.log(event);
  if(key==="undefined")key=getKeyOfKeyCode(event.keyCode);
  //if(key==="Dead" && event.code==="Equal" && event.shiftKey)key="`"; //&& event.keyCode===187
  var actel = slidenote.parser.CarretOnElement();
  if(actel && actel.dataobject){
    for(var x=0;x<slidenote.datatypes.length;x++){
      if(slidenote.datatypes[x].type===actel.dataobject.type
         && slidenote.datatypes[x].mdcode===false)return;
    }
  }
  var selend = slidenote.textarea.selectionEnd;
  var selstart = slidenote.textarea.selectionStart;
  var txt = slidenote.textarea.value;
  var checknextletter = slidenote.textarea.value.substring(selend,selend+1);
  var checkletterbefore = slidenote.textarea.value.substring(selstart-1,selstart);
  if(key==="*" && selstart-selend===0 && checknextletter==="*"){

    var insideofendtag = false;
    if(actel && actel.brotherelement && actel.brotherelement.typ==="end"){
      var elpos = actel.brotherelement.posinall;
      var elcode = actel.brotherelement.mdcode;
      insideofendtag= (elpos<selstart && elpos+elcode.length > selend);
      insideofendtag = (insideofendtag && actel.mdcode.indexOf("**")>-1);
    }

    if(checkletterbefore!="*" ||insideofendtag ){
      //slidenote.textarea.value = slidenote.textarea.value.substring(0,selend)+slidenote.textarea.value.substring(selend+1);
      slidenote.textarea.selectionStart=selstart+1;
      slidenote.textarea.selctionEnd=selend+1;
      event.preventDefault();
      return "break";
    }
  }
  if(key==="*" && selstart-selend===0 && checkletterbefore==="*" && checknextletter!="*")return;
  if(key==="Backspace" && selend-selstart===0 &&
    checknextletter ==="*" && checkletterbefore==="*"){
    slidenote.textarea.value = slidenote.textarea.value.substring(0,selstart-1)+slidenote.textarea.value.substring(selend+1);
    slidenote.textarea.selectionStart = selstart-1;
    slidenote.textarea.selectionEnd = selend-1;
    event.preventDefault();
    return "break";
  }
  if(key==="*" || key==="_" || key==="~" || key==="`"){
      event.preventDefault();
        if(key==="~")key+=key;
        if(key==="`" && txt.substring(selstart-1,selstart)==="`" && txt.substring(selend,selend+1)==="`"){
          txt = txt.substring(0,selstart)+"``\n"+txt.substring(selstart,selend)+"\n```\n"+txt.substring(selend+1);
          key="``";
        }else if(key==="*" && txt.substring(selstart-1,selstart)==="\n"){
          key+=" ";
          txt = txt.substring(0,selstart)+key+txt.substring(selstart);
        }else{
          txt = txt.substring(0,selstart)+key+txt.substring(selstart,selend)+key+txt.substring(selend);
        }
        slidenote.textarea.value=txt;
        slidenote.textarea.selectionEnd = selend+key.length;
        slidenote.textarea.selectionStart = selstart+key.length;
        slidenote.parseneu();
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
