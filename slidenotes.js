//was, wenn ich alles komplett neu denke und ein mapping-objekt erstelle:
/*
var mapobject = {	//link:
	line:0,			//0
	pos:12,
	posinall:12,
	html:"<b>",		//"<a href='url'>text</a>"
	mdcode:"*",		//[text](url)
	typ:"start",	// "link"
	//brotherelement: end,
	wystextveraenderung:1,
	linktext: null,	//"text"
	linkurl: null	//"url"

};
*/

/* mapper object to track mapping between md-code/source-code and wysiwyg-html-code
*/

function mapping (parser) {
	 this.insertedhtmlelements = new Array();
	 this.insertedhtmlinline = new Array();
	 this.lastline=0;
	 this.linepos = [0];
	 this.angezeigtezeichen = new Array();

	var origtext = parser.sourcecode;
	var lastpos=origtext.indexOf("\n");
	while(lastpos>-1){
		this.linepos.push(lastpos);
		this.lastline++;
		lastpos=origtext.indexOf("\n",lastpos+1);
	}
	//lastline steht jetzt auf der letzten linie


	for(var x=0;x<=this.lastline;x++)this.insertedhtmlinline[x]=new Array();
};

mapping.prototype.init = function(){
//standard-sachen die gemacht werden müssen:
	if(this.insertedhtmelements!=null)this.insertedhtmlelements.sort(function(a,b){return a.posinall - b.posinall})

}

mapping.prototype.addElement = function(element2){
	var element=element2;
	if(element.posinall==null)element.posinall=element.pos+this.linepos[element.line];
	this.insertedhtmlelements.push(element);
	this.insertedhtmlinline[element.line].push(element);
};
mapping.prototype.addVeraenderung = function(element){
	if(element.posinall==null)element.posinall=element.pos+this.linepos[element.line];
	element.angezeigteszeichen=true;
	this.angezeigtezeichen.push(element);
}
mapping.prototype.ganzeZeileVeraendern = function(zeile){
	if(this.insertedhtmlinline[zeile]!=null){
		var insertedhtml = this.insertedhtmlinline[zeile];
		for(var x=0;x<insertedhtml.length;x++){
			var elem=insertedhtml[x];
			if(elem.wystextveraenderung!=0)this.addVeraenderung({line:elem.line,
				pos:elem.pos, posinall:elem.posinall, mdcode:elem.mdcode, html:elem.html,
				typ:elem.typ, angezeigteszeichen:true,
				wystextveraenderung:0-elem.wystextveraenderung
			});
		}

	}

}
mapping.prototype.resetVeraenderungen = function(){
	this.angezeigtezeichen=new Array();
}

mapping.prototype.allElementsInLine = function(linenr){
	return this.insertedhtmlinline[linenr];
};

mapping.prototype.positionInHtml = function(position, line){
	var newpos=position;
	var onelement = false; //braucht das? vielleicht nicht blöd für schnelle abfrage
	var onelements = new Array();
	var posinelements = new Array();
	var lastelement;
	var nextelement = this.insertedhtmlinline[line][0];
	this.insertedhtmlinline[line].sort(function (a,b){return a.pos - b.pos || a.mdcode.length - b.mdcode.length});
	if(line!=null){
		if(position==0){
			for(var el=0;el<this.insertedhtmlinline[line].length;el++){
				var elem = this.insertedhtmlinline[line][el];
				if(elem.pos ==0 && elem.typ=="start"){
					newpos+=elem.html.length;
					if(elem.mdcode.length > 0)nextelement=elem;
				}
			}
		}else
		//position ist mit lineangabe:
		for(var x=0;x<this.insertedhtmlinline[line].length;x++){
			var elem = this.insertedhtmlinline[line][x];
				if(elem.pos<position){
					newpos+=elem.html.length-elem.mdcode.length;
					if(elem.mdcode.length>0)lastelement=elem;
					nextelement=this.insertedhtmlinline[line][x+1];
				}
				if(elem.pos<position && position<elem.pos+elem.mdcode.length){
					//auf element gelandet:
					newpos+=elem.mdcode.length-elem.html.length; //erstmal wieder rückgängig machen
					var posinelement=position-elem.pos;
					newpos-=posinelement; //newpos steht jetzt auf anfang des elements
					//hier wirds kompliziert mit dem link wegen element in element und der newpos:
					if(elem.typ=="link" || elem.typ=="image"){
						//mal gucken, was ich da machen muss, klingt komplizierter
						//fürs austauschen html-position merken:
						elem.htmlpos = newpos;
						//einfach nix machen??? sieht so aus! goil. ah, doch: wieder im element vorrücken
						newpos+=posinelement;
						//ok, jetzt stimmt die position. aber das austauschen wird schwer :(

					}
					if(elem.typ=="start"){
						//rücke html-vor:
						newpos+=elem.html.length;
					}
					//end: tue nix, stehst schon richtig
					//ansonsten erstmal:
					onelements.push(elem);
					posinelements.push(posinelement);
				}
		}
	}
	return {position:newpos,onelements:onelements, posinelements:posinelements, lastelement:lastelement,nextelement:nextelement};
};

mapping.prototype.WystextToSource = function(position){
	var veraenderungen = new Array();
	for(var x=0;x<this.insertedhtmlelements.length;x++){
		if(this.insertedhtmlelements[x].wystextveraenderung!=0)veraenderungen.push(this.insertedhtmlelements[x]);
	}
	for(x=0;x<this.angezeigtezeichen.length;x++){
		veraenderungen.push(this.angezeigtezeichen[x]);
	}
	veraenderungen.sort(function(a, b){return a.posinall - b.posinall});
	//console.log("veraenderungen:");
	//console.log(veraenderungen);
	//veraenderungen sind jetzt sortiert und enthalten alle insertedhtmls und angezeigte zeichen
	var aktpos=position;
	var onlink=false;
	for(x=0;x<veraenderungen.length;x++){
		//jetzt veraenderungen durchlaufen:
		if(veraenderungen[x].posinall<aktpos){
		//console.log("aktposalt:"+aktpos);
			aktpos+=veraenderungen[x].wystextveraenderung;
		//console.log("veränderung gefunden:"+veraenderungen[x].mdcode + " -> "+veraenderungen[x].wystextveraenderung);
		//console.log("aktpos:"+aktpos);
		}
		//console.log("posinall:"+veraenderungen[x].posinall);
		//console.log(veraenderungen[x]);
		if(aktpos>veraenderungen[x].posinall &&
			aktpos<veraenderungen[x].posinall+veraenderungen[x].mdcode.length  &&
			veraenderungen[x].typ=="link" && !veraenderungen[x].angezeigteszeichen){
				//auf link gelandet
				//stimmt nicht unbedingt: wenn im link noch md-code ist stimmts evtl. nicht
				//TODO: md-code im link-fehler abfangen
				//schaue nach, ob weitere veränderungen innerhalb des links passieren:
				var verinlink = 0;
				for (var vx=x+1;vx<veraenderungen.length;vx++){
					if(veraenderungen[vx].posinall <= veraenderungen[x].posinall+veraenderungen[x].mdcode.length &&
					  veraenderungen[vx].posinall > veraenderungen[x].posinall){
						//veränderung ist innerhalb des links:
						verinlink+=veraenderungen[vx].wystextveraenderung;
					}
				}

				//console.log("auf link gelandet an "+aktpos + " verinlink:"+verinlink);
				//console.log(veraenderungen[x]);
				//console.log("wirklich auf link gelandet?");
				if(aktpos<veraenderungen[x].posinall+veraenderungen[x].mdcode.length-verinlink){
					//console.log("ja, wirklich");
					aktpos=aktpos-veraenderungen[x].wystextveraenderung+1;
					//if(veraenderungen[x+1]!=null && veraenderungen[x+1].angezeigteszeichen &&
					//veraenderungen[x+1].typ=="link")aktpos--;
					onlink=true;
				}
		}
		//console.log
		if(veraenderungen[x].typ=="link" && veraenderungen[x].angezeigteszeichen &&
		onlink){
			//link ist bereits angezeigt:mache daher aktpos wieder rückgängig?
				aktpos--;
				aktpos-=veraenderungen[x].wystextveraenderung;
				//console.log("rückgängig gemacht auf:"+aktpos);
		}
		if(veraenderungen[x].typ=="proposedsymbol" && aktpos<veraenderungen[x].posinall){
				//auf proposedsymbol gelandet
				//console.log("auf proposedsymbol gelandet an"+aktpos);
				//aktpos=aktpos-veraenderungen[x].wystextveraenderung;//+veraenderungen[x].mdcode.length;
		}

	}
	return aktpos;
}

/*alter teil des Programms:*/

/* einfaches parse-objekt wie bspw. Sternchen und ähnliches
*	*/
function parseobjekt(emdedstart, emdedend, htmlstarttag, htmlendtag, nombre){
	//init der klasse
		this.emdstart = emdedstart;
		this.emdend = emdedend;
		this.htmlstart = htmlstarttag;
		this.htmlend = htmlendtag;
		this.nombre = nombre;
}
parseobjekt.prototype.htmlencapsule = function(text,position, errorlog){
	//text ist alles
	var temptext = text.substring(position+this.emdstart.length);
	if(temptext.indexOf(this.emdend)==-1){
		//error aufgetreten:
		//zeilen zählen:
		var zeilencounttext = text.substring(0,position);
		var zc=0;
		var zscan=true;
		var zlnpos=0;
		while(zeilencounttext.indexOf("\n",zlnpos)>-1){
			zc++;
			zlnpos=zeilencounttext.indexOf("\n",zlnpos)+1;
		}
		zlnpos--; //zlnpos ist jetzt der letzte zeilenumbruch vorm fehler:
		errorlog.push(new parsererror(zc,position-zlnpos,20,this.nombre,"missing endsymbol "+this.emdend));
		//errorlog.push(new parsererror(zc,0,
		return text;
	}else {
		temptext = temptext.substring(0,temptext.indexOf(this.emdend));
		var returntext = this.htmlstart + temptext + this.htmlend;
		if(this.emdend=="\n")returntext+="\n";
		if(this.emdstart.indexOf("\n")>-1)returntext = "\n"+returntext;
		return text.substring(0,position)+returntext + text.substring(position + temptext.length+this.emdstart.length+this.emdend.length);
	}
};

function parsererror(line, row, rowend, errorclass, errortext, parseobjekt){
	this.line = line;
	this.row = row;
	this.rowend = rowend;
	this.errorclass = errorclass;
	this.errortext = errortext;
	this.htmlstart = '<span class="error">';
	this.htmlend = "</span>";
	this.parseobjekt = parseobjekt;
}
parsererror.prototype.proposeEnding = function(){
	if(this.errortext.indexOf("missing endsymbol ")>-1)return this.errortext.substring(this.errortext.indexOf("missing endsymbol ")+18);
	else return "";
};
parsererror.prototype.encapsulehtml=function(linetext){
	//if(this.rowend<linetext.length)return linetext.substring(0,this.row)+this.htmlstart+linetext.substring(this.row, this.rowend)+this.htmlend+linetext.substring(this.rowend);
		//else
		var realstart = this.row;
		if(this.parseobjekt!=null){
			//console.log("error an stelle:"+realstart+" zu finden:" +this.parseobjekt.emdstart + " momentaner fund:"+linetext.substring(realstart,realstart+this.parseobjekt.emdstart.length));
		}
		if(realstart>0 && this.parseobjekt != null && linetext.substring(realstart,realstart+this.parseobjekt.emdstart.length)!=this.parseobjekt.emdstart){
			//realstart = linetext.indexOf(this.parseobjekt.emdstart, realstart);
			while(linetext.substring(realstart,realstart+this.parseobjekt.emdstart.length)!=this.parseobjekt.emdstart && realstart>0)realstart--;
		}
		return linetext.substring(0,realstart)+this.htmlstart+linetext.substring(realstart)+this.htmlend;
};
parsererror.prototype.logformat=function(){
	return this.line+"/"+this.row+" ["+this.errorclass+"]:"+this.errortext;
};

function emdparser(text){
	this.sourcecode = text;  //the sourcecode of everything, normaly gotten from editor-textfield
	this.lines = new Array(); //array with ready html-code parsed as lines into array
	this.lineswithhtml = new Array(); //array lineswithhtml[linenummer] = string with element-code: text,ol,ul,table...
	this.parsedcode = text;  //string with the code parsed to html
	this.errorcode = text; //string with the code parsed to html including error-spans and error-description-spans
	this.errorsourcecode = text; //string with the code including error-spans
	this.errorlines = new Array(); //wird nicht genutzt - war gedacht als direktes einpflegen in errorlines während dem parsen
	this.lineswitherrors = new Array(); // array with strings of errorcode parsed as lines into array
	this.errorsourcelines = new Array(); //array with strings of errorsourcecode parsed as lines into array
	this.imgurlpre = "images/"; //string with the beginning for image-urls, depending on the server and the nodeid, maybe not necesary
	//var aktpos = 0;
	this.parselines(text);  //parsing the sourcecode on init into lines
	this.perror = new Array(); //array with parsing-errors as objects/array
	this.parseelemente = new Array(); //array with simple parseelements which can go over lines
	//erstelle einfache parseobjekte:
	this.parseelemente.push(new parseobjekt('***','***',"<b><i>","</i></b>","bolditalic"));
	this.parseelemente.push(new parseobjekt('**','**',"<b>","</b>","bold"));
	this.parseelemente.push(new parseobjekt('__','__',"<b>","</b>","bold"));
	this.parseelemente.push(new parseobjekt('*','*',"<i>","</i>","italic"));
	this.parseelemente.push(new parseobjekt('_','_',"<i>","</i>","italic"));
	this.parseelemente.push(new parseobjekt("~~","~~","<strike>","</strike>","strike"));
	//this.parseelemente.push(new parseobjekt("`","`","<code>","</code>","code")); //darf auch nicht über eine zeile hinausgehen
	//this.parseelemente.push(new parseobjekt("-----","\n","<hr>","","pagebreak")); //ist ein zeilending, kein einfaches element
	//wysiwyg-erweiterung:
	//insertedhtmlinline wird benutzt, um später die position genauer herauszufinden
	this.insertedhtmlinline = new Array(); //array with inserted htmlcodes
	for(var ix=0;ix<this.lines.length;ix++)this.insertedhtmlinline.push(new Array());
	//zeilenansatz funktioniert nicht für umgekehrt, daher füg ich mal ein weiteres array hinzu
	//dieses array speichert die position des changes ab, den typus des changes sowie die effektive länge des gekürzten oder längeren textes
	//bspw: * wird zu 1, da html-code NICHT mitgerechnet wird, der text also nachher um 1 zeichen kürzer ist
	//this.veraenderungen = new Array(); //array with array of changes made at position (typ, position, laenge) -> funktioniert so nicht. hol ich aus insertedhtmlinline
	//es müssen die letzten angezeigten zeichen gespeichert werden um den effekt zu vermeiden, dass er springt wenn
	this.angezeigtezeichen = new Array();
	this.originallinien = new Array();

	//neuneuneu: ansatz über mapping-objekt:
	this.map = new mapping(this);


}

emdparser.prototype.parselines= function(text){
	var aktpos = 0;
	this.lines = new Array();
	while(text.indexOf("\n",aktpos)>-1){
		this.lines.push(text.substring(aktpos,text.indexOf("\n",aktpos)));
		aktpos=text.indexOf("\n",aktpos)+1;
	}
	this.lines.push(text.substring(aktpos));
};
emdparser.prototype.returnparsedlines = function(text){
	var aktpos = 0;
	var lines = new Array();
	while(text.indexOf("\n",aktpos)>-1){
		lines.push(text.substring(aktpos,text.indexOf("\n",aktpos)));
		aktpos=text.indexOf("\n",aktpos)+1;
	}
	lines.push(text.substring(aktpos));
	//console.log("last line:"+lines[lines.length-1]+"eol");
	return lines;
};
/*weitere hilfsfunktionen:
*/
emdparser.prototype.lineAtPosition = function(position){
	var linepos = 0;
	line = 0;
	while(this.sourcecode.indexOf("\n",linepos)<position &&
		this.sourcecode.indexOf("\n",linepos)>-1){
		linepos=this.sourcecode.indexOf("\n",linepos)+1;
		line++;
	}
	linepos--;
	return line;
};

emdparser.prototype.positionOfLine = function(line){
	var linepos = 0;
	var aktline=0;
	while(this.sourcecode.indexOf("\n",linepos)>-1 && aktline<line){
		linepos=this.sourcecode.indexOf("\n",linepos)+1;
		aktline++;
	}
	return linepos;
};


