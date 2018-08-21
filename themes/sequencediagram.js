var newtheme = new Theme("sequencediagram");
newtheme.description = "Generates UML sequence diagrams from simple text \n https://bramp.github.io/js-sequence-diagrams/ \n by Andrew Brampton 2012-2017";
//loading js-libraries:
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/sequencediagram/snap.svg-min.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);
jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/sequencediagram/underscore-min.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);
jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/sequencediagram/webfontloader.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);
jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/sequencediagram/sequence-diagram-min.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);
//loading aditional css-file:
var cssfile = document.createElement("link");
cssfile.setAttribute("rel", "stylesheet");
cssfile.setAttribute("type", "text/css");
cssfile.setAttribute("href", "themes/sequencediagram/sequence-diagram-min.css");
document.getElementsByTagName("head")[0].appendChild(cssfile);

newtheme.addEditorbutton('Flowdiagram',"||flow||","||flow||");
slidenote.datatypes.push({type:"flow",mdcode:false,theme:newtheme});

newtheme.styleThemeSpecials = function(){
  var datadivs = slidenote.presentationdiv.getElementsByTagName("data");
  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    var dataobject = slidenote.parser.dataobjects[datax];
    if(dataobject.type==="flow"){
      var rawdata = dataobject.raw.join("\n");
      var datadiv = datadivs[datax];
      var svgdiv = document.createElement("div");
      svgdiv.id = "sequencediagram"+datax;
      datadiv.appendChild(svgdiv);
      console.log("sequencediagram:");
      console.log(rawdata);
      console.log(datadivs[datax]);
      var d = Diagram.parse(rawdata);
      var options = {theme: 'hand'};
      d.drawSVG(svgdiv, options);
    }
  }
}

slidenote.addTheme(newtheme);
