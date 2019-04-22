/* load and save module
* handles the interaction with all what has to do with loading and saving
* saves slidenotes localy in localStorage
* saves slidenotes in cms
* exports slidenote to filesystem
* encrypts slidenote before saving
* loads slidenotes from localStorage
* loads slidenotes from cms
* imports slidenotes from filesystem
* imports md-code from filesystem
* decrypts slidenote after loading
* saves config to cms/localStorage destination
* loads config from cms/localStorage destination
* Dependencies: FileSaver.js for saving exports
*/

function slidenoteGuardian(slidenote){
  this.slidenote = slidenote;
  this.cmsConfig = document.getElementById("cmsconfig");
  this.cmsArea = document.getElementById("cmsarea");
  this.cmsImages = document.getElementById("cmsimages");
  this.cmsSlidenoteHash = document.getElementById("cmsslidenotehash");
  this.cmsImagesHash = document.getElementById("cmsimageshash");
  this.cmsNoteSave;
  this.cmsImagesSave;

  //this.exportedPresentations = new Array();
  this.restObject={};
  this.hascmsconnection=false;
  if("initial_note" in window){
    this.hascmsconnection=true;
    this.restObject = initial_note;
    this.restObject.drupal7 = {
      nid:initial_note.nid,
      author:initial_note.author
    }
    this.getRestToken("init");
    this.getAllPlugins();
  }else if(location.protocol!="file:"){
    console.log("get all css from static webserver");
    this.getCSSFromStaticWebserver();
    this.getJSFromStaticWebserver();
  }
  if(this.restObject.exportedPresentations===undefined)this.restObject.exportedPresentations = new Array();
  this.restObject.combine = function(uploadobj){
    for(var key in uploadobj){
      if(uploadobj.hasOwnProperty(key)){
        this[key]=uploadobj[key];
      }
    }
  }
  this.uploadRestObject = {};

  this.configs; //not used yet
  this.password; //storing password for later use so user has not to retype it all the time he saves (automagicaly)
  this.passwordHash; //better use this than original password?
  this.key = null; //always start with empty key
  this.crypto = window.crypto; //make crypto available
  this.decText; //last decrypted Text - we could get rid of it
  this.encBufferString; //last encrypted String from cms or local storage
  this.encImageString; //last encrypted String from cms or local storage with base64-images
  this.iv; //the initialisation-vector to use - we could get rid of it?
  this.ivlength = 12; //the length of the initialisation vector used for encryption
  this.localstorage = window.localStorage; //set local storage
  /*in local-storage there can be saved ONE slidenote only. items:
  * cryptnote: encrypted slidenote
  * cryptimagestring: encrypted string with base64-images
  * title: the title of the saved slidenote
  */
  this.notetitle = "slidenotetest"; //the title of the saved slidenote - normaly set via cms
  //helpers for autosave:
  this.lastNoteFormId;
  this.isencryptingimages = false;
  //this.lastTimeActive = new Date().getTime(); //last time user was active - needed for Timeout before saving

  //add FileSaver.js to meet Dependencie:
  this.slidenote.appendFile("script","filesaver/FileSaver.js");
  /*
  var jsfile = document.createElement('script');
  jsfile.setAttribute("type","text/javascript");
  jsfile.setAttribute("src", "themes/filesaver/FileSaver.js");
  document.getElementsByTagName("head")[0].appendChild(jsfile);
  */
  if(!this.hascmsconnection){
    var savestatus = document.getElementById("savestatus");
    savestatus.src = slidenote.imagespath+"buttons/clouderror.png";
    savestatus.title = "no connection with the cloud";
  }
  //can we start the init here? why not?
  this.init();
}

slidenoteGuardian.prototype.init = function(){
  //init will be called once the slidenote has been loaded from cms
  //this.getCMSFields();
  notetitle = this.restObject.title;
  this.notetitle = this.restObject.title;
  notehash = this.restObject.notehash;
  if(this.localstorage.getItem("title") && this.localstorage.getItem("title").length>0){//===this.notetitle){
    let loadtext = "We found a Slidenote in your Browsers Cache of the loaded Slidenote. Use Version of Browser-Cache?";
    if(this.localstorage.getItem("title")!=notetitle)loadtext="We found a Slidenote with title \""+this.localstorage.getItem("title")+"\" in your local Storage but loaded Title is \""+this.notetitle+"\". Do you want to load the cached version instead?";
    if(this.localstorage.getItem("slidenotehash")!=notehash && confirm(loadtext)){
      this.notetitle=this.localstorage.getItem("title");
      setTimeout("slidenoteguardian.loadNote('local')",100);
    } else {
      if(this.hascmsconnection && this.restObject.encnote.length>1){
        setTimeout("slidenoteguardian.loadNote('cms')",1);
      }else if(this.hascmsconnection){

      }
      //this.loadNote("cms");
      //this.loadConfig("cms");
    }
  }
  if(this.localstorage.getItem("config")!=null){
    //i cant do it directly because its quite obvious that some themes are not added yet
    //for testing purpose i should just wait 2 seconds
    //setTimeout('slidenoteguardian.loadConfig("local")',2000);
    this.loadConfig("local"); //slidenoteguardian is loaded after editor is ready to use
      //slidenote.extensions.addAfterLoadingThemesHook(function(){slidenoteguardian.loadConfig("local")});
  }
  document.getElementById("optionsclose").addEventListener("click",function(event){
      slidenoteguardian.saveConfig("local");
  });
  //more to save:
  var savefunction = function(e){
    slidenoteguardian.saveConfig("local");
  };

  setTimeout("slidenoteguardian.autoSaveToCMS()",3000);
  slidenote.textarea.addEventListener("focus",function(event){
    if(document.getElementById("slidenoteGuardianPasswortPrompt")!=null){
      document.getElementById("password").focus();
    }
  })
  //Adding import-Function to fileinput:
  var fileInput = document.getElementById("importfile");
  fileInput.addEventListener('change', function(e){
    let file = this.files[0];
    let nombre = file.name; //.slidenote
    console.log("file "+nombre + " selected");
    if(nombre.substring(nombre.length-10)===".slidenote"){
      //its an encrypted slidenote
      var reader = new FileReader();
      reader.onload = function(e){
        slidenoteguardian.importFromEncryptedFile(reader.result);
      }
      reader.readAsText(file);
    } else if(nombre.substring(nombre.length-2)==="md" ||
           nombre.substring(nombre.length-3)==="txt" ||
            nombre.substring(nombre.length-3)==="csv"){
      var reader = new FileReader();
      reader.onload = function(e){
        slidenoteguardian.insertImport(reader.result);
      }
      reader.readAsText(file);
    } else {
      //Filetype not supported
      alert("filetype not supported");
    }
  }); //end of fileinput.addEventListener

  window.onbeforeunload = function(){
    var acthash = slidenoteguardian.localstorage.getItem("slidenotehash");
    if(acthash!=slidenoteguardian.cmsSlidenoteHash.value){
      console.log(acthash+"\n localstoragehash vs cmshash\n"+slidenoteguardian.cmsSlidenoteHash.value);
      return "do you really want to leave?";
    }
  }

  slidenote.textarea.addEventListener('drop', function(e){
      //prevent defaults:
      e.preventDefault();
      e.stopPropagation();
      //handling drag n drop of files
      let dt = e.dataTransfer;
      let files = dt.files;
      let file = files[0];
      let nombre = file.name;
      document.getElementById("importfile").dropfilename = file.name;
      if(nombre.substring(nombre.length-10)===".slidenote"){
        var reader = new FileReader();
        reader.onload = function(e){
          slidenoteguardian.importFromEncryptedFile(reader.result);
        }
        reader.readAsText(file);
      }else if(nombre.substring(nombre.length-2)==="md" ||
            nombre.substring(nombre.length-3)==="txt" ||
            nombre.substring(nombre.length-3)==="csv"){
              var reader = new FileReader();
              reader.onload = function(e){
                slidenoteguardian.insertImport(reader.result);
              }
              reader.readAsText(file);
      } else {
        //filetype not supported: Image here?
      }
  }, false); //end of drop-event

  //savebutton:
  var savebutton = document.getElementById("savebutton");
  if(savebutton)savebutton.addEventListener("click",function(e){
    slidenoteguardian.saveNote("cms");
    this.savebutton = savebutton;
    this.savebuttontitles = {default:"not in sync with cloud",
                             error:"error while connecting to cloud",
                             sync:""}
  })
}