/* parsewysiwyghtml:
* erstellt html für wysiwyg
* inklusive cursor oder selection
*/
emdparser.prototype.parsewysiwyghtml= function(){
	var temptext = ""; //wird aus lines gewonnen:
	var errorlines=new Array();
	console.log("parsewysiwyghtml");
	var lines = this.returnparsedlines(this.parsedcode);
	var sourcelines = this.returnparsedlines(this.sourcecode);
	var proposedsymbols = new Array(); //linenr, symbol-code
	//parsefehlerbearbeitung: symbol vorschlagen
	//nur einen gleichen parseerror anzeigen lassen pro zeile, first comes first:
	//var lasterrorline;
	console.log(this.perror);
	for(var x=0;x<this.perror.length;x++){
			//if(lasterrorline != this.perror[x].line){
				//console.log(this.perror[x].errorclass);
				var proposedsymbol = this.perror[x].proposeEnding();
				//proposedsymbols[x]=proposedsymbol;
				if(proposedsymbol != ""){
						if(proposedsymbols[this.perror[x].line]==null)proposedsymbols[this.perror[x].line]="";
					//	proposedsymbols[this.perror[x].line]+='<span class="proposedsymbol">'+proposedsymbol+'</span>';
						proposedsymbols[this.perror[x].line]= proposedsymbol+" "+proposedsymbols[this.perror[x].line];
					//proposedsymbols[this.perror[x].line]= proposedsymbol;
					 //lines[this.perror[x].line]+='<span class="proposedsymbol">'+proposedsymbol+'</span>';
					if(lines[this.perror[x].line].indexOf("<br>">-1)){
						lines[this.perror[x].line] = lines[this.perror[x].line].replace("<br>","") + "<br>";
					}
				}

			//}
			//lasterrorline = this.perror[x].line;
	}

	//wysiwyg: cursor an position setzen:

	var texteditor = document.getElementById("quelltext");
	var altecursorposition = texteditor.selectionEnd;
	var alteselectionstart = texteditor.selectionStart;
	var selectiondirection = texteditor.selectionDirection;
	var neuecursorline = this.lineAtPosition(altecursorposition);
	//console.log(this.positionOfLine(neuecursorline));
	var cursorinlinealt = altecursorposition - this.positionOfLine(neuecursorline);
	var cursorinlineneu = cursorinlinealt;
	//jetzt zeile durchgehen und sonderzeichen zählen:
	var emdpositionen = new Array();
	var aktuellezeile = lines[neuecursorline];
	//console.log(neuecursorline + "vs" + this.insertedhtmlinline.length);
	if(this.insertedhtmlinline[neuecursorline] == null){
		this.insertedhtmlinline[neuecursorline] = new Array();
		console.log("wasn los");
	}
	if(alteselectionstart < altecursorposition){
	//es wurde etwas per maus oder tastatur ausgewählt:
	//welche richtung? muss gleichlang sein
		var seldir = "bacw"
		if(selectiondirection=="forward")seldir="forw";
		var neueselectionstartline = this.lineAtPosition(alteselectionstart);
		var neueselectionendline = neuecursorline;
		//alert(neueselectionstartline+" bis "+neueselectionendline);
		this.originallinien[0]=neueselectionstartline;
		this.originallinien[1]=neueselectionendline;
		console.log("neue markierung von zeile"+neueselectionstartline+" bis "+neueselectionendline);
		this.map.resetVeraenderungen();

		for(var selline=neueselectionstartline;selline<=neueselectionendline;selline++){
			//tausche den html-text durch originaltext aus:
			//if(this.lineswithhtml[selline].substring(0,1)!="h") //nicht machen bei titeln
			//replace < mit ersatzzeichen, damit html nicht gebrochen wird
			lines[selline]=this.replace(sourcelines[selline],"<","&lt;")+"<br>";
			this.map.ganzeZeileVeraendern(selline);
			//zeichen zum austauschen: ≤ 〈 ‹∠
			//h-tags anzeigen weil sonst nervig springt -> geht nicht, weil sonst mapping zerstört wird
			// wenn gewünscht ist, muss mapping angepasst werden
			//if(this.lineswithhtml[selline]=="h1")lines[selline]='<h1>'+lines[selline]+'</h>';
			//this.map.addVeraenderung({line:selline, pos:0, mdcode:"#",html:"<h1>",typ:"angezeigteszeichen",wystextveraenderung:0});

		}
		//setze selection-start und end-tag:
		var selstartinline = alteselectionstart - this.positionOfLine(neueselectionstartline);
		var selendinline = cursorinlinealt;
		if(neueselectionstartline == neueselectionendline){
			//in der selben linie:
			lines[neueselectionstartline] = this.replace(sourcelines[neueselectionstartline].substring(0,selstartinline),"<","&lt;") +
																			'<span class="wysiwygselection '+seldir+'">' +
																			this.replace(sourcelines[neueselectionstartline].substring(selstartinline,selendinline),"<","&lt;")+
																			'</span>' +
																			this.replace(sourcelines[neueselectionstartline].substring(selendinline),"<","&lt;")
																			+'<br>';
		} else {
			lines[neueselectionstartline]= this.replace(sourcelines[neueselectionstartline].substring(0,selstartinline),"<","&lt;")+
										'<span class="wysiwygselection '+seldir+'">' +
										this.replace(sourcelines[neueselectionstartline].substring(selstartinline),"<","&lt;")
										+'<br>';
			lines[neueselectionendline]=this.replace(sourcelines[neueselectionendline].substring(0,selendinline),"<","&lt;")+
																	'</span>' +
																	this.replace(sourcelines[neueselectionendline].substring(selendinline),"<","&lt;")
																	+'<br>';
		}
		/*alt:
		var selstartinline = alteselectionstart - this.positionOfLine(neueselectionstartline);
		lines[neueselectionstartline]=lines[neueselectionstartline].substring(0,selstartinline)+'<span class="wysiwygselection '+seldir+'">'+lines[neueselectionstartline].substring(selstartinline);
		//alert(lines[neueselectionstartline]);
		var selendinline = cursorinlinealt;
		if(neueselectionstartline == neueselectionendline)selendinline+=36; //alert("zeilengleichheit");}
		lines[neueselectionendline]=lines[neueselectionendline].substring(0,selendinline)+'</span>'+lines[neueselectionendline].substring(selendinline);
		*/
		//alert(lines[neueselectionendline]);
		//fast fertig - jetzt muss noch überprüft werden ob html zerschossen wird,
		//also ob selectionanfang oder selectionende innerhalb
		//tabelle, ol, ul, code, quote oder text ist:
		var linecode = this.lineswithhtml[neueselectionstartline];
		if(linecode=="table" || linecode =="ol" || linecode == "ul" || linecode =="code" || linecode=="quote" || linecode=="text"){ //zitat fehlt noch, ist aber eh grad kaputt
			var preselectionline = neueselectionstartline;
			while(preselectionline>=0 && this.lineswithhtml[preselectionline]==linecode)preselectionline--;
			preselectionline++; //wieder auf richtige linie bringen
			this.originallinien[0]=preselectionline;
			for(var presel=preselectionline;presel<neueselectionstartline;presel++){
				lines[presel]=this.replace(sourcelines[presel],"<","&lt;")+"<br>"; //sourcelines[presel]+"<br>";
				this.map.ganzeZeileVeraendern(presel);
			}
		}
		linecode = this.lineswithhtml[neueselectionendline];
		if(linecode=="table" || linecode =="ol" || linecode == "ul" || linecode =="code" || linecode=="quote" || linecode=="text"){ //zitat fehlt noch, ist aber eh grad kaputt
			var afterselectionline = neueselectionendline;
			while(afterselectionline<this.lineswithhtml.length && this.lineswithhtml[afterselectionline]==linecode)afterselectionline++;
			this.originallinien[1]=afterselectionline;
			for(var asel=neueselectionendline+1;asel<afterselectionline;asel++){
				lines[asel]=this.replace(sourcelines[asel],"<","&lt;")+"<br>"; //sourcelines[asel]+"<br>";
				this.map.ganzeZeileVeraendern(asel);
			}
		}

	}else {
		this.map.resetVeraenderungen();
		//es wurde nichts ausgewählt:
		var cursormdinline = cursorinlinealt;
			var wysposobj = this.map.positionInHtml(cursorinlinealt,neuecursorline);
			var lastelement = wysposobj.lastelement;
			var nextelement = wysposobj.nextelement;
		//wyscodeposobj = {position, onelements[], posinelements[], lastelement, nextelement};
			var wyspos = wysposobj.position;
			var insertbeforecursor = "";
			var insertaftercursor = "";
			var objbeforecursor = new Array();
			var objaftercursor = new Array();
			if(lastelement !=null && lastelement.pos+lastelement.mdcode.length == cursormdinline){
				//lastelement grenzt an aktuelle cursorposition. einfache objekte anzeigen, links und images nix tun:
				if(lastelement.typ!= "image" && lastelement.typ != "link" && lastelement.typ!= "<" && lastelement.typ!="hotcode"){ //könnte auch im objekt bereits gesetzt werden
					insertbeforecursor+=lastelement.mdcode;
					this.map.addVeraenderung({line:lastelement.line, pos:lastelement.pos,
						posinall:lastelement.posinall, typ:lastelement.typ,
						mdcode:lastelement.mdcode, html:lastelement.html,
						wystextveraenderung:0-lastelement.wystextveraenderung});
						if(lastelement.typ=="start" && lastelement.brotherelement!= null)objaftercursor.push(lastelement.brotherelement);
				} else if(lastelement.typ=="image" || lastelement.typ=="link"){
					objbeforecursor.push(lastelement);
				}
			}
			if(wysposobj.onelements!=null){
				//es wurde auf mind. einem element gelandet
				for(var onx=wysposobj.onelements.length-1;onx>=0;onx--){
					//tausche von hinten nach vorne aus:
					var elem = wysposobj.onelements[onx];
					if(elem.typ =="link"){

						//link wurde gefunden. text muss ausgetauscht werden:
						elem.linktext = lines[elem.line].substring(elem.htmlpos + elem.linkurl.length +"<a href=''>".length, lines[elem.line].indexOf("</a>",elem.htmlpos));
						lines[elem.line] = lines[elem.line].substring(0,elem.htmlpos)+
										"[" + elem.linktext +
										"](" + elem.linkurl + ")" +
										lines[elem.line].substring(elem.htmlpos+elem.linktext.length+elem.linkurl.length + "<a href=''></a>".length);
						this.map.addVeraenderung({line:elem.line, pos:elem.pos, mdcode:elem.mdcode, angezeigteszeichen:true, typ:elem.typ, wystextveraenderung:0-elem.wystextveraenderung});
					} else if(elem.typ=="image"){
						//image wurde gefunden. text muss ausgetauscht werden:
						lines[elem.line] = lines[elem.line].substring(0, elem.htmlpos) + elem.mdcode + lines[elem.line].substring(elem.htmlpos+elem.html.length);
						this.map.addVeraenderung({line:elem.line, pos:elem.pos, mdcode:elem.mdcode, angezeigteszeichen:true,typ:elem.typ, wystextveraenderung:0-elem.wystextveraenderung});
					} else if(elem.typ=="<" || elem.typ=="hotcode"){
						//mach ich da was?
					}else {
						insertbeforecursor+=elem.mdcode.substring(0,wysposobj.posinelements[onx]);
						insertaftercursor+=elem.mdcode.substring(wysposobj.posinelements[onx]);
						this.map.addVeraenderung({line:elem.line, pos:elem.pos, posinall:elem.posinall, typ:elem.typ, mdcode:elem.mdcode, html:elem.html, wystextveraenderung:0-elem.wystextveraenderung});
					}
				}
			}		//text ist jetzt ausgetauscht falls cursor auf einem mdcode-element sein sollte, position ist richtig
			if(nextelement!=null && cursormdinline == nextelement.pos){
				//es folgt ein objekt direkt nach dem cursor:
				if(nextelement.typ!="link" && nextelement.typ!="image" && nextelement.typ!="hotcode" &&nextelement.typ!="<"){
					console.log("an einem objekt rechts dran:"+nextelement.mdcode+" darstellen");
					insertaftercursor+=nextelement.mdcode;
					this.map.addVeraenderung({line:nextelement.line, pos:nextelement.pos, posinall:nextelement.posinall, typ:nextelement.typ, mdcode:nextelement.mdcode, html:nextelement.html, wystextveraenderung:0-nextelement.wystextveraenderung});
				}
			}
			cursorinlineneu = wyspos;
			//console.log("cursor gesetzt von"+cursorinlinealt+"auf:"+cursorinlineneu);
			//console.log(wysposobj);
			//console.log(this.map);
			//proposedsymbols
		var proposedsymbol = proposedsymbols[neuecursorline];
		var proposedsymbolhtml = "";
		if(proposedsymbol==null)proposedsymbol=""; else proposedsymbolhtml = '<span class="proposedsymbol">'+proposedsymbol+'</span>';

		//console.log("proposedsymbol:"+proposedsymbol + " neuecursorline:"+neuecursorline);
		//console.log(proposedsymbols);

		//cursor setzen
		//überarbeiten: cursor sollte das nächste wort umfassen und links border haben und nach links "collapsen" anstelle zum ende.
		//sonst bricht der vorm wort um und dadurch kann nicht ordentlich am anfang der linie runter gegangen werden
		//also hier die line durchsuchen bis zum nächsten leerzeichen und bis dahin das span ziehen
		var nextspace = lines[neuecursorline].indexOf(" ",cursorinlineneu);
		if(nextspace==-1)nextspace=cursorinlineneu;
		lines[neuecursorline] = lines[neuecursorline].substring(0,cursorinlineneu)
											+ insertbeforecursor
											+ '<span class="cursor">&zwj;'
											//+ lines[neuecursorline].substring(cursorinlineneu,nextspace) //klappt noch nicht so richtig
											+ '</span>'
											+ insertaftercursor
											//+ '<span class="proposedsymbol">'
											+ proposedsymbolhtml //+ "</span>"
											+lines[neuecursorline].substring(cursorinlineneu);
										//	+lines[neuecursorline].substring(nextspace); //klappt noch nicht so richtig

		//wenn cursor einen buchstaben bekommt sollte es auch gemerkt werden:
		//this.angezeigtezeichen.push(new Array(neuecursorline, cursorinlinealt,"|")); //zeichen merken
		this.map.addVeraenderung({line:neuecursorline, pos:cursorinlinealt, typ:"cursor", mdcode:"|", wystextveraenderung:-1});
		//auch die proposedsymbols sollten gemerkt werden
		//this.angezeigtezeichen.push(new Array(neuecursorline, cursorinlinealt, proposedsymbol));
		this.map.addVeraenderung({line:neuecursorline, pos:cursorinlinealt, typ:"proposedsymbol", mdcode:proposedsymbol, wystextveraenderung:0-proposedsymbol.length});

	}//else vom if(selection)

	//alle lines fertig: erstelle ein textstring daraus und übergebe es an this.errorcode:
	for(var x=0;x<lines.length;x++)temptext += lines[x] + "\n";
	//doppelte leerzeichen entfernen:
	if(temptext.indexOf("  ")>-1)temptext = this.replace(temptext,"  ","&nbsp; ");
	if(temptext.indexOf("\n ")>-1)temptext=this.replace(temptext,"\n ","\n&nbsp;");
	if(temptext.indexOf(" <br>")>-1)temptext=this.replace(temptext," <br>","&nbsp;<br>"); //braucht firefox
	//if(temptext.indexOf("\t")>-1)temptext = this.replace(temptext,"\t","&nbsp;&nbsp;&nbsp; ");
	if(temptext.indexOf("\t")>-1)temptext = this.replace(temptext,"\t","&emsp;");
	//if(temptext.indexOf("<")>-1)temptext = this.replace(temptext,"<","&lt;");

	this.errorcode = temptext;
	this.lineswitherrors = errorlines;


};
/* parseerrorsourcehtml erstellt html für die erweiterte fehlerdarstellung des sourcecodes
*
*/
emdparser.prototype.parseerrorsourcehtml= function(){
	var lines = this.returnparsedlines(this.sourcecode);
	var temptext = '<ol start="0">';
	for(var x=0;x<this.perror.length;x++)lines[this.perror[x].line]=this.perror[x].encapsulehtml(lines[this.perror[x].line])+'<span class="errordescription">'+this.perror[x].errorclass+': '+this.perror[x].errortext+"</span>";
	for(var x=0;x<lines.length;x++)temptext+='<li>'+lines[x]+'</li>\n';
	temptext += "</ol>";
	//var errorsourcecodediv = document.getElementById("fehlercode");
	//if(errorsourcecodediv!=null)errorsourcecodediv.innerHTML = temptext;
	this.errorsourcelines = lines;
	this.errorsourcecode = temptext;
};

