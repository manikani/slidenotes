var slidenoteSpeaker = new Theme("speaker");
slidenote.extensions.speaker = slidenoteSpeaker;
slidenoteSpeaker.active=true;

slidenoteSpeaker.say = function(m) {
  console.log("speaker says:"+m);
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  // msg.voice = voices[10];
  //msg.voiceURI = "native";
  msg.volume = 1;
  //msg.rate = 1;
  //msg.pitch = 0.8;
  msg.text = m;
  msg.lang = 'en-US';
  speechSynthesis.speak(msg);
}

slidenoteSpeaker.readLine = function(linenr){
  var nr = linenr;
  if(nr===null || nr===undefined)nr = slidenote.parser.lineAtPosition(slidenote.textarea.selectionEnd);
  console.log("speaker: readline "+nr);
  var linetext = slidenote.parser.map.origLines[nr];
  console.log("speaker: linetext"+linetext);
  var cursorpos = slidenote.textarea.selectionEnd;
  var lst = slidenote.parser.map.linestart[nr];
  var lend = slidenote.parser.map.lineend[nr];
  console.log("cursorpos:"+cursorpos+"lst:"+lst+"lend"+lend);
  if(lst <= cursorpos &&lend>=cursorpos){
      console.log("insert cursor to speaker text");
      var cpos = cursorpos - slidenote.parser.map.linestart[nr];
      linetext = linetext.substring(0,cpos)+" Carret "+linetext.substring(cpos);
    }
  linetext = "line "+nr+": "+linetext;
  this.say(linetext);
}

slidenoteSpeaker.readPage = function(pagenr){
  var nr = pagenr;
  if(!nr>0)nr=slidenote.parser.map.pageAtPosition(slidenote.textarea.selectionEnd);
  console.log("speaker:read Page "+nr);
  if(nr<slidenote.parser.map.pagesCode.length)
        var pageText = "Slide Number "+nr+":";
        pageText+=slidenote.parser.map.pagesCode[nr];
        this.say(pageText);
}

slidenoteSpeaker.readElement = function(mdelement){
  var elem = mdelement;
  if(elem===null || elem===undefined)elem = slidenote.parser.CarretOnElement();
  console.log("speaker: speak Element:");console.log(elem);
  var textToSpeak = "";
  if(elem===null || elem===undefined){
    textToSpeak="No Element found";
    return;
  }
  if(elem.dataobject){
    textToSpeak = "Sectionblock Type "+elem.dataobject.type;
    textToSpeak+= ". Head " + elem.dataobject.head.substring(4+elem.dataobject.type.length);
  }else{
    //other objects like title
  }
  this.say(textToSpeak);
}
slidenoteSpeaker.keyPressed = function(event){
  var key = event.key;
  console.log(event);
  if(event.ctrlKey){
    var stopEvent = false;
    if(event.key==="l"){this.readLine();stopEvent=true;}
    if(event.key==="e"){this.readElement();stopEvent=true;}
    if(event.key==="p"){this.readPage();stopEvent=true;}

    if(stopEvent){
      event.preventDefault();
      return false;
    }
  }

}

slidenoteSpeaker.init = function(){
  //set default keystrokes:
  slidenote.textarea.addEventListener("keydown",function(e){
    slidenoteSpeaker.keyPressed(e);
  });
}


slidenote.addTheme(slidenoteSpeaker);
