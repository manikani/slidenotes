/* slidenoteplayer:
* gets a nearly ready-to-use presentation and gives it a slideshow-effect
*
*
*/

function slidenotePlayer(){
  this.actpage = 0;
  this.presentation;
  this.encpresentation;
  this.decpresentation;
  this.ivlength = 12;
  this.pw;
  this.pages;
  this.controlbuttons = {
    area:null,
    backward:null,
    forward:null,
    firstpage:null,
    lastpage:null,
    gotopage:null,
    pagenumber:null,
    pagenumbertotal:null
  }
  this.comments = {
	container:null,
	list: new Array(),
	perpage: new Array()
  };
}

var slidenoteplayer = new slidenotePlayer();

slidenoteplayer.init = async function(){
  this.actpage = 0;
  this.presentation = document.getElementById("slidenotepresentation");

  if(this.presentation.classList.contains("encrypted")){
      this.encpresentation = this.presentation.innerHTML;
      this.decpresentation = await this.decryptPresentation();
      this.presentation.innerHTML = this.decpresentation;
  }
  this.pages = this.presentation.getElementsByClassName("ppage");
  this.initButtons();
  this.initKeystrokes();
  //this.initComments();
  this.gotoPage(this.actpage);
  this.hideLoadScreen();
  this.commentform = document.getElementById("comment-form");
  //this.commentform.onsubmit = function(){return confirm("wirklich absenden?")};//slidenoteguardian.encryptComment()};
  this.commentblock = document.getElementById("comments");
  this.initComments();
}

slidenoteplayer.initButtons = function(){
  this.controlbuttons.area = document.getElementById("controlarea");
  var cbs = this.controlbuttons.area.getElementsByClassName("controlbutton");
  //lazy stile, maybe better to write it by hand with ids?
  this.controlbuttons.backward = cbs[0];
  this.controlbuttons.forward = cbs[1];
  this.controlbuttons.firstpage = cbs[2];
  this.controlbuttons.lastpage = cbs[3];
  this.controlbuttons.gotopage = document.getElementById("controlgotobutton");
  this.controlbuttons.pagenumber = document.getElementById("controlpagenumber");
  this.controlbuttons.pagenumbertotal = document.getElementById("controlpagenumbertotal");
  this.controlbuttons.commentbutton = document.getElementById("controlcomment");
  this.controlbuttons.commentcount = document.getElementById("controlcommentcount");
  this.controlbuttons.commenttotal = document.getElementById("controlcommenttotal");

  //add values to gotopage:
  for(var x=1;x<=this.pages.length;x++){
    var opt = document.createElement("option");
    opt.value = x-1;
    opt.innerHTML = "Go to Slide #"+x;
    this.controlbuttons.gotopage.appendChild(opt);
  }

  //add functioncalls to buttons:
  this.controlbuttons.backward.onclick = function(e){slidenoteplayer.lastPage()};
  this.controlbuttons.forward.onclick = function(e){slidenoteplayer.nextPage()};
  this.controlbuttons.firstpage.onclick = function(e){slidenoteplayer.gotoPage(0)};
  this.controlbuttons.lastpage.onclick=function(e){slidenoteplayer.gotoPage(slidenoteplayer.pages.length-1)};
  this.controlbuttons.gotopage.onchange = function(e){slidenoteplayer.gotoPage(this.value)};

  this.controlbuttons.pagenumber.innerHTML = "1";
  this.controlbuttons.pagenumbertotal.innerHTML = this.pages.length;

  this.controlbuttons.commentcount.innerHTML = this.commentCount();
  this.controlbuttons.commenttotal.innerHTML = document.getElementsByClassName("comment").length;
  this.controlbuttons.commentbutton.onclick = function(e){slidenoteplayer.commentClick(e)};

  this.formSaveButton = document.getElementById("edit-submit");
  this.commentSaveButton = document.createElement("button");
  this.commentSaveButton.innerText = "Encrypt & Save";
  this.commentSaveButton.onclick = function(){
	var test = slidenoteguardian.encryptComment();
	//if(test)this.formSaveButton.click();
  };
  this.commentSaveButton.classList.add("comment-form");
  document.getElementById("comments").appendChild(this.commentSaveButton);

  this.commentAddCommentButton = document.createElement("button");
  this.commentAddCommentButton.innerText = "+";
  this.commentAddCommentButton.id="commentAddButton";
  this.commentAddCommentButton.onclick = function(){
	slidenoteplayer.showCommentForm();
  }
  this.commentblock = document.getElementById("comments");
  var commenttitle = this.commentblock.firstElementChild;
  commenttitle.appendChild(this.commentAddCommentButton);

  this.commentShowAllButton = document.createElement("button");
  this.commentShowAllButton.innerText = "show all";
  this.commentShowAllButton.onclick = function(){slidenoteplayer.showAllComments();};
  commenttitle.appendChild(this.commentShowAllButton);  
}

