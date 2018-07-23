/* load and save module
* handles the interaction with all what has to do with loading and saving
* saves slidenotes localy
* saves slidenotes in cms
* encrypts slidenote before saving
* loads slidenotes from local destination
* loads slidenotes from cms
* decrypts slidenote after loading
* saves config to cms/local destination
* loads config from cms/local destination
*/

function slidenoteGuardian(slidenote){
  this.slidenote = slidenote;
  this.configArea = document.getElementById("configarea");
  this.cmsArea = document.getElementById("cmsarea");
  this.cmsImages = document.getElementById("cmsimages");
  this.cmsSlidenoteHash = document.getElementById("cmsslidenotehash");
  this.cmsImagesHash = document.getElementById("cmsimageshash");
  this.cmsNoteSave;
  this.cmsImagesSave;
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
  //this.lastTimeActive = new Date().getTime(); //last time user was active - needed for Timeout before saving
  //can we start the init here? why not?
  this.init();
}

slidenoteGuardian.prototype.init = function(){
  //init will be called once the slidenote has been loaded from cms
  this.getCMSFields();
  if(this.localstorage.getItem("title")===this.notetitle){
    if(confirm("We found a Version of this Slidenote in your local Storage. Do you want to load it?")){
      this.loadNote("local");
    } else {
      //this.loadNote("cms");
    }
  }
  setTimeout("slidenoteguardian.autoSaveToCMS()",3000);
}