slidenoteGuardian.prototype.loadFromRest = async function(filepath){
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(){
    slidenoteguardian.loadedFromRest(this);
  });
  oReq.open("GET", filepath);
  oReq.send();
}

slidenoteGuardian.prototype.loadedFromRest = function(jsonstring){
  var loadedObject = JSON.parse(jsonstring);
  this.loadedObject = loadedObject;
  console.log(loadedObject);
}

slidenoteGuardian.prototype.getAllPlugins = function(){
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(){
    console.log(this);
    if(this.status===200 || this.statusText==="ok")
    slidenoteguardian.importPlugins(JSON.parse(this.response));
  });
  oReq.open("GET","/node.json?type=slidenote_plugin");
  oReq.send();
}

//get all Css-Blocks from static webserver:
slidenoteGuardian.prototype.getCSSFromStaticWebserver = function(){
  console.log("load css from themes:"+slidenote.extensions.themes.length);
  console.log("theme-string:"+this.slidenote.extensions.themeObjektString);

  this.cssBlocksPerPlugin = new Array();
  var basicl = new XMLHttpRequest();
  basicl.addEventListener("load",function(){
    if(this.status===200)slidenoteguardian.cssBlocksPerPlugin.push({plugin:"basic", css:this.response});
  })
  basicl.open("GET", "layout.css");
  basicl.send();
  var basepath = "themes/"
  var themes = slidenote.extensions.themeObjektString.split(";");//slidenote.extensions.themes;
  themes.pop(); //remove last empty entry
  themes.push("slidenoteguardian");
  themes.push("slidenoteplayermini");
  var oReqs = new Array();
  for(var x=0;x<themes.length;x++){
    var filename = basepath + themes[x]+".css";//themes[x].classname + ".css";
    oReqs[x] = new XMLHttpRequest();
    oReqs[x].addEventListener("load",function(){
      console.log("css-file loaded from webserver as textfile:")
      console.log(this);
      var pluginname = this.responseURL.substring(this.responseURL.lastIndexOf("/")+1,this.responseURL.lastIndexOf("."));
      if(this.status ===200)slidenoteguardian.cssBlocksPerPlugin.push({plugin:pluginname, css:this.response});
    });
    oReqs[x].open("GET", filename);
    oReqs[x].send();
  }

}
slidenoteGuardian.prototype.getJSFromStaticWebserver = function(){
  this.jsfilesForExport = new Array();

  var jsfilenames = ["slidenoteplayermini.js", "slidenoteguardianmini.js"];
  for(var x=0;x<jsfilenames.length;x++){
    var filename = slidenote.basepath + jsfilenames[x];
    var req = new XMLHttpRequest();
    req.addEventListener("load",function(){
      console.log("js-file loaded from webserver as textfile");
      console.log(this);
      slidenoteguardian.jsfilesForExport.push({name: this.responseURL.substring(this.responseURL.lastIndexOf("/")+1),jscode: this.response});
    });
    req.open("GET",filename);
    req.send();
  }
}
slidenoteGuardian.prototype.importPlugins = function(resolve){
  console.log(resolve);
  this.restObject.plugincollector = {};
  this.restObject.plugincollector.pluginlist = resolve.list;
  for(var x=0;x<resolve.list.length;x++){
    var actplugin = resolve.list[x];
    var css = actplugin.field_plugincss;
    this.restObject.plugincollector[actplugin.title] = {
      css:css, nr:x, body:actplugin.body
    }
  }
  console.log("imported plugins");
}

slidenoteGuardian.prototype.createCssBlock = function(){
  var cssblock = "";
  if(this.restObject.plugincollector == undefined && this.hascmsconnection){
    this.getAllPlugins();
  } else if(!this.hascmsconnection && this.cssBlocksPerPlugin){
    for(var x=0;x<this.cssBlocksPerPlugin.length;x++){
      var cssb = this.cssBlocksPerPlugin[x];
      var ltheme = slidenote.extensions.getThemeByName(cssb.plugin);
      if(ltheme && ltheme.active || cssb.plugin==="basic" ||
      cssb.plugin==="slidenoteguardian" || cssb.plugin==="slidenoteplayermini"){
        cssblock+="\n"+cssb.css+"\n</style><style>";
      }else{
        console.log("plugin "+cssb.plugin +"war nicht aktiv");
      }
    }
    return cssblock;
  } else if(!this.hascmsconnection) return "/*connection to cloud not working*/";

  for(var x=0;x<slidenote.extensions.themes.length;x++){
    var acttheme = slidenote.extensions.themes[x];
    if(acttheme.active && this.restObject.plugincollector[acttheme.classname]!=undefined){
      cssblock+=this.restObject.plugincollector[acttheme.classname].css;
    }
  }
  //cssblock+="\n</style>\n";
  return cssblock;
}

slidenoteGuardian.prototype.getRestToken = async function(afterwards){
  var tokenquest = new XMLHttpRequest();
  console.log("asking for Token...");
  tokenquest.addEventListener("load",function(){
    if(this.status==200&& this.statusText==="OK")
      slidenoteguardian.restToken = this.response;
      else slidenoteguardian.restToken = undefined;
    console.log("Token loaded:"+this.statusText);
  });
  tokenquest.open("GET","/restws/session/token");
  tokenquest.send(null);
  //should return promise to let saveToRest await
}
//@param: payloadobject
slidenoteGuardian.prototype.saveToRest= async function(path, payload){
  console.log("start saveToRest:"+path);
  if(!this.restToken){
    console.log("Rest-Token not set yet... getting Token and try again...");
    this.getRestToken("save"); //has to be with await
    return; //return and wait for next save till we can await
  }
  //var payload = JSON.stringify(payloadobject);
  var putReq= new XMLHttpRequest();
  putReq.addEventListener("load",function(){
    slidenoteguardian.resolve=this;
    console.log(this);
    slidenoteguardian.savedToRest(this);
  });
  putReq.open("PUT",path);
  putReq.setRequestHeader("CONTENT-TYPE","application/json");
  putReq.setRequestHeader('X-CSRF-TOKEN', this.restToken);

  //putReq.withCredentials = true;
  putReq.send(payload);
  console.log("sending payload");
  console.log(putReq);
}

slidenoteGuardian.prototype.savedToRest = function(resolve){
  console.log("saved to Rest:"+resolve.statusText);
  var statusimg = document.getElementById("savestatus");
  if(resolve.statusText==="OK"){
    statusimg.src = slidenote.imagespath+"buttons/cloudsaved.png";
    statusimg.title = "slidenote in sync with cloud";
    this.restObject.combine(this.uploadRestObject);
  }else{
    statusimg.src = slidenote.imagespath+"buttons/clouderror.png";
    statusimg.title=resolve.statusText;
  }
}

slidenoteGuardian.prototype.exportPresentationToRest = function(payload){
  console.log("start exportToRest");
  if(!this.restToken){
    console.log("Rest-Token not set yet... getting Token and try again...");
    this.getRestToken("save"); //has to be with await
    return; //return and wait for next save till we can await
  }
  //var payload = JSON.stringify(payloadobject);
  var postReq= new XMLHttpRequest();
  postReq.addEventListener("load",function(){
    //slidenoteguardian.resolve=this;
    console.log("new export-resolve");
    console.log(this);
    slidenoteguardian.exportedPresentationToRest(this);
  });
  postReq.open("POST","/node/");
  postReq.setRequestHeader("CONTENT-TYPE","application/json");
  postReq.setRequestHeader('X-CSRF-TOKEN', this.restToken);

  //putReq.withCredentials = true;
  postReq.send(payload);
  console.log("sending payload");
  console.log(postReq);
}

