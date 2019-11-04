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
	if(optionnr===0){
		//if(this.highlightstylecssfile!=undefined)this.highlightstylecssfile.parentNode.removeChild(this.highlightcssfile);
		this.highlightstylecssfile = slidenote.appendFile("css","highlight/styles/"+value+".css");
		console.log("changedesignoption:"+optionnr+":"+value);
		var seldesign = 0;
		for(var selx=0;selx<this.designoptions[0].values.length;selx++){
			if(this.designoptions[0].values[selx] === value)seldesign = selx;
		}
		this.designoptions[optionnr].selected = seldesign;
		this.seldesign = seldesign;
		console.log("designoption changed hljs"+optionnr+"->"+value);
	}else if(optionnr===1){
		this.showLineNumbers = value;
	}
}


newtheme.saveConfigString = function(){
	return this.seldesign+"\t"+this.highlightintexteditor;
}
newtheme.loadConfigString = function(data){
	var dataar = data.split("\t");
	this.changeDesignOption(0,this.cssarray[dataar[0]]);
	if(dataar[1]==="true")this.highlightintexteditor=true;else this.highlightintexteditor=false;
	this.changeGlobalOption(0,this.highlightintexteditor);
}

/*dateien nachladen:
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/highlight/highlight.pack.js");
var cssfile = document.createElement("link");
cssfile.setAttribute("rel", "stylesheet");
cssfile.setAttribute("type", "text/css");
cssfile.setAttribute("href", "themes/highlight/styles/default.css");
document.getElementsByTagName("head")[0].appendChild(jsfile);
document.getElementsByTagName("head")[0].appendChild(cssfile);
*/
newtheme.loadingFiles = new Array();
newtheme.loadingFiles.push(slidenote.appendFile("script","highlight/highlight.pack.js"));
slidenote.appendFile("css","highlight/styles/default.css");
//slidenote.appendFile("script", "highlight/highlightjs-line-numbers.js");

newtheme.description = "Automagicaly highlightning Codes in Codeblock using hljs. For more Information "+
												"see http://highlightjs.org";
newtheme.styleThemeSpecials = function(){
	var codeblocks = document.getElementsByClassName("codeblock");
	var codeheads = new Array();
	for(var x=0;x<slidenote.parser.map.codeblocks.length;x++)codeheads.push(slidenote.parser.map.codeblocks[x].head);

	for(var x=0;x<codeblocks.length;x++){
		var block = codeblocks[x];
		console.log("highlightlines:"+block.innerHTML);
		if(block.innerHTML.substring(0,1)==="\n")block.innerHTML=block.innerHTML.substring(1);
		//hljs.lineNumbersBlock(block);
		var options;
		if(codeheads[x] && codeheads[x].indexOf(this.metablockSymbol)>-1){
			options = this.parseStyledBlockOptions(block);
		}else options = new slidenotecodeblockoptions();
		console.log(options);
		this.options = options;
		this.findHighlightLines(block);
		hljs.highlightBlock(block);
		this.highlightLines(block);
		var buildlines = (this.options.linehighlight!=null) || (this.options.linenumbering==="on" || this.options.linenumbering==="true");
		if(buildlines){
			//this.buildLines(block);
		}
		if(this.options.linenumbering === "on" ||
				this.options.linenumbering === "true")this.buildLines(block);
	}
}
newtheme.active = true;
slidenote.datatypes.elementOfType("code").theme = newtheme;

newtheme.highlighteditor = function(){
	var codes = document.getElementsByClassName("code");
	for(var cx=0;cx<codes.length;cx++){
		if(codes[cx].classList.contains("backgroundline"))
		if(codes[cx].innerHTML.length>5){
			hljs.highlightBlock(codes[cx]);
			codes[cx].classList.remove("hljs");
		}
	}
}

newtheme.findHighlightLines = function(block){
	this.findHighlightInline(block);
	var text = block.innerHTML;
	console.log("find highlightlines in:\n"+text+
							"\n linemarker:"+this.options.speciallinemarker + "eol");
	var lines = text.split("\n");
	var foundlines = new Array();
	for(var x=0;x<lines.length;x++){
		console.log("linestart:"+lines[x].substring(0,this.options.speciallinemarker.length));
		if(lines[x].substring(0,this.options.speciallinemarker.length) === this.options.speciallinemarker){
				foundlines.push(x+1);
				lines[x]=lines[x].substring(this.options.speciallinemarker.length);
		}
	}
	if(this.options.linehighlight===null)this.options.linehighlight = foundlines.toString();
	else this.options.linehighlight += ","+foundlines.toString();
	console.log("found highlightlines:"+foundlines.toString());
	block.innerHTML = lines.join("\n");
}