slidenoteplayer.initKeystrokes = function(){
  this.lastpressednrkey="";
  this.controlbuttons.area.onkeyup = function(event){
    var key=""+event.key;
    if(key==="ArrowRight" || key===" ")slidenoteplayer.nextPage();
    if(key==="ArrowLeft")slidenoteplayer.lastPage();
    if("0123456789".indexOf(key)>-1){
      slidenoteplayer.lastpressednrkey+=key;
    }
    if(key==="Enter" && slidenoteplayer.lastpressednrkey.length>0){
      slidenoteplayer.lastpressednrkey--;
      console.log("lastnrkey:"+slidenoteplayer.lastpressednrkey);
      slidenoteplayer.gotoPage(slidenoteplayer.lastpressednrkey);
      slidenoteplayer.lastpressednrkey="";
    }
  }
  this.controlbuttons.area.tabIndex=1;
  this.controlbuttons.area.focus();
}

slidenoteplayer.gotoPage = function (pagenumber){
  var pn = pagenumber*1;
  var activepages = this.presentation.querySelectorAll(".ppage.active");
  for(var x=activepages.length-1;x>=0;x--)activepages[x].classList.remove("active");
  if(pn<0)pn=0;
  if(pn>=this.pages.length)pn=this.pages.length-1;
  this.pages[pn].classList.add("active");
  this.actpage = pn;
  pn++;
  console.log(pn +" actpage:" +this.actpage);
  this.controlbuttons.pagenumber.innerHTML = pn;
  this.controlbuttons.commentcount.innerHTML = this.commentCount(pn);
  if(this.commentblock === undefined)this.commentblock = document.getElementById("comments");
  if(this.commentblock.classList.contains("show"))this.showCommentsOfPage(pn);else this.hideAllComments();
  this.setCommentFormPagenr();
}

slidenoteplayer.nextPage = function(){
  this.actpage++;
  if(this.actpage>=this.pages.length)this.actpage = this.pages.length-1;
  this.gotoPage(this.actpage);
}

slidenoteplayer.lastPage = function(){
  this.actpage--;
  if(this.actpage<0)this.actpage=0;
  this.gotoPage(this.actpage);
}

slidenoteplayer.decryptPresentation = async function(){

}
slidenoteplayer.hideLoadScreen = function(){

}

slidenoteplayer.initComments = function(){
	/*var comments = this.comments;
	comments.container = document.getElementById("comments");
	comments.list = comments.container.getElementsByClassName("comment");
	for(var x=0;x<comments.list.length;x++){
		var actcom = comments.list[x];
		var cp = actcom.getAttribute('data-pagenr')*1;
		if(comments.perpage[cp]===undefined)comments.perpage[cp]=new Array();
		comments.perpage[cp].push(actcom);
	}
	*/	
  this.setCommentFormPagenr();
  this.decryptAllComments();
  this.gotoPage(this.actpage);

}

slidenoteplayer.decryptAllComments = async function(){
	var clist = document.getElementsByClassName("enccontent");
    var containerlist = document.getElementsByClassName("comment");
	for(var x=0;x<clist.length;x++){
		console.log("decrypting "+clist[x].innerText);
		clist[x].innerText = await slidenoteguardian.decryptText(clist[x].innerText);
		if(clist[x].innerText ==="decryption has failed")containerlist[x].classList.add("failedencryption");
	}
	var remlist = document.getElementsByClassName("failedencryption");
	for(var x=remlist.length-1;x>=0;x--)remlist[x].parentElement.removeChild(remlist[x]);
	document.getElementById("controlcommenttotal").innerText=containerlist.length;
	
}

slidenoteplayer.commentClick = function(e){
  var cblock = document.getElementById("comments");
  if(cblock.classList.contains("show")){
	this.hideCommentBlock();
  }else if(this.controlbuttons.commentcount.innerHTML!="0"){
    this.showCommentBlock();
	this.showCommentsOfPage(this.actpage+1);
  } else {
	this.showCommentBlock();
	this.hideAllComments();
    this.showCommentForm();
  }
}
slidenoteplayer.showCommentBlock = function(){
	var cblock = document.getElementById("comments");
	cblock.classList.add("show");
}
slidenoteplayer.hideCommentBlock = function(){
	var cblock = document.getElementById("comments");
	cblock.classList.remove("show");
}

slidenoteplayer.showCommentsOfPage = function(pagenr){
	this.hideAllComments();
	var clist = document.getElementsByClassName("pagenr"+pagenr);
	for(var x=0;x<clist.length;x++)clist[x].classList.add("show");
}

slidenoteplayer.showAllComments = function(){
	var clist = document.getElementsByClassName("comment");
	for(var x=0;x<clist.length;x++)clist[x].classList.add("show");
}

slidenoteplayer.hideAllComments = function(){
	var clist = document.getElementsByClassName("comment");
	for(var x=0;x<clist.length;x++)clist[x].classList.remove("show");	
}

slidenoteplayer.commentCount = function(pagenr){
	var pn = pagenr;
	if(pn===null)pn=this.actpage+1;
	var clist = document.getElementsByClassName("pagenr"+pn);
	return clist.length;
}

slidenoteplayer.setCommentFormPagenr = function(){
 var pagenrfield = document.getElementById("edit-field-pagenr-und-0-value");
 pagenrfield.value = this.actpage+1;
}

slidenoteplayer.showCommentForm = function(){
  var commentform = document.getElementById("comment-form");
  this.setCommentFormPagenr();
  commentform.classList.add("show");
 //var commentbody = document.getElementById("edit-comment-body-und-0-value");
  var commentformtitle = document.querySelector(".title.comment-form");
  commentformtitle.classList.add("show");
  this.commentSaveButton.classList.add("show");
}


