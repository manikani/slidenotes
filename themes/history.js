var newtheme = new Theme("history");

newtheme.backList = new Array();
newtheme.forwardList = new Array();

newtheme.init = function(){
  //memorise first back-stadium:
/*  this.backList.push({value:slidenote.textarea.value,
  selectionStart : slidenote.textarea.selectionStart,
  selectionEnd : slidenote.textarea.selectionEnd,
  scrollTop : slidenote.textarea.scrollTop});
*/  //initialise buttons:
  this.active = true;
  var buttondiv = document.createElement("div");
  var backb = document.createElement("button");
  var forwb = document.createElement("button");
  backb.onclick = function(){slidenote.presentation.getThemeByName("history").goBack()};
  forwb.onclick = function(){slidenote.presentation.getThemeByName("history").goForward()};
  backb.id="historyBackButton";
  forwb.id="historyForwardButton";
  backb.classList.add("historyButton");
  forwb.classList.add("historyButton");
  backb.title="undo last change";
  forwb.title="redo last change";
  backb.innerText="⤺";
  forwb.innerText="⤻";
  this.backButton = backb;
  this.forwardButton = forwb;
  buttondiv.appendChild(backb);
  buttondiv.appendChild(forwb);
  var texteb = document.getElementById("texteditorbuttons");
  texteb.insertBefore(buttondiv, texteb.firstElementChild);
}

newtheme.styleThemeMDCodeEditor = function(){
  //save history:
  console.log("check history");
  var newCode = slidenote.textarea.value;
  var newSelectionStart = slidenote.textarea.selectionStart;
  var newSelectionEnd = slidenote.textarea.selectionEnd;
  var newScrollTop = slidenote.textarea.scrollTop;
  if(this.backList.length===0||
    (this.backList[0] && this.backList[0].value!=newCode)){
    console.log("save history");
    this.backList.unshift({
      value:newCode,
      selectionStart:newSelectionStart,
      selectionEnd:newSelectionEnd,
      scrollTop:newScrollTop
    });
    this.forwardList = new Array();//on new entry in backList empty forwardList
  }
  if(this.backList.length>10)this.backList.pop();
  if(this.backList.length>1 && this.backButton.classList.contains("disabled"))this.backButton.classList.remove("disabled");
  if(this.forwardList.length>0)this.forwardButton.classList.remove("disabled");else this.forwardButton.classList.add("disabled");
}

newtheme.setTo = function(statusObject){
  slidenote.textarea.value = statusObject.value;
  slidenote.textarea.selectionStart = statusObject.selectionStart;
  slidenote.textarea.selectionEnd = statusObject.selectionEnd;
  slidenote.textarea.scrollTop = statusObject.scrollTop;
  slidenote.textarea.focus();
  slidenote.parseneu();
}

newtheme.goBack = function(){
  if(this.backList.length>1){
    var oldCode = this.backList.shift();
    this.forwardList.unshift(oldCode);
    this.setTo(this.backList[0]);
    //this.forwardButton.classList.remove("disabled");
    if(this.backList.length===1)this.backButton.classList.add("disabled");
  }
}
newtheme.goForward = function(){
  if(this.forwardList.length>0){
    var oldCode = this.forwardList.shift();
    this.backList.unshift(oldCode);
    //slidenote.textarea.value = this.forwardList.shift();
    this.setTo(oldCode);
    //if(this.forwardList.length===0)this.forwardButton.classList.add("disabled");
  }
}


slidenote.addTheme(newtheme);
