var newtheme = new Theme("extraoptions");
newtheme.description = "Show more Options";
newtheme.options=new Array();
newtheme.options[0]= {name:"Sidebar",value:true};
newtheme.options[1]= {name:"Editorbuttons", value:true};
newtheme.options[1].onchange = function(){
  //if(this.value)document.getElementById("texteditorbuttons").style.display="unset";
  //  else document.getElementById("texteditorbuttons").style.display = "none";
}


newtheme.addGlobalOption("checkbox","Sidebar","Sidebar",true);
newtheme.addGlobalOption("checkbox","Editorbuttons","Show Editorbuttons",true);

newtheme.changeGlobalOption = function(optionnr, value){
  this.options[optionnr].value = value;
  this.globaloptions[optionnr].values=value;
  if(this.options[optionnr].onchange)this.options[optionnr].onchange();
}

newtheme.saveConfigString = function(){
  var stringToSave="";
  stringToSave+=this.options[0].value+";"+this.options[1].value;
  return stringToSave;
}

newtheme.loadConfigString = function(datastring){
  var data = datastring.split(";");
  for(var x=0;x<data.length;x++)this.changeGlobalOption(x,(data[x]==="true"));
}


slidenote.addTheme(newtheme);