newtheme.findHighlightInline = function(block){
	var text = block.innerHTML;
	console.log("find highlighted Inline");
	var lines = text.split("\n");
	var foundlines = new Array();
	var stm = this.options.specialstartmarker;
	var endm = this.options.specialendmarker;
	var startreplace = "o͈˒˔˒˔˒";
	var endreplace = "o͈˓˔˓˔˓";
	var lengthdiff = startreplace.length + endreplace.length - stm.length - endm.length;
	for(var x=0;x<lines.length;x++){
		var actl = lines[x];
		var spos = actl.indexOf(stm);
		var epos = actl.indexOf(endm);
		var foundparts = undefined;
		while(spos>-1 && epos>-1 && spos<epos){
			//foundparts.push({start:spos,end:epos});
			foundparts = {startreplace:startreplace,endreplace:endreplace};
			actl = actl.substring(0,spos)+
								startreplace +
								actl.substring(spos+stm.length,epos)+
								endreplace+
								actl.substring(epos+endm.length);
			spos = actl.indexOf(stm,epos+1+lengthdiff);
			epos = actl.indexOf(endm,epos+1+lengthdiff);
		}
		lines[x]=actl;
		foundlines[x]=foundparts;
	}
	this.options.inlineHighlights = foundlines;
	block.innerHTML = lines.join("\n");
}

newtheme.highlightLines = function(block){
	var text = block.innerHTML;
	console.log("start highlightlines with:"+text);
	if(this.options === undefined)this.options = new slidenotecodeblockoptions();
	//var linemarker = "\n"+this.options.speciallinemarker;
	//this.speciallinemarker = linemarker;
	block.classList.remove("specialline");
	/*while(text.indexOf(linemarker)>-1 && confirm("linemarker: |"+linemarker+"|\n"+text)){
		var pos = text.indexOf(linemarker);
		posend = text.indexOf("\n", pos+2);
		text = text.substring(0,pos)+'\n<span class="specialline">' +
					 text.substring(pos+linemarker.length,posend)+
					 '</span>'+text.substring(posend);
		block.classList.add("specialline");
	}*/
	var textarr = text.split("\n");
	var lastel = textarr.pop();
	if(lastel.length>0)textarr.push(lastel);
	var markerlnr = this.options.linesToHighlight();
	var specialLinesFound = false;
	for(var x=0;x<textarr.length;x++){
		if(markerlnr.includes(x+1)){
			specialLinesFound = true;
			textarr[x]='<span class="specialline">'+textarr[x]+"</span>";
		}else{
			if(this.options.inlineHighlights[x]!=undefined){
				specialLinesFound = true;
				var actlinechanges = this.options.inlineHighlights[x];
				while(textarr[x].indexOf(actlinechanges.startreplace)>-1)
					textarr[x] = textarr[x].replace(actlinechanges.startreplace, '</span><span class="specialinline">');
				while(textarr[x].indexOf(actlinechanges.endreplace)>-1)
					textarr[x] = textarr[x].replace(actlinechanges.endreplace, '</span><span class="codeline">');
			}
			textarr[x]='<span class="codeline">'+textarr[x]+"</span>";
		}
	}
	text = textarr.join("\n");
	block.innerHTML = text;
	if(specialLinesFound)block.classList.add("specialline");
	console.log("end with:"+text);
	return text;
}

function slidenotecodeblockoptions(){
	/*defines codeblock options defaults*/
	this.linehighlight = null; //string with kind-of-array "1,3-5,7"
	this.linenumbering = "on"; //could be on, true, off, false
	this.linenumberingstart = 1;
	this.language = "";	 //programming language - default is let hljs choose
	this.speciallinemarker = "§§";
	this.specialstartmarker = "§a";
	this.specialendmarker = "§e";

	this.showLineNumbers = function(){
		return (this.linenumbering === "on"|| this.linenumbering ==="true");
	}

	this.linesToHighlight = function(){
		var linearr = new Array();
		if(this.linehighlight===null)return linearr;
		var tmparr = this.linehighlight.split(",");
		for(var x=0;x<tmparr.length;x++){
			if(tmparr[x].indexOf("-")>-1){
				var tmp = tmparr[x].split("-");
				var start = 1*tmp[0];
				var end = 1*tmp[1];
				if(start>0&&end>0){
					for(start;start<=end;start++){
						linearr.push(start);
					}
				}
			}else{
				var linenr = tmparr[x] * 1;
				if(linenr>0)linearr.push(linenr);
			}
		}
		return linearr;
	}
}
newtheme.options = new slidenotecodeblockoptions();
newtheme.metablockSymbol = "options";//"styled";
newtheme.hasInsertMenu = true;

