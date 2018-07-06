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
  this.configs; //not used yet
  this.password; //storing password for later use so user has not to retype it all the time he saves (automagicaly)
  this.key = null; //always start with empty key
  this.crypto = window.crypto; //make crypto available
  this.decText; //last decrypted Text - we could get rid of it
  this.encBufferString; //last encrypted String from cms or local storage
  this.encImageString; //last encrypted String from cms or local storage with base64-images
  this.iv; //the initialisation-vector to use
  this.ivlength = 12; //the length of the initialisation vector used for encryption
  this.localstorage = window.localStorage; //set local storage
}

slidenoteGuardian.prototype.loadNote = async function(destination){
    //loads Note from cmsArea or from local destination
    //destination is "cms" or "local"
    if(destination==="cms"){
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
    this.encTextBuffer = buffer.buffer; //changing to ArrayBuffer
    this.decText = await this.decrypt(buffer.buffer); //decrypt ArrayBuffer
    this.slidenote.textarea.value = this.decText; //putting result into textarea

    //cleaning up:
    this.slidenote.textarea.focus(); //focus on textarea for further editing
    this.slidenote.parseneu(); //let wysiwyg-editor notice change

}

slidenoteGuardian.prototype.saveNote = async function(destination){
  //saves Note to cmsArea -> CMS or to local destination
  //destination is cms or local - will be encrypted nevertheless
  let encTextBuffer = await this.encrypt(slidenote.textarea.value);
  //getting only displayable chars without control-chars:
  let utf8array = new Uint8Array(encTextBuffer); //changing into utf8-Array
  //console.log(utf8array);
  let utf8string = ""; //starting new string for utf8
  for(let i =0; i<utf8array.length;i++){
    utf8string+=String.fromCharCode(utf8array[i]+255); //fill string with save values
  }
  //converting iv to string with same method:
  let ivstring="";
  for(let i=0; i<this.iv.length;i++)ivstring+=String.fromCharCode(this.iv[i]+255);
  let result = ivstring+utf8string;//save iv in front of code
  if(destination ==="cms"){
    this.cmsArea.value= result; //putting it in textarea of cms
    //if(imagestring.length>0)this.cmsImages.value = ivstring+imagestring;
    //TODO: images?
    //TODO: sending result to CMS
  }else if(destination==="local"){
    //TODO: testing max-size of local storage
    this.localstorage.setItem('cryptnote',result); //saving it to local storage
    //TODO: save images localy
  }


}

slidenoteGuardian.prototype.loadImages = async function(destination){
  //image-part:
  if(this.encImageString.length>0){
    //getting iv out of the string
    let imgiv = new Uint8Array(this.ivlength);
    for(let iiv=0;iiv<this.ivlength;iiv++)imgiv[i]=this.encImageString.charCodeAt(iiv)-255;
    this.imgiv = imgiv;
    this.encImageString = this.encImageString.substring(this.ivlength); //delete iv-chars
    let imgbuffer = new Uint8Array(this.encImageString.length);
    for(let im=0;im<imgbuffer.length;im++)this.encImageString.charCodeAt(im)-255;
    //this.encImageBuffer = imgbuffer.buffer;
    let decImageString = await this.decrypt(imgbuffer.buffer); //decrypt imgbuffer
    this.slidenote.base64images.loadImageString(decImageString); //send it to slidenote

  }
};

slidenoteGuardian.prototype.saveImages = async function(destination){
  //now the images:
  let imagestring="";
  if(this.slidenote.base64images.base64images.length>0){ //muss diese abfrage überhaupt hier sein?
    let imageBuffer = await this.encrypt(this.slidenote.base64images.allImagesAsString());
    let imageutf8 = new Uint8Array(imageBuffer);
    for(let i=0;i<imageutf8.length;i++)imagestring+=String.fromCharCode(imageutf8[i]+255);
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
    let plainTextUtf8 = new TextEncoder().encode(plaintext); //changing into UTF-8-Array
    await this.createKey();
    return await crypto.subtle.encrypt(this.alg, this.key, plainTextUtf8);
    /*the job of encrypt is done - rest of code should be in save*/
}
slidenoteGuardian.prototype.decrypt = async function(buffer){
  await this.createKey(this.iv);
  console.log("decoding starts");
  try{
    this.plainTextBuffer = await this.crypto.subtle.decrypt(this.alg, this.key, buffer);
  } catch(e){
    console.log(e);
  }
  console.log("decoding has ended");
  return new TextDecoder().decode(this.plainTextBuffer);
}

//helper functions - for internal use only:

slidenoteGuardian.prototype.createKey = async function(iv){
  console.log("creating Key");
  if(this.password == null)this.password = prompt("please type in your personal password");
  let pwUtf8 = new TextEncoder().encode(this.password);
  let passwordHash = await this.crypto.subtle.digest('SHA-256', pwUtf8);

  if(iv==null){
    this.iv = crypto.getRandomValues(new Uint8Array(this.ivlength));
  }else{
    this.iv = iv;
  }
  this.alg = { name: 'AES-GCM', iv: this.iv };
  this.key = await crypto.subtle.importKey('raw', passwordHash, this.alg, false, ['encrypt', 'decrypt']);
  console.log("key created");
}
