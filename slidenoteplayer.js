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
}

var slidenoteplayer = new slidenotePlayer();

slidenotePlayer.prototype.init = async function(){
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
  this.gotoPage(this.actpage);
  this.hideLoadScreen();
}

slidenotePlayer.prototype.initButtons = function(){
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
}

slidenotePlayer.prototype.initKeystrokes = function(){
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

slidenotePlayer.prototype.gotoPage = function (pagenumber){
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
}

slidenotePlayer.prototype.nextPage = function(){
  this.actpage++;
  if(this.actpage>=this.pages.length)this.actpage = this.pages.length-1;
  this.gotoPage(this.actpage);
}

slidenotePlayer.prototype.lastPage = function(){
  this.actpage--;
  if(this.actpage<0)this.actpage=0;
  this.gotoPage(this.actpage);
}

slidenotePlayer.prototype.decryptPresentation = async function(){

}
slidenotePlayer.prototype.hideLoadScreen = function(){

}