/*	parseerrorsourcebackground erstellt einen string für das #errorsourcecodelayer
 *	zur anzeige hinter dem texteditor. also den gleichen text wie errorsourcecodelayer, nur
 * 	mit den errorspans im hintergrund
 * 	holt sich den code vom sourcecode, gibt ergebnis als string zurück
*/
emdparser.prototype.parseerrorsourcebackground = function(){
	//this.parsenachzeilen(); //erstmal aktualisieren
	var lines = this.returnparsedlines(this.replace(this.replace(this.sourcecode,"<","&lt;"),"\t","&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"));
	var temptext = "";
	for(var x=0;x<lines.length;x++){
		var pseudoline="&nbsp;";
		for(var y;y<lines[x].length;y++)pseudoline+=pseudoline;
		//lines[x]=pseudoline+".";
	}
	//nur einen gleichen error anzeigen lassen pro zeile, first comes first:
	var lasterrorline;
	var x;
	//* vor ** anzeigen lassen:
	var doppelsternchen = new Array();
	for(x=0;x<this.perror.length;x++){
			if(lasterrorline != this.perror[x].line){
				console.log(this.perror[x].errorclass);
				//if(this.perror[x].errorclass=="bold")doppelsternchen.push(x);
				lines[this.perror[x].line]=this.perror[x].encapsulehtml(lines[this.perror[x].line]);
				var proposedsymbol = this.perror[x].proposeEnding();
				if(proposedsymbol != ""){
					if(this.perror[x].errorclass=="bold")doppelsternchen.push(x); else
					 lines[this.perror[x].line]+='<span class="proposedsymbol">'+proposedsymbol+'</span>';
				}

			}
			lasterrorline = this.perror[x].line;

	}
	//doppelsternchenfehler anzeigen lassen:
	for(x=0;x<doppelsternchen.length;x++)lines[this.perror[doppelsternchen[x]].line]+='<span class="proposedsymbol">' + this.perror[doppelsternchen[x]].proposeEnding() + '</span>';
		//+'<span class="errordescription">'+this.perror[x].errorclass+': '+this.perror[x].errortext+"</span>";
	for(x=0;x<lines.length;x++){
	//temptext+='<div><span class="linenr">'+x+'</span>'+this.replace(lines[x],"  ","&nbsp; ")+'&nbsp;</div>\n';
	//divs funktionieren im firefox, aber nicht im chrome, daher lieber mit br arbeiten:
	var leerzeichen="";
	if(lines[x].length<1)leerzeichen="&nbsp;";
	temptext +='<span class="linenr">'+x+'</span><span class="backgroundline">'+this.replace(lines[x],"  ","&nbsp; ")+leerzeichen+'</span><br>\n';


	}
	temptext +="&nbsp;";
	//temptext += "</ol>";
	//if(temptext.indexOf('backgroundline"> ')>-1)this.replace(temptext,'backgroundline"> ','backgroundline">&nbsp;');
	return temptext;

};
/*	* replace: hilfsmethode um nicht zu regexen(text,symbol,newsymbol)
	* text: zu durchsuchender string, symbol: zu ersetzender string, newsymbol: ersetzungsmuster string
	* gibt string zurück mit ersetztem text
 */

emdparser.prototype.replace = function(text,symbol,newsymbol){
	var temptext = text;
	var letztertreffer=0;
	while(temptext.indexOf(symbol, letztertreffer)>=0){
		var treffer=temptext.indexOf(symbol,letztertreffer);
		temptext = temptext.substring(0,treffer)+newsymbol+temptext.substring(treffer+symbol.length);
		//letztertreffer=treffer+1;
	}
	return temptext;
};
/* 	* sanitizeemdcodeline(text)
	* wechselt emdzeichen im text (aktuelle line) durch html-code aus, damit sie nicht geparst werden:
	* gibt string mit sanisiertem text zurück.
 	* soll ersetzen: *	 		> 	  ~ 	# [91,93 ] (40,41) < |124
 	* durch		: &lowast;  &gt; &tilde; &#91,93,40,41; &lt;
 */

emdparser.prototype.sanitizeemdcodeline = function(text){
	var santext = text;
	//lt rausnehmen, da es an andrer stelle ja bereits ist. hier nur emd-code sanitizen
	var oldsymbol = new Array("*",">","~","_","#",						"[","]",		"(",")","|","-",". ");
	var newsymbol = new Array("&lowast;","&gt;","&tilde;","&lowbar;","&num;","&#91;","&#93;","&#40;","&#41;","&#124;","&#45;",".&nbsp;");
	for(var sym=0;sym<oldsymbol.length;sym++)santext = this.replace(santext,oldsymbol[sym],newsymbol[sym]);
	return  ""+santext;
};

emdparser.prototype.sanitizedemdcodelinepositions = function(text){
	//sucht positionen raus von den symbolen und liefert sie im array zurück
	var hotpos = new Array();
	var oldsymbol = new Array("*",">","~","_","#",						"[","]",		"(",")","|","-",". ");
	//var newsymbol = new Array("&lowast;","&gt;","&tilde;","&lowbar;","&num;","&#91;","&#93;","&#40;","&#41;","&#124;","&#45;",".&nbsp;");
	for(var sym=0;sym<oldsymbol.length;sym++){
		//santext = this.replace(santext,oldsymbol[sym],newsymbol[sym]);
		var aktpos = 0;
		while(text.indexOf(oldsymbol[sym], aktpos)>-1){
			hotpos.push(text.indexOf(oldsymbol[sym],aktpos));
			aktpos=text.indexOf(oldsymbol[sym],aktpos+1);
		}
	}
	if(hotpos.length>1)hotpos.sort(function(a,b){return a - b});
	return hotpos;
}
emdparser.prototype.sanitizedcodepositions = function(text){
	var newsymbol = new Array("&lowast;","&gt;","&tilde;","&lowbar;","&num;","&#91;","&#93;","&#40;","&#41;","&#124;","&#45;","&nbsp;");
	var codepos = new Array();
	var text= this.replace(text, "&lt;", "<"); //html wurde bereits ausgetauscht, daher gefährlich!
	for(var sym=0;sym<newsymbol.length;sym++){
		var aktpos=0;
		while(text.indexOf(newsymbol[sym],aktpos)>-1){
			codepos.push(new Array(text.indexOf(newsymbol[sym],aktpos),newsymbol[sym]));
			//alert(aktpos+newsymbol[sym]);
			aktpos=text.indexOf(newsymbol[sym],aktpos)+1;
		}
	}
	if(codepos.length > 1)codepos.sort(function(a, b){return a[0] - b[0]});
	//codepos ist jetzt sortiert, um auf richtige position im source zu kommen jetzt zeichen abziehen
	//ab dem zweiten element die länge des vorherigen elements -1 steigend
	var veraenderung=0;
	for(var f=0;f<codepos.length;f++){
		codepos[f][0]-=veraenderung;
		veraenderung+=codepos[f][1].length-1;
	}
	//console.log("codepositions: vom text:"+text);
	//console.log(codepos);
	//console.log(this.insertedhtmlinline);
	return codepos;
};

/*	pageAtPosition: sucht die page raus, die zur position gehört
 *	position: position im text, mode: pagenr, pagepos, null
 *	returns: nummer der page oder position des letzten pageanfangs oder array aus beidem
*/
emdparser.prototype.pageAtPosition = function(position, mode){
	//sucht die page raus vom selection-text
	var aktpos = 0;
	var altpos = 0;
	var pagecount = 0;
	while(this.sourcecode.indexOf("\n-----",aktpos)<position && aktpos>-1){
		altpos = aktpos;
		aktpos = this.sourcecode.indexOf("\n-----",aktpos+6);
		pagecount++;
	}
	if(pagecount>0)pagecount--; //pagecount auf richtige seite bringen
	//altpos ist jetzt die position vom letzten page-start
	if(mode=="pagenr") return pagecount;
	if(mode=="pagepos") return altpos;
	if(mode==null) return new Array(pagecount, altpos);
}
/* positionAtPage: sucht die anfangsposition der gefragten seite heraus
 * erwartet: pagenummer returns: position
*/
emdparser.prototype.positionAtPage = function(page){
	var position = 0;
	var aktpos =0;
	console.log("searching for position of page "+page+"...");
	for(var x=0;x<page;x++){
		if(aktpos>-1){
			position=aktpos;
			aktpos=this.sourcecode.indexOf("\n-----",aktpos+6);
		}
	}
	if(aktpos>position)position=aktpos+7;
	console.log("found position at:"+position);
	return position;
}