slidenoteGuardian.prototype.exportedPresentationToRest = function(resolve){
  if(resolve.statusText==="Created"){
    var respobj = JSON.parse(resolve.response);
    var cdate = new Date();
    this.restObject.exportedPresentations.push({
      id:respobj.id,
      uri:respobj.uri,
      date: cdate
    });
    console.log("uploaded to Rest");
    console.log(respobj);
    //update slidenote-node:
    var update = this.prepareDrupal7Rest("presentationEntityUpdate");
    this.saveToRest(update.path,update.payload);
    //get public url of presentation:
    var urlquest = new XMLHttpRequest();
    urlquest.addEventListener("load", function(){
      var exp = slidenoteguardian.restObject.exportedPresentations[slidenoteguardian.restObject.exportedPresentations.length-1];
      var resolve = JSON.parse(this.response);
      exp.publicURL = resolve.url;
      if(confirm("new Presentation ready with url "+resolve.url+"\n Go there now?")){
        console.log("jump to presentationnode");
      }
    });
    urlquest.open("GET",respobj.uri+".json");
    urlquest.setRequestHeader("CONTENT-TYPE","application/json");
    urlquest.setRequestHeader('X-CSRF-TOKEN', this.restToken);
    urlquest.send();
  }
}

slidenoteGuardian.prototype.exportPresentation = async function(destination, presentationdiv){
  var password = await this.passwordPrompt("Choose a Password for the Presentation", "exportCMS", true);
  if(destination==="filesystem")this.preparePresentationForFilesystem(presentationdiv);
  var presentationstring = '<div class="'+presentationdiv.classList.toString()+'">'+
                            presentationdiv.innerHTML + "</div>";
  var encResult = await this.encryptForExport(presentationstring, password);
  var encString = this.encBufferToString(encResult);
  this.uploadRestObject.encpresentation = encString;
  if(destination==="cms"){
    this.uploadRestObject.title = encResult.filename;
    console.log("prepare to upload and uploading to cms...");
    var payloadobj = this.prepareDrupal7Rest("presentation");
    console.log(payloadobj);
    this.exportPresentationToRest(payloadobj.payload);
  }else if(destination==="filesystem"){
    this.exportPresentationToFilesystem(encString, true);
  }
}

slidenoteGuardian.prototype.prepareDrupal7Rest = function(mode){
  var path = "/node/"+this.restObject.drupal7.nid;
  var payloadobj = {
    nid:this.restObject.drupal7.nid
  }
  if(mode=="text"){
    payloadobj.field_encryptednote = this.uploadRestObject.encnote;
    payloadobj.field_notehash=this.uploadRestObject.notehash;
  }else if(mode==="image"){
    payloadobj.field_encimages= this.uploadRestObject.encimg;
    payloadobj.field_imageshash=this.uploadRestObject.imagehash;
  }
  else if(mode==="presentation"){
    path = "/node/";
    let cssblock = this.createCssBlock();
    payloadobj = {
      type:"presentation",
      title: this.uploadRestObject.title,
      field_encpresentation: this.uploadRestObject.encpresentation,
    //  field_description:"PIPPO",
      field_slidenotenode: this.restObject.drupal7.nid,
      field_cssblock: cssblock
    }
    payloadobj.author = this.restObject.author;

  } else if(mode==="presentationUpdate"){
    payloadobj.field_encpresentation = "TEST";//this.uploadRestObject.encpresentation;
  } else if(mode==="presentationEntityUpdate"){
    payloadobj.field_presentations = new Array();
    for(var px=0;px<this.restObject.exportedPresentations.length;px++){
      if(this.restObject.exportedPresentations[px].id!="")
      payloadobj.field_presentations.push({id:this.restObject.exportedPresentations[px].id});
    }
  }
  console.log("Json-stringify payload object:");
  console.log(payloadobj);
  var payload = JSON.stringify(payloadobj);
  return{path:path,payload:payload};
}

slidenoteGuardian.prototype.exportIsReady = function(presdiv){
  console.log("export is ready to:"+this.exportPresentationDestination);
  if(this.exportPresentationDestination==="unencrypted"){
    this.preparePresentationForFilesystem(presdiv);
    this.exportPresentationToFilesystem(presdiv.innerHTML, false);
  }else{
    this.exportPresentation(this.exportPresentationDestination, presdiv);
  }
  this.exportPresentationDestination = undefined;
  slidenote.presentation.showpresentation();//hide exported-Presentation and return into editormode
}

slidenoteGuardian.prototype.exportPresentationToCMS = function(){
  this.exportPresentationDestination ="cms";
  console.log("start exporting to cms");
  slidenote.presentation.showpresentation(true);
}
slidenoteGuardian.prototype.exportPresentationLocal = function(encrypted){
  if(encrypted)this.exportPresentationDestination = "filesystem";
  if(!encrypted)this.exportPresentationDestination = "unencrypted";
  console.log("start exporting to filesystem");
  slidenote.presentation.showpresentation(true);
}

slidenoteGuardian.prototype.preparePresentationForFilesystem = function(presentationdiv){
  var pages = presentationdiv.getElementsByClassName("ppage");
  for(var x=0;x<pages.length;x++){
    var page = pages[x];
    var id = "slide"+x;
    var nav = document.createElement("div");
    //nav.style.position = "fixed";
    //nav.style.bottom = 0;
    //nav.style.width = "100vw";
    nav.classList.add("controlarea");
    var backlink = document.createElement("a");
    if(x>0)backlink.href="#slide"+(x-1);
    backlink.innerText="last slide";
    var forwlink = document.createElement("a");
    backlink.classList.add("controlbutton");
    if(x<pages.length-1)forwlink.href="#slide"+(x+1);
    forwlink.innerText = "next slide";
    forwlink.classList.add("controlbutton");
    nav.appendChild(backlink);
    nav.appendChild(forwlink);
    page.appendChild(nav);
    page.id=id;
    page.classList.remove("active");
  }//for-to
}

slidenoteGuardian.prototype.exportPresentationToFilesystem = function(presstring, encrypted){
  //get css-codes from all active themes:
  /*
  var allactivethemes = ""; //holds names of all active themes
  for(var x=0;x<slidenote.extensions.themes.length;x++){
    var acttheme=slidenote.extensions.themes[x];
    if(acttheme.active)allactivethemes+=acttheme.classname+";";
  }*/
  var cssblock = this.createCssBlock();
  cssblock+= "\ndiv.ppage{visibility:hidden;}"+
            " \ndiv.ppage:target{visibility:visible;}"+
            "\n.blocks div.ppage.active{visibility:hidden;}"+
            "\n#slide0{visibility:visible;z-Index:1} .ppage{z-index:2}";
  var headerhtml = "<html><head><title>a slidenote presentation</title></head>";
  if(encrypted)headerhtml+='<body onload="slidenoteguardian.decryptPresentation()">'; else headerhtml+="<body>";
  var bodyhtmlbefore = '<div id="slidenotediv" class="'+slidenote.presentation.presentation.classList.toString()+'"><div id="slidenotepresentation">';
  var bodypresentation = "";
  if(!encrypted)bodypresentation = presstring;
  var bodyhtmlafter = '</div></div>';
  var bodyend ='</body></html>';
  var jsblock = "";
  if(encrypted){
    jsblock = "encslidenote = {encBufferString:'"+presstring +
                "', ivlength:"+this.ivlength+
                "}\n";

    for(var jsx = 0;jsx<this.jsfilesForExport.length;jsx++)jsblock += this.jsfilesForExport[jsx].jscode;
  }else{
    for(var jsx = 0;jsx<this.jsfilesForExport.length;jsx++)if(this.jsfilesForExport[jsx].name==="slidenoteplayermini.js")jsblock += this.jsfilesForExport[jsx].jscode;
  }
  var passwordprompt =  "";
  if(encrypted)passwordprompt = document.getElementById("slidenoteGuardianPasswordPromptStore").innerHTML;

  var result = headerhtml+
              "<style>"+ cssblock + "</style>"+
              bodyhtmlbefore+
              bodypresentation +
              bodyhtmlafter+
              "<script>"+jsblock+"</script>"+
              '<div id="slidenoteGuardianPasswordPromptStore">'+passwordprompt+'</div>'+
              bodyend;

  this.exportToFilesystem(result, this.title+".html");
}

