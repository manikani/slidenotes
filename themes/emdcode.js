var newtheme = new Theme("emdcode", 1);
newtheme.styleThemeSpecials = function(){
	console.log("emd-code styleThemeSpecials wird ausgeführt");
	this.cycleThroughHtmlElements("code");
}
newtheme.specialStylePerElement = function(texta){
	console.log("emd-code plugin: zeichen werden ummantelt");
	var text = "";
	text += texta;
	var zeichen = new Array("-----","![","[","](",")","#","*","~~","∗","˜˜");
	var count=0;
	for(var x=0;x<zeichen.length;x++){
		var schl=0;
		while(text.indexOf(zeichen[x],schl)>-1){
			var treffer = text.indexOf(zeichen[x],schl);
			console.log("zeichen "+zeichen[x]+" gefunden an "+treffer);
			text = text.substring(0,treffer)+'<span class="emdcodesymbol">'+text.substring(treffer,treffer+zeichen[x].length)
					+ '</span>' + text.substring(treffer+zeichen[x].length);
			schl =treffer+28+zeichen[x].length;
			count++;
		}
	}
	//alle zeichen sind jetzt ummantelt
	var lines = new Array();
	var aktpos = 0;
	while(text.indexOf("<br>",aktpos)>-1){
		if(aktpos<text.indexOf("<br>",aktpos))
				lines.push(text.substring(aktpos,text.indexOf("<br>",aktpos)));
		aktpos = text.indexOf("<br>",aktpos)+4;
	}
	lines.push(text.substring(aktpos,text.length));
	var temptext = '<ol start="0">\n';
	for(var x=0;x<lines.length;x++)temptext +="<li>"+lines[x]+"</li>\n";
	temptext += "</ol>\n";
	return temptext;
}
//Übergabe des Themes an den Pagegenerator:
presentation.addTheme(newtheme);
