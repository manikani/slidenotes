var newtheme = new Theme("highlight", 1);
//Style-Auswahl implementieren
var styles = new Array(
"agate","androidstudio","arduino-light","arta","ascetic","atelier-cave-dark",
"atelier-cave-light","atelier-dune-dark","atelier-dune-light","atelier-estuary-dark",
"atelier-estuary-light","atelier-forest-dark","atelier-forest-light","atelier-heath-dark",
"atelier-heath-light","atelier-lakeside-dark","atelier-lakeside-light",
"atelier-plateau-dark","atelier-plateau-light","atelier-savanna-dark",
"atelier-savanna-light","atelier-seaside-dark","atelier-seaside-light",
"atelier-sulphurpool-dark","atelier-sulphurpool-light","atom-one-dark",
"atom-one-light","brown-paper","codepen-embed","color-brewer","darcula",
"dark","darkula","default","docco","dracula","far","foundation","github",
"github-gist","googlecode","grayscale","gruvbox-dark","gruvbox-light",
"hopscotch","hybrid","idea","ir-black","kimbie.dark","kimbie.light","magula",
"mono-blue","monokai","monokai-sublime","obsidian","ocean","paraiso-dark",
"paraiso-light","pojoaque","purebasic","qtcreator_dark","qtcreator_light",
"railscasts","rainbow","routeros","school-book","solarized-dark","solarized-light",
"sunburst","tomorrow","tomorrow-night-blue","tomorrow-night-bright","tomorrow-night",
"tomorrow-night-eighties","vs2015","vs","xcode","xt256","zenburn");
newtheme.cssarray = styles;

newtheme.addDesignOption("select", "theme of hljs:", styles, styles, 0);

newtheme.changeDesignOption = function(optionnr, value){
	var cssfile = document.createElement("link");
	cssfile.setAttribute("rel", "stylesheet");
	cssfile.setAttribute("type", "text/css");
	cssfile.setAttribute("href", "themes/highlight/styles/"+value+".css");
	document.getElementsByTagName("head")[0].appendChild(cssfile);
	//console.log("changedesignoption:"+optionnr+":"+value);
	var seldesign = 0;
	for(var selx=0;selx<this.designoptions[0].values.length;selx++){
		if(this.designoptions[0].values[selx] === value)seldesign = selx;
	}
	this.designoptions[optionnr].selected = seldesign;
	this.seldesign = seldesign;
	console.log("designoption changed hljs"+optionnr+"->"+value);

}


newtheme.saveConfigString = function(){
	return this.seldesign;
}
newtheme.loadConfigString = function(data){
	this.changeDesignOption(0,this.cssarray[data]);
}

/*dateien nachladen:*/
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/highlight/highlight.pack.js");
var cssfile = document.createElement("link");
cssfile.setAttribute("rel", "stylesheet");
cssfile.setAttribute("type", "text/css");
cssfile.setAttribute("href", "themes/highlight/styles/default.css");
document.getElementsByTagName("head")[0].appendChild(jsfile);
document.getElementsByTagName("head")[0].appendChild(cssfile);

newtheme.description = "Automagicaly highlightning Codes in Codeblock using hljs. For more Information "+
												"see http://highlightjs.org";
newtheme.styleThemeSpecials = function(){
	var codeblocks = document.getElementsByTagName("code");
	for(var x=0;x<codeblocks.length;x++){
		var block = codeblocks[x];
		hljs.highlightBlock(block);
	}
}
newtheme.active = true;
newtheme.highlighteditor = function(){
	var codes = document.getElementsByClassName("code");
	for(var cx=0;cx<codes.length;cx++){
		if(codes[cx].innerHTML.length>5){
			hljs.highlightBlock(codes[cx]);
			codes[cx].classList.remove("hljs");
		}
	}
}

slidenote.afterCodeEditorrender = newtheme.highlighteditor;

presentation.addTheme(newtheme);
