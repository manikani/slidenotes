var newtheme = new Theme("transition");
newtheme.description = "Transition: Adds CSS-based Transition-Effekts to Slideshow";
/*Define Options*/
newtheme.options = new Array(
                  {name:"Opacity", transition:"transitionopacity", value:false},
                  {name:"Scroll to Left", transition:"transitionscrollleft", value:false}
                );

//Add to global Options:
newtheme.addGlobalOption("checkbox","Opacity", "Opacity", false);
newtheme.addGlobalOption("checkbox","Scroll to Left", "Scroll to Left", false);

newtheme.changeGlobalOption = function(optionnr, value){
  this.options[optionnr].value = value;
  this.globaloptions[optionnr].values=value;
  console.log("option geändert");
  console.log(this.options);
}

/*Hook into styling-process, append classes */
newtheme.styleThemeSpecials = function(){
  var pages = document.getElementsByClassName("ppage");
  console.log("transition pages:");
  console.log(pages);
  console.log(this.options);
  for(var x=0;x<this.options.length;x++){
    for(var px=0;px<pages.length;px++){
      if(this.options[x].value)pages[px].classList.add(this.options[x].transition);
        else pages[px].classList.remove(this.options[x].transition);
    }
  }
}

//end of theme-declaration - append to slidenote
slidenote.addTheme(newtheme);
