var newtheme = new Theme("switchparseelements");
newtheme.description = "Let User select and deselect * and _ as Parseelements";

newtheme.standardparseelemente = new Array();
newtheme.standardparseelemente.push(new parseobjekt('***','***',"<b><i>","</i></b>","bolditalic"));
newtheme.standardparseelemente.push(new parseobjekt('**','**',"<b>","</b>","bold"));
newtheme.standardparseelemente.push(new parseobjekt('__','__',"<b>","</b>","bold"));
newtheme.standardparseelemente.push(new parseobjekt('*','*',"<i>","</i>","italic"));
newtheme.standardparseelemente.push(new parseobjekt('_','_',"<i>","</i>","italic"));
newtheme.standardparseelemente.push(new parseobjekt("~~","~~","<strike>","</strike>","strike"));

newtheme.options = new Array(
  {name: "*", value:true},
  {name: "_", value:true}
);
newtheme.addGlobalOption("checkbox", "*", "*", true);
newtheme.addGlobalOption("checkbox", "_","_",true);

newtheme.changeGlobalOption = function(optionnr, value){
  console.log("switch parseelements"+optionnr+":"+value)
  this.options[optionnr].value = value;
  console.log(this.options[optionnr].value);
  if(this.options[0].value &&this.options[1].value){
    console.log("switch back to normal");
  slidenote.parseelemente = this.standardparseelemente;
}else if(this.options[1].value){
    console.log("no stars");
    //no stars:
    var parseelemente = new Array();
    parseelemente.push(new parseobjekt('__','__',"<b>","</b>","bold"));
    parseelemente.push(new parseobjekt('_','_',"<i>","</i>","italic"));
    parseelemente.push(new parseobjekt("~~","~~","<strike>","</strike>","strike"));
    slidenote.parseelemente = parseelemente;
  } else{
    console.log("no underline");
    //no underline:
    var parseelemente = new Array();
    parseelemente.push(this.standardparselemenete[0]);
    parseelemente.push(this.standardparseelemente[1]);
    parseelemente.push(this.standardparseelemente[3]);
    parseelemente.push(this.standardparseelemente[5]);
  }
}
newtheme.saveConfigString = function(){
  var stringToSave = "";
  stringToSave+=this.options[0].value+";"+this.options[1].value;
  return stringToSave;
}
newtheme.loadConfigString = function(datastring){
  var data = datastring.split(";");
  for(var x=0;x<data.length;x++)this.changeGlobalOption(x,(data[x]==="true"));
}

slidenote.addTheme(newtheme);