slidenoteGuardian.prototype.loadCssFromRest = function(){

}

slidenoteGuardian.prototype.loadNote = async function(destination){
    //loads Note from cmsArea or from local destination
    //destination is "cms" or "local"
    if(destination==="cms"){
      if(!this.hascmsconnection)return;
      //first thing to do is get the fields right:
      //this.getCMSFields();
      if(this.cmsArea)this.encBufferString = this.cmsArea.value;
      if(initial_note)this.encBufferString = initial_note.encnote;
      //this.encImageString = this.cmsImages.value;
    }else if(destination==="local"){
      this.encBufferString = this.localstorage.getItem('cryptnote');
    }
    //getting iv of string:
    let iv = new Uint8Array(this.ivlength); //create empty ivarray
    for(let i=0;i<this.ivlength;i++)iv[i]=this.encBufferString.charCodeAt(i)-255;
    this.iv = iv;
    this.encBufferString = this.encBufferString.substring(this.ivlength);//delete iv-chars from string
    let buffer = new Uint8Array(this.encBufferString.length);
    for(let i=0;i<this.encBufferString.length;i++)buffer[i]=this.encBufferString.charCodeAt(i)-255;
    //this.encTextBuffer = buffer.buffer; //changing to ArrayBuffer -- TODO:kann weg oder?
    this.decText = await this.decrypt(buffer.buffer, this.iv); //decrypt ArrayBuffer
    //console.log("decryption fail:"+this.decText);
    //error-handling - try again:
    while(this.decText === "decryption has failed" && confirm("decryption failed. try it again?")){
        this.decText = await this.decrypt(buffer.buffer, this.iv); //decrypt ArrayBuffer anew
    }
    if(this.decText === "decryption has failed")return; //password wrong, abort the load
    console.log("decryption ended succesfully:"+this.decText.substring(0,20));
    this.slidenote.textarea.value = this.decText; //putting result into textarea
    //loading images:
    let imgstring;
    if(destination==="cms"){
      if(this.cmsImages)imgstring = this.cmsImages.value;
      else if(initial_note)imgstring = initial_note.encimg;
    }
    if(destination==="local")imgstring = this.localstorage.getItem('cryptimagestring');
    if(imgstring != undefined && imgstring.length>0){
      //images sind vorhanden - TODO: check ob images bereits geladen sind mittels timestamp
      this.encImageString = imgstring;
      await this.loadImages(destination);

    }
    //cleaning up:
    this.slidenote.textarea.focus(); //focus on textarea for further editing
    this.slidenote.parseneu(); //let wysiwyg-editor notice change

}

slidenoteGuardian.prototype.saveNote = async function(destination){
  if(destination==="cms"&&!this.hascmsconnection)return;
  if(destination==="local" && !slidenote.extensions.allThemesLoaded)return;
  if(slidenote ===undefined || this.slidenote.base64images ===undefined)return;
  var starttime = new Date().getTime();
  console.log("starting save note to destination "+destination);
  //saves Note to cmsArea -> CMS or to local destination
  //destination is cms or local - will be encrypted nevertheless
  if(document.getElementById("slidenoteGuardianPasswortPrompt")!=null)return;
  let slidenotetext = this.slidenote.textarea.value;
  let encResult;
  if(destination ==="filesystem"){
    let exportstring = this.slidenote.textarea.value +
                        "\n||€€imagepart€€||\n" +
                      this.slidenote.base64images.allImagesAsString();
     encResult = await this.encryptForExport(exportstring);
  }else{
    encResult = await this.encrypt(slidenote.textarea.value);
  }
 /*
  let encTextBuffer = encResult.encbuffer;
  let iv = encResult.iv;
  //getting only displayable chars without control-chars:
  let utf8array = new Uint8Array(encTextBuffer); //changing into utf8-Array
  //console.log(utf8array);
  let utf8string = ""; //starting new string for utf8
  for(let i =0; i<utf8array.length;i++){
    utf8string+=String.fromCharCode(utf8array[i]+255); //fill string with save values
  }
  //converting iv to string with same method:
  let ivstring="";
  for(let i=0; i<iv.length;i++)ivstring+=String.fromCharCode(iv[i]+255);
  let result = ivstring+utf8string;//save iv in front of code
  */
  let result = this.encBufferToString(encResult);
  //save Images:
  let encimgstring="";
  var imghash = null;
  if(this.slidenote.base64images.notempty){
    if(destination ==="cms"){
      //first get the fields right:
      //this.getCMSFields();
      //slidenote has images - check if already saved:
      let newimghash = await this.hash(this.slidenote.base64images.allImagesAsString());
      if(this.restObject.imagehash!=newimghash){//this.cmsImagesHash.value != newimghash){
        console.log("save images with hash:"+newimghash);
        if(!this.isencryptingimages){
          console.log("its not encrypting so start:"+this.isencryptingimages);
          this.isencryptingimages = true;
          encimgstring = await this.encryptImages(); //encrypt imagestring
          this.uploadRestObject.imagehash = newimghash; //this.cmsImagesHash.value = newimghash; //send new hash to cms
          this.isencryptingimages = false; //allow further encrypting
          var enctime = new Date().getTime() - starttime;
          console.log("Timecheck: encrypted imgstring in "+enctime+"Ms");
        }else{ console.log("still encrypting images - do nothing"); return;}
      } else{
        console.log("images did not change:"+newimghash);
      }
    }else if(destination==="local"){
      //saving images to localStorage - TODO: do we want to check if already saved? Yes, because it can be quite bothersome to wait!
      imghash = await this.hash(this.slidenote.base64images.allImagesAsString());
      if(imghash != this.localstorage.getItem("imghash")){
        encimgstring = await this.encryptImages();
      }else {imghash = null;}
    }
  }
  if(destination ==="cms"){
    //first get the fields right:
    //this.getCMSFields();
    //this.cmsSlidenoteHash.value = await this.hash(slidenotetext); //putting hash into cms
    //this.cmsArea.value= result; //putting it in textarea of cms
    //----old://if(imagestring.length>0)this.cmsImages.value = ivstring+imagestring;
    this.uploadRestObject = {};
    this.uploadRestObject.notehash = await this.hash(slidenotetext); //putting into rest-object
    this.uploadRestObject.encnote = result;
    var savestatus = document.getElementById("savestatus")
    savestatus.src=slidenote.imagespath+"buttons/cloudupload.gif";
    savestatus.title="saving note into cloud";

    //TODO: images?
    if(encimgstring!=""){
      var starttimecopy = new Date().getTime();
      //this.cmsImages.value=encimgstring; //dont do it for test purpose
      this.uploadRestObject.encimg = encimgstring;
      var endtimecopy = new Date().getTime();
      var usedtimecopy = endtimecopy - starttimecopy;
      console.log("Timecheck: Copied imagestring with length "+encimgstring.length+" in "+usedtimecopy+"Ms");
      //this.sendToCMS("images"); //cant do that like this? because copy is async?
      var drupal7prepare = this.prepareDrupal7Rest("image");
      this.saveToRest(drupal7prepare.path, drupal7prepare.payload);

    }
    //TODO: sending result to CMS
    //this.sendToCMS("note");
    var drupal7prepare = this.prepareDrupal7Rest("text");
    console.log("saving to cms drupal7:"+drupal7prepare.path);
    console.log(JSON.parse(drupal7prepare.payload));
    this.saveToRest(drupal7prepare.path,drupal7prepare.payload);
  }else if(destination==="local"){
    //TODO: testing max-size of local storage
    this.localstorage.setItem('cryptnote',result); //saving it to local storage
    this.localstorage.setItem('cryptnote'+this.notetitle,result); //new approach with multiple notes
    this.localstorage.setItem('title',this.notetitle); //can be deleted in future
    let titles = this.localstorage.getItem("notetitles"); //multiple notes can be saved
    if(titles===null)titles=this.notetitle;
    if(titles.indexOf(this.notetitle)===-1)titles+="#|#"+this.notetitle;

    if(imghash!=null){
      this.localstorage.setItem('cryptimagestring',encimgstring); //TODO: new aproach with multiple notes
      this.localstorage.setItem('imghash',imghash); //TODO: new approach with multiple notes
    }
    let notehash = await this.hash(slidenotetext);
    this.localstorage.setItem("slidenotehash", notehash);

  }else if(destination ==="filesystem"){
    //export/save it to the local filesystem
    let exportstring = result;
    let exportfilename = this.notetitle+".slidenote";
    if(encResult.filename){
      exportfilename=encResult.filename;
      if(exportfilename.substring(exportfilename.length-10)!=".slidenote")exportfilename+=".slidenote";
    }
    this.exportToFilesystem(exportstring, exportfilename);
  }
  var endtime = new Date().getTime();
  var usedtime = endtime - starttime;
  console.log("Timecheck: saved node to destination "+destination+" in"+usedtime+"Ms");

}