/* parsenachzeilen:
 * parst emd-text zeilenweise (this.sourcecode)
 * speichert geparsten und mit html versehenen code in this.parsedcode
 * speichert gefundene fehler in this.perror - array
 * speichert zeilenmuster in this.lineswithhtml (h1-4, ul, ol, quote, table, code, text )
*/
emdparser.prototype.parsenachzeilen= function(){
	//erstmal nach zeilen, dann ist auch die * aufzählung weg:
	//var lines = new Array();
	var lines = this.returnparsedlines(this.sourcecode);
	var pseudolines = this.returnparsedlines(this.sourcecode);
	var sourcelines = this.returnparsedlines(this.sourcecode);
	var text = this.sourcecode;
	//alert("nach zeilen scannen ergebnis:\n"+lines.toString());
	var letztezeile=0;
	//var laengebiszeile=0;
	//< aussortieren und durch &lt; ersetzen:

	for(var lt=0;lt<lines.length;lt++){
		var symbol = "<";
		var newsymbol = "&lt;"
		var temptext = lines[lt];
		var indexinorig = -1;
		var indexinhtml = 0;
		while(temptext.indexOf(symbol)>=0){
			indexinhtml = temptext.indexOf(symbol);
			indexinorig = pseudolines[lt].indexOf(symbol,indexinorig+1);
			temptext = temptext.substring(0,temptext.indexOf(symbol))+newsymbol+temptext.substring(temptext.indexOf(symbol)+symbol.length);
			//this.insertedhtmlinline[lt].push(new Array(indexinorig,"&","&lt;"))
			this.map.addElement({line:lt,pos:indexinorig,html:"&lt;",mdcode:"<",typ:"<",wystextveraenderung:0});
		}
		lines[lt] = temptext;
	}

	for(var x=0;x<lines.length;x++){
		linestart = lines[x].substring(0,1);
		//if(x>0)laengebiszeile+=lines[x-1].length;
		//headers:
		if(linestart=="#"){
			var rautenanzahl=1;
			for(var rautencount=1;rautencount<5;rautencount++){
				if(lines[x].substring(rautencount,rautencount+1)=="#")rautenanzahl++; else rautencount=5;
			}
			var ersatz ="";
			var rauten = "";
			for(var ec=0;ec<rautenanzahl;ec++){ ersatz+="€"; rauten+="#";}
			lines[x]= "<h"+rautenanzahl+">"+lines[x].substring(rautenanzahl)+"</h"+rautenanzahl+">";
			//pseudolines[x]=ersatz+lines[x].substring(rautenanzahl)+ersatz; //wird das überhaupt noch gebraucht?
			//if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x] = new Array();
			//this.insertedhtmlinline[x].push(new Array(0,rauten,"<h"+rautenanzahl+">"));
			//this.veraenderungen.push(new Array("titel",laengebiszeile,rauten));
			this.map.addElement({line:x,pos:0,html:"<h"+rautenanzahl+">",mdcode:rauten,typ:"start",wystextveraenderung:rautenanzahl});
			this.lineswithhtml[x]="h"+rautenanzahl;
		} //lines[x] fängt jetzt mit <h an
		//generic list
		if(lines[x].substring(0,2)=="* "){
			glc=x;
			//var laengebiszeileglc = laengebiszeile;
			this.map.addElement({line:x,pos:0,html:"<ul>",mdcode:"",typ:"start",wystextveraenderung:0});
			while(lines[glc]!=null && lines[glc].substring(0,2)=="* " && glc<lines.length){
				lines[glc] = "<li>"+ lines[glc].substring(2)+"</li>";
				//if(this.insertedhtmlinline[glc]==null)this.insertedhtmlinline[glc] = new Array();
				//this.insertedhtmlinline[glc].push(new Array(0,"* ","<li>"));
				//this.veraenderungen.push(new Array("ul",laengebiszeileglc,2));
				//laengebiszeileglc += lines[glc].length;
				this.map.addElement({line:glc,pos:0,html:"<li>",mdcode:"* ",typ:"start",wystextveraenderung:2});
 				glc++;
			}
			glc--;
			lines[x]="<ul>"+lines[x];
			//if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x] = new Array();
			//this.insertedhtmlinline[x].unshift(new Array(0,"","<ul>")); //setze ul an die spitze der insertedhtmls um reihenfolge zu wahren
			//muss ich oben machen
			lines[glc]=lines[glc]+"</ul>";
			letztezeile=glc;
			for(var lwh=x;lwh<=letztezeile;lwh++){
				this.lineswithhtml[lwh]="ul";
				pseudolines[lwh]= "€"+pseudolines[lwh].substring(1);
				console.log("generic-list pseudolines[lwh]:"+pseudolines[lwh]);
			}
		}
		//lines[x] fängt jetzt mit ul an:
		if(lines[x].substring(0,1)=="*"){
			this.perror.push(new parsererror(x,1,lines[x].length-1,"list","missing space after *"));
		}
		//numeric list
		if(lines[x].search(/[0-9]+\.\s/)==0){
			var start=lines[x].substring(0,lines[x].indexOf("."));
			var starttext = "<ol";
			if(start>0)starttext+=' start="'+start+'"';
			starttext +=">";
			this.map.addElement({line:x,pos:0,html:starttext,mdcode:"",typ:"start",wystextveraenderung:0});
			nlc=x;
			//var laengebiszeileglc = laengebiszeile;

			while(nlc <lines.length && lines[nlc].search(/[0-9]+\.\s/)==0){
				//if(this.insertedhtmlinline[nlc]==null)this.insertedhtmlinline[nlc]=new Array();
				//this.insertedhtmlinline[nlc].push(new Array(0,lines[nlc].substring(0,lines[nlc].indexOf(". ")+2),"<li>"));
				var tmpmdcode = lines[nlc].substring(0,lines[nlc].indexOf(". ")+2);
				this.map.addElement({line:nlc,pos:0,html:"<li>",mdcode:tmpmdcode,
				typ:"start",wystextveraenderung:tmpmdcode.length});
				//this.veraenderungen.push(new Array("ul",laengebiszeileglc,lines[nlc].indexOf(". ")+2));
				//laengebiszeileglc += lines[nlc].length;
				lines[nlc] = "<li>"+lines[nlc].substring(lines[nlc].indexOf(". ")+2)+"</li>";
				nlc++;
			}
			nlc--;

			lines[x] = starttext + lines[x];
			//if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x] = new Array();
			//this.insertedhtmlinline[x].unshift(new Array(0,"",starttext)); //packe den ol-tag an die spitze des arrays um reihenfolge zu wahren
			//wird oben bereits getan
			lines[nlc]+= "</ol>";
			letztezeile=nlc;
			for(var lwh=x;lwh<=letztezeile;lwh++)this.lineswithhtml[lwh]="ol";
		}
		//lines[x]fängt jetzt mti <ol> an
		if(lines[x].search(/[0-9]/)==0){
			this.perror.push(new parsererror(x,1,lines[x].length,"numeric list","dot and/or whitespace missing"));
		}
		//quotes
		if(linestart==">" && !(lines[x].substring(0,2)=="> ")){
		this.errorlines[x] = '<span class="error quotes">'+lines[x]+'</span>  ';
		this.errorsourcelines[x] = '<span class="error">'+lines[x]+'</span>  ';
		this.perror.push(new parsererror(x,1,lines[x].length,"quotes","missing space after >"));
		}
		if(lines[x].substring(0,2)=="> "){
			qlc=x;
			console.log("quote gefunden: "+lines[qlc]);
			//console.log("wasn los? qlc="+qlc+" lines-länge:"+lines.length + "lines[qlc]="+lines[qlc]);
			//var laengebiszeileglc = laengebiszeile;
			while(qlc<lines.length && lines[qlc].substring(0,2)=="> " ){ //}&& confirm("weiter in line?"+qlc+"llenght:"+lines.length)){
				lines[qlc] = lines[qlc].substring(2);
				//this.veraenderungen.push(new Array("quote",laengebiszeileglc,2));
				//laengebiszeileglc += lines[qlc].length;
				qlc++;
			}
			//if(confirm("abbrechen?"))break;
			//console.log("quote gefunden von"+x+" bis:"+qlc)
			qlc--;
			lines[x]="<quote>"+lines[x];
			if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
			//this.insertedhtmlinline[x].push(new Array(0,"> ","<quote>"));
			this.map.addElement({line:x,pos:0,html:"<quote>",mdcode:"> ",typ:"start",wystextveraenderung:2});

			for(var ql=x;ql<qlc;ql++)lines[ql]+="<br>";
			//console.log("quotes br-tags abgeschlossen");
			//if(this.insertedhtmlinline[qlc]==null)this.insertedhtmlinline[qlc]=new Array();
			//this.insertedhtmlinline[qlc].push(new Array(lines[qlc].length,"","</quote>"));
			lines[qlc]+="</quote>";
			for(var qil=x+1;qil<=qlc;qil++){
				//if(this.insertedhtmlinline[qil]==null)this.insertedhtmlinline[qil]=new Array();
				//this.insertedhtmlinline[qil].push(new Array(0,"> ",""));
				this.map.addElement({line:qil,pos:0,html:"",mdcode:"> ",typ:"start",wystextveraenderung:2});
			}
			letztezeile = qlc;
			for(var lwh=x;lwh<=letztezeile;lwh++)this.lineswithhtml[lwh]="quote";
		}//lines[x] fängt jetzt mit <quote> an

		// codeblock
		//alert(lines[x].substring(0,3));
		if(lines[x].length>2 && lines[x].substring(0,3)=="```"){
			var codeende=x+1;
			var scanweiter=true;
			while(codeende<lines.length && scanweiter)	if(lines[codeende].substring(0,3)=="```")scanweiter=false;else codeende++;
			if(codeende==lines.length || lines[codeende].substring(0,3)!="```"){
				this.perror.push(new parsererror(x,0,lines[x].length-1,"code","missing endsymbol ```"));
				this.errorlines[x]='<span class="error">'+lines[x]+'</span>  ';
				this.errorsourcelines[x]='<span class="error">'+lines[x]+'</span>';
			}else {
				var altelinie=lines[x];
				var altelinieende=lines[codeende];
				lines[x]="<code>";
				for(var codez=x+1;codez<codeende;codez++){
					lines[codez]=this.sanitizeemdcodeline(lines[codez]);
					var hotpositions = this.sanitizedcodepositions(lines[codez]);
					for(var hotp=0;hotp<hotpositions.length;hotp++){
						//if(hotpositions[hotp][1]!="&lt;")
						//this.insertedhtmlinline[codez].push(new Array(hotpositions[hotp][0], "&",hotpositions[hotp][1]));
						this.map.addElement({line:codez,pos:hotpositions[hotp][0],html:hotpositions[hotp][1],mdcode:"&",typ:"hotcode",wystextveraenderung:0});
					}
				}
				lines[codeende]="</code>";
				//console.log("code-lines sanitized:"+lines[x+1]+lines[x+2]);
				for(var lwh=x;lwh<=codeende;lwh++)this.lineswithhtml[lwh]="code";
				//insertedhtmlinline:
				//this.insertedhtmlinline[x].push(new Array(0,altelinie,"<code>"));
				//this.insertedhtmlinline[codeende].push(new Array(0,altelinieende,"</code>"));
				this.map.addElement({line:x,pos:0,html:"<code>",mdcode:altelinie,typ:"start",wystextveraenderung:altelinie.length});
				this.map.addElement({line:codeende,pos:0,html:"</code>",mdcode:altelinieende,typ:"start",wystextveraenderung:altelinieende.length});
				//for(var cil=x+1;cil<codeende;cil++)this.insertedhtmlinline[cil].push(new Array(lines[cil].length,"\n","\n"));

			}
		}//lines[x] fängt jetzt mit <code> an
		//image:
		if(lines[x].indexOf("![](")>-1){
			var error="";
			var imgaktpos=0;
			var pseudozeile=pseudolines[x];
			while(lines[x].indexOf("![](", imgaktpos)>-1){ //können ja mehrere sein
				var imgpos =lines[x].indexOf("![](");
				var imgposend = lines[x].indexOf(")",imgpos);
				if(imgposend==-1){
					this.perror.push(new parsererror(x,imgaktpos,lines[x].length-1,"image","missing endsymbol )"));//
					error="imgende";
				}
				imgaktpos=imgpos+4;
				var imgurl = lines[x].substring(imgpos+4,imgposend);
				//if-abfrage ob img unter url existiert, sonst fehler
				var imghtml = '<img src="'+imgurl+'">';
				if(error.length==0){
					lines[x] = lines[x].substring(0,imgpos)+imghtml+lines[x].substring(imgposend+1);
					if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
					//this.insertedhtmlinline[x].push(new Array(pseudozeile.indexOf("![]("),"![]("+imgurl+")",imghtml));
					this.map.addElement({line:x,pos:pseudozeile.indexOf("![]("),html:imghtml,mdcode:"![]("+imgurl+")",typ:"image",wystextveraenderung:5+imgurl.length});
					//this.veraenderungen.push(new Array("image",laengebiszeile+imgpos,imgposend-imgpos));

					pseudozeile = pseudozeile.substring(0,pseudozeile.indexOf("![]("))+"€€€€"+pseudozeile.substring(pseudozeile.indexOf("![]("+4));
				}else {
					//alert(error);
					//lines[x]=lines[x].substring(0,imgpos)+lines[x].substring(imgpos+4);

					this.errorlines[x]='<span class="error">'+lines[x]+'</span>  ';
					this.errorsourcelines[x]='<span class="error">'+lines[x]+'</span>';
				}
			}
		}
		//link:
		//if(lines[x].indexOf("](")>0){
		var linkpos = 0;
		var pseudozeile=pseudolines[x];
		while(lines[x].indexOf("](",linkpos)>0){
			//muss vergrößert werden auf mehrere links pro zeile
			//var neuelinkpos = lines[x].indexOf("](",linkpos+3);
			//alert("linkpos:"+linkpos+lines[x].substring(linkpos)+"neue linkpos"+lines[x].indexOf("](",linkpos)+"\n"+lines[x].substring(neuelinkpos));
			var linktextstartsymbol=lines[x].indexOf("[");
			var error=this.perror.length;
			if( linktextstartsymbol==-1)this.perror.push(new parsererror(x,0,lines[x].length-1,"link","missing startsymbol ("));//error="linkstartsymbol";
				else	var linktextendsymbol=lines[x].indexOf("](",linktextstartsymbol);
			var linkurlstart=linktextendsymbol+2;
			var linkurlend = lines[x].indexOf(")",linkurlstart);
			if(linkurlend == -1)this.perror.push(new parsererror(x,0,lines[x].length-1,"link","missing endsymbol )"));//error="linkurlendsymbol";
			if(this.perror.length==error){
				var linktext = lines[x].substring(linktextstartsymbol+1,linktextendsymbol);
				var linkurl = lines[x].substring(linkurlstart,linkurlend);
				//alert(linkurl+"???"+linkurlstart+"/"+linkurlend+lines[x].substring(linkurlstart,linkurlend)+"\n"+linktext);
				var lineanfang =lines[x].substring(0,linktextstartsymbol);
				var lineende = lines[x].substring(linkurlend+1);
				lines[x]=lineanfang+ '<a href="'+linkurl+'">'+linktext+'</a>'+lineende;
				var pseudoanf = pseudozeile.indexOf("[");
				var pseudoend = pseudozeile.indexOf(")");
				var pseudomitte = pseudozeile.indexOf("](");

				if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x] = new Array();
				//this.insertedhtmlinline[x].push(new Array(pseudoanf,pseudozeile.substring(pseudoanf,pseudoend+1),'<a href="'+linkurl+'">'+linktext+'</a>'));
				var tmplinktext = pseudozeile.substring(pseudoanf+1,pseudomitte);
				var tmphtml = '<a href="'+linkurl+'">'+tmplinktext+'</a>';
				var tmpmdcode = sourcelines[x].substring(pseudoanf,pseudoend+1);
				console.log("tmpmdcode:"+tmpmdcode + "sourceline:"+sourcelines[x]);
				this.map.addElement({line:x,pos:pseudoanf,html:tmphtml,mdcode:tmpmdcode,
					typ:"link",
					wystextveraenderung:tmpmdcode.length-tmplinktext.length,
					linkurl:linkurl, linktext:linktext});
				//this.veraenderungen.push(new Array("link",laengebiszeile+linktextstartsymbol,linkurl.length+4));
				pseudozeile=pseudozeile.substring(0,pseudoanf)+"€"+pseudozeile.substring(pseudoanf+1,pseudomitte)+"€€"
							+pseudozeile.substring(pseudomitte+2,pseudoend)+"€"+pseudozeile.substring(pseudoend+1);

			}else{
				this.errorlines[x]=lines[x].substring(0,lines[x].indexOf("]("))+'<span class="error">'+lines[x].substring(lines[x].indexOf("]("))+'</span>';
				this.errorsourcelines[x]=lines[x].substring(0,lines[x].indexOf("]("))+'<span class="error">'+lines[x].substring(lines[x].indexOf("]("))+'</span>';
				 //alert(this.perror[this.perror.length-1].errortext);
				linkpos=lines[x].indexOf("](",linkpos)+3;
			}
		}//ende link
		//page-break
		if(lines[x].indexOf("-----")==0){
			if(lines[x].length>5){
				var pagebreakcheck = lines[x].substring(5);
				var pagebreakonlyminus = true;
				while(pagebreakcheck.length>0 && pagebreakonlyminus){
					if(pagebreakcheck.substring(0,1)!="-")pagebreakonlyminus=false;
					pagebreakcheck = pagebreakcheck.substring(1);
				}
				if(pagebreakonlyminus){
					this.lineswithhtml[x] = "pagebreak";
					//this.insertedhtmlinline[x].push(new Array(0,lines[x],"<hr>"));
					this.map.addElement({line:x,pos:0,html:"<hr>",mdcode:lines[x],typ:"pagebreak",wystextveraenderung:lines[x].length});
					//this.insertedhtmlinline[x].push(new Array(5,lines[x].substring(5),""));
					lines[x]="<hr>";
				}
			}else{
				lines[x]="<hr>";
				this.lineswithhtml[x] = "pagebreak";
				this.insertedhtmlinline[x].push(new Array(0,"-----","<hr>"));
				this.map.addElement({line:x,pos:0,html:"<hr>",mdcode:"-----",typ:"pagebreak",wystextveraenderung:5});

			}

		}//page-break ist jetzt eingefügt
		//inline code:
		if(lines[x].indexOf("`")>-1){
			var codepos =0;
			while(codepos<lines[x].length && lines[x].indexOf("`", codepos)>-1){
					// &&confirm("inlinecode"+codepos+" linex.length:"+lines[x].length + "\n" + lines[x]		)){
				var codestart = lines[x].indexOf("`",codepos);
				//console.log("codepos:"+codepos+"codestart:"+codestart);
				var codeend = -1;
				if(codestart < lines[x].length-2)codeend = lines[x].indexOf("`",codestart+2);
				//console.log("codeend:"+codeend);
				if(codeend == -1){
					this.perror.push(new parsererror(x,codepos,lines[x].length-1,"inlinecode","missing endsymbol `"));
					codepos = lines[x].length; //es macht keinen sinn weiter zu suchen
					//console.log("inlinecodeerror neue codepos:"+codepos);
				}else{
					//alert(codestart+","+codeend+":"+lines[x].substring(codestart,codeend));
					//codeummantelung vor weiterem parsen schützen
					var softcode = this.sanitizeemdcodeline(lines[x].substring(codestart+1,codeend));
					lines[x]=lines[x].substring(0,codestart)+"<code>"+softcode+"</code>"+lines[x].substring(codeend+1);
					//wysiwyg: position merken
					var textareacodestart = pseudolines[x].indexOf("`");
					var textareacodeend = pseudolines[x].indexOf("`",textareacodestart+2);
					var hotcode = pseudolines[x].substring(textareacodestart+1,textareacodeend);
					if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
					this.insertedhtmlinline[x].push(new Array(textareacodestart,"`","<code>"));
					this.map.addElement({line:x,pos:textareacodestart,html:"<code>",mdcode:"`",typ:"start",wystextveraenderung:1});
					//this.insertedhtmlinline[x].push(new Array(textareacodestart,"`"+hotcode+"`","<code>"+softcode+"</code>"));
					this.insertedhtmlinline[x].push(new Array(textareacodeend,"`","</code>"));
					this.map.addElement({line:x,pos:textareacodeend,html:"</code>",mdcode:"`",typ:"end",wystextveraenderung:1});
					var hotpositions = this.sanitizedcodepositions(softcode);
					for(var hotp=0;hotp<hotpositions.length;hotp++){
						if(hotpositions[hotp][1]!="&lt;")
						//this.insertedhtmlinline[x].push(new Array(codestart+1+hotpositions[hotp][0], "&",hotpositions[hotp][1]));
						this.map.addElement({line:x,pos:codestart+1+hotpositions[hotp][0],html:hotpositions[hotp][1],mdcode:"&",typ:"hotcode",wystextveraenderung:0});
					}
					//auch für einfache zeichen vor codeummantelung schützen:

					var oldsymbol = new Array("*", "<",">","~","[","]","(",")","|","-","_");
//					var newsymbol = new Array("&lowast;","&lt;","&gt;","&tilde;","&#91;","&#93;","&#40;","&#41;","&#124;","&#45;");
					for(var sym=0;sym<oldsymbol.length;sym++)hotcode = this.replace(hotcode,oldsymbol[sym],"€");
					pseudolines[x]=pseudolines[x].substring(0,textareacodestart)+hotcode+pseudolines[x].substring(textareacodeend+1);
					//console.log("inlinecode abgeschlossen");
					codepos=codeend+1; //suche nach dem endzeichen weiter

				}
			}
			}//ende inlinecode
		//for(var testx=0;testx<this.lineswithhtml.length;testx++)
				//console.log(testx + "- " +this.lineswithhtml[testx]);


		//if(letztezeile>x)x=letztezeile; //scan nach letzter zeile des gefundenen weiter - funktioniert irgendwie nicht
		//dadurch tritt dreifache fehlerausgabe bei tabelle auf, aber ist nicht so schlimm, markiert halt jede tabellenzeile ;)
		//darf auch nicht mehr weil sonst img und link untergehen. wenn also erwünscht ist dann muss link und img erneut gescannt werden
	}//for lines[x]
		//ansatz für einfache parselemente per zeile:
		console.log("zeilendurchlauf beendet. starte einfache parseelemente. pseudolines:");
		console.log(pseudolines);
	for(var x=0;x<lines.length;x++){
		for(var pare=0;pare<this.parseelemente.length;pare++){
					var pestart=lines[x].indexOf(this.parseelemente[pare].emdstart);
					//var peend = lines[x].indexOf(this.parseelemente[pare].emdend,pestart+1);
					var peend = lines[x].indexOf(this.parseelemente[pare].emdend,pestart+this.parseelemente[pare].emdstart.length);
					var aktppos = 0;
					var mline=-1;
					while(pestart>-1){
						//parseelement wurde gefunden, suche nach endzeichen
						if(peend<=pestart){
							//kein endzeichen gefunden, suche in nächster zeile fortsetzen?
							//zur erinnerung codes: text==null momentan, table, pagebreak, code, h1, ul, ol, quote
							//stimmt nicht: näxte line ist noch nicht gescannt - nur für tables, code, ul, ol und quote stimmt das, nicht für h und pagebreak
							//multiline erlaubt in text/null, quote - erstmal ohne quote, weil sonst über beginnenden quote hinaus gesucht wird:
							//console.log(this.parseelemente[pare].nombre+" gefunden in line" + x +", pos "+pestart
								//		+"lineswithhtml:"+this.lineswithhtml[x] + "next line:" + this.lineswithhtml[x+1]
									//	+this.lines.length	);
							if(this.lineswithhtml[x]==null && this.lineswithhtml[x+1]==null && x<this.lines.length-1){
								//multiline-suche: suche auf nächste zeilen ausdehnen
								//console.log("multiline-search für textblock startet");
									mline = x+1;
									while(this.lineswithhtml[mline]==null
											&& lines[mline].indexOf(this.parseelemente[pare].emdend)==-1
											&& mline<lines.length-1
											&& lines[mline].substring(0,5)!="-----" //pagebreak ist abbruchsignal
											&& lines[mline].substring(0,1)!="#"  //titel ebenfalls
											){
										mline++;
									}

									//mline ist jetzt entweder die line wo ein treffer erwartet wird oder die nächste line mit html-code oder letzte linie
									var anf = (lines[mline].substring(0,1)!="#" && lines[mline].substring(0,5)!="-----" && this.lineswithhtml[mline]==null);
									if(!anf)mline--;
									//if(this.lineswithhtml[mline]!=null && mline>0)mline--;
									//console.log("mline ist auf "+mline + "-> " +lines[mline].substring(0,5)+"anf:"+anf);
									if(this.lineswithhtml[mline]==null)peend = lines[mline].indexOf(this.parseelemente[pare].emdend);


							}
							if(this.lineswithhtml[x]=="quote" && x+1<lines.length){
									mline=x;
									while(this.lineswithhtml[mline]==null && lines[mline].indexOf(this.parseelemente[pare].emdend)==-1 && mline<lines.length-1){
										mline++;
									}
									if(this.lineswithhtml[mline]=="quote")peend = lines[mline].indexOf(this.parseelemente[pare].emdend);
							}


						}
						if(peend==pestart+1  && (this.parseelemente[pare].emdstart=="*" || this.parseelemente[pare].emdstart=="_")){
							//doppelsternchen und doppel__ und trippel leider noch nicht - das muss doch einfacher gehen. *** ___
							//|| lines[x].substring(pestart-1,1)==lines[x].substring(pestart,1))
							pestart=peend;

						}else if(mline==-1 && peend>=pestart+this.parseelemente[pare].emdstart.length ){
							//endzeichen wurde gefunden

							//ersetzen durch html zeichen:
							lines[x] = lines[x].substring(0,pestart)+this.parseelemente[pare].htmlstart
										+ lines[x].substring(pestart+this.parseelemente[pare].emdstart.length, peend)
										+ this.parseelemente[pare].htmlend + lines[x].substring(peend+this.parseelemente[pare].emdend.length);
							//positionsbestimmung für wysiwyg:
							console.log("pseudolines["+x+"] ="+pseudolines[x]);
							var posanf = pseudolines[x].indexOf(this.parseelemente[pare].emdstart);
							var posend = pseudolines[x].indexOf(this.parseelemente[pare].emdend,
																pseudolines[x].indexOf(this.parseelemente[pare].emdstart)
																+this.parseelemente[pare].emdstart.length);
							if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
							var insertanf = new Array(posanf, this.parseelemente[pare].emdstart, this.parseelemente[pare].htmlstart);
							var insertend = new Array(posend, this.parseelemente[pare].emdend, this.parseelemente[pare].htmlend);
							insertanf[3] = {line:x , position:posend, emdcode:this.parseelemente[pare].emdend, htmlcode:this.parseelemente[pare].htmlend}; //insertend;
							insertend[3] = {line:x, position:posanf, emdcode:this.parseelemente[pare].emdstart, htmlcode:this.parseelemente[pare].htmlstart};//insertanf;
							this.insertedhtmlinline[x].push(insertanf);
							this.insertedhtmlinline[x].push(insertend);
							var elemanf = {line:x, pos:posanf, mdcode:this.parseelemente[pare].emdstart, html:this.parseelemente[pare].htmlstart, typ:"start", wystextveraenderung:this.parseelemente[pare].emdstart.length};
							var elemend = {line:x, pos:posend, mdcode:this.parseelemente[pare].emdend, html:this.parseelemente[pare].htmlend, typ:"end", wystextveraenderung:this.parseelemente[pare].emdend.length};
							elemanf.brotherelement = elemend;
							elemend.brotherelement = elemanf;
							//this.map.addElement({line:x,pos:textareacodestart,html:"<code>",mdcode:"`",typ:"start",wystextveraenderung:1});
							this.map.addElement(elemanf);
							this.map.addElement(elemend);
							//this.insertedhtmlinline[x].push(new Array(posanf, this.parseelemente[pare].emdstart, this.parseelemente[pare].htmlstart));
							//this.insertedhtmlinline[x].push(new Array(posend, this.parseelemente[pare].emdend, this.parseelemente[pare].htmlend));
							//this.veraenderungen.push(new Array(this.parseelemente[pare].emdstart,laengebiszeile+posanf,this.parseelemente[pare].emdstart.length));
							//this.veraenderungen.push(new Array(this.parseelemente[pare].emdend,laengebiszeile+posend,this.parseelemente[pare].emdend.length));
							var ersatzanf = "";
							var ersatzend = "";
							for(eax=0;eax<this.parseelemente[pare].emdstart.length;eax++)ersatzanf+="€";
							for(eax=0;eax<this.parseelemente[pare].emdend.length;eax++)ersatzend+="€";
							console.log(this.parseelemente[pare].emdstart + " wird zu "+ersatzanf);
							pseudolines[x] = pseudolines[x].substring(0,posanf)+ersatzanf
											+pseudolines[x].substring(posanf+ersatzanf.length,posend)
											+ersatzend
											+pseudolines[x].substring(posend+ersatzend.length);
							console.log("pseudoline[x]"+pseudolines[x]);
							console.log("pseudoline-end");
						}else if(peend>-1 && pestart>-1 && mline>-1){
							//endzeichen in multiline gefunden:
							lines[x]= lines[x].substring(0,pestart)+this.parseelemente[pare].htmlstart
										+ lines[x].substring(pestart+this.parseelemente[pare].emdstart.length);
							lines[mline]=lines[mline].substring(0,peend)+this.parseelemente[pare].htmlend
										+ lines[mline].substring(peend+this.parseelemente[pare].emdend.length);
							if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
							//positionsbestimmung für wysiwyg:
							var posanf = pseudolines[x].indexOf(this.parseelemente[pare].emdstart);
							var posend = pseudolines[mline].indexOf(this.parseelemente[pare].emdend);
							if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
							if(this.insertedhtmlinline[mline]==null)this.insertedhtmlinline[mline]=new Array();
							var insanf = new Array(posanf, this.parseelemente[pare].emdstart, this.parseelemente[pare].htmlstart);
							var insend = new Array(posend, this.parseelemente[pare].emdend, this.parseelemente[pare].htmlend);
							insanf[3] = {line:mline, position:posend, emdcode:this.parseelemente[pare].emdend, htmlcode:this.parseelemente[pare].htmlend};//insend;
							insend[3] = {line:x, position:posanf, emdcode:this.parseelemente[pare].emdstart, htmlcode:this.parseelemente[pare].htmlstart};//insanf;
							this.insertedhtmlinline[x].push(insanf);
							this.insertedhtmlinline[mline].push(insend);
							var elemanf = {line:x, pos:posanf, mdcode:this.parseelemente[pare].emdstart, html:this.parseelemente[pare].htmlstart, typ:"start", wystextveraenderung:this.parseelemente[pare].emdstart.length};
							var elemend = {line:mline, pos:posend, mdcode:this.parseelemente[pare].emdend, html:this.parseelemente[pare].htmlend, typ:"end", wystextveraenderung:this.parseelemente[pare].emdend.length};
							elemanf.brotherelement = elemend;
							elemend.brotherelement = elemanf;
							//this.map.addElement({line:x,pos:textareacodestart,html:"<code>",mdcode:"`",typ:"start",wystextveraenderung:1});
							this.map.addElement(elemanf);
							this.map.addElement(elemend);
							//this.insertedhtmlinline[x].push(new Array(posanf, this.parseelemente[pare].emdstart, this.parseelemente[pare].htmlstart));
							//this.insertedhtmlinline[mline].push(new Array(posend, this.parseelemente[pare].emdend, this.parseelemente[pare].htmlend));
							//this.veraenderungen.push(new Array(this.parseelemente[pare].emdstart,laengebiszeile+posanf,this.parseelemente[pare].emdstart.length));
							//var laengebismultizeile = laengebiszeile;
							//for(var lbmz=x;lbmz<mline;lbmz++)laengebismultizeile+=lines[lbmz].length;
							//this.veraenderungen.push(new Array(this.parseelemente[pare].emdend,laengebismultizeile+posend,this.parseelemente[pare].emdend.length));
							var ersatzanf = "";
							var ersatzend = "";
							for(eax=0;eax<this.parseelemente[pare].emdstart.length;eax++)ersatzanf+="€";
							for(eax=0;eax<this.parseelemente[pare].emdend.length;eax++)ersatzend+="€";
							pseudolines[x] = pseudolines[x].substring(0,posanf)+ersatzanf+pseudolines[x].substring(posanf+ersatzanf.length);
							pseudolines[mline] = pseudolines[mline].substring(0,posend)
											+ersatzend+pseudolines[mline].substring(posend+ersatzend.length);
						}else{
							//kein endzeichen gefunden
							this.perror.push(new parsererror(x,pestart,lines[x].length-1,this.parseelemente[pare].nombre,
																"missing endsymbol "+this.parseelemente[pare].emdend, this.parseelemente[pare]));
							if(mline>-1)this.perror.push(new parsererror(mline,0,lines[mline].length-1,this.parseelemente[pare].nombre,
																			"missing endsymbol "+this.parseelemente[pare].emdend));
						}
					//while schleife ist durchgelaufen:
					aktppos = pestart+1;
					pestart=lines[x].indexOf(this.parseelemente[pare].emdstart,aktppos);
					peend = lines[x].indexOf(this.parseelemente[pare].emdend,pestart+1);

					}
		}
	} //ende ansatz zeilendurchlaufen
	//this.parsewysiwyghtml();
	//
	console.log(this.lineswithhtml);
	for(var lwh=0;lwh<lines.length;lwh++){
		if(this.lineswithhtml[lwh]==null){
			console.log("text nach lwh"+lwh);
			this.lineswithhtml[lwh]="text";
			//lines[lwh]='<div class="text">'+lines[lwh];
			lines[lwh]='<p>'+lines[lwh];
			if(this.insertedhtmlinline[lwh]==null)this.insertedhtmlinline=new Array();
			this.insertedhtmlinline[lwh].push(new Array(0,"","<p>"));
			this.map.addElement({line:lwh, pos:0, html:"<p>", mdcode:"", typ:"start", wystextveraenderung:0});
			var followlines=lwh+1;
			console.log("lineswithhtmllength:"+this.lineswithhtml.length);
				while(this.lineswithhtml[followlines]==null && followlines<lines.length){
					this.lineswithhtml[followlines]="text";
					followlines++;
					console.log("fll++");
				}
			followlines--; //followlines geht jetzt bis zur letzten zeile
			console.log("lwh->followlines"+lwh+" -> "+followlines);
			//lines[followlines]+="</div>";
			if(this.insertedhtmlinline[followlines]==null)this.insertedhtmlinline[followlines]=new Array();
			//this.insertedhtmlinline[followlines].push(new Array(lines[followlines].length,"","</p>"));
			this.map.addElement({line:followlines, pos:lines[followlines].length, html:"</p>", mdcode:"", typ:"end", wystextveraenderung:0});
			lines[followlines]+="</p>";

			if(lwh==followlines && lines[lwh]==''){
				lines[lwh]="";
				//this.lineswithhtml[lwh]="leerzeile";
			}
		}
	}
	//alert(this.lineswithhtml.toString());
	//lineswithhtml ist jetzt gefüttert mit jeder zeile
	//fehlende zeilenumbrüche in html-blöcken text und code einsetzen:
	var temptext ="";
	for(var lx=0;lx<lines.length;lx++){
		temptext +=lines[lx];
		//if(lines[lx].indexOf(">",lines[lx].length-2)==-1 && lines[lx].substring(0,5)!="-----")temptext+="<br>";
		if(this.lineswithhtml[lx]=="text" && lines[lx].indexOf("</p>")==-1 && lx<lines.length-1)temptext+="<br>";
		if(this.lineswithhtml[lx]=="code"&& lx<lines.length-1)temptext+="<br>";
		//if(this.lineswithhtml[x]=="text")alert(lines[x]+lines[x].indexOf("</div>"));
		//alert(this.lineswithhtml[x]);
		if(lx<lines.length-1)temptext +="\n";

	}
	this.parsedcode=temptext;
	//temptext müsste jetzt komplett emded nach html geparsed sein:
	this.parsedcode = temptext;
	this.parselines(temptext); //lines mit neu zugefügtem html einlesen

}
/*	*stylepager: objekt mit einem muster, nach welchem die page per zeile geparst wird und mit zusätzlichem html und/oder klassen versehen wird
	* braucht beim erstellen muster nach dem gescannt werden kann -> array mit zeilenelement-code: text, table, ul, li, head usw.
	* start: htmlcodestarttag, end: htmlcodeendtag
*/