newtheme.insertMenuArea = function(dataobject){
	var result = document.createElement("div");
	result.classList.add("codeinsertmenu");
	console.log("start codeinsertmenü");
	console.log(this.options);
	for(var key in this.options)if(this.options.hasOwnProperty(key) && typeof this.options[key] !="function"){
		console.log("key:"+key);
		var button = document.createElement("button");
		button.innerText = key;
		button.addEventListener("click", function(e){
			var theme = slidenote.extensions.getThemeByName("highlight");
			var key = this.innerText;
			var keyvalue = theme.options[key];
			console.log("codeinsertmenu key "+key + ":"+keyvalue);
			var celement = slidenote.parser.CarretOnElement();
			if(celement.tag==="codeende")celement = slidenote.parser.CarretOnElement(slidenote.parser.map.linestart[celement.line-1]);
			var codeblockstart = slidenote.parser.map.linestart[celement.line+1];
			var codeblockend = slidenote.parser.map.linestart[celement.endline];
			var metablockend = slidenote.textarea.value.indexOf("\n---\n",codeblockstart);
			if(metablockend<0 || metablockend>codeblockend)	metablockend = false;
			var metablockhead = (celement.mdcode.indexOf(theme.metablockSymbol)>-1);
			if(key==="linehighlight")keyvalue="1,2-3,4";
			var insertText = key + "="+keyvalue+"\n";
			var insertPos = codeblockstart;
			var foundkey = slidenote.textarea.value.indexOf("\n"+key,codeblockstart-1);
			console.log("codeinsertmenu all parsed:"+
									"\nfoundkey:"+foundkey+
									"\nmetablockend:"+metablockend+
									"\nmetablockhead:"+metablockhead+
									"\ncodeblockstart:"+codeblockstart
									);
			if(metablockend && metablockhead &&
				 foundkey >= codeblockstart-1 && foundkey < metablockend){
				//element is already there. move there to edit:
				foundkey++;
				var eol = slidenote.textarea.value.indexOf("\n",foundkey);
				var sym = slidenote.textarea.value.indexOf("=", foundkey)+1;
				if(sym>eol)sym=eol;
				slidenote.textarea.selectionEnd=sym;
				slidenote.textarea.selectionStart=sym;
				slidenote.textarea.focus();
				console.log("element found, edit on it");
				return;
			}
			if(metablockhead && metablockend){
				//element was not found but metablockend has:
				insertPos = metablockend+1; //+1 because of \n so its after the \n and before the ---
			}else{
				insertText+="---\n";
			}
			var tx = slidenote.textarea;
			tx.value = tx.value.substring(0,insertPos)+insertText+tx.value.substring(insertPos);
			var cursorpos = insertPos + key.length+1;
			if(!metablockhead){
				var newhead = "code:"+theme.metablockSymbol+"\n";
				//magic number 3 is the length of either "+++" or "´´´" so we dont delete it but keep it as it is to not mix up
				tx.value = tx.value.substring(0,celement.posinall+3)+newhead+tx.value.substring(codeblockstart);
				cursorpos+= newhead.length - (codeblockstart-(celement.posinall+3));
			}
			slidenote.textarea.selectionEnd = cursorpos;
			slidenote.textarea.selectionStart = cursorpos;
			slidenote.textarea.focus();
			slidenote.parseneu();
		});
		result.appendChild(button);
	}
	console.log("codeinsertmenü");
	console.log(result);
	return result;
}

newtheme.parseStyledBlockOptions = function(block){
	var text = block.innerHTML;
	if(text.indexOf("\n---\n")===-1)return new slidenotecodeblockoptions();
	text = text.substring(0,text.indexOf("\n---\n"));
	var optionlines = text.split("\n");
	var options = new slidenotecodeblockoptions();
	for(var x=0;x<optionlines.length;x++){
		console.log(optionlines[x]);
		/*var oline = optionlines[x].split("=");
		if(oline.length>2){
			var tmp = oline.shift();
			var tmp2 = oline.join("=");
			oline[0]=tmp;
			oline[1]=tmp2;
		}
		console.log(oline);
		if(oline.length<2)continue;
		*/
		var oline = new Array();
		var sign = "=";
		var poseq = optionlines[x].indexOf("=");
		var signpos = poseq;
		var pospoint = optionlines[x].indexOf(":");
		if(poseq + pospoint <0)continue; //no valid pos found
		if(pospoint>0 &&
			(pospoint<poseq || poseq===-1)){
				sign=":";
				signpos = pospoint;
			}
		oline[0]=optionlines[x].substring(0,signpos);
		oline[1]=optionlines[x].substring(signpos+1);
		var optionname = oline[0].replace(/\s/g,"").toLowerCase();
		var optiondata = oline[1].replace(" ","");
		console.log(optionname+":"+optiondata);
		//check if default exist: if so, overwrite it. else do nothing
		//if(options[optionname]===undefined)continue;
		options[optionname]=optiondata;

	}
	block.innerHTML = block.innerHTML.substring(text.length+5);
	return options;
}

