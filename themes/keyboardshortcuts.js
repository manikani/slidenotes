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
    if(typeof key === "string"){
        this.keys = [key]; //sole key-element
    }else if(key.constructor === Array){
        this.keys = key;
    }else{
        if(key.key)this.keys = [key.key]; //sole key in key-object
        if(key.keys)this.keys = key.keys; //array of pressed keys
        if(key.multipleChoiceKeys)this.multipleChoiceKeys = key.multipleChoiceKeys;
        if(key.metakey)this.metakey = key.metakey; //if global-metakey should be pressed
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
    this.addShortcut(new this.shortcut("select element", "textarea","m",function(){ 
        var el = slidenote.parser.CarretOnElement();
        if(el){ slidenote.textarea.selectionStart=el.posinall;
            if(el.brotherelement)slidenote.textarea.selectionEnd=el.brotherelement.posinall+el.brotherelement.mdcode.length;
            if(el.brotherelement===undefined)slidenote.textarea.selectionEnd = slidenote.parser.map.lineend[el.line];
        }
    })); 
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
    
}
keyboardshortcuts.pressKey = function(e){
    if(e.key==="undefined")e.key=getKeyOfKeyCode(e.keyCode); //webkit-bug
    this.pressedkeys[e.key]=true;
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
        for(var x=0;x<this[element].length;x++)if(this[element][x].active && this.shortcutFound(e,this[element][x])){
            this[element][x].activate(e);
            preventDefault=true;
        }
        if(preventDefault)e.preventDefault();
    }

}

keyboardshortcuts.attachShortcuts = function(){
    window.addEventListener("keydown",function(e){slidenote.keyboardshortcuts.pressKey(e);});
    slidenote.textarea.addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e, "textarea");});
    document.getElementById("insertarea").addEventListener("keyup",function(e){slidenote.keyboardshortcuts.reactOn(e, "insertmenu");console.log("shortcut insmenu");console.log(e);});
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