slidenoteGuardian.prototype.exportToFilesystem = function(exportstring, exportfilename){
  //TODO: Check if saveAs supported. If not bounce exportstring to server
  let blob = new Blob([exportstring],{type:"text/plain;charset=utf-8"});
  saveAs(blob, exportfilename);
}

slidenoteGuardian.prototype.loadImages = async function(destination){
  //image-part:
  let encimagestring = this.encImageString.substring(0);
  //console.log("load Images" + encimagestring.substring(this.ivlength,30));
  if(encimagestring.length>0){
    //getting iv out of the string
    let imgiv = new Uint8Array(this.ivlength);
    for(let iiv=0;iiv<this.ivlength;iiv++)imgiv[iiv]=encimagestring.charCodeAt(iiv)-255;
    //this.imgiv = imgiv;
    encimagestring = encimagestring.substring(this.ivlength); //delete iv-chars
    let imgbuffer = new Uint8Array(encimagestring.length);
    for(let im=0;im<imgbuffer.length;im++)imgbuffer[im]=encimagestring.charCodeAt(im)-255;
    let decImageString = await this.decrypt(imgbuffer.buffer, imgiv); //decrypt imgbuffer
    this.slidenote.base64images.loadImageString(decImageString); //send it to slidenote

  }
};

slidenoteGuardian.prototype.encryptImages = async function(){
  //now the images:
  let imagestring="";
  //console.log("save Imagestring:"+this.slidenote.base64images.allImagesAsString());
  if(this.slidenote.base64images.base64images.length>0){ //muss diese abfrage überhaupt hier sein?
    let encResult = await this.encrypt(this.slidenote.base64images.allImagesAsString());
    let imageBuffer = encResult.encbuffer;
    for(let i=0;i<encResult.iv.length;i++)imagestring+=String.fromCharCode(encResult.iv[i]+255);
    let imageutf8 = new Uint8Array(imageBuffer);
    for(let i=0;i<imageutf8.length;i++)imagestring+=String.fromCharCode(imageutf8[i]+255);
    return imagestring;
  } else{
    return "";
  }
};

slidenoteGuardian.prototype.loadConfig = async function(destination){
  //loads Config from configarea or from local destination
  //destination is cms or local
  var savedConfigString;
  this.getCMSFields();
  if(destination==="cms")savedConfigString = this.cmsConfig.value;
  if(destination==="local")savedConfigString = this.localstorage.getItem('config');
  if(slidenote==null){
    setTimeout("slidenoteguardian.loadConfig("+destination+")",2000);
    return;
  }
  //load Themes:
  console.log("load configString:"+savedConfigString);
  var themes = new Array(); //only active themes
  var actthemesstring = savedConfigString.substring(0,savedConfigString.indexOf("$$"));
  var actthemenames = actthemesstring.split(";");
  //check if Theme allready loaded - if not, load anew:
  //check if Theme allready added to themes, if not await:
  var addedthemes="";
  for(var x=0;x<slidenote.extensions.themes.length;x++)addedthemes+=slidenote.extensions.themes[x].classname;

  for(var x=0;x<actthemenames.length;x++){
    if(slidenote.themeobjekts.indexOf(actthemenames[x])==-1){
      //slidenote.presentation.loadTheme(actthemenames[x]);
      //is this really important? isnt this decided elsewhere? like in the cms?
    }
    if(addedthemes.indexOf(actthemenames[x])==-1){
      //this is bullshit - i should not do that
    }
  }

  for(var x=0;x<slidenote.extensions.themes.length;x++){
    var act = slidenote.extensions.themes[x];
    if(actthemesstring.indexOf(act.classname)>=0){
      if(!act.active)slidenote.extensions.changeThemeStatus(x,true);
      themes.push(act);
    }else{
      slidenote.extensions.changeThemeStatus(x,false);
    }
  }
  //Choose Editor:
  var editorchoiceString = savedConfigString.substring(savedConfigString.indexOf("$$")+2,savedConfigString.indexOf("€€"));
  slidenote.choseEditor(editorchoiceString);
  console.log("choseeditor:"+editorchoiceString);

  //Nightmode yes or no?
  var nightm = savedConfigString.substring(savedConfigString.indexOf("€€")+2,savedConfigString.indexOf("€$"));
  console.log("nightmode:"+nightm);
  if(nightm==="true"){
    var toggler = document.getElementById("nightmodetoggle");
    toggler.classList.remove("off");
    toggler.classList.add("on");
    document.getElementById("slidenotediv").classList.add("nightmode");
  }
  //load Themes-Config:
  var savedConfigStrings = new Array();
  for(var x=0;x<themes.length;x++){
  	var pos = savedConfigString.indexOf("{["+themes[x].classname+"]}");
  	if(pos>=0)savedConfigStrings.push({name:themes[x].classname, position:pos, dataposition:pos+4+themes[x].classname.length,theme:themes[x]});
  }
  //console.log()
  savedConfigStrings.sort(function(a,b){return a.position-b.position});
  for(var x=0;x<savedConfigStrings.length-1;x++){
  	savedConfigStrings[x].data = savedConfigString.substring(savedConfigStrings[x].dataposition, savedConfigStrings[x+1].position);
  }
  if(savedConfigStrings.length>0)
        savedConfigStrings[savedConfigStrings.length-1].data = savedConfigString.substring(savedConfigStrings[savedConfigStrings.length-1].dataposition);
  console.log(savedConfigStrings);
  for(var x=0;x<savedConfigStrings.length;x++){
    savedConfigStrings[x].theme.loadConfigString(savedConfigStrings[x].data);
  }
}

slidenoteGuardian.prototype.saveConfig = function(destination){
  //saves configs to local destination or to cmsarea -> CMS
  //destination is cms or local
  var themes = new Array(); //only active themes
  var stringToSave = "";
  for(var x=0;x<slidenote.extensions.themes.length;x++){
        if(slidenote.extensions.themes[x].active){
          themes.push(slidenote.extensions.themes[x]); //collect active themes
          stringToSave+=slidenote.extensions.themes[x].classname+";";
        }
  }
  stringToSave+="$$";
  //stringToSave+="md-texteditor";
  stringToSave+=document.getElementById("editorchoice").value;
  stringToSave+="€€";
  var nightm = document.getElementById("nightmodetoggle").classList.contains("on");
  console.log("save nightmode:"+nightm);
  stringToSave+=nightm;
  stringToSave+="€$";

  for(var x=0;x<themes.length;x++){
	    var actConfigString = themes[x].saveConfigString();
	    if(actConfigString!=null){
		      stringToSave+="{["+themes[x].classname+"]}";
		        stringToSave+=actConfigString;
	    }
  }
  if(destination==="local"){
    this.localstorage.setItem("config",stringToSave);
    console.log("saved to local:"+stringToSave);
  }
  //return stringToSave;
  return stringToSave;
}
slidenoteGuardian.prototype.encrypt = async function(plaintext){
  console.log("encrypt plaintext:"+plaintext.substring(0,20));
    let plainTextUtf8 = new TextEncoder().encode(plaintext); //changing into UTF-8-Array
    let keyguardian = await this.createKey();
    if(keyguardian==null)return {encbuffer:null, iv:null};
    //this.iv = keyguardian.iv;
    let encbuffer = await crypto.subtle.encrypt(keyguardian.alg, keyguardian.key, plainTextUtf8);
    return {encbuffer: encbuffer, iv:keyguardian.iv};
    /*the job of encrypt is done - rest of code should be in save*/
}
slidenoteGuardian.prototype.decrypt = async function(buffer, iv){
  let pwtext = "as a matter of principle: everything you write is encrypted before we even store it on our server. please choose a password now. feel free to make one as simple or as complicated as you want. just don't forget it: there is no password recovery!";
  this.password = await this.passwordPrompt(pwtext, "decrypt");
  let keyguardian = await this.createKey(iv);
  console.log("decoding starts");
  let encstatus = document.getElementById("encstatus");
  try{
    this.plainTextBuffer = await this.crypto.subtle.decrypt(keyguardian.alg, keyguardian.key, buffer);
  } catch(e){
    console.log(e);
    console.log("decryption has failed!");
    this.password = null; //reset password as it has no meaning
    encstatus.src=slidenote.imagespath+"schloss-rot.png";
    encstatus.title = "failed to decrypt note - wrong password";
    return "decryption has failed";
  }
  encstatus.src=slidenote.imagespath+"schloss-gruen.png";
  encstatus.title = "encryption works as expected - your data is secure";
  console.log("decoding has ended");

  return new TextDecoder().decode(this.plainTextBuffer); //TODO: error-handling
}

