var dialoger = {
  standardtitle:{
    prompt:"please insert",
    confirm:"please confirm",
  }

};
/*options: object with:
* type: can be four cases: prompt, confirm, alert, dialog
* content: the content to be placed, e.g. message.
    must be a string, a html-node or array with html-nodes
    html-node with id "placeholder" will append all childnodes,
    else will appended node directly
* title: title to be placed on top of dialog - optional
* confirmbutton: text ("ok") for confirmbutton - optional
* cancelbutton: text ("cancel") for cancelbutton - optional
* closebutton: boolean (false) if closebutton is placed on top right - optional
* closebuttontext: text placed before x of button - optional
*/
dialoger.buildDialog = function(options, followfunction){
  var type = options.type;
  var content = options.content;
  //standard-closefunction: optional: options.closefunction
  var closefunction = function(){
    var dialog = document.getElementById("dialogcontainer");
    dialog.parentElement.removeChild(dialog);
    slidenote.textarea.focus();
  };

  //html-structure:
  var container = document.createElement("div");
  container.classList.add("dialogboxparent");
  //check if old container exists, if so delete it:
  var oldcontainer = document.getElementById("dialogcontainer");
  if(oldcontainer)oldcontainer.parentElement.removeChild(oldcontainer);
  //set new container:
  container.id = "dialogcontainer";
  var dialogbox = document.createElement("div");
  dialogbox.classList.add("dialogbox");
  if(options.cssclass)dialogbox.classList.add(options.cssclass);
  var title = document.createElement("h1");
  title.classList.add("dialogtitle");
  var titletext = document.createElement("span");
  if(options.title)titletext.innerText = options.title;
  else titletext.innerText = type;
  title.appendChild(titletext);
  //close/abortfunction:
  //closebutton:
  if(options.closebutton){
    var closebutton = document.createElement("button");
    closebutton.classList.add("dialogclosebutton");
    if(options.closebuttontext){
      var closespantxt = document.createElement("span");
      closespantxt.innerText = options.closebuttontext;
      closebutton.appendChild(closespantxt);
    }
    var closespanimg = new Image();
    closespanimg.src = slidenote.imagespath+"buttons/x.png";
    closebutton.appendChild(closespanimg);
    if(options.closefunction)closebutton.addEventListener("click",options.closefunction);
    closebutton.onclick = closefunction;
    title.appendChild(closebutton);
  }
  dialogbox.appendChild(title);
  var dialogcontent = document.createElement("div");
  dialogcontent.classList.add("dialogcontent");
  //handle content:
  if(options.content.innerHTML!=undefined){
    if(options.content.id==="placeholder"){
      for(var x=content.childNodes.length-1;x>=0;x--){
        dialogcontent.appendChild(options.content.childNodes[x]);
      }
    }else{
      dialogcontent.appendChild(options.content);
    }
  }else if(typeof options.content ==="string"){
    dialogcontent.innerHTML = options.content;
  }else if(options.content.length>0){
    for(var x=0;x<options.content.length;x++){
      dialogcontent.appendChild(options.content[x]);
    }
  }
  //finish content:
  dialogbox.appendChild(dialogcontent);
  if(type==="confirm"){
    var buttondiv = document.createElement("div");
    buttondiv.classList.add("buttonarea");
    var confirmbutton = document.createElement("button");
    //confirmbutton.classList.add("dialogconfirmbutton");
    confirmbutton.id = "dialogconfirmbutton";
    confirmbutton.onclick = followfunction;
    confirmbutton.addEventListener("click",closefunction);
    if(options.confirmbutton)confirmbutton.innerText = options.confirmbutton;
    else confirmbutton.innerText="Ok";
    buttondiv.appendChild(confirmbutton);
    //check for button-list:
    if(options.extrabuttons && options.extrabuttons.length>0){
      for(var x=0;x<options.extrabuttons.length;x++){
        buttondiv.appendChild(options.extrabuttons[x]);
      }
    }
    //cancelbutton:
    var cancelbutton = document.createElement("button");
    //cancelbutton.classList.add("dialogcancelbutton");
    cancelbutton.id="dialogcancelbutton";
    if(options.cancelbutton)cancelbutton.innerText=options.cancelbutton;
    else cancelbutton.innerText="cancel";
    cancelbutton.onclick = closefunction;
    if(options.closefunction)cancelbutton.addEventListener("click",options.closefunction);
    buttondiv.appendChild(cancelbutton);
    dialogbox.appendChild(buttondiv);
  }
  //finish html-structure
  container.appendChild(dialogbox);
  //append keyboard-shortcuts:
  dialogbox.addEventListener("keydown",function(e){
    console.log("key on dialog:"+e.key);
    slidenote.keyboardshortcuts.reactOn(e,"dialog");
  });
  if(type==="confirm" || options.arrownavleftright){
    dialogbox.addEventListener("keydown",function(e){
      slidenote.keyboardshortcuts.reactOn(e,"arrowleftright");
    });
  }
  //append dialog to document:
  document.getElementsByTagName("body")[0].appendChild(container);
  //focus on confirm-button if exists
  if(confirmbutton){
    confirmbutton.focus();
  }else{
    //as the first button is the closebutton we want to avoid it by selecting last one:
    //but if its the only one - fuck it.
    var bns = dialogbox.getElementsByClassName("menuitem");
    if(!bns.length>0)bns = dialogbox.getElementsByTagName("button");
    if(!bns.length>0){
      //we did not get any buttons - make dialog tabable and focus:
      dialogbox.tabable = true;
      dialogbox.focus();
    }else{
      bns[bns.length-1].focus();
    }
  }
}


//just for testing purpose some elements:
revertoptions = {
type: "confirm",
title: "revert to revision",
content: "Do you wish to revert to the revision from <br>'+date+'?<br>Progress not added to a revision will be lost.",
confirmbutton:"revert",
cancelbutton:"cancel", //standard
closebutton:false, //standard
closebuttontext:undefined //standard
}

deletepresentationoptions = {
type:"confirm",
title:"delete presentation",
content:"Do you wish to delete the presentation published to slidenotes.io?",
confirmbutton:"delete",
cancelbutton:"cancel", //standard
closebutton:false, //standard
closebuttontext:undefined //standard
}

deleteslidenoteoptions = {
type:"confirm",
title:"delete slidenote",
content:"Do you wish to delete the slidenote?",
confirmbutton:"delete"
}

renameslidenoteoptions = {
type:"prompt",
title:"rename",
content:"Enter new name",
confirmbutton:"save",
cancelbutton:"cancel"
}

changepassword = {
type:"not possible, just for reference",
title:"change password",
content:"password $passwordfield retype password $retype password field",
confirmbutton:"save",
cancelbutton:"cancel"
}

logoutconfirmoptions = {
type:"confirm",
title:"log out",
content:"You need to be logged in to use slidenotes.io during the beta phase.<br>Log out anyway?",
confirmbutton:"log out",
cancelbutton:"cancel"
}

presentationoptions = {
type:"dialog",
title:"slide design",
content: "design-list",
closebutton:true,
closebuttontext:undefined
}

deleteimageoptions = {
type:"dialog",
title:"delete image",
content: 'button1:"delete connection to tag" or button2:"delete image from slidenote & image gallery"',
closebutton:true,
closebuttontext:"cancel"
}

sizedialogoptions = {
    type:"dialog",
    title:"add image",
    content: "previewimage+ullist",
    closebutton:true,
    closebuttontext:"cancel upload",
    closefunction:function(){
        var fileinput = document.getElementById("fileInput");
        if(fileinput)fileinput.value="";
    }
}