function stylepager(muster, start, end){
	this.muster = muster;
	this.starthtml = start;
	this.endhtml = end;
}
/* stylepager.find(pagetaglines,startline):
 * sucht nach muster des jeweiligen stylepagers in den pagetaglines
 * returns array mit anfangszeile und endzeile des gefundenen musters, -1 bedeutet kein treffer gefunden
*/

stylepager.prototype.find = function(pagetaglines, startline){
	if(pagetaglines==null)pagetaglines = new Array();
	var found=false;
	var foundstartpos=-1;
	var foundendpos = -1;
	var musterpos=0;
	var pseudonodestructure = new Array(); //shortened array of [tagline][startlinenr in orig][endlinenr in orig] to sort through
	var aktcode = "";
	//alert(pagetaglines.toString());
	//console.log("pagetaglinesanzahl: "+pagetaglines.length);
	for(var y=startline;y<pagetaglines.length;y++){
		if(pagetaglines[y]!=aktcode){
			//if(pseudonodestructure.length>0 && y>startline && pseudonodestructure[y-startline-1] != null)pseudonodestructure[y-startline-1][2]=y-1;
			pseudonodestructure.push(new Array(pagetaglines[y],y,y));
			aktcode = pagetaglines[y];
		}
		if(pagetaglines[y]==aktcode && pseudonodestructure.length>0)pseudonodestructure[pseudonodestructure.length-1][2]=y;
	}
	//console.log("pseudonodestructure:"+pseudonodestructure.toString());
	if(pseudonodestructure.length>0)pseudonodestructure[pseudonodestructure.length -1][2]=pagetaglines.length-1;
	for(var x=0;x<pseudonodestructure.length;x++){
		if(musterpos<this.muster.length && pseudonodestructure[x][0]==this.muster[musterpos]){
			if(musterpos==0)foundstartpos=pseudonodestructure[x][1];
			if(musterpos==this.muster.length-1)foundendpos = pseudonodestructure[x][2];
			musterpos++;
			found=true;
		}else{
			if(musterpos>0 && musterpos<this.muster.length){
				found=false;
				//musterpos=this.muster.length; //suche abbrechen, da muster nicht gefunden wurde? oder neu beginnen?
				musterpos = 0; //lieber neu beginnen? muster könnte ja noch auftauchen. bspw. überschrift - überschrift>aufzählung>überschrift>aufzählung
				//neu prüfen, ob mit muster[0] getroffen wird. sonst wird in dieser zeile nicht geguckt:
				if(pseudonodestructure[x][0]==this.muster[musterpos]){
					foundstartpos=pseudonodestructure[x][1];
					musterpos++;
					found=true;
				}
			}
		}

	}
	if(musterpos<this.muster.length)found=false; //muster nicht bis zum ende prüfen können
	if(foundendpos<foundstartpos)found=false; //kein ende gefunden, eigentlich das selbe wie oben oder?
	if(found)console.log("muster "+ this.muster+" found at:"+foundstartpos+","+foundendpos)
	//if(found)return [foundstartpos,foundendpos]; else return [-1,-1];
	//besser objektorientiert:
	if(found)return {start:foundstartpos, end:foundendpos}; else return {start:-1,end:-1};
}
/* stylepager.encapsuleHtml(pagelines, pagetaglines)
 * sucht in den pagelines mittels der find-methode (s.o.) nach dem muster des styles und ummantelt diese mit dem html-code des styles
 * erwartet: pagelines: array mit text-strings, pagetaglines: array mit parse-code-zeilen (ul,ol,text,table, usw. )
 * gibt array mit pagelines zurück
*/

stylepager.prototype.encapsuleHtml = function(pagelines,pagetaglines){
	//alert(pagetaglines.toString());
	//console.log("encapsulehtml pagetaglines-length:"+pagetaglines.length);
	var startend = this.find(pagetaglines,0);
	//console.log("startend:"+startend);
	//alert(pagetaglines.toString() + "\n" +startend.toString());
	//alert(pagetaglines==null);
	var aktline=0;
	//while(startend[0]>-1&&startend[1]>-1){
	while(startend.start>-1&&startend.end>-1){
	//if(startend[0]>-1&&startend[1]>-1){
		console.log("encapsulehtml treffer:"+this.starthtml + " on line"+ startend.start);
		pagelines[startend.start]=this.starthtml + pagelines[startend.start];
		pagelines[startend.end]+=this.endhtml;
		aktline=startend.end+1;
		startend = this.find(pagetaglines,aktline);
	}
	return pagelines;

}

/* Pagegenerator-Objekt
 * Pagegenerator ist für das Erstellen und Steuern der Präsentation aus geparstem EMD-Code zuständig.
 * Pagegenerator wird NICHT jedesmal neu erschaffen, sondern es gibt nur EINEN pagegenerator auf der Seite (momentaner name: presentation)
 * Über die init() - Funktion können Werte neu gesetzt und eingelesen werden
 * Über die addTheme() - Funktion können dem Pagegenerator neue Themes zugewiesen werden
 * Braucht: emdparsobjekt vom typ emdparser, ausgabediv: ein HTML-Objekt, in welches die Präsentation eingefügt wird
*/