slidenoteGuardian.prototype.loadNote = async function(destination){
    //loads Note from cmsArea or from local destination
    //destination is "cms" or "local"
    if(destination==="cms"){
      //first thing to do is get the fields right:
      this.getCMSFields();
      this.encBufferString = this.cmsArea.value;
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

    this.slidenote.textarea.value = this.decText; //putting result into textarea
    //loading images:
    let imgstring;
    if(destination==="cms")imgstring = this.cmsImages.value;
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
  //saves Note to cmsArea -> CMS or to local destination
  //destination is cms or local - will be encrypted nevertheless
  let slidenotetext = this.slidenote.textarea.value;
  let encResult = await this.encrypt(slidenote.textarea.value);
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
  //save Images:
  let encimgstring="";
  if(this.slidenote.base64images.notempty){
    if(destination ==="cms"){
      //first get the fields right:
      this.getCMSFields();
      //slidenote has images - check if already saved:
      let newimghash = await this.hash(this.slidenote.base64images.allImagesAsString());
      if(this.cmsImagesHash.value != newimghash){
        console.log("save images with hash:"+newimghash);
        encimgstring = await this.encryptImages(); //encrypt imagestring
        this.cmsImagesHash.value = newimghash; //send new hash to cms
      } else{
        console.log("images did not change:"+newimghash);
      }
    }else if(destination==="local"){
      //saving images to localStorage - TODO: do we want to check if already saved?
      encimgstring = await this.encryptImages();
    }
  }
  if(destination ==="cms"){
    //first get the fields right:
    this.getCMSFields();
    this.cmsSlidenoteHash.value = await this.hash(slidenotetext); //putting hash into cms
    this.cmsArea.value= result; //putting it in textarea of cms
    //if(imagestring.length>0)this.cmsImages.value = ivstring+imagestring;
    //TODO: images?
    if(encimgstring!=""){
      this.cmsImages.value=encimgstring;
      this.sendToCMS("images");
    }
    //TODO: sending result to CMS
    this.sendToCMS("note");
  }else if(destination==="local"){
    //TODO: testing max-size of local storage
    this.localstorage.setItem('cryptnote',result); //saving it to local storage
    this.localstorage.setItem('cryptimagestring',encimgstring);
    this.localstorage.setItem('title',this.notetitle);
    //TODO: save images localy
  }


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
}

slidenoteGuardian.prototype.saveConfig = async function(destination){
  //saves configs to local destination or to cmsarea -> CMS
  //destination is cms or local


}
slidenoteGuardian.prototype.encrypt = async function(plaintext){
  console.log("encrypt plaintext:"+plaintext);
    let plainTextUtf8 = new TextEncoder().encode(plaintext); //changing into UTF-8-Array
    let keyguardian = await this.createKey();
    //this.iv = keyguardian.iv;
    let encbuffer = await crypto.subtle.encrypt(keyguardian.alg, keyguardian.key, plainTextUtf8);
    return {encbuffer: encbuffer, iv:keyguardian.iv};
    /*the job of encrypt is done - rest of code should be in save*/
}
slidenoteGuardian.prototype.decrypt = async function(buffer, iv){
  let keyguardian = await this.createKey(iv);
  console.log("decoding starts");
  try{
    this.plainTextBuffer = await this.crypto.subtle.decrypt(keyguardian.alg, keyguardian.key, buffer);
  } catch(e){
    console.log(e);
    console.log("decryption has failed!");
    this.password = null; //reset password as it has no meaning
    return "decryption has failed";
  }
  console.log("decoding has ended");
  return new TextDecoder().decode(this.plainTextBuffer); //TODO: error-handling
}

//helper functions - for internal use only:

slidenoteGuardian.prototype.hash = async function(text){
  let textutf8 = new TextEncoder().encode(text);
  let hash = new Uint8Array(await this.crypto.subtle.digest('SHA-256', textutf8));
  let result = "";
  for(let i=0;i<hash.length;i++)result+=String.fromCharCode(hash[i]+255);
  return result;
}

slidenoteGuardian.prototype.createKey = async function(iv){
  console.log("creating Key");
  if(this.password == null){
    //this.password = prompt("please type in your personal password");
    this.password = await this.passwordPrompt("please type in your personal password");
  }
  let pwUtf8 = new TextEncoder().encode(this.password);
  this.passwordHash = await this.crypto.subtle.digest('SHA-256', pwUtf8);
  let passwordHash = this.passwordHash;
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
  this.configArea = document.getElementById("configarea");
  this.cmsArea = document.getElementById("cmsarea");
  this.cmsImages = document.getElementById("cmsimages");
  this.cmsSlidenoteHash = document.getElementById("cmsslidenotehash");
  this.cmsImagesHash = document.getElementById("cmsimageshash");

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
  this.saveNote("local");
  console.log("saved to local:"+time);
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
  this.getCMSFields();//getting the fields right:
  let oldhash = this.cmsSlidenoteHash.value; //oldhash
  if(oldhash != acthash){
    //acthash diffs from old saved hash in cms so we have to save:
    console.log("autosave oldhash:"+oldhash+"\nnew hash:"+acthash);
    this.saveNote("cms");
  }
  //check if cms-save is actually done yet (drupal7):
  if(this.cmsNoteSave && this.cmsNoteSave.id != this.lastNoteFormId){
    this.lastNoteFormId = this.cmsNoteSave.id;
    console.log("autosave done - cms-form has new id");
  }

  //repeats itself every 30 seconds, 2 minutes
  let autosavetime = 30000;//120000;
  setTimeout("slidenoteguardian.autoSaveToCMS()",autosavetime);
}

slidenoteGuardian.prototype.passwordPrompt = function (text){
  /*creates a password-prompt*/
	var pwprompt = document.createElement("div"); //the prompt-container
	pwprompt.id= "slidenoteGuardianPasswortPrompt"; //id for css
  var pwpromptbox = document.createElement("div"); //inner promptbox
  pwprompt.appendChild(pwpromptbox);
	var pwtext = document.createElement("div"); //text to be displayed inside box
	pwtext.innerHTML = text;
	pwpromptbox.appendChild(pwtext);
	var pwinput = document.createElement("input"); //password-box
	pwinput.type="password";
	pwpromptbox.appendChild(pwinput);
	var pwokbutton = document.createElement("button");
	pwokbutton.innerHTML = "ok";
	var pwcancelb = document.createElement("button");
	pwcancelb.innerHTML = "cancel";
	pwpromptbox.appendChild(pwcancelb);
	pwpromptbox.appendChild(pwokbutton);
	document.body.appendChild(pwprompt); //make promptbox visible
	pwinput.focus(); //focus on pwbox to get direct input

	return new Promise(function(resolve, reject) {
	    pwprompt.addEventListener('click', function handleButtonClicks(e) {
	      if (e.target.tagName !== 'BUTTON') { return; }
	      pwprompt.removeEventListener('click', handleButtonClicks); //removes eventhandler on cancel or ok
	      if (e.target === pwokbutton) {
	        resolve(pwinput.value); //return password
	      } else {
	        reject(new Error('User cancelled')); //return error
	      }
		    document.body.removeChild(pwprompt); //let prompt disapear
	    });
		pwinput.addEventListener('keyup',function handleEnter(e){
			if(e.keyCode == 13){
				resolve(pwinput.value);
				document.body.removeChild(pwprompt);
			}else if(e.keyCode==27){
				document.body.removeChild(pwprompt);
				reject(new Error("User cancelled"));
			}
		});
	});
}
