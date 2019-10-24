var newtheme = new Theme("klatex");
newtheme.description = "Latex-Support with Katex";
/*
//loading js-library:
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/katex/katex.min.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);
//loading aditional css-file:
var cssfile = document.createElement("link");
cssfile.setAttribute("rel", "stylesheet");
cssfile.setAttribute("type", "text/css");
cssfile.setAttribute("href", "themes/katex/katex.min.css");
document.getElementsByTagName("head")[0].appendChild(cssfile);
*/
newtheme.loadingFiles = new Array();
newtheme.loadingFiles.push(slidenote.appendFile("script","katex/katex.js"));
slidenote.appendFile("css","katex/katex.min.css");
newtheme.addEditorbutton('<img src="'+slidenote.imagespath+'buttons/latex.svg" title="LaTeX">',"+++latex","+++"); //TODO: add function to body?
slidenote.datatypes.push({type:"latex",mdcode:false,theme:newtheme});

newtheme.styleThemeSpecials = function(){
  var datadivs = slidenote.presentationdiv.getElementsByTagName("section");
  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    var dataobject = slidenote.parser.dataobjects[datax];
    if(dataobject.type==="latex"){
      //var latexspan = new Element("span");
      var rawdata = dataobject.raw.join("\n");
      var datadiv = datadivs[datax];
      datadiv.innerHTML="";
      datadiv.classList.add("klatex");
      var newdiv = document.createElement("div");
      console.log("katex:"+rawdata+"<<eol");
      console.log(rawdata);
      console.log(datadivs[datax]);
      katex.render(rawdata, newdiv, {throwOnError:false});
      //katex.render(rawdata,newdiv);
      datadiv.appendChild(newdiv);
    }
  }
}

slidenote.addTheme(newtheme);