slidenoteGuardian.prototype.encryptForExport = async function(plaintext, password){
  console.log("encrypt plaintext:"+plaintext.substring(0,20));
    let plainTextUtf8 = new TextEncoder().encode(plaintext); //changing into UTF-8-Array
    let pw =  password;
    if(pw===null || pw===undefined)pw = await this.passwordPrompt("please type in password for export", "export", true);
    let filename = document.getElementById("username").value;
    let keyguardian = await this.createKey(null,pw); //create new key with no iv
    if(keyguardian==null)return {encbuffer:null, iv:null};
    //this.iv = keyguardian.iv;
    let encbuffer = await crypto.subtle.encrypt(keyguardian.alg, keyguardian.key, plainTextUtf8);
    return {encbuffer: encbuffer, iv:keyguardian.iv, filename:filename};
    /*the job of encryptForExport is done - rest of code should be in saveNote*/
}
slidenoteGuardian.prototype.decryptImport = async function(buffer, iv){
  let pw = await this.passwordPrompt("please type in password of import", "decrypt",true);
  let keyguardian = await this.createKey(iv, pw);
  console.log("decoding starts");
  try{
    this.plainTextBuffer = await this.crypto.subtle.decrypt(keyguardian.alg, keyguardian.key, buffer);
  } catch(e){
    console.log(e);
    console.log("decryption has failed!");
    //this.password = null; //reset password as it has no meaning
    return "decryption has failed";
  }
  console.log("decoding has ended");
  return new TextDecoder().decode(this.plainTextBuffer); //TODO: error-handling
}

slidenoteGuardian.prototype.importFromEncryptedFile = async function(encBufferString){
  let encstring = encBufferString;
  console.log("import of enc-file"+encstring);
  //getting iv of string:
  let iv = new Uint8Array(this.ivlength); //create empty ivarray
  for(let i=0;i<this.ivlength;i++)iv[i]=encBufferString.charCodeAt(i)-255;
  encstring = encBufferString.substring(this.ivlength);//delete iv-chars from string
  let buffer = new Uint8Array(encstring.length);
  for(let i=0;i<encstring.length;i++)buffer[i]=encstring.charCodeAt(i)-255;
  //this.encTextBuffer = buffer.buffer; //changing to ArrayBuffer -- TODO:kann weg oder?
  let decText = await this.decryptImport(buffer.buffer, iv); //decrypt ArrayBuffer
  //console.log("decryption fail:"+this.decText);
  console.log("decryption succesfull?" + decText);
  //error-handling - try again:
  while(decText === "decryption has failed" && confirm("decryption failed. try it again?")){
      decText = await this.decryptImport(buffer.buffer, iv); //decrypt ArrayBuffer anew
  }
  if(decText === "decryption has failed")return; //password wrong, abort the load
  //decText is now the unencrypted MD-Code plus imagestring:
  let MDCodeEnd = decText.indexOf("\n||€€imagepart€€||\n");
  console.log("decryption of import succesfull");
  let decMD;
  if(MDCodeEnd===-1)decMD = decText; else decMD = decText.substring(0,MDCodeEnd);
  console.log(MDCodeEnd + "MDCODEEND");
  console.log("decMD:"+decMD);
  let decImageString;
  if(MDCodeEnd>-1)decImageString = decText.substring(MDCodeEnd+19);//getting rid of ||€€imagepart€€||
  console.log("imagestring"+decImageString);
  this.insertImport(decMD, decImageString);
}



//helper functions - for internal use only:
slidenoteGuardian.prototype.encBufferToString = function(encResult){
  let encTextBuffer = encResult.encbuffer;
  let iv = encResult.iv;
  //getting only displayable chars without control-chars:
  let utf8array = new Uint8Array(encTextBuffer); //changing into utf8-Array
  //console.log(utf8array);
  let utf8string = ""; //starting new string for utf8
  for(let i =0; i<utf8array.length;i++){
    utf8string+=String.fromCharCode(utf8array[i]+255); //fill string with save values
  }
  //converting iv to string with same method:
  let ivstring="";
  for(let i=0; i<iv.length;i++)ivstring+=String.fromCharCode(iv[i]+255);
  return ivstring+utf8string;//save iv in front of code
}

slidenoteGuardian.prototype.insertImport = async function(mdcode, imagestring){
  if(slidenote.textarea.value.length<=1){
    slidenote.textarea.value = mdcode;
  } else{
    let userchoice = await this.importPrompt(mdcode, imagestring);
    let selend = slidenote.textarea.selectionEnd;
    if(userchoice ==='import'){
      slidenote.textarea.value= slidenote.textarea.value.substring(0,slidenote.textarea.selectionStart)+
         mdcode + slidenote.textarea.value.substring(slidenote.textarea.selectionEnd);
      slidenote.textarea.selectionEnd = selend+mdcode.length;
    }else if(userchoice ==="replace"){
      slidenote.textarea.value=mdcode;
      slidenote.base64images.deleteAllImages(); //empty array
    } else if(userchoice ==="chart"){
      slidenote.textarea.value=slidenote.textarea.value.substring(0,selend)+
                "\n```chart\n"+mdcode+"\n```\n"+slidenote.textarea.value.substring(selend);
    } else if(userchoice ==="table"){
      slidenote.textarea.value=slidenote.textarea.value.substring(0,selend)+
                "\n```table\n"+mdcode+"\n```\n"+slidenote.textarea.value.substring(selend);
    } else{ //user canceled
      //return;
    }

  }
  //reset fileuploadfield to get it anew:
  document.getElementById("importfile").value=null;

  if(imagestring)slidenote.base64images.loadImageString(imagestring);
  slidenote.parseneu();
  slidenote.textarea.focus();

}

slidenoteGuardian.prototype.hash = async function(text){
  let textutf8 = new TextEncoder().encode(text);
  let hash = new Uint8Array(await this.crypto.subtle.digest('SHA-256', textutf8));
  let result = "";
  for(let i=0;i<hash.length;i++)result+=String.fromCharCode(hash[i]+255);
  return result;
}