function pagegenerator(emdparsobjekt, ausgabediv){
	this.sourcecode = emdparsobjekt.parsedcode;
	this.emdparsobjekt = emdparsobjekt;
	this.pages = new Array(); //strings with ready-for-output-pages parsed by pagebreak
	this.pagesperline = emdparsobjekt.returnparsedlines(this.sourcecode);
	this.pagestaggedlines = new Array();
	this.presentation = ausgabediv; //actual div-objekt which contains the presentation
	this.htmlstart = '<div class="presentation">';
	this.htmlend = "</div>";
	this.pagestart = '<div class="ppage">';
	this.pageend = '</div>';
	this.aktpage = 0;
	this.presentationhtml;
	this.pagestyles = new Array(); //array of stylepagers
	this.themes = new Array(); //array of theme-names/strings
	this.jsfilepath = "themes/";
	this.cssfilepath = "themes/";
	//scan den sourcecode in pages:
		/*dirty and quick:
	var aktpos=0;
	while(this.sourcecode.indexOf("<hr>",aktpos)>-1){
		this.pages.push(this.sourcecode.substring(aktpos,this.sourcecode.indexOf("<hr>",aktpos)));
		aktpos=this.sourcecode.indexOf("<hr>",aktpos)+4;
	}
	this.pages.push(this.sourcecode.substring(aktpos));
	*/
	//pages ist jetzt mit html gefüttert
	//pagestaggedlines füttern:
	//pages enthält html inkl. \n's nach denen weiter gescannt werden kann, allerdings fehlen die hr-zeilen.
	//daher erneutes scannen wie oben nur mit lines:
	this.init();
	//Grundthemes laden:
	this.loadTheme("emdcode");
	this.loadTheme("procontra");
	this.loadTheme("azul");
	this.loadTheme("redalert");
}
pagegenerator.prototype.init = function(emdparsobjekt, ausgabediv){
	var pagec = 0;
	//bestimmte werte neu einlesen:
	if(emdparsobjekt!=null)this.emdparsobjekt = emdparsobjekt;
	if(ausgabediv != null)this.presentation = ausgabediv; //actual div-objekt which contains the presentation
	this.sourcecode = this.emdparsobjekt.parsedcode;
	this.pages = new Array(); //strings with ready-for-output-pages parsed by pagebreak
	this.pagesperline = this.emdparsobjekt.returnparsedlines(this.sourcecode);
	this.pagestaggedlines = new Array();
	if(this.aktpage>this.pagesperline.length)this.aktpage=this.pagesperline.length-1;
	if(this.aktpage==-1)this.aktpage==0;
	var lineswithtags = new Array();
	this.sourcecode = this.emdparsobjekt.parsedcode;
	this.pagesperline = this.emdparsobjekt.returnparsedlines(this.sourcecode);
	for(var x=0;x<this.emdparsobjekt.lineswithhtml.length;x++)lineswithtags.push(this.emdparsobjekt.lineswithhtml[x]); //echte kopie der strings anlegen


	//alert("lineswithtags0:"+lineswithtags[0].toString()+" lineswithtags:"+lineswithtags.toString());
	this.pagestaggedlines.push(new Array());
	this.pagesperline = new Array();
	this.pagesperline.push(new Array());
	for(var x=0;x<lineswithtags.length;x++){
		if(lineswithtags[x]=="pagebreak"){
			pagec++;
			this.pagestaggedlines.push(new Array());
			this.pagesperline.push(new Array());
		}else {
		this.pagestaggedlines[pagec].push(lineswithtags[x]);
		if(this.pagesperline[pagec]!=null)this.pagesperline[pagec].push(this.emdparsobjekt.lines[x]);
		   else alert("pagec:"+pagec+"pagesperline.length:"+this.pagesperline.length);
		}
	}
	//this.pagestaggedlines
	//alert("ppllength:"+this.pagesperline.length+"erster inhalt:"+this.pagesperline[0].toString());
	//alert("pagestaggedlines[x]"+this.pagestaggedlines[0]+"vs pagesperline[x]"+this.pagesperline[0]);
	//alert(this.pagestaggedlines[0].toString());
	//pagesperline enthält jetzt array mit lines sortiert nach pages ohne pagebreaks
	//grundmuster erstellen um überhaupt was zu stylen
	this.pagestyles = new Array(); //pagestyles löschen
	this.pagestyles.push(new stylepager(new Array("h2","ol"),'<div class="listblock">','</div>'));
	this.pagestyles.push(new stylepager(new Array("h2","ul"),'<div class="listblock">','</div>'));
	//this.pagestyles.push(new stylepager(new Array("h2","ol","h2","ol"),'<div class="procontra">',"</div>"));
	this.pagestyles.push(new stylepager(new Array("h2","text"),'<div class="textblock">','</div>'));
	//this.pagestyles.push(new stylepager(new Array("h2","text"),'<div class="textblockliste">','</div>',"multiple")); komplexere muster erlauben: alle einschließen


}

/* Pagegenerator.finalizeHtml()
 * Erstellt den finalen HTML-Code nach Seiten und pflegt ihn ins ausgabediv ein
 + Hier finden keine Hooks statt
*/
pagegenerator.prototype.finalizeHtml = function(){
	//jetzt stylen: - findet hier nicht statt
	//this.stylePages();
	//abfrage ob presentation gesetzt ist:
	if(this.presentation==null){
		console.log("präsentation war nicht gesetzt");
		this.presentation = document.getElementById("praesentation");
	}
	//pages als ein-string-pro-page einlesen:
	this.pages = new Array();
	for(var pg=0;pg<this.pagesperline.length;pg++){
		var pagestring = "";
		for(var x=0;x<this.pagesperline[pg].length;x++)pagestring+=this.pagesperline[pg][x]+"\n";
		this.pages.push(pagestring);
	}
	//this.presentation.innerHTML = this.htmlstart+this.pages[this.aktpage]+this.htmlend;
	this.presentationhtml = this.htmlstart;
	for(var x=0;x<this.pages.length;x++)this.presentationhtml +=this.pagestart + this.pages[x] + this.pageend;

	this.presentationhtml += this.htmlend;
	this.presentation.innerHTML = this.presentationhtml;
	console.log("präsentation ins div geschrieben:"+this.presentation.innerHTML);
	this.pagedivs = document.getElementsByClassName("ppage");
	if(this.aktpage>this.pagedivs.length)this.aktpage=0;
	this.pagedivs[this.aktpage].classList.add("active");
	//alert(this.pages.toString());
}

/* pagegenerator.addStyler(muster, starthtml, endhtml)
 * erstellt ein neues pagestyle-objekt mit einem muster, starthtml-tag und endhtml-tag und fügt es dem pagestyles-array hinzu
*/

pagegenerator.prototype.addStyler = function(muster,starthtml,endhtml){
	this.pagestyles.push(new stylepager(muster,starthtml,endhtml));
	//this.stylePages();
}
// pagegenerator.resetStyler: löscht den pagestyles-array, bisher nicht verwendet
pagegenerator.prototype.resetStyler = function(){
	this.pagestyles = new Array();
}
/* pagegenerator.stylePages()
 * ist die Theming-Funktion des pagegenerators: in ihr werden
 * 1. zusätzliche styles mittels der stylepager-objekte aus dem pagegenerator.pagestyles-array ausgeführt
 * 2. zusätzliche styles aus den stylepager-objekten der Themes-Objekte ausgeführt
 * 3. durch den Aufruf von finalizeHtml das endgültige HTML-Objekt der Präsentation erstellt und ans ausgabediv übergeben
 * 4. durch den Aufruf der styleThemeSpecials()-Funktion zusätzliche Styles der jeweiligen Themes eingeführt (Hook-Funktion)
 * 5. dem Präsentations-HTML-Objekt (ausgabediv) werden die Klassen der aktivierten Themes angehängt um CSS des jew. Themes zu aktivieren
 * Hier finden Hooks statt
*/
pagegenerator.prototype.stylePages = function(){
	//alert(this.pagesperline[0].toString());
	//grundpagestyles ausführen:
	console.log("stylepages:");
	for(var x=0;x<this.pagestyles.length;x++){
		for(var pg=0;pg<this.pagesperline.length;pg++){
			//console.log("stylePages pagestaglines:"+this.pagestaggedlines);
			this.pagesperline[pg]=this.pagestyles[x].encapsuleHtml(this.pagesperline[pg], this.pagestaggedlines[pg]);
			//this.pagesperline[pg] = this.sanitizeSonderzeichen(this.pagesperline[pg]);
			//console.log("after:"+this.pagesperline[pg]);
		}
	}
	//jetzt theme-styles ausführen: (Hook)
	for(var x=0;x<this.themes.length;x++){
	if(this.themes[x].active){ //nur ausführen falls theme aktiv ist
		console.log("theme-styles von theme "+this.themes[x].classname+": "+this.themes[x].styles.length);
		console.log(this.themes[x]);
		for(var y=0;y<this.themes[x].styles.length;y++){
			if(this.themes[x].styles[y]!=null)for(var pg=0;pg<this.pagesperline.length;pg++){
				this.pagesperline[pg] = this.themes[x].styles[y].encapsuleHtml(this.pagesperline[pg],this.pagestaggedlines[pg]); //Hook-Funktion
			}
		}
	}
	}
	//html ist vorgestyled. jetzt html finalisieren:
	this.finalizeHtml();

	//jetzt special theme-styles ausführen:
	console.log(this.themes.length+" Themes");
	//console.log(document.
	for(var x=0;x<this.themes.length;x++){
		if(this.themes[x].active)this.themes[x].styleThemeSpecials(); //Hook-Funktion
	}
	//alles gestyled: klassen anhängen:
	for(var x=0;x<this.themes.length;x++){
		if(this.themes[x].active){
			this.presentation.classList.add(this.themes[x].classname);
		}else{
			this.presentation.classList.remove(this.themes[x].classname);
		}
	}
	this.presentationhtml = this.presentation.innerHTML;

}
//sanitizeSonderzeichen: war gedacht um Sonderzeichen in HTML-Code umzuwandeln. wird nicht gebraucht und ist gefährlich
pagegenerator.prototype.sanitizeSonderzeichen = function(){
	var text = this.presentationhtml;
	var sonderzeichen = new Array("ä","Ä","ö","Ö","ü","Ü");
	var sonderzeichenhtml = new Array("&auml;","&Auml;","&ouml;","&Ouml;","&uuml;","&Uuml;");
	for(var x=0;x<sonderzeichen.length;x++)
			while(text.indexOf(sonderzeichen[x])>-1)
				text=text.substring(0,text.indexOf(sonderzeichen[x])) + sonderzeichenhtml[x] + text.substring(text.indexOf(sonderzeichen[x])+1);
	this.presentation.innerHTML = text;
}

//nextPage: "blättert um" zur nächsten Seite der Präsentation durch Anhängen der ".active" CSS-Klasse an das nächste Element
pagegenerator.prototype.nextPage = function(){
	this.pagedivs[this.aktpage].classList.remove("active");
	this.aktpage ++;
	if(this.aktpage>=this.pages.length)this.aktpage --; //bei letzter angekommen mache nichts
	this.pagedivs[this.aktpage].classList.add("active");
		//direkte ansteuerung:
	//this.presentation.innerHTML = this.htmlstart+this.pages[this.aktpage]+this.htmlend;
}
//lastPage: "blättert zurück"
pagegenerator.prototype.lastPage = function(){
	this.pagedivs[this.aktpage].classList.remove("active");
	this.aktpage--;
	if(this.aktpage<0)this.aktpage=0;
	this.pagedivs[this.aktpage].classList.add("active");
}
//showPage(pagenummer): blättert zur seite pagenummer
pagegenerator.prototype.showPage = function(page){
	this.pagedivs[this.aktpage].classList.remove("active");
	if(page>=this.pages.length)page= this.pages.length-1;
	if(page<0)page=0;
	this.aktpage = page;
	//console.log("aktpage:"+this.aktpage+" pagedivslength:"+this.pagedivs.length);
	this.pagedivs[page].classList.add("active");
}

/* loadTheme: Lädt Theme-Dateien (css,js) in die aktuelle HTML-Seite
 * globale string-variable themeobjekts dient dabei dazu zu prüfen, ob es schon mal geladen wurde um doppeltes laden zu vermeiden
 * Nach dem Aufruf ist das Theme noch nicht im pagegenerator, sondern es werden NUR die .css und .js dateien des themes in die Seite geladen
*/
themeobjekts = "";
pagegenerator.prototype.loadTheme = function(themename){
	if(themeobjekts.indexOf(themename)==-1){
		console.log("load Theme "+themename);
		var jsfile = document.createElement('script');
  	jsfile.setAttribute("type","text/javascript");
		jsfile.setAttribute("src", this.jsfilepath + themename +".js");
		var cssfile = document.createElement("link");
		cssfile.setAttribute("rel", "stylesheet");
		cssfile.setAttribute("type", "text/css");
  	cssfile.setAttribute("href", this.cssfilepath + themename + ".css");
		document.getElementsByTagName("head")[0].appendChild(jsfile);
		document.getElementsByTagName("head")[0].appendChild(cssfile);
		themeobjekts+=themename;
	}
}
/* pagegenerator.addTheme(theme)
 * fügt ein Theme dem Pagegenerator hinzu
 * erwartet: Theme-objekt
 * Normalerweise wird in einer theme.js datei ein neues theme erstellt und mittels dieser Funktion dem Pagegenerator übergeben
*/
pagegenerator.prototype.addTheme = function (theme){
	this.themes.push(theme);
	//this.themes.sort(weight)
	/*oder direkt sortiert einpflegen:

	*/

	console.log("neues Theme geladen: "+theme.classname);
	//this.stylePages();
}
	/*showThemes zeigt die Themes in einem Div an und lässt sie dort aktivieren etc.
	*/
pagegenerator.prototype.showThemes = function(){
	var breaktext = "<br>";
	var themetabtext = '';
	var designtabtext = '';
	var globaloptionstext = '';
	for(var x=0;x<this.themes.length;x++){
		var acttheme = this.themes[x];
		if(acttheme.themetype == "css"){
			var acttext = '<input type="radio" name="design" onchange="slidenote.presentation.changeThemeStatus('+x+',this.checked)"';
			if(acttheme.active)acttext +=' checked>';
			acttext += '<label>';
			acttext += acttheme.classname + ": ";
			acttext+= acttheme.description;
			acttext +='</label>';
			designtabtext += acttext + breaktext;
		}else{
			var acttext = '<input type="checkbox" onchange="slidenote.presentation.changeThemeStatus('+x+',this.checked)"';
			acttext +='checked="'+acttheme.active+'">';
			acttext += '<label>';
			if(acttheme.description==null)acttext += acttheme.classname; else acttext+= acttheme.description;
			acttext +='</label>';
			themetabtext += acttext + breaktext;
		}
	}
	var seltab = document.getElementById("themeselectiontab");
	var destab = document.getElementById("designoptionstab");
	var gloptab= document.getElementById("globaloptionstab");
	var options = document.getElementById("options");
	seltab.innerHTML = themetabtext;
	destab.innerHTML = designtabtext;
	gloptab.innerHTML = globaloptionstext;
	options.classList.add("visible");

}

//hideThemes versteckt die Theme-auswahl bei klick auf close
pagegenerator.prototype.hideThemes = function(){
	document.getElementById("options").classList.remove("visible");
}
//changeThemeStatus erwartet eine themenr und ändert das entsprechende theme
pagegenerator.prototype.changeThemeStatus = function(themenr, status){
	if(this.themes[themenr].themetype=="css"){
		//es darf nur ein css ausgewählt werden?
		for(var x=0;x<this.themes.length;x++)if(this.themes[x].themetype=="css")this.themes[x].active=false;
	}
	this.themes[themenr].active = status;
	console.log("themenr"+themenr+" "+this.themes[themenr].classname+" active geändert auf"+status);
}

/* pagegenerator.showpresentation() startet und beendet die präsentation
 * startet die eigentliche präsentation durch aufruf von
 * 1. this.init() - erneutes und finales einlesen des geparsten codes etc. aus dem emdparse-objekt
 * 2. this.stylePages() - styled die Seiten mit zusätzlichem HTML und hängt CSS-Klassen an
 * 3. this.showPage(presentation.emdparsobjekt.pageAtPosition(quelle.selectionStart)[0]) - springt zur aktuell bearbeiteten Seite
 * 4. praesesrahmen.classList.add("fullscreen") setzt die Präsentation auf Vollbildmodus
 *
 * beendet die präsentation
 * 1. entfernen der klasse fullscreen
 * 2. springen und scrollen an die Stelle der zuletzt in der Präsentation dargestellten Seite
*/
var fullscreen = false;
pagegenerator.prototype.showpresentation = function(){
	var praesesrahmen = document.getElementById("praesentationrahmen");
	var quelle = document.getElementById("quelltext");
	if(!fullscreen){
		//this.init();
		fullscreen=true;
		this.init(slidenote.parser, document.getElementById("praesentation"));
		var test2 = document.getElementsByTagName("code");
		if(test2!=null)console.log(test2.length+"codes");
		this.stylePages();
		var test = document.getElementsByTagName("code");
		if(test!=null)console.log(test.length+"codes code1: ");
		//console.log("querycodeanzahl:"+document.querySelectorAll(".presentation code")[0].innerHTML);

		//this.sanitizeSonderzeichen();
		//console.log("querycodeanfang:"+document.querySelectorAll(".presentation code")[0].innerHTML.substring(0,20));
		this.showPage(presentation.emdparsobjekt.pageAtPosition(quelle.selectionStart)[0]);
		praesesrahmen.classList.add("fullscreen");
		//praesesrahmen.style.height = document.height;
		document.body.style.height = "100vh";
		document.body.style.overflow = "hidden";
	} else{
		fullscreen=false;
		//presentation.ausgabediv.classList.remove("active");

		quelle.selectionEnd = presentation.emdparsobjekt.positionAtPage(presentation.aktpage);
		quelle.selectionStart = quelle.selectionEnd;
		quelle.focus();
		quelle.selectionEnd = presentation.emdparsobjekt.positionAtPage(presentation.aktpage);
		slidenote.parseneu();
		praesesrahmen.classList.remove("fullscreen");
		document.body.style.height = "unset";
		document.body.style.overflow = "unset";
		//praesesrahmen.style.height = "unset";
	}
}

