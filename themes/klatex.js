var newtheme = new Theme("klatex");
newtheme.description = "Latex-Support with Katex";
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

newtheme.addEditorbutton('Latex',"```latex","```"); //TODO: add function to body?
slidenote.datatypes.push({type:"latex",mdcode:false,theme:newtheme});

newtheme.styleThemeSpecials = function(){
  var datadivs = slidenote.presentationdiv.getElementsByTagName("data");
  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    var dataobject = slidenote.parser.dataobjects[datax];
    if(dataobject.type==="latex"){
      //var latexspan = new Element("span");
      var rawdata = dataobject.raw.join("\n");
      var datadiv = datadivs[datax];
      console.log("katex:");
      console.log(rawdata);
      console.log(datadivs[datax]);
      katex.render(rawdata, datadiv, {throwOnError:false});
    }
  }
}

slidenote.addTheme(newtheme);