slidenoteGuardian.prototype.createKey = async function(iv, passw){
  console.log("creating Key with iv"+iv);
  let password = passw;
  if(this.password == null && passw==null){
    //this.password = prompt("please type in your personal password");
    let pwtext = "as a matter of principle: everything you write is encrypted before we even store it on our server. please choose a password now. feel free to make one as simple or as complicated as you want. just don't forget it: there is no password recovery!";
    this.password = await this.passwordPrompt(pwtext);
  }
  if(this.password ==null && passw==null)return;
  if(passw==null)password = this.password;
  let pwUtf8 = new TextEncoder().encode(password);
  let passwordHash = await this.crypto.subtle.digest('SHA-256', pwUtf8);
  if(passw==null) this.passwordHash = passwordHash;
  let keyguardian = {};
  if(iv==null){
    keyguardian.iv = crypto.getRandomValues(new Uint8Array(this.ivlength));
  }else{
    keyguardian.iv = iv;
  }
  keyguardian.alg = { name: 'AES-GCM', iv: keyguardian.iv };
  keyguardian.key = await crypto.subtle.importKey('raw', passwordHash, keyguardian.alg, false, ['encrypt', 'decrypt']);
  console.log("key created");
  return keyguardian;
}

slidenoteGuardian.prototype.getCMSFields = function(){
  //get the cms-fields right. Test Style for slidenote.htm:
  //this.configArea = document.getElementById("configarea");
  this.cmsArea = document.getElementById("cmsarea");
  this.cmsImages = document.getElementById("cmsimages");
  this.cmsSlidenoteHash = document.getElementById("cmsslidenotehash");
  this.cmsImagesHash = document.getElementById("cmsimageshash");
  this.cmsConfig = document.getElementById("cmsconfig");


  //drupal7 with editablefields-module:
  let nodetitle = document.getElementById("page-title");
  if(nodetitle!=null)this.notetitle=nodetitle.innerHTML;
  let notename = "encslidenote";
  let imagename = "imagescontainer";
  let holdingforms = document.getElementsByClassName("editable-field");
  for(let x=0;x<holdingforms.length;x++){
    if(holdingforms[x].id.indexOf(notename)>1){
      this.cmsNoteSave = holdingforms[x].getElementsByClassName("form-submit")[0];
			this.cmsArea = holdingforms[x].getElementsByClassName("text-full")[0];
			this.cmsSlidenoteHash = holdingforms[x].getElementsByClassName("text-summary")[0];
    }
    if(holdingforms[x].id.indexOf(imagename)>1){
      this.cmsImagesSave = holdingforms[x].getElementsByClassName("form-submit")[0];
			this.cmsImages = holdingforms[x].getElementsByClassName("text-full")[0];
			this.cmsImagesHash = holdingforms[x].getElementsByClassName("text-summary")[0];
    }
  }
}

slidenoteGuardian.prototype.sendToCMS = function(target){
  //drupal7 with editablefields-module:
  if(target==="note" && this.cmsNoteSave)this.cmsNoteSave.dispatchEvent(new Event("click"));
  if(target==="images" && this.cmsImagesSave)this.cmsImagesSave.dispatchEvent(new Event("click"));
}

slidenoteGuardian.prototype.autoSaveToLocal = function(time){
  //TODO: performance-check. if saving costs too much it should save less
  if(slidenote.extensions.allThemesLoaded){
    this.saveNote("local");
    console.log("saved to local:"+time);
  }else{
    console.log("not saved - editor not ready yet");
  }
}

slidenoteGuardian.prototype.autoSaveToCMS = async function(){
  //check if you have to save:
  console.log("autosave to cms started");
  if(this.slidenote.textarea.value.length<1){
    //if empty dont save:
    setTimeout("slidenoteguardian.autoSaveToCMS()",30000);
    return;
  }
  let acthash = await this.hash(this.slidenote.textarea.value); //hash the actual slidenote
  //this.getCMSFields();//getting the fields right:
  let oldhash = this.restObject.notehash;//this.cmsSlidenoteHash.value; //oldhash
  if(oldhash != acthash){
    //acthash diffs from old saved hash in cms so we have to save:
    console.log("autosave oldhash:"+oldhash+"\nnew hash:"+acthash);
    this.saveNote("cms");
  }
  //check if cms-save is actually done yet (drupal7):
  //if(this.cmsNoteSave && this.cmsNoteSave.id != this.lastNoteFormId){
  //  this.lastNoteFormId = this.cmsNoteSave.id;
  //  console.log("autosave done - cms-form has new id");
  //}
  //check if config has changed:
  var localSavedConfig = this.localstorage.getItem("config");
  //if(localSavedConfig!=null && localSavedConfig != this.cmsConfig.value){
  //  this.cmsConfig.value = localSavedConfig;
  //}

  //repeats itself every 30 seconds, 2 minutes
  let autosavetime = 30000;//120000;
  setTimeout("slidenoteguardian.autoSaveToCMS()",autosavetime);
}

slidenoteGuardian.prototype.checkCloudStatus = async function(){
  console.log("checking cloud status");
  var timestrt = new Date();
  let acthash = await this.hash(this.slidenote.textarea.value);
  let oldhash = this.restObject.notehash;
  var savestatus = document.getElementById("savestatus");
  if(acthash != oldhash){
    savestatus.src=slidenote.imagespath+"buttons/cloud.png";
    savestatus.title="not in sync with cloud";
  }else{
    savestatus.src=slidenote.imagespath+"buttons/cloudsaved.png";
    savestatus.title="in sync with cloud";
  }
  console.log("checking cloud status. in sync:"+(acthash!=oldhash));
  var timeneeded = new Date() - timestrt;
  console.log("Timecheck: checking needs "+timeneeded+"MS")
}