/* Theme-Objekt
 * Das Theme-Objekt ist die Hauptschnittstelle um Themes einzuspielen. Durch ein Plug-In ähnliches System können so zusätzliche
 * HTML-Tags und CSS-Klassen an die Präsentation gebracht werden.
 * Erwartet: nombre= Name des Themes.
 * optional: weight= Gewicht des Themes. Darüber wird die Reihenfolge der Theme-Anwendungen gesteuert von niedrigem Gewicht zu hohem. Default ist 0
 * Hook-Funktion: styleThemeSpecials () ist dazu gedacht, im .js-File des Themes bei Bedarf überschrieben zu werden
 * Hilfsfunktionen:
 * HtmlElements ( css-query-code ) liefert alle HTML-Elemente einer Präsentation des gefragten Types
 * cycleThroughHtmlElements (css-query-code) durchläuft die gefundenen Elemente des css-query-codes einer Präsentation und ersetzt innerHTML
											 durch Ergebnis von specialStylePerElement
 * interne  Hook-Funktion: specialStylePerElement (text / innerHTML) wird in der Hilfsfunktion cycleThroughHtmlElements aufgerufen
 * 			bekommt: textstring des innerHTML des durchlaufenen HTMLElements, erwartet return: text für selbiges
*/

function Theme(nombre, weight){
	this.classname = nombre;  //string für die klasse
	this.styles = new Array(); //array of stylepager
	this.jsfile;
	this.cssfile;
	this.active = true;
	this.filepath = "themes/";
	if(weight !=null)this.weight = weight; else this.weight = 0; //gewicht der klasse: höheres gewicht wird später ausgeführt, niedrigeres früher
	this.htmlelements;
	this.querycode = "#praesentation .ppage ";
	this.themetype = "extension";
	this.descriptiontext = "";
//	console.log("Theme "+this.classname+" found "+this.htmlelements.length + " of "+htmlelement);
}

/* Theme.addStyle erwartet ein zeilenmuster, nach welchem gescannt wird
* sowie ein start und ein end html-tag mit welchem gefundene muster ummantelt werden
* muster ist ein Array mit zeilencode, bspw: text, h2, code etc.
*/
Theme.prototype.addStyle = function(muster, start, end){
	this.styles.push(new stylepager(muster,start,end));
}

/* Theme.specialStylePerElement ist eine Hook-Funktion, welche
* dazu gedacht ist überschrieben zu werden in einem angepassten
* theme. sie wird aus der funktion cycleThroughHtmlElements aufgerufen
* und bearbeitet das fertige innerHTML des betreffenden HTML-Elements
*/

Theme.prototype.specialStylePerElement = function(text){
	return text;
}

/* Theme.HtmlElements erwartet htmlelement-css-code für eine query
* und liefert alle gefundenen elemente innerhalb der präsentation zurück
*/

Theme.prototype.HtmlElements = function (htmlelement){
	var elements;
	if(htmlelement!=null)elements =  document.querySelectorAll(this.querycode + htmlelement);
		//else return document.querySelectorAll(this.querycode);
	return elements;
}

/* Theme.cycleThroughHtmlElements wird aufgerufen mit dem querycode
* nach welchem html-elemente durchlaufen werden sollen.
* es sucht die betreffenden html-elemente innerhalb der präsentation raus
* und führt anschließend für jedes gefundene html-element die
* specialStylePerElement-Hook-Funktion aus
*/

Theme.prototype.cycleThroughHtmlElements = function(htmlelement){
	var querycode = "#praesentation .ppage "+htmlelement;
	var elements;
	if(htmlelement!=null)elements = document.querySelectorAll(querycode);
	if(elements != null){
	console.log("cycle through "+elements.length+" elements of type "+htmlelement);
		for(var x=0;x<elements.length;x++){
			var styledtext = this.specialStylePerElement(elements[x].innerHTML);
			elements[x].innerHTML = styledtext;
		}
	}
}

Theme.prototype.styleThemeSpecials = function(){
	//Hook-Funktion, gedacht zum überschreiben in .js-Datei des Themes
}




/*neuer aufbau für die steuerung und ablauf usw. des programms:
*/

function slidenotes(texteditor, texteditorerrorlayer, wysiwygarea, htmlerrorpage, presentationdiv){
	//grundlegender zugriff auf alle wichtigen html-elemente:
	this.textarea = texteditor;
	this.texteditorerrorlayer = texteditorerrorlayer;
	this.wysiwygarea = wysiwygarea;
	this.htmlerrorpage = htmlerrorpage;
	//this.htmlerrorpagerahmen = htmlerrorpage.parentNode;
	this.presentationdiv = presentationdiv;
	this.keydown = false; //hilfsboolean um nicht zu oft zu parsen

	//das wichtigste: das parsingobjekt:
	this.parser = new emdparser(this.textarea.value);
	//das nächste ist der wysiwyg-editor:
	this.wysiwyg = new wysiwygcontroller(this.textarea, this.wysiwygarea, this);
	//als letztes die präsentation:
	this.presentation = new pagegenerator(this.parser,this.presentationdiv);

	//edit-modus:
	this.wysiwygactivated = true;
	this.texteditorerroractivated = true;
}

slidenotes.prototype.choseEditor=function(editor){
	if(editor=="wysiwyg"){
		this.wysiwygactivated=true;
		this.texteditorerroractivated=false;
		this.wysiwygarea.classList.remove("hidden");
		this.texteditorerrorlayer.classList.add("hidden");
		document.getElementById("slidenotediv").classList.remove("vollbild");
	}else if(editor=="md-texteditor"){
		this.wysiwygactivated=false;
		this.texteditorerroractivated = true;
		this.wysiwygarea.classList.add("hidden");
		this.texteditorerrorlayer.classList.remove("hidden");
		document.getElementById("slidenotediv").classList.remove("vollbild");
	}else if(editor=="wysiwygfullscreen"){
		this.wysiwygactivated=true;
		this.texteditorerroractivated=false;
		this.wysiwygarea.classList.remove("hidden");
		this.texteditorerrorlayer.classList.add("hidden");
		document.getElementById("slidenotediv").classList.add("vollbild");
	} else {
		this.wysiwygactivated=false;
		this.texteditorerroractivated = false;
	}
	if(editor=="wysiwygdebugmode"){
		this.wysiwygactivated=true;
		this.wysiwygarea.classList.remove("hidden");
		this.texteditorerrorlayer.classList.add("hidden");
		document.getElementById("slidenotediv").classList.remove("vollbild");
		this.wysiwygarea.classList.add("debugmode");
	}else{
		this.wysiwygarea.classList.remove("debugmode");
	}
	this.parseneu();
	this.textarea.focus();
}

slidenotes.prototype.texteditorrahmensetzen= function(){
	//setzt den rahmen vom errorlayer auf textarea-größe:
	var texteditorrahmen = document.getElementById("texteditor");
	var eingabeblock = this.textarea;
	var texteditorfehlerlayer = this.texteditorerrorlayer;
	texteditorrahmen.style.width = eingabeblock.offsetWidth + "px";
	texteditorrahmen.style.height = eingabeblock.clientHeight+"px";
	texteditorfehlerlayer.style.width = (eingabeblock.offsetWidth-4) + "px";
	texteditorfehlerlayer.style.height = (eingabeblock.offsetHeight-4)+"px";
	//frag mich nicht warum 4px abgezogen werden müssen, aber dann passts.
	//vermutung ist der focus-rahmen vom texteditor...
};

slidenotes.prototype.parseneu = function(){
	var startzeit = new Date();
	this.parser = new emdparser(this.textarea.value);
	this.parser.parsenachzeilen();
	var zwischenzeit = new Date();
	if(this.wysiwygactivated){
		//hier kommt wysiwygkram rein
		/*this.parser.parsewysiwyghtml();
		this.wysiwygarea.innerHTML = this.parser.errorcode;
		this.wysiwyg.scrollToCursor();*/
		this.renderwysiwyg();
	} else {
		//ohne wysiwyg-kram:
		if(this.texteditorerroractivated){
			this.texteditorerrorlayer.innerHTML = this.parser.parseerrorsourcebackground();
			this.texteditorrahmensetzen();
		}
	}
	var endzeit = new Date();
	var parszeit = zwischenzeit - startzeit;
	var renderzeit = endzeit - zwischenzeit;
	var gesamtzeit = endzeit - startzeit;
	console.log("Parsen brauchte: "+parszeit+"ms - Rendern brauchte:"+renderzeit+"ms" );
};
slidenotes.prototype.renderwysiwyg = function(){
	//nur wysiwyg neu aufbauen
	var st = this.wysiwygarea.scrollTop;
	this.parser.parsewysiwyghtml();
	this.wysiwygarea.innerHTML = this.parser.errorcode;
	this.wysiwygarea.scrollTop = st;
	this.wysiwyg.scrollToCursor();
	console.log("renderwysiwyg abgeschlossen");
}

slidenotes.prototype.keypressdown = function(event, inputobject){
	var key = ""+event.key;
	if(key=="undefined"){
			webkit = true;
			console.log("keycode:"+event.keyCode)
			console.log("webkit-test:"+event.keyIdentifier);
			console.log("webkit-test2:"+event.which);
			//if(event.keyCode=="16")key="Shift";else
			//key=String.fromCharCode(event.keyCode);
			//key=event.keyCode;
			key = getKeyOfKeyCode(event.keyCode);
	}
	if(key=="Shift")this.wysiwyg.shiftdown = true;
	console.log("key:"+key);
	var keydown = this.keydown; //braucht das noch? erstmal zum testen hier temporär, wenns funktioniert
	//kann es ganz weg, sonst wieder global machen
	//die logik macht doch keinen sinn... a
	//if(!keydown &&(key=="ArrowDown" || key=="ArrowUp" || key=="End" || key=="Home")){
	if(inputobject == this.textarea  &&
		(key=="ArrowDown" || key=="ArrowUp" || key=="End" || key=="Home")){
		//Sonderfälle für wysiwyg:
		//alert()
		console.log("steuerkeydown:"+key + " lasttyping:"+this.wysiwyg.lasttypingtext);
		if(this.wysiwyg.lasttypingtext.length>1){
			console.log("parse wegen steuerkey");
			this.parseneu();
			this.wysiwyg.lasttypingtext="";
		}
		this.wysiwyg.setCursor();
		//this.keydown=true;

	}else if(inputobject==this.textarea && key=="Shift"){
		console.log("Shift gedrückt");
		var alteselection = document.getElementsByClassName("wysiwygselection")[0];
		if(alteselection!=null){
			//es gibt ne alte selection, also selection auswählen und focus auf
			//wysiwyg setzen
			this.wysiwygarea.focus();
			this.wysiwyg.setCursorToElement(alteselection, true);
		}
	}
	if(key.length<2 && !event.ctrlKey)
	this.wysiwyg.lasttypingtext+=key;
};
slidenotes.prototype.keypresswebkit = function(event, inputobject){
	if(webkit){
		var key= String.fromCharCode(event.keyCode);
		this.wysiwyg.lasttypingtext+=key;
	}
}

slidenotes.prototype.keypressup = function(event, inputobject){
	var key = ""+event.key;
	if(key=="undefined")key=getKeyOfKeyCode(event.keyCode);//key=String.fromCharCode(event.keyCode);
	if(key=="Shift"){
		this.wysiwyg.shiftdown = false;
		console.log("Shift up");
	}
	console.log(key + " textarea?"+(inputobject == this.textarea)+"ctrl?"+event.ctrlKey);
	if(inputobject == this.textarea &&
		(key=="ArrowDown" || key=="ArrowUp" || key=="End" || key=="Home")){
	//textarea feuert arrow-down etc.: soll nix gemacht werden oder?
		//alert("feuert :(");
	} else if(inputobject == this.wysiwygarea &&
		//(key=="ArrowDown" || key=="ArrowUp")){
		//key.indexOf("Arrow")>-1 &&
		key.substring(0,5)=="Arrow" &&
		event.shiftKey){
		//wysiwygarea feuert arrow-down oder arrow-up
		//copyCursorToTextarea(); nur wenn fertig ist
		console.log("keyupdown-timeout starten");
		this.wysiwyg.lasttyping = new Date().getTime();
		setTimeout("slidenote.wysiwyg.keyupdown()",201);
		//this.wysiwyg.typing(key);

	}	else if(inputobject==this.wysiwygarea){
		console.log("inputobject wysiwygarea keyup" + key);
		//keypressup wurde vom wysiwygarea gefeuert: copywysiwyg-cursorpos zu textarea
		//if(key!="Shift")
		this.wysiwyg.copyCursorToTextarea(event);
	}else if(inputobject == this.textarea){
		//alert("feuert?");
		//if(!this.keydown)this.parseneu();
		//console.log("parsen?");
		//wirklich immer parsen? lieber keystrokes abwarten:
		//this.parseneu();
		//console.log(key);
		if(this.wysiwygactivated){
			if(key=="ArrowLeft"||key=="ArrowRight"){
					this.renderwysiwyg();
				console.log("left-right-key"+key);
			}else if(key=="Control" || event.ctrlKey){
				this.parseneu();
			}else {//if(!event.ctrlKey){
				console.log("tippen mit:"+key + " metakey:"+event.metaKey);
				this.wysiwyg.typing(key);
			}
		} else {
			console.log("parsen....");
			this.parseneu();
		}
	}
};

slidenotes.prototype.insertbutton = function(emdzeichen){
	var textarea = this.textarea;
	var startemdl = new Array('**','*','~~',"%head","%list","%nrlist","%link","%quote","%image","%table");
	var endemdl = new Array('**','*','~~',"\n","\n","\n","%link","\n","%image","%table");
	var emdnr;
	var emdstart="";
	var emdend="";
	var multilineselection = false;
	if(emdzeichen=="%head"){
		emdstart="\n#";
		emdnr = prompt("h... 1,2,3,4?");
		for(var xa=1;xa<emdnr;xa++)emdstart+="#";
		emdend="\n";
	}else if(emdzeichen=="%nrlist" || emdzeichen=="%list" || emdzeichen=="%quote"){
			var selectedtext = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			//if(selectedtext.substring(1,2)=="\n")selectedtext = selectedtext.substring(1);
			console.log("füge "+emdzeichen+" ein. markierter text"+selectedtext );
			var selectedlines = new Array();
			while(selectedtext.indexOf("\n")>-1){
				selectedlines.push(selectedtext.substring(0,selectedtext.indexOf("\n")));
				selectedtext=selectedtext.substring(selectedtext.indexOf("\n")+1);
			}
			selectedlines.push(selectedtext);
			selectedtext ="";
			for(var x=1;x<=selectedlines.length;x++){
				if(x==1 && selectedlines[x-1].length==0){
					selectedtext+="\n"; //wenn in der ersten zeile nix steht bedeutet das in der regel, dass bis zur zeile davor markiert wurde
					console.log("zeile scheint leer zu sein:"+selectedlines[x-1]+"eol");
				}else{
					//alert("selectedline:"+selectedlines[x-1]+"endofline");
					if(emdzeichen=="%nrlist")selectedtext+=x+". "+selectedlines[x-1]+"\n";
					else if(emdzeichen=="%list")selectedtext+="* "+selectedlines[x-1]+"\n";
					else selectedtext+="> "+selectedlines[x-1]+"\n";
				}
			}
			textarea.value = textarea.value.substring (0, textarea.selectionStart)+
						selectedtext +
						textarea.value.substring (textarea.selectionEnd);
			multilineselection = true;

	}else if(emdzeichen=="%link"){
			var linkurl = prompt("url for the link");
			emdstart="[";
			emdend="]("+linkurl+")";
	}else if(emdzeichen=="%image"){
			var imgurl = prompt("hier kommt bald imageupload rein. solange: tippe hier url ein:");
			emdend="![]("+imgurl+")";
	}else if(emdzeichen=="%table"){
		emdend="\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |";
	}else if(emdzeichen=="%code"){
		var selectedtext = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
		if(selectedtext.indexOf("\n")>-1){
			emdstart="\n```\n";
			emdend="\n```\n";
		}else{
			emdstart="`";
			emdend="`";
		}

	}else{ //einfache zeichen:
		//emdnr = startemdl.positionOf(emdzeichen); //sollte im array vorkommen. da ich den befehl grad nicht weiß:
		for(var x=0;x<startemdl.length;x++)if(startemdl[x]==emdzeichen)emdnr=x;
		emdstart=startemdl[emdnr];
		emdend=endemdl[emdnr];
	}

	var selectionend = textarea.selectionEnd;
	if(!multilineselection){
	var newText = textarea.value.substring (0, textarea.selectionStart) +
                        emdstart + textarea.value.substring  (textarea.selectionStart, textarea.selectionEnd) + emdend +
                        textarea.value.substring (textarea.selectionEnd);
    textarea.value = newText;
	}
	var scrolltop = textarea.scrollTop; //merk dir scroll-position um ruckeln zu vermeiden
	//textarea.focus();
	//var textarbody = textarea.value;
	//textarea.value = textarbody.substring(0,selectionend);
	textarea.focus();
	//textarea.value = textarbody;
	textarea.selectionEnd = selectionend+emdstart.length; //cursor vor emdendsymbol stellen
	textarea.scrollTop = scrolltop; //scrolle an richtige stelle
	//testparsenachzeilen(document.getElementById("quelltext").value); //zeichen einparsen
	this.parseneu();


};