newtheme.highlightLinesInEditor = function(){
	var codes = slidenote.texteditorerrorlayer.getElementsByClassName("code");
	var standardlinemarker = "§§";
	var linemarker = standardlinemarker;
	var map = slidenote.parser.map;
	//var linestomark = this.options.linesToHighlight();
	for(var x=0;x<codes.length;x++){
		if(map.codeblocklines[x].line === map.codeblocklines[x].codeblock.line){
			if(map.codeblocklines[x].codeblock.head.indexOf(this.metablockSymbol)>-1){
				map.codeblocklines[x].codeblock.hasmetablock = true;
			}
			linemarker = standardlinemarker;
			codes[x].classList.add("codehead");

		}
		if(map.codeblocklines[x].codeblock.hasmetablock){
			if(codes[x].innerHTML === "---"){
				map.codeblocklines[x].codeblock.metablockendline = x;
				codes[x].innerHTML = '--- &nbsp;&nbsp;&nbsp;&nbsp;<span class="pagenr">&uarr;options&uarr; &darr;code&darr;</span>'
				codes[x].classList.add("metadataseparator");
			}
			if(map.codeblocklines[x].codeblock.metablockendline ===undefined){
				codes[x].classList.add("metadata");
			}
			if(map.codeblocklines[x].codeblock.metablockendline ===undefined &&
				map.codeblocklines[x].origtext.indexOf("linemarker")>-1){
					var eqpos = map.codeblocklines[x].origtext.indexOf("=");
					var popos = map.codeblocklines[x].origtext.indexOf(":");
					if(popos>0&&popos<eqpos)eqpos=popos;
					if(eqpos>0){
						linemarker = map.codeblocklines[x].origtext.substring(eqpos+1).replace(" ","");
						map.codeblocklines[x].codeblock.linemarker = linemarker;
					}
			}
		}
		console.log("highlight line: "+codes[x].innerHTML);
		if(map.codeblocklines[x].origtext.substring(0,linemarker.length)===linemarker){
			var ct = codes[x].innerHTML;
			ct = '<span class="specialline">'+ct+"</span>";
			codes[x].innerHTML = ct;
			//console.log("highlightning line: yes"+ct);
		}//else console.log("highlight line: not.")
	}
}

newtheme.styleThemeMDCodeEditor = function(){
	this.highlightLinesInEditor();
}

newtheme.buildLines = function(block){
	var text = block.innerHTML;
	var markedlines = this.options.linesToHighlight();
	if(markedlines.length>0)block.classList.add("specialline");
	console.log(text);
	//text = text.replace('\n', '<ol start="'+this.options.linenumberingstart+'"><li>');
	var firstli = "<li>";
	if(markedlines.includes(1))firstli='<li class="specialline">';
	if(this.options.linenumbering === "on"|| this.options.linenumbering==="true"){
		text = '<ol start="'+this.options.linenumberingstart+'">'+firstli+text;
	}else{
		text = '<ul>'+firstli+text;
	}

	console.log(text);
	var linenr = 1;
	while(text.indexOf("\n")>-1){
		linenr++;
		let litag = "<li>";
		if(markedlines.includes(linenr))litag = '<li class="specialline">'
		text = text.replace(/\n/, "</li>"+litag);
	}
	//text = text.replace(/\n/g, "</li><li>");
	console.log(text);
	text+="</li></ol>";
	//text = text.replace(/\n/g,"");
	block.innerHTML = text;
	return text;
}

slidenote.afterCodeEditorrender = newtheme.highlighteditor;

newtheme.highlightintexteditor = true;
newtheme.addGlobalOption("checkbox", "Highlightning of Codeblocks in Texteditor (experimental)", "hltexteditor",true);
newtheme.addGlobalOption("checkbox", "show line numbers", "show line numbers",true, true)	;
newtheme.showLineNumbers = true;
newtheme.changeGlobalOption = function(optionnr, value){
		if(optionnr===0)this.highlightintexteditor = value;
		if(optionnr===1)this.showLineNumbers = value;
		this.globaloptions[optionnr].values=value;
		if(this.highlightintexteditor){
			slidenote.afterCodeEditorrender = this.highlighteditor;
		} else{
			slidenote.afterCodeEditorrender = null;
		}
}

slidenote.addTheme(newtheme);