slidenoteGuardian.prototype.passwordPrompt = function (text, method, newpassword){
  /*creates a password-prompt*/
  if(document.getElementById("slidenoteGuardianPasswortPrompt")!=null){
    console.log("second password-prompt");
    return null;
  }
  if(this.password!=null && method==="decrypt" && !newpassword){
    console.log("password allready set");
    return this.password;
  }

	var pwprompt = document.createElement("div"); //the prompt-container
	pwprompt.id= "slidenoteGuardianPasswortPrompt"; //id for css
  var pwpromptbox = document.getElementById("slidenoteGuardianPasswordPromptTemplate");
  if(pwpromptbox===null){
    console.log("no password template found"+pwpromptbox);
    pwpromptbox = document.createElement("div"); //inner promptbox
  	var pwtext = document.createElement("div"); //text to be displayed inside box
  	pwtext.innerHTML = text;
  	pwpromptbox.appendChild(pwtext);
    //password-box and retype-password-box
    var pwform = document.createElement("form");
    var emailfield = document.createElement("input");
    emailfield.id="email";
    emailfield.type="email";
    emailfield.value= this.slidenotetitle+"@slidenotes.io";
    //emailfield.style.display="none";
    //emailfield.style.height="1px";
    emailfield.autocomplete="username";
    pwform.appendChild(emailfield);
    var pwlabel = document.createElement("label");
    pwlabel.innerText="PASSWORD";
    pwform.appendChild(pwlabel);
  	var pwinput = document.createElement("input"); //password-box
  	pwinput.type="password";
    pwinput.id="password";
    pwinput.autocomplete="current-password";
  	pwform.appendChild(pwinput);
    pwpromptbox.appendChild(pwform);
    var pwchecklabel = document.createElement("label");
    pwchecklabel.innerText="RE-TYPE PASSWORD";
    pwpromptbox.appendChild(pwchecklabel);
    pwcheck = document.createElement("input");
    pwcheck.type="password";
    pwcheck.id="pwcheckfield";
    pwpromptbox.appendChild(pwcheck);

    //buttons
  	var pwokbutton = document.createElement("button");
  	pwokbutton.innerHTML = "ENCRYPT";
  	var pwcancelb = document.createElement("button");
  	pwcancelb.innerHTML = "cancel";
  	pwpromptbox.appendChild(pwcancelb);
  	pwpromptbox.appendChild(pwokbutton);

    var pwpromptaftertext = document.createElement("div");
    pwpromptaftertext.innerText = "we recommend using a password manager to keep up with the task of choosing and remembering safe passwords on the web.";
    pwpromptbox.appendChild(pwpromptaftertext);
  }else{
    console.log("template found: using template to comply with password-manager");
    var usernamefield = document.getElementById("username");
    var usernamelabel = document.getElementById("slidenoteGuardianPasswordPromptUsernameLabel");
    var pwinput = document.getElementById("password");
    var pwcheck = document.getElementById("pwcheckfield");
    var pwchecklabel = document.getElementById("slidenoteGuardianPasswordPromptRetypeLabel");
    var pwtext = document.getElementById("slidenoteGuardianPasswordPromptTemplatePreText");
    var pwokbutton = document.getElementById("slidenoteGuardianPasswordPromptEncrypt");
    var pwnotetitle = document.getElementById("slidenoteGuardianPasswordPromptNotetitle");
    pwtext.innerText = text;
    if(this.notetitle==="undefined")this.notetitle=this.localstorage.getItem("title");
    pwinput.value="";
    usernamefield.value = this.notetitle; //+"@slidenotes.io";
    if(pwnotetitle!=null)pwnotetitle.innerText = "Decrypting Slidenote \""+this.notetitle+"\"";
  }
  if(method==="decrypt"){
    pwokbutton.innerText="DECRYPT";
    pwchecklabel.style.display="none";
    pwcheck.style.display="none";
    pwcheck.value="";
    usernamefield.classList.add("hidden");
    usernamelabel.classList.add("hidden");
  }else if(method==="export") {
    pwokbutton.innerText="ENCRYPT";
    usernamefield.value=this.notetitle+".slidenote";
    usernamefield.classList.remove("hidden");
    usernamelabel.classList.remove("hidden");
    pwchecklabel.style.display="block";
    pwcheck.style.display="block";
  }else if(method==="exportCMS"){
    pwokbutton.innerText="ENCRYPT";
    usernamefield.value=this.notetitle;
    usernamefield.classList.remove("hidden");
    usernamelabel.classList.remove("hidden");
    pwchecklabel.style.display="block";
    pwcheck.style.display="block";
  }else {
    usernamefield.classList.add("hidden");
    usernamelabel.classList.add("hidden");
    pwokbutton.innerText="ENCRYPT";
    pwchecklabel.style.display="block";
    pwcheck.style.display="block";
    pwnotetitle.innerText="Set Password for Slidenote";
  }
  pwprompt.appendChild(pwpromptbox);
	document.body.appendChild(pwprompt); //make promptbox visible
	pwinput.focus(); //focus on pwbox to get direct input
  setTimeout("document.getElementById('password').focus()",500); //not the most elegant, but direct focus does not work sometimes - dont know why

	return new Promise(function(resolve, reject) {
	    pwprompt.addEventListener('click', function handleButtonClicks(e) {
	      if (e.target.tagName !== 'BUTTON') { return; }
	      pwprompt.removeEventListener('click', handleButtonClicks); //removes eventhandler on cancel or ok
	      if (e.target === pwokbutton) {
          if(pwinput.value===pwcheck.value||(pwcheck.style.display==="none" && pwcheck.value.length===0))resolve(pwinput.value); //return password
          else {
            return;
            //reject(new Error('Wrong retype'));
          }
	      } else {
	        reject(new Error('User canceled')); //return error
	      }
        document.getElementById("slidenoteGuardianPasswordPromptStore").appendChild(pwpromptbox);
		    document.body.removeChild(pwprompt); //let prompt disapear
	    });
    var handleenter= function handleEnter(e){
      if(pwinput.value===pwcheck.value){
        pwcheck.style.backgroundColor="green";
      }else{
        if(pwcheck.value.length>0 || pwcheck.style.display!="none")pwcheck.style.backgroundColor="red";else pwcheck.style.backgroundColor="white";
      }
  			if(e.keyCode == 13){
          if(pwinput.value===pwcheck.value||(pwcheck.value.length===0 && pwcheck.style.display==="none"))resolve(pwinput.value);
            else {
              return;
            //  alert("password and retype of password differs - please try again");
            //reject(new Error("Wrong retype"));
            }
          document.getElementById("slidenoteGuardianPasswordPromptStore").appendChild(pwpromptbox);
          if(pwprompt.parentElement === document.body)document.body.removeChild(pwprompt);
  			}else if(e.keyCode==27){
          document.getElementById("slidenoteGuardianPasswordPromptStore").appendChild(pwpromptbox);
  				document.body.removeChild(pwprompt);
  				reject(new Error("User cancelled"));
  			}
  		}
		pwinput.addEventListener('keyup',handleenter);
    pwcheck.addEventListener('keyup',handleenter);
	});
}

slidenoteGuardian.prototype.importPrompt = function(mdcode, imagestring){
  var promptwrapper = document.createElement("div");
  promptwrapper.id = "slidenoteGuardianImportPromptWrapper";
  var prompt = document.createElement("div"); //prompt-container
  prompt.id = "slidenoteGuardianImportPrompt";
  var mdcodeblock = document.createElement("div"); //md-code-container
  var imageblock; //block for preview-images
  let imageblocktitle;
  let mdcodeblocktitle = document.createElement("h1");
  mdcodeblocktitle.innerHTML = "Import MD-Code from File:";
  prompt.appendChild(mdcodeblocktitle);
  prompt.appendChild(mdcodeblock);
  if(imagestring){
    imageblock = document.createElement("div"); //block for preview-images
    imageblocktitle = document.createElement("h2");
    prompt.appendChild(imageblocktitle);
    prompt.appendChild(imageblock);
  }
  //buttons:
  var importbutton = document.createElement("button");
  var cancelbutton = document.createElement("button");
  var replacebutton = document.createElement("button");
  importbutton.innerHTML = "add to existing Code";
  cancelbutton.innerHTML = "cancel";
  replacebutton.innerHTML = "replace existing code";
  var buttonwrapper = document.createElement("div");
  buttonwrapper.appendChild(cancelbutton);
  buttonwrapper.appendChild(replacebutton);
  buttonwrapper.appendChild(importbutton);
  prompt.appendChild(buttonwrapper);

  mdcodeblock.innerHTML = mdcode;
  mdcodeblock.id = "slidenoteGuardianCodePreview";

  if(imagestring){

    var imagepuffer = imagestring.split("<<<");
    imagepuffer.pop(); //delete last element as it has no meaning
    imageblocktitle.innerHTML = "Images from slidenote to import: (Total "+imagepuffer.length+" images)";
    for(let i=0;i<imagepuffer.length;i++){
      let imgdata = imagepuffer[i].split(">>>");
      //previewimages.push({name:imgdata[0],src:imgdata[1]});
      let imgtitle = document.createElement("h3");
      imgtitle.innerHTML = imgdata[0];
      let img = new Image();
      img.src = imgdata[1];
      imageblock.appendChild(imgtitle);
      imageblock.appendChild(img);
    }
  }
  let nombre=document.getElementById("importfile").files[0];
  if(nombre){
    nombre=nombre.name;
  }else {
    nombre = document.getElementById("importfile").dropfilename;
    if(!nombre)nombre="nothing";else document.getElementById("importfile").dropfilename=null;
  };
  let chartbutton = document.createElement("button");
  let tablebutton = document.createElement("button");
  let insidedatatag = slidenote.parser.CarretOnElement(slidenote.textarea.selectionEnd);
  if(insidedatatag) insidedatatag = (insidedatatag.dataobject!=undefined); else insidedatatag=false;
  if(nombre.substring(nombre.length-3)==="csv" && !insidedatatag){
    //buttons to insert: chart, table:
    chartbutton.innerText="add as new chart";
    tablebutton.innerText = "add as new table";
    buttonwrapper.appendChild(chartbutton);
    buttonwrapper.appendChild(tablebutton);

  }
  promptwrapper.appendChild(prompt);
  document.body.appendChild(promptwrapper); //make prompt visible
  return new Promise(function(resolve,reject){
    prompt.addEventListener('click', function handleButtonClicks(e){
      if(e.target.tagName!== 'BUTTON'){return;}
      prompt.removeEventListener('click',handleButtonClicks);
      if (e.target === importbutton){
        resolve('import');
      } else if(e.target === replacebutton){
        resolve('replace');
      } else if(e.target === chartbutton){
        resolve('chart');
      } else if(e.target === tablebutton){
        resolve('table');
      } else{
        reject(new Error('User aborted Import'));
      }
      document.body.removeChild(promptwrapper);

    });
  });

}