slidenotes.prototype.scroll = function(editor){
	if(editor==this.textarea && this.texteditorerroractivated)
	this.texteditorerrorlayer.scrollTop = editor.scrollTop;
	//TODO: wysiwyg-scroll wenn cursor aus dem bild kommt
	//kommt das wirklich hier rein? eher nach wysiwyg-html-rendern oder?
};

slidenotes.prototype.initpresentation = function(){
	if(presentation == null)
	this.presentation = new pagegenerator(this.parser, this.presentationdiv);
	else presentation.init(this.parser, this.presentationdiv);
};

/* shows Sourcecode on another Div with detailed error-description
*/
slidenotes.prototype.showErrorDetails = function(){
	this.parser.parseerrorsourcehtml();
	this.htmlerrorpage.innerHTML = this.parser.errorsourcecode;
	var rahmen = this.htmlerrorpage.parentNode;
	rahmen.classList.add("active");
	rahmen.scrollTop = this.texteditorerrorlayer.scrollTop;
};

/* Theme-Controll:
*/
slidenotes.prototype.addTheme = function(theme){
	this.presentation.addTheme(theme);
	//hier könnte auch noch unterschieden werden nach theme-art, also bspw. n plugin,
	//welches auch den parser beeinflusst o.ä.
}

function wysiwygcontroller(textarea, wysiwyfield, ersteller){
	this.textarea = textarea;
	this.wysiwygarea = wysiwygarea;
	this.ersteller = ersteller;
	this.lasttyping = 0;
	this.lasttypingloops =0;
	this.lasttypingtext ="";
	this.shiftdown = false; //hab nix besseres gefunden,
	//daher manuell: gibt an ob shift noch gedrückt ist
	//this.lastscroll = wysiwygarea.scrollTop;
	//this.actstroll = lastscroll;
}
wysiwygcontroller.prototype.keyupdown = function(){
	console.log("keyupdown:"+this.lasttyping+"act:"+new Date().getTime());
	if(this.lasttyping+200<new Date().getTime()){
		console.log("keyupdown feuert"+this.lasttyping)
		this.copyCursorToTextarea();
	}
}
wysiwygcontroller.prototype.typing = function(key){
	var timeact = new Date().getTime();
	this.lasttyping = timeact;
	var cursor = this.Cursor();
	if(cursor!=null && key.length<2){
		//this.lasttypingtext += key;
		cursor.innerHTML = this.lasttypingtext +"&zwj;";
		console.log("loop startet mit key:" +key);
		setTimeout("slidenote.wysiwyg.typingloop();",500);
	}else if(key!="Control"){
		console.log("parsen wyswig direkt mit key:" +key);
		this.ersteller.parseneu();
		this.lasttypingtext="";
	}
}
wysiwygcontroller.prototype.typingloop = function(){
	var timeact = new Date().getTime();
	if(timeact < this.lasttyping +501){
		//this.lasttypingloops++;
		//setTimeout("slidenote.wysiwyg.typingloop();",101);
	}else{
		if(this.lasttypingtext!=""){
			console.log("parsen loop"+this.lasttypingtext);
			this.ersteller.parseneu();
			this.lasttypingtext="";
		}
		//this.lasttyping = timeact + (this.lasttypingloops*100);
	}
}
wysiwygcontroller.prototype.shiftkeydown = function(event){
	var key=""+event.key;
	if(key=="undefined")key=String.fromCharCode(event.keyCode);

	var steuerkeys ="ArrowUp,ArrowDown,ArrowLeft,ArrowRight,End,Home";
	console.log("shiftdown: key gedrückt:"+key)
	if(key.length<2 || (key.length>1 && steuerkeys.indexOf(key)==-1)){
		//was anderes als steuerkeys
		//this.textarea.focus();
		console.log("shiftdown text überschreiben");
		var oldselect = document.getElementsByClassName("wysiwygselection")[0];
		if(oldselect!=null)oldselect.classList.remove("wysiwygselection");
		this.copyCursorToTextarea();

	}
}
wysiwygcontroller.prototype.Cursor = function(){
	return document.getElementsByClassName("cursor")[0];
};
wysiwygcontroller.prototype.positionOfElement = function(element){
	var cursor = element;
	if(cursor==null){
		return -1;
	}else{
		var range = document.createRange();
		range.selectNodeContents(this.wysiwygarea);
		range.setEndBefore(cursor);
		var pos = range.toString().length;
		//range wieder freigeben
		return pos;

	}
};

wysiwygcontroller.prototype.scrollToCursor = function(){
	var cursor = this.Cursor();
	var cursortop;

	if(cursor!=null){
		cursortop = cursor.offsetTop - this.wysiwygarea.offsetTop;
		//var wysiwygareaoffset = this.wysiwygarea.offsetTop;
		//console.log("wysareaoffset:"+wysiwygareaoffset);
		var wysiwygmaxheight = this.wysiwygarea.clientHeight - cursor.offsetHeight;
		//var wysiwygmax = this.wysiwygarea.scrollTop + this.wysiwygarea.offsetHeight-this.wysiwygarea.offsetTop;
		var wysiwygmax = wysiwygmaxheight + this.wysiwygarea.scrollTop;
		var wysiwygmin = this.wysiwygarea.scrollTop;
		//firefox scheint images nicht im offsetTop mitzudenken:
		/*
		console.log("offsetparent"+cursor.offsetParent+" -> ist wysiwygarea?"+(cursor.offsetParent==this.wysiwygarea));
		console.log(cursor.offsetParent);
		console.log("cursor.offsettop"+cursor.offsetTop+" parentoffsetTop:"+cursor.offsetParent.offsetTop+" wysoftop"+this.wysiwygarea.offsetTop);
		console.log("wysiwygscrolltop"+this.wysiwygarea.scrollTop + "maxheight:"+wysiwygmaxheight);
		console.log("clientHeight:"+this.wysiwygarea.clientHeight + "offsetHeight:"+this.wysiwygarea.offsetHeight);
		console.log("cursortop:"+cursortop + "wysmin:"+wysiwygmin+"wysmax"+wysiwygmax);
		*/
		if(cursortop>wysiwygmax){
			//console.log("scrolling"+this.wysiwygarea.scrollTop + "->"+ cursortop);
			this.wysiwygarea.scrollTop = cursortop;

		}else if(cursortop<wysiwygmin){
			//console.log("scrollup:"+this.wysiwygarea.scrollTop + "<-"+cursortop);
			//this.wysiwygarea.scrollTop = cursor.offsetTop + 109;
		}
		//cursor.scrollIntoView();

	}
}
wysiwygcontroller.prototype.setCursor = function(){
	//TODO: document durch this.wysiwygarea austauschen um cursor-namen einheitlich ändern zu können
	//var cursor = document.getElementsByClassName("cursor")[0];
	var cursor = this.Cursor();
	if(cursor!=null){
		console.log("cursor in wysiiwyg-setzen und fokusieren"+cursor);
		//scrollen verhindern, sonst bleibt er immer in der letzten zeile:
		var wysscrolltop = this.wysiwygarea.scrollTop;
		this.wysiwygarea.focus();
		this.setCursorToElement(cursor, false);
		//console.log()
		this.wysiwygarea.scrollTop = wysscrolltop;

	}else{
		var wyssel = document.getElementsByClassName("wysiwygselection")[0];
		if(wyssel!=null){
			//es gibt ne selection
			//hier muss noch mehr rein getCaretCharacterOffsetWithin
			//TODO: alte markierung erweiterbar machen
			this.setCursorToElement(wyssel,true);
			this.wysiwygarea.focus();
		}
	}
};
wysiwygcontroller.prototype.setCursorToElement = function(element,selectionorcursor){
	//element sollte der cursor-span sein oder die selectionspan
	if(typeof window.getSelection != "undefined" && typeof document.createRange != "undefined"){
	//firefox und chrome:
		var range = document.createRange();
		range.selectNodeContents(element); //add the contents of the given element to the range
		if(selectionorcursor== false)range.collapse(true); //collapse the range
		console.log("setcursortoelement-elementclasses:"+element.classList.contains("bacw"));
		if(selectionorcursor && element.classList.contains("bacw")){
			//selection wurde von rechts nach links ausgewählt:
			// (startContainer, startOffset)
			var selstartnode = range.startContainer;
			var selstartoff = range.startOffset;
			range.collapse(false);
			var sel = window.getSelection(); //Returns a Selection object representing the range of the text selected by the user or the current position of the caret.
			sel.removeAllRanges(); //removes all ranges from the selection, leaving the anchorNode and focusNode properties equal to null and leaving nothing selected.
			sel.addRange(range); //adds the range we created to the selection, effectively setting cursor position
			sel.extend(selstartnode,selstartoff);
			//range.extend(selstartnode,selstartoff);
		}else{
			var sel = window.getSelection(); //Returns a Selection object representing the range of the text selected by the user or the current position of the caret.
			sel.removeAllRanges(); //removes all ranges from the selection, leaving the anchorNode and focusNode properties equal to null and leaving nothing selected.
			sel.addRange(range); //adds the range we created to the selection, effectively setting cursor position
		}
	}
	else if (typeof document.body.createTextRange != "undefined") {
		//internetexplorer - really?
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(element);
		textRange.collapse();
		textRange.select();
	}
};
wysiwygcontroller.prototype.getSelectionLength = function(element){
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
	var sel = win.getSelection();
	//alert("String:"+sel.toString()+"eol");
	return sel.toString().length;
};
wysiwygcontroller.prototype.isSelectionBackwards= function(){
	var backwards = false;
	if (window.getSelection) {
		var sel = window.getSelection();
		if (!sel.isCollapsed) {
				var range = document.createRange();
				range.setStart(sel.anchorNode, sel.anchorOffset);
				range.setEnd(sel.focusNode, sel.focusOffset);
				backwards = range.collapsed;
				range.detach();
		}
	}
return backwards;
}

wysiwygcontroller.prototype.getCaretCharacterOffsetWithin = function(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
						/*console.log("keyupdown: carret gefunden an"+caretOffset);
						console.log(range);
						console.log(sel);*/
						if(sel.anchorNode==this.textarea){
							console.log("textarea-selection!");
							caretOffset=-1;
						}
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
};

wysiwygcontroller.prototype.copyCursorToTextarea = function(event){
	var debugzeitstart = new Date();
	var sellength = this.getSelectionLength(this.wysiwygarea);
	var wysiwygcursorpos =  this.getCaretCharacterOffsetWithin(this.wysiwygarea);
	var selbackwards = this.isSelectionBackwards();
	var aktpos = wysiwygcursorpos;
	var startpos = aktpos-sellength;

	if(sellength>0){
		//es gibt eine neue selection
		aktpos = this.ersteller.parser.map.WystextToSource(aktpos);
		startpos = this.ersteller.parser.map.WystextToSource(startpos);

	} else{
		//es gibt keine neue selection
			aktpos = this.ersteller.parser.map.WystextToSource(aktpos);
			startpos = aktpos;
	}
	//console.log("copyCursorToTextarea wyspos:"+wysiwygcursorpos+" aktpos:"+aktpos+" startpos:"+startpos);
	//console.log(this.ersteller.parser.map);
	var debugzeitwystexttosource = new Date() - debugzeitstart;
	console.log("wystexttosource brauchte:"+debugzeitwystexttosource+"ms");
		this.textarea.focus();
		this.textarea.selectionEnd = aktpos; //cursor an stelle setzen
		this.textarea.selectionStart = startpos;
		this.textarea.selectionDirection="forward";
		if(selbackwards)this.textarea.selectionDirection = "backward";
		//this.ersteller.parseneu();
		//nicht neu parsen - es reicht, html für wysiwyg neu zu rendern
		this.ersteller.renderwysiwyg();
		keydown=false;
		var debugzeitend = new Date() - debugzeitstart;
		console.log("copyCursorToTextarea brauchte "+debugzeitend+"ms")
};

wysiwygcontroller.prototype.pastefromwysiwyg = function(pastedtext){

}

wysiwygcontroller.prototype.mousedown = function(event){

	console.log("maus gedrückt");
	if(event.which==3 || event.button=="2"){
		//rechte maustaste wurde gedrückt:
		console.log("rechte maustaste wurde gedrückt");
		//this.textarea.focus();
		var cursor = this.Cursor();
		if(cursor!=null){
			//this.wysiwygarea.focus();
			this.setCursorToElement(cursor,false);
		}
		var alteselection = document.getElementsByClassName("wysiwygselection")[0];
		if(alteselection!=null){

			this.setCursorToElement(alteselection,true);
		}

	}
	if(event.shiftKey){
		//maus wurde gedrückt und shift ist aktiviert
	/*	var alteselection = document.getElementsByClassName("wysiwygselection")[0];
		if(alteselection!=null){
			this.setCursorToElement(alteselection,true);

		}*/
		//evtl. einfach nur focus wechseln:
		var cursor = this.Cursor();
		if(cursor!=null){

			var sel = window.getSelection();
			if(sel.rangeCount>0){
				var range=window.getSelection().getRangeAt(0);
				range.collapse();
				range.setStartBefore(cursor);
				sel.removeAllRanges();
			 	sel.addRange(range);
				setTimeout("slidenote.keypressdown({key:'Shift'},slidenote.textarea)",100);

			}
			/*
			var oldselect = document.getElementsByClassName("wysiwygselection")[0];
			if(oldselect!=null){
				var sel = window.getSelection();
				if(sel.rangeCount>0){
					var range=window.getSelection().getRangeAt(0);
					range.collapse();
					if(oldselect.classList.contains("bacw")){
						range.setStartBefore(oldselect);
					}else{
						range.setStartAfter(oldselect);
					}
					sel.removeAllRanges();
				 	sel.addRange(range);
					setTimeout("slidenote.keypressdown({key:'Shift'},slidenote.textarea)",400);

				}
			}*/
			this.wysiwygarea.focus();

		}
	}
	console.log("wysiwyg.mousedown abgeschlossen");
}
//webkit-hacks:
var webkit = false;
function getKeyOfKeyCode(keycode){
  var keycodes = new Array();
  keycodes[16]="Shift";
	keycodes[17]="Control";
	keycodes[18]="Alt";
  keycodes[35]="End";
  keycodes[36]="Home";
  keycodes[37]="ArrowLeft";
  keycodes[38]="ArrowUp";
  keycodes[39]="ArrowRight";
  keycodes[40]="ArrowDown";
	keycodes[91]="Control"; //"mac-cmd-left";
	keycodes[93]="Control";//"mac-cmd-right";
	//if(keycode>64 && keycode<90)return String.fromCharCode(keycode);
  if(keycodes[keycode]==null)return "webkitbug"+keycode;
  return keycodes[keycode];
}

wysiwygcontroller.prototype.hideorshowcursor = function(){
	//console.log("hideorshow:");
	//console.log(document.activeElement);
	var cursor = this.Cursor();
	if(cursor != null){
		var active = document.activeElement;
		if(active == this.textarea || active == this.wysiwygarea){
			//console.log("show cursor");
			cursor.style.display="unset";
		} else {
			//console.log("hide cursor");
			cursor.style.display="none";
		}

	}
}
/*
wird scheinbar doch nicht gebraucht
function cutcurrentselection(){
	var textarea = slidenote.textarea;
	var selstart= textarea.selectionStart;
	var selend = textarea.selectionEnd;
	console.log(selstart+"->"+selend+" cutcurrentselection")
	textarea.value = textarea.value.substring(0,selstart)+
									textarea.value.substring(selend);
	slidenote.textarea.selectionEnd=selstart;
	textarea.focus();
	slidenote.parseneu();
}
*/
