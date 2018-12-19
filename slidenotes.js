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
	 this.insertedimages = new Array();
	 this.lastline=0;
	 //this.linepos = [0];
	 this.linestart = [0];
	 this.lineend = new Array();
	 this.angezeigtezeichen = new Array();
	 this.pagestart = [{line:0,posinall:0}];
	 this.pageend = new Array();
	 this.lastcursorpos = 0;//

	var origtext = parser.sourcecode;
	var lastpos=origtext.indexOf("\n");
	while(lastpos>-1){
		//this.linepos.push(lastpos+1); //wrong - should be lastpos +1 because \n is on the end
		this.lineend.push(lastpos);
		this.linestart.push(lastpos+1);
		this.lastline++;
		lastpos=origtext.indexOf("\n",lastpos+1);
	}
	this.lineend.push(origtext.length);
	//lastline steht jetzt auf der letzten linie


	for(var x=0;x<=this.lastline;x++)this.insertedhtmlinline[x]=new Array();
};

mapping.prototype.init = function(){
//standard-sachen die gemacht werden müssen:
	if(this.insertedhtmelements!=null)this.insertedhtmlelements.sort(function(a,b){return a.posinall - b.posinall})

}

mapping.prototype.addElement = function(element2){
	var element=element2;
	if(element.posinall==null)element.posinall=element.pos+this.linestart[element.line];
	this.insertedhtmlelements.push(element);
	this.insertedhtmlinline[element.line].push(element);
	if(element.typ === "image")this.insertedimages.push(element);
};
mapping.prototype.addVeraenderung = function(element){
	if(element.posinall==null)element.posinall=element.pos+this.linestart[element.line];
	element.angezeigteszeichen=true;
	//this.lineend.push(lastpos);
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

mapping.prototype.pageAtPosition = function(position){
	var result = 0;

	for(var x=0;x<this.pagestart.length;x++){
		if(this.linestart[this.pagestart[x].line]<=position)result = x;
		//console.log(this.pagestart[x].line+"<"+position);
	}
	console.log("Page at Position"+position+"-"+x);
	return result;

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
	console.log("new error found"+errorclass+errortext);
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
	this.dataobjects = new Array(); //array with dataobjects of data-blocks
	//var aktpos = 0;
	this.parselines(text);  //parsing the sourcecode on init into lines
	this.perror = new Array(); //array with parsing-errors as objects/array
	if(slidenote && slidenote.parseelemente){
		this.parseelemente = slidenote.parseelemente; //makes parseelemente changeable through themes
		//because emdparser will be defined anew every parseneu - so it has to be saved in slidenote which stays stable
	} else {
		//standard-parseelemente if no parseelmenetearray is defined in slidenote
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
	}
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
	var lines = this.returnparsedlines(this.replace(this.sourcecode,"<","&lt;"));
	//this.returnparsedlines(this.replace(this.replace(this.sourcecode,"<","&lt;"),"\t","&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"));
	var temptext = "";
	/* dont remember why i wrote this but it doesnt have any effect so get rid of it:
	for(var x=0;x<lines.length;x++){
		var pseudoline="&nbsp;";
		for(var y;y<lines[x].length;y++)pseudoline+=pseudoline;
		//lines[x]=pseudoline+".";
	} */
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
/* renderCodeeditorBackground:
 *  makes use of the map to render background for md-Code-Editor
 */
emdparser.prototype.renderCodeeditorBackground = function(){
	 var lines = this.returnparsedlines(this.sourcecode); //raw sourcecode
	 var changes = new Array(); //saves the changes we have to do
	 var imagesinline = new Array(); //array with array of images-changes
	 //create cursor-change:
	 var cursorposinall = slidenote.textarea.selectionEnd;
	 //var linediff = this.lineAtPosition(cursorposinall);
	 //cursorposinall -=linediff; //\n counts in cursorpos
	 var cursorline = this.lineAtPosition(cursorposinall);
	 var cursorposinline = cursorposinall - this.map.linestart[cursorline];
	 console.log("new cursor at line:"+cursorline+", posinall:"+cursorposinall+", pos:"+cursorposinline);
	 //if(cursorposinline<0)cursorposinline=0;
	 var cursorchange = {
	 	line:cursorline,
	 	posinall:cursorposinall,
	 	pos:cursorposinline,
	 	html:'<span id="carret"></span>',
	 	mdcode:'',
	 	typ:'cursor'
	 };
	 changes.push(cursorchange);

	 //looking for simple changes:
	 var mdsimples = "***__~~<&`"; //< is also a simple change
	 for(var x=0;x<this.map.insertedhtmlelements.length;x++){
		 var element = this.map.insertedhtmlelements[x];
		 //iterate through map and get changes we have to do to orig-text:
		 if(element.mdcode.length>0 && mdsimples.indexOf(element.mdcode)>-1){
			 	console.log("adding change "+element.mdcode);
			 //a simple thing - just do the changes later on:
			 //end should be changed after element
			 if(element.typ==="start" || element.typ==="<") changes.push(element);
			 if(element.typ==="start" &&
								 element.brotherelement &&
								 element.brotherelement.line!=element.line){
				 console.log("element"+element.mdcode+element.typ+element.line+" brotherelement:"+element.brotherelement.mdcode+element.brotherelement.typ+element.brotherelement.line);
				 console.log(element);
				 changes.push({
					 line:element.line,
					 posinall:this.map.lineend[element.line],
					 pos:lines[element.line].length,
					 html:element.brotherelement.html,
					 mdcode:element.brotherelement.mdcode,
					 typ:element.brotherelement.typ
				 });
				 for(var ellines=element.line+1;ellines<element.brotherelement.line;ellines++){
					 changes.push({
						 line:ellines,
						 posinall:this.map.linestart[ellines],
						 pos:0,
						 html:element.html,
						 mdcode:element.mdcode,
						 typ:"start"
					 });
					 changes.push({
						 line:ellines,
						 posinall:this.map.lineend[ellines],
						 pos:lines[ellines].length,
						 html:element.brotherelement.html,
						 mdcode:element.brotherelement.mdcode,
						 typ:"end"
					 });
				 }//for-to schleife
			 }//now lines are filled with nearly all changes
			 if(element.typ==="end"){
				 changes.push({
					line:element.line,
					posinall:element.posinall+element.mdcode.length,
					pos:element.pos+element.mdcode.length,
					html:element.html,
				 	mdcode:element.mdcode,
			 		typ:element.typ
				});
				if(element.brotherelement && element.brotherelement.line!=element.line){
					changes.push({
						line:element.line,
						posinall:this.map.linestart[element.line],
						pos:0,
						html:element.brotherelement.html,
						mdcode:element.brotherelement.mdcode,
						typ:element.brotherelement.typ
					})
				}
			}
		 }
		 if(element.typ === "image"){
			 //record in imagesinline;
			 if(imagesinline[element.line]==null)imagesinline[element.line] = new Array();
			 imagesinline[element.line].push(element);
			 //check if image is over http and if so if it exists:
			 var imgparsefalse = false;
			 var imagenotfound = " ";
			 if(element.src.substring(0,4)==="http"){
				 	 if(slidenote.HTTPImagesNotFound === undefined)slidenote.HTTPImagesNotFound = "";
					 if(slidenote.HTTPImagesNotFound.indexOf(element.src)>-1){
						 imagenotfound+="imagenotfound";

					 } else{
						 var imgtocheck = new Image();
						 console.log("image httpsrc: "+element.src);
						 imgtocheck.onerror = function(){
							 //alert("image not found")
							 console.log("image not found:"+this.src);
							 imagenotfound += "imagenotfound";
							 if(slidenote.HTTPImagesNotFound==undefined)slidenote.HTTPImagesNotFound = "";
							 slidenote.HTTPImagesNotFound += this.src;
							 var imgsrcs = document.getElementsByClassName("imagesrc");
							 for(var i=0;i<imgsrcs.length;i++){
								 console.log("imgsrcs innerhtml:"+imgsrcs[i].innerHTML);
								 if(imgsrcs[i].innerHTML === this.src || imgsrcs[i].innerHTML+"/"===this.src){
									 imgsrcs[i].classList.add("imagenotfound");
								 }
							 }
					 		}
							imgtocheck.src = element.src;
				 };
				 //imgtocheck.onload = function(){alert("image geladen")};
			 }else {
				 //image is not over http - check if it exists in database:
				 if(slidenote.base64images && slidenote.base64images.imageByName(element.src)==null){
					 console.log("image not in database:"+element.src);
					 imagenotfound+="imagenotfound";
				 }
			 }
			 //add span for image-tag to get highlightning
			 changes.push({
				 line:element.line,
				 posinall:element.posinall,
				 pos:element.pos,
				 html:'<span class="imagetag">',
				 mdcode:"",
				 typ:"image-tag"
			 });
			 if(element.alt.length>0){
				 changes.push({
					 line:element.line,
					 posinall:element.posinall+2,
					 pos:element.pos+2,
					 html:'<span class="imagealt">',
					 mdcode:"",
					 typ:"image-alt"
				 });
				 changes.push({
					 line:element.line,
					 posinall:element.posinall+2+element.alt.length,
					 pos:element.midpos,
					 html:'</span>',
					 mdcode:"",
					 typ:"end",
					 tag: "image-alt-end"
				 });
			 }
			 changes.push({
				 line:element.line,
				 posinall:element.posinall+2+element.alt.length+2,
				 pos:element.midpos+2,
				 html:'<span class="imagesrc'+imagenotfound+'">',
				 mdcode:"",
				 typ:"image-src"
			 });
			 changes.push({
				 line:element.line,
				 posinall:element.posinall+element.endpos-element.pos,
				 pos:element.endpos,
				 html:'</span>',
				 mdcode:"",
				 typ:"end"
			 });
			 changes.push({
				 line:element.line,
				 posinall:element.posinall+element.mdcode.length,
				 pos:element.pos+element.mdcode.length,
				 html:"</span>",
				 mdcode:"",
				 typ:"end"
			 });
		 }
		 if(element.tag ==="footnote-anchor"){
			 if(element.typ==="start"){
				 changes.push({
					 line:element.line,
					 posinall:element.posinall,
					 pos:element.pos,
					 html:'<span class="footnoteanchor">',
					 mdcode:element.mdcode,
					 typ:"start"
				 });
			 }else{
				 changes.push({
					 line:element.line,
					 posinall:element.posinall+1,
					 pos:element.pos+1,
					 html:"</span>",
					 mdcode:element.mdcode,
					 typ:"end"
				 });
			 }
		 }
		 if(element.tag ==="footnote"){
			 if(this.lineswithhtml[element.line-1]!="footnote"){
				 changes.push({
					 line:element.line,
					 posinall:element.posinall,
					 pos:0,
					 html:'<span class="footnote firstfootnote">',
					 mdcode:element.mdcode,
					 typ:"start"
				 });
			 }else{
				 changes.push({
					 line:element.line,
					 posinall:element.posinall,
					 pos:0,
					 html:'<span class="footnote">',
					 mdcode:element.mdcode,
					 typ:"start"
				 });
			 }
			 changes.push({
				 line:element.line,
				 posinall:this.map.lineend[element.line],
				 pos:lines[element.line].length,
				 html:'</span>',
				 mdcode:"",
				 typ:"end"
			 });
		 } //footnote
		 if(element.tag==="comment"){
			 changes.push({
				 line:element.line,
				 posinall:element.posinall,
				 pos:element.pos,
				 html:'<span class="comment">',
				 mdcode:element.mdcode,
				 typ:"start"
			 });
			 changes.push({
				 line:element.line,
				 posinall:this.map.lineend[element.line],
				 pos:lines[element.line].length,
				 html:'</span>',
				 mdcode:"", typ:"end"
			 });
		 }
		 if(element.typ==="pagebreak"){

		 }
	 }
	 //add error-spans:
	 this.perror.sort(function(a,b){return a.row-b.row});
	 var lasterrorpos;
	 for(var er=0;er<this.perror.length;er++){
		 if(this.perror[er].row!=lasterrorpos){
			 lasterrorpos = this.perror[er].row;
			 if(this.perror[er].errortext!="missing space after *"){
				 changes.push({
					 line:this.perror[er].line,
					 posinall:this.map.linestart[this.perror[er].line]+this.perror[er].row,
					 pos:this.perror[er].row,
					 html:this.perror[er].htmlstart,
					 mdcode:"",
					 typ:"error",
					 tag:this.perror[er].errorclass
				 });
				 if(this.perror[er].errorclass="image"){
					 changes.push({
						 line:this.perror[er].line,
						 posinall:this.map.linestart[this.perror[er].line]+this.perror[er].rowend,//this.map.linestart[this.perror[er].line]+lines[this.perror[er].line].length,
						 pos:this.perror[er].rowend,
						 html:this.perror[er].htmlend,
						 mdcode:"",
						 typ:"error",
						 tag:"imageerror end"
					 });
				 }else{
					 changes.push({
						 line:this.perror[er].line,
						 posinall:this.map.lineend[this.perror[er].line],//this.map.linestart[this.perror[er].line]+lines[this.perror[er].line].length,
						 pos:lines[this.perror[er].line].length,
						 html:this.perror[er].htmlend,
						 mdcode:"",
						 typ:"error",
						 tag:this.perror[er].errorclass
					 });
			 		}
				}
		 }
	 }

	 //sort the array:
	 changes.sort(function(a,b){
		 if(a.typ==="cursor"&&b.typ==="end" &&
		  	a.posinall-b.posinall==0){
			 return 1;
		 }else
		 return a.posinall - b.posinall;
	 });
	 console.log(changes);
	 //do the changes from behind to beginning:
	 for(var c=changes.length-1;c>=0;c--){
		 actchange = changes[c];
		 if(actchange.typ==="<"){
			 lines[actchange.line] = lines[actchange.line].substring(0,actchange.pos) +
  		 												actchange.html +
  														lines[actchange.line].substring(actchange.pos+1);
		 }else {
			// if(actchange.typ ==="start"){
		 	 		lines[actchange.line] = lines[actchange.line].substring(0,actchange.pos) +
		 												actchange.html +
														lines[actchange.line].substring(actchange.pos);
				//}else{
					//lines[actchange.line] = lines[actchange.line].substring(0,actchange.pos+actchange.mdcode.length) +
		 				//								actchange.html +
					//									lines[actchange.line].substring(actchange.pos+actchange.mdcode.length);
				//}
			}
	 }

	 //add proposedsymbol:
	var lasterrorline;
 	var x;
 	//* before ** :
 	var doppelsternchen = new Array();
 	for(x=0;x<this.perror.length;x++){
 			if(lasterrorline != this.perror[x].line && this.perror[x].errortext!="missing space after *"){ //only one error per line, dont parse missing space after * because it sucks
 				//lines[this.perror[x].line]=this.perror[x].encapsulehtml(lines[this.perror[x].line]);
 				var proposedsymbol = this.perror[x].proposeEnding();
 				if(proposedsymbol != ""){
 					if(this.perror[x].errorclass=="bold")doppelsternchen.push(x); else
 					 lines[this.perror[x].line]+=' <span class="proposedsymbol">'+proposedsymbol+'</span>';
					 console.log("proposedsymbol:"+proposedsymbol);
 				}

 			}
 			lasterrorline = this.perror[x].line;

 	}
 	//doppelsternchenfehler anzeigen lassen:
 	for(x=0;x<doppelsternchen.length;x++)lines[this.perror[doppelsternchen[x]].line]+='<span class="proposedsymbol">' + this.perror[doppelsternchen[x]].proposeEnding() + '</span>';
	//adding pagenr to pagebreak:
	for(x=0;x<this.map.pagestart.length;x++){
		var pline =this.map.pagestart[x].line-1;
		if(pline<0)pline=0;
		var pbpos = lines[pline].length;
		if(pline>0 || this.lineswithhtml[pline]==="pagebreak")lines[pline]+='<span class="pagenr">    »»» new page #'+x+'</span>';
		changes.push({
			line:pline,
			posinall:this.map.lineend[pline],//this.map.linestart[this.perror[er].line]+lines[this.perror[er].line].length,
			pos:pbpos,
			html:'<span class="pagenr">    »»» new page #'+x+'</span>',
			mdcode:"",
			typ:"pagenr",
			tag:"pagebreak pagenr"
		});
	}
	console.log(this.map.pagestart);
	//putting it inside line-spans and returning as whole text:
	var temptext = "";
	for(x=0;x<lines.length;x++){
		var lineclass="backgroundline";
		var imgtemptext ="";
		var emptyline = "";
		if(this.lineswithhtml[x]==="data" && (lines[x].length==0 || lines[x]==='<span id="carret"></span>'))emptyline="&nbsp;";
		lineclass += " "+slidenote.parser.lineswithhtml[x];
		temptext += imgtemptext +'<span class="linenr">'+x+
								'</span><span class="'+lineclass+'">'+lines[x]+
								emptyline+
								'</span>';

		temptext+="<br>\n";
	}
	console.log("changes:"); console.log(changes);
	this.mdcodeeditorchanges = changes;
	return temptext;
};

emdparser.prototype.renderNewCursorInCodeeditor = function(){
	var cursorposinall = slidenote.textarea.selectionEnd;
	var cursorline = this.lineAtPosition(cursorposinall);
	if(cursorline == 0){ //error in line0 - quickfix TODO: Why does it not work in line0?
		slidenote.parseneu();
		return;
	}
	var cursorposinline = cursorposinall - this.map.linestart[cursorline];
	console.log("new cursor at line:"+cursorline+", posinall:"+cursorposinall+", pos:"+cursorposinline);
	var codeofline = this.sourcecode.substring(this.map.linestart[cursorline],this.map.lineend[cursorline]);

	var changes = new Array();
	var cursorchange = {
	 line:cursorline,
	 posinall:cursorposinall,
	 pos:cursorposinline,
	 html:'<span id="carret"></span>',
	 mdcode:'',
	 typ:'cursor'
	};
	changes.push(cursorchange);
	for(var x=0;x<this.mdcodeeditorchanges.length;x++){
		//add parsed changes of cursorline to actual changes
		if(this.mdcodeeditorchanges[x].line===cursorline &&
			 this.mdcodeeditorchanges[x].typ!='cursor')changes.push(this.mdcodeeditorchanges[x]);
	}
	changes.sort(function(a,b){
		if(a.typ==="cursor"&&b.typ==="end" &&
			 a.posinall-b.posinall==0){
			return 1;
		}else
		return a.pos-b.pos});

	for(var x=changes.length-1;x>=0;x--){
		var actchange = changes[x];
		if(actchange.typ==="<"){
			codeofline = codeofline.substring(0,actchange.pos) +
														 actchange.html +
														 codeofline.substring(actchange.pos+1);
		}else {
		 // if(actchange.typ ==="start"){
				 codeofline = codeofline.substring(0,actchange.pos) +
													 actchange.html +
													 codeofline.substring(actchange.pos);

		}
	}
	//console.log(changes);
	var backgroundlines = document.getElementsByClassName("backgroundline");
	if(backgroundlines.length>=cursorline)backgroundlines[cursorline].innerHTML=codeofline;
	//console.log("backgroundline neu:"+codeofline);
	//console.log(backgroundlines[cursorline]);
	//console.log(slidenote.textarea.clientWidth + " : "+slidenote.texteditorerrorlayer.clientWidth)
	for(var x=0;x<slidenote.presentation.themes.length;x++){
		if(slidenote.presentation.themes[x].active)slidenote.presentation.themes[x].styleThemeMDCodeEditor(); //Hook-Funktion
	}
};

emdparser.prototype.renderCodeeditorImagePreview = function(){
	var images = new Array();
	var lines = this.returnparsedlines(this.sourcecode); //raw sourcecode

	for(var x=0;x<this.map.insertedhtmlelements.length;x++)if(this.map.insertedhtmlelements[x].typ ==="image")images.push(this.map.insertedhtmlelements[x]);
	//images is now filled with all image-elements
	images.sort(function(a,b){return a.posinall -b.posinall}); //sort them
	for(var x=0;x<lines.length;x++){
		lines[x]="";
	}
	//lines are now empty

	for(var x=0;x<images.length;x++){
		img = images[x];
		if(lines[img.line]===""){
			var beforetmp="";
			var arrowtoimage="";
			for(var bf=0;bf<img.pos+img.mdcode.length;bf++)beforetmp+="&nbsp;";
			var afterspace = 75-img.pos-img.mdcode.length;//(slidenote.textarea.clientWidth / 16) - img.pos - img.mdcode.length;
			for(var ai=0;ai<afterspace;ai++)arrowtoimage+="-";
			lines[img.line]+=beforetmp+arrowtoimage+">";
			console.log(slidenote.textarea.clientWidth + ":clientwidth"+ beforetmp+arrowtoimage+afterspace);
		}
		if(img.src.substring(0,4)!="http" && slidenote.base64images){
			//base64images is active, so check if image is in database:
			if(slidenote.base64images.imageByName(img.src)!=null){
				//base64image found in database:
				console.log("image found: "+img.src);
				lines[img.line]+= '<img src="'+slidenote.base64images.imageByName(img.src).base64url+'">';
			}else{
				//base64image not found in database:
				console.log("imagesrc:"+img.src);
				//imgurl = "images/imageupload.png";
				lines[img.line]+= '<img src="images/imageupload.png">';
			}
		} else {
			lines[img.line]+='<img src="'+img.src+'">';
		}
	}
	var imgtemptext ="";
	for(var x=0;x<lines.length;x++)imgtemptext+='<span>'+lines[x]+"&nbsp;</span><br>";
	return imgtemptext;
}

emdparser.prototype.generateSidebar = function(){
	var sidebarelements = slidenote.parser.map.sidebarelements;
	var sidebar = document.getElementById("sidebar");
	if(!sidebar){
		sidebar = document.createElement("div");
		sidebar.id="sidebar";
		var editor = document.getElementById("texteditor");
		editor.insertBefore(sidebar,editor.childNodes[0]);
	}
	sidebar.innerHTML = "";
	var bglines = document.getElementsByClassName("backgroundline");
	var sidebarlines = new Array();
	//get pixel-height of one line:
	var testline = document.createElement("span");
	testline.classList.add("backgroundline");
	testline.innerText="t";
	bglines[0].parentNode.appendChild(testline);
	var standardlineheight = testline.offsetHeight;
	testline.remove();
	console.log("standard-height:"+standardlineheight);
	for(var x=0;x<bglines.length;x++){
		var newline = document.createElement("div");
		var h = bglines[x].offsetHeight;
		//if(h<10)h=16;
		if(h>standardlineheight){
			newline.ismultiline=true;
			newline.multilines = h/standardlineheight;
			console.log("multiline - lines:"+newline.multilines+" px:"+h);
		}//newline.style.height = h+"px";

		//newline.style.height = h+"px";
		//newline.innerHTML = "&nbsp;"//"Line #"+x;
		sidebarlines.push(newline);
	}

	var carretsymbol = document.createElement("a");
	carretsymbol.classList.add("carretline");
	carretsymbol.href="javascript:slidenote.presentation.showInsertMenu()";
	//carretsymbol.onclick="slidenote.presentation.showInsertMenu()";
	carretsymbol.innerText= "__▽_▶";//" ⌣➤ ▶";
	/*
	var carretsymbol = document.createElement("span");
	carretsymbol.classList.add("carretline");
	var downtilde = document.createElement("a");
	downtilde.href="javascript:alert('todo:buttonmenu')";
	downtilde.innerText = " ▽";
	carretsymbol.appendChild(downtilde);
	var carretmarker = document.createElement("span");
	carretmarker.innerText = " >";
	carretmarker.classList.add("carretmarker");
	carretsymbol.appendChild(carretmarker);*/
	sidebarlines[this.lineAtPosition(slidenote.textarea.selectionEnd)].appendChild(carretsymbol);
	for(var x=sidebarelements.length-1;x>=0;x--){
		actel = sidebarelements[x];
		if(actel.typ==="singleline" || actel.endline === actel.startline){
			var newspan = document.createElement("span");
			newspan.innerText=actel.text;
			newspan.classList.add("singleline");
			sidebarlines[actel.startline].insertBefore(newspan,sidebarlines[actel.startline].firstChild);
			sidebarlines[actel.startline].issingleline=true;
		}else if(actel.typ==="multiline"){
			var firstlinespan = document.createElement("span");
			var lastlinespan = document.createElement("span");
			var innerelementlength=0;
			for(var iex=actel.startline;iex<=actel.endline;iex++)if(sidebarlines[iex].innerText.length>innerelementlength)innerelementlength=sidebarlines[iex].innerText.length;//if(sidebarlines[iex].childNodes.length>innerelementlength)innerelementlength=sidebarlines[iex].childNodes.length;
			if(innerelementlength>0)innerelementlength=innerelementlength+2;
			var emptytext = "....................".substring(0,actel.text.length-1);
			firstlinespan.classList.add("multilinestart");
			firstlinespan.innerText=emptytext;
			lastlinespan.classList.add("multilineend");
			lastlinespan.innerText=emptytext;
			//sidebarlines[actel.startline].appendChild(firstlinespan);
			firstlinespan.innerText+="................".substring(0,innerelementlength-sidebarlines[actel.startline].innerText.length);
			sidebarlines[actel.startline].insertBefore(firstlinespan, sidebarlines[actel.startline].firstChild);
			if(actel.endline-actel.startline>1){
				var middlelinespan = document.createElement("span");
				middlelinespan.classList.add("multilinemiddle");
				middlelinespan.innerText = actel.text;
				var middlelinenr = Math.floor((actel.endline - actel.startline)/2)+actel.startline;
				//if(middlelinenr===actel.endline)lastlinespan=null;

				for(var mlx=actel.startline+1;mlx<middlelinenr;mlx++){
					var simplechild = document.createElement("span");
					simplechild.innerText = emptytext;
					simplechild.innerText+="................".substring(0,innerelementlength-sidebarlines[mlx].innerText.length);
					//sidebarlines[mlx].appendChild(simplechild);
					sidebarlines[mlx].insertBefore(simplechild, sidebarlines[mlx].firstChild);
				}
				//sidebarlines[middlelinenr].appendChild(middlelinespan);
				var spacesright = innerelementlength - sidebarlines[middlelinenr].innerText.length;
				spacesright = spacesright*6;
				middlelinespan.innerHTML+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".substring(0,spacesright);
				sidebarlines[middlelinenr].insertBefore(middlelinespan, sidebarlines[middlelinenr].firstChild);
				for(var mlx=middlelinenr+1;mlx<actel.endline;mlx++){
					var simplechild = document.createElement("span");
					simplechild.innerText = emptytext;
					simplechild.innerText+="................".substring(0,innerelementlength-sidebarlines[mlx].innerText.length);
					//sidebarlines[mlx].appendChild(simplechild);
					sidebarlines[mlx].insertBefore(simplechild, sidebarlines[mlx].firstChild);
				}
			}
			//if(lastlinespan)sidebarlines[actel.endline].appendChild(lastlinespan);
			lastlinespan.innerText+="................".substring(0,innerelementlength-sidebarlines[actel.endline].innerText.length)
				if(lastlinespan)sidebarlines[actel.endline].insertBefore(lastlinespan, sidebarlines[actel.endline].firstChild);

		}
	}
	for(var x=0;x<sidebarlines.length;x++){
		if(sidebarlines[x].innerHTML.length===0)sidebarlines[x].innerHTML = "&nbsp;";
		if(sidebarlines[x].ismultiline){//style.height.length>0){
			var maxlines = sidebarlines[x].multilines -1;
			//maxlines = maxlines.substring(0,maxlines.indexOf("px"));
			//maxlines = Math.floor(maxlines/16);
			if(sidebarlines[x].innerHTML ==="&nbsp;"){
				for(var adline=0;adline<maxlines;adline++)sidebarlines[x].innerHTML+="<br>◥";
			}else{
			//how many lines?
			var firstline = sidebarlines[x].cloneNode(true);
			for(var adline=0;adline<maxlines;adline++){
				//add missing symbols:
				var newline = firstline.cloneNode(true);
				//remove all links:
				while(newline.getElementsByClassName("carretline").length>0){
					var replacement = document.createElement("span");
					replacement.classList.add("replacement");
					replacement.innerText = ".....";
					newline.appendChild(replacement);
					newline.removeChild(newline.getElementsByClassName("carretline")[0]);
				}
				sidebarlines[x].appendChild(document.createElement("br"));
				console.log(newline);
				console.log(newline.childNodes);
				for(var nx=0;nx<newline.childNodes.length;nx++){
					if(newline.childNodes[nx].classList.contains("multilinemiddle")){
						newline.childNodes[nx].classList.remove("multilinemiddle");
						newline.childNodes[nx].innerText="..................".substring(0,newline.childNodes[nx].innerText.length-1);
					}
					if(newline.childNodes[nx].classList.contains("singleline")){
						newline.childNodes[nx].innerText="";
					}
					if(newline.childNodes[nx].classList.contains("multilinestart")){
						newline.childNodes[nx].classList.remove("multilinestart");
					}
					if(newline.childNodes[nx].classList.contains("multilineend")){
						sidebarlines[x].childNodes[nx].classList.remove("multilineend");
						if(adline<maxlines-1)newline.childNodes[nx].classList.remove("multilineend");
					}
				}
				var continueline = document.createElement("span");
				continueline.classList.add("continueline");
				continueline.innerText = "◥";
				newline.appendChild(continueline);
				continueline.previousSibling.innerText = continueline.previousSibling.innerText.substring(0,continueline.previousSibling.innerText.length-1);
				while(newline.childNodes.length>0){
					sidebarlines[x].appendChild(newline.childNodes[0]);
				}
			}
		}}
		sidebar.appendChild(sidebarlines[x]);
	}
	//make cursorline nicer:
	//carretsymbol.innerHTML='&nbsp;<img src="images/buttons/droptilde.png">&nbsp;<img src="images/buttons/cursorline.png">';
	var nicesymbol = document.getElementById("nicesidebarsymbol");//document.createElement("div");
	//nicesymbol.id="nicesidebarsymbol";
	nicesymbol.style.top = (carretsymbol.offsetTop + sidebar.offsetTop) +"px";
	nicesymbol.style.position="absolute";
	//nicesymbol.innerHTML='&nbsp;<a href="javascript:slidenote.presentation.showInsertMenu();"<img src="images/buttons/droptilde.png"></a>&nbsp;<img src="images/buttons/cursorline.png">';

	return sidebarlines;
}

/* Returns the element in the map the current carret is on
 * usefull for many things in the md-Code-Editor
 * returns null if there is no element
*/
emdparser.prototype.CarretOnElement = function(carretpos){
	var element;
	for(var x=0;x<this.map.insertedhtmlelements.length;x++){
		var actel = this.map.insertedhtmlelements[x];
		var actelstart = actel.posinall;
		var actelend = actel.posinall+actel.mdcode.length ;
		//var linenr = this.lineAtPosition(carretpos);
		//if(this.map.lineswithhtml[linenr]==="data")
		if(actel.mdcode.substring(0,1) === "#"){actelstart --; actelend = this.map.lineend[actel.line];} //TODO:linepos
		if(actel.typ==="start" && actel.brotherelement)actelend = actel.brotherelement.posinall+actel.brotherelement.mdcode.length;
		if(actel.typ==="end")actelend = 0; //do nothing on end-elements
		if(actel.html ==="<data>"){actelstart--;actelend++;}

		if(actelstart<carretpos && actelend > carretpos){
			//element getroffen:
			var allowed = "###***__~~"

			element = actel;
		}

	}
	if(element == null){
		var line = this.lineAtPosition(carretpos);
		var linetype = this.lineswithhtml[line];
		if(linetype === "pagebreak" || linetype === "h1" && this.map.insertedhtmlinline[line].length ===1){
			element = this.map.insertedhtmlinline[line][0];
		}
	}
	return element;
}
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
	while(this.sourcecode.indexOf("\n---",aktpos)<position && aktpos>-1){
		altpos = aktpos;
		aktpos = this.sourcecode.indexOf("\n---",aktpos+6);
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
			aktpos=this.sourcecode.indexOf("\n---",aktpos+4);
		}
	}
	if(aktpos>position)position=aktpos+5;
	console.log("found position at:"+position);
	return position;
}
/* 	renderMapToPresentation is a function which takes the map and lineswithhtml
*		information to prerender the presentation-page. it renders into pure basic html
* 	with pagebreaks and such
*/
emdparser.prototype.renderMapToPresentation = function(){
  var lines = this.returnparsedlines(this.sourcecode);
  var changes = this.map.insertedhtmlelements;
	//find imagelines:
	for(var im=0;im<this.map.insertedimages.length;im++){
		var actimg = this.map.insertedimages[im];
		if(this.lineswithhtml[actimg.line]==="imageline")continue; //do nothing if imageline is set yet to avoid duplicates
		//find images-md-code in line:
		var imgLength = 0;
		var imgMdCode = "";
		var imagesInLine = new Array();
		for(var el=0;el<this.map.insertedhtmlinline[actimg.line].length;el++){
			if(this.map.insertedhtmlinline[actimg.line][el].typ ==="image"){
				imgLength += this.map.insertedhtmlinline[actimg.line][el].mdcode.length;
				imagesInLine.push(this.map.insertedhtmlinline[actimg.line][el]);
				imgMdCode += this.map.insertedhtmlinline[actimg.line][el].mdcode;
			}
		}
		if(imgLength === lines[actimg.line].length){
			//there are only images in this line, because md-code is just image-md-code
			this.lineswithhtml[actimg.line]="imageline";
			console.log("simple imageline found"+actimg.line);
		} else{
			//there could be spaces inside this line
			console.log("not so simple imageline found"+actimg.line);
			var imgline = lines[actimg.line];
			imgline = imgline.replace(/\s/g,"");
			imgMdCode = imgMdCode.replace(/\s/g,"");
			console.log("imageline:"+imgline+"\nimgMdCode:"+imgMdCode);
			if(imgline.length === imgMdCode.length){
				this.lineswithhtml[actimg.line]="imageline";
			}
		}
	}//end imagelines
  //add missing parts to changes - eg p-tags, imageblock, empty line etc.
  for(var lwh=0;lwh<lines.length;lwh++){
    if(this.lineswithhtml[lwh]==null&& lines[lwh].length==0){
      this.lineswithhtml[lwh]="empty";
    }else if(this.lineswithhtml[lwh]==null){

      this.lineswithhtml[lwh]="text";
      var linestart = this.map.linestart[lwh];
      changes.push({
				line:lwh, pos:0, posinall:linestart,
				html:"<p>", mdcode:"", typ:"start",
				weight:0
			});
      var followlines=lwh+1;
      while(followlines<lines.length && lines[followlines].length>0 &&//dont parse in empty lines, break on them
							(this.lineswithhtml[followlines]==null || this.lineswithhtml[followlines]==="imageline")
              ){
        this.lineswithhtml[followlines]="text";
        followlines++;
        //console.log("fll++");
      }
	    followlines--; //followlines geht jetzt bis zur letzten zeile
	    var lineend = this.map.lineend[followlines];

	    changes.push({line:followlines, pos:lines[followlines].length,
	      posinall:lineend, html:"</p>", mdcode:"", typ:"start", weight:10});
	  	}//lineswithhtml==null
			if(this.lineswithhtml[lwh]==="imageline"){
				//search for imageblock:
				var followlines = lwh+1;
				while(followlines < lines.length && lines[followlines].length>0 &&
					(this.lineswithhtml[followlines]==null || this.lineswithhtml[followlines]=="imageline")
				){
					this.lineswithhtml[followlines]="imageblock";
					followlines++;
				}
				followlines--;
				if(lwh<followlines){
					this.lineswithhtml[lwh]="imageblock";
					var lineend = this.map.lineend[followlines];
					changes.push({
						line:lwh, pos:0, posinall: this.map.linestart[lwh],
						html:'<div class="imageblock">',mdcode:"",typ:"start",
						weight:0
					});
					changes.push({line:followlines, pos:lines[followlines].length,
					posinall:lineend, html:"</div>", mdcode:"", typ:"end",weight:10});
					//add brs to lines:
					for(var brx=lwh;brx<followlines;brx++)
					changes.push({
						line:brx, pos:lines[brx].length,
						posinall:this.map.lineend[brx],
						html:"<br>", mdcode:"", typ:"end", weight:9
					});

				}
			}//end of imageblock-search
	} //end of for

  changes.sort(function (a,b){
		if(a.posinall!=b.posinall) return a.posinall-b.posinall;
		if(a.weight!=undefined && b.weight!=undefined) return a.weight - b.weight;
		var x = a.weight;
		var y = b.weight;
		if(x===undefined)x=1;
		if(y===undefined)y=1;
		return x-y;
	});
	console.log("changes of parsetopresentation"); console.log(changes);
  //helper function for change:
  function execute(element){
    line = lines[element.line];
    begin = element.pos;
    end = element.pos + element.mdcode.length;
    line = line.substring(0,begin)+element.html+line.substring(end);
    lines[element.line]=line;
  }
	console.log(changes);
  for(var x=changes.length-1;x>=0;x--){
    var change = changes[x];
		console.log(change);
    if(change.tag==="title"){
			console.log("title found");
      lines[change.line] = change.html + lines[change.line].substring(change.mdcode.length)+change.htmlend;
    }else{
      execute(change);
    }
  }

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
  this.parselines(temptext);

}


/*  parseMap is the parsefunction which parses the lines of the sourcecode into
 +  a map (parser.map) and into lineswithhtml (parser.lineswithhtml)
 + with this information the page can be rendered for mdcodeeditor and page later on
 */
emdparser.prototype.parseMap = function(){
  var TimecheckStart = new Date().getTime();
  //new parser parsing only information, does not render anything
  function substitutewitheuro(textlength){
    var signs = "€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€";
    while(textlength>signs.length)signs+=signs;
    return signs.substring(0,textlength);
  }
	var sourcecode = this.sourcecode;
	//sourcecode  = sourcecode.replace(/(\S)([_])(\S)/g,"$1€$3");
	//sourcecode  = sourcecode.replace(/([^\s_])([_])(\S)/g,"$1€$3");
	//console.log("Timecheck: replace T_T needed:"+(new Date().getTime() - TimecheckStart));
  var lines = this.returnparsedlines(sourcecode);
  var linestartpos = 0;
	this.map.sidebarelements = new Array();

  //sort out <:
  for(var x=0;x<lines.length;x++){
    var symbols = ["<", "&", '\\***', "\\**", "\\*", "\\__", "\\_", "\\~~", "\\![", "\\```","\\`"];
    var newsymbols = ["&lt;","&amp;", "***", "**","*","__","_", "~~", "![","```", "`"];
    var temptext = lines[x];
		for(var s=0;s<symbols.length;s++){ //its not working for some reason so avoid it
			var symbol = symbols[s];
			var newsymbol = newsymbols[s];
	    while(temptext.indexOf(symbol)>=0){
	      var actpos = temptext.indexOf(symbol);
	      temptext = temptext.substring(0,actpos)+substitutewitheuro(symbol.length)+temptext.substring(actpos+symbol.length);
	      this.map.addElement({
	        line:x,pos:actpos,posinall:linestartpos+actpos,
	        html:newsymbol,mdcode:symbol,typ:"<",
	        wystextveraenderung:0
	      });
	    }
		}
    lines[x]=temptext;
    linestartpos+=lines[x].length+1; //+1 for \n
  } //end of <

  //scann all lines:
  for(var x=0;x<lines.length;x++){
    var linestart = lines[x].substring(0,1);

    //scan line for title
    if(linestart === "#"){
      var rauten="#";
      //how many? as jakob only wants till ### we just check it this way:
      if(lines[x].substring(0,2)==="##")rauten="##";
      if(lines[x].substring(0,3)==="###")rauten="###";
      var ersatz = "€€€";
      ersatz = ersatz.substring(0,rauten.length);
      this.map.addElement({
				line:x,pos:0,html:"<h"+rauten.length+">",mdcode:rauten,
				typ:"start", tag:"title", htmlend:"</h"+rauten.length+">",
				wystextveraenderung:rauten.length
			});
			this.lineswithhtml[x]="h"+rauten.length;
			var rautentext = ["", "H1", "H2", "H3"];
			this.map.sidebarelements.push({
				typ:"singleline",text:rautentext[rauten.length],
				startline:x, endline:x
			});
    }//end title
		//scan for lists:
		/*	SCAN FOR LISTS (ul and ol)
		*		This part needs regex, and because lists can be recursive
		*  	ol and ul should be both treaded as list.
		* 	findthemall: regex which finds every possible combination of list-md-code:
		*  numlistregexlist: every valid combination as separate regexlist (has to start without spaces)
		*		linetosearch: as we go with spaces in front, we have to get rid of them before
		* 								we check against a valid regex
		*		Big TODO: Can i prevent regex as much as possible?
		*/

		var findthemall = /^(\s*)([\+\-\*]|(\s*)([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\)))\s/;
		var listspaces = -1;
		if(this.lineswithhtml[x]==undefined || this.lineswithhtml[x].substring(0,7)==="sublist")
		listspaces = lines[x].search(findthemall);
		//console.log("listsearch:"+lines[x]+"->"+listspaces);
		if(listspaces>-1){
		  //setting listspaces to right pos:
		  listspaces = lines[x].search(/\S/);
		  if(listspaces==-1)listspaces=0; //is it really necesary?
		  var linetosearch = lines[x].substring(listspaces);
		  //found a new list:
		  var numlistregexlist = [
													/^[0-9]+\.\s/, //1. - regex#0 ul
		                      /^[0-9]+\.\)\s/, //1.) - regex#1 ul
		                      /^[0-9]+\)\s/, //1) - regex#2 ul
		                      /^[a-z]\)\s/, //a) - regex#3 ul
		                      /^[IVX]+\)\s/, //I) - regex#4 ul
		                      /^\-\s/, //"- " - regex#5 ol
		                      /^\*\s/,  //"* " -regex#6 ol
													/^\+\s/   //"+ "- regex#7 ol
												];

		  var nlregnr;
		  //get the right regex to search for:
		  for(var nlrit=0;nlrit < numlistregexlist.length;nlrit++){
		    if(linetosearch.search(numlistregexlist[nlrit])===0){
		      nlregnr = nlrit;
		      break;
		    }
		  }
		  //nlregnr is now the right regex to find the list in further lines
		  var listregex = numlistregexlist[nlregnr]; //save the regex for easier writing
		  var listtyp = "ul";
		  if(nlregnr < 5){ //5 and upward are ul, else is ol, check if you add another regex above
		    listtyp = "ol";
		  }
		  var start ="";
		  if(listtyp === "ol"){
		    //get start for ol:
		    if(nlregnr<2)start = ' start="'+lines[x].substring(listspaces,lines[x].indexOf("."))+'" ';
		    if(nlregnr>=2)start = ' start="'+lines[x].substring(listspaces,lines[x].indexOf(")"))+'" ';
		  }
		  var liststarthtml = "<"+listtyp+start+">";
			// add ul/ol-tag element to map:
		  this.map.addElement({
		    line:x, pos:0, html:liststarthtml, mdcode:"", typ:"start",
		    wystextveraenderung:0, weight:1
		  });
		  var listzeichenarr = [". ", ".) ", ") ", ") ", ") ", "- ", "* ", "+ "];
		  var listzeichen = listzeichenarr[nlregnr];
		  var listmdcode = lines[x].substring(0,lines[x].indexOf(listzeichen)+listzeichen.length);
			//add first li-tag element to map:
		  this.map.addElement({
		    line:x, pos:0, html:"<li>", mdcode: listmdcode,
		    typ:"start", wystextveraenderung:listmdcode.length,
		    tag:listtyp+"-li-start", weight:2
		  });
		  //ol/ul-start-tag + first li-tag are now set
			//get weight of list - as to mean which number of recursion are we in
			var listweight = 0;
			//sublist-check in lineswithhtml:
			if(this.lineswithhtml[x]&& this.lineswithhtml[x].substring(0,7)==="sublist"){ //only on lineswithhtml == list are we on a sublist.
				//console.log(this.map.insertedhtmlinline[x-1][0])
				listweight+=this.lineswithhtml[x].length - 7;
			}
			//console.log("listweight:"+listweight+"lineswithhtml:"+this.lineswithhtml[x]);
		  var listx = x+1;
		  var sublist = false;
		  var listfound = true; //= (linetosearch.search(listregex)===0);
		  var otherlistfound = true;// = (linetosearch.search(findthemall)===0);
			//get rid of list-md-code in line:
			lines[x] = substitutewitheuro(listmdcode.length)+lines[x].substring(listmdcode.length);
			//console.log("found list "+listtyp+" in line "+x+" with start "+liststarthtml+"\nnew lines-x:"+lines[x]);
			//start looking for further list till end of list
		  for(listx=x+1;listx<lines.length;listx++){
		    linetosearch=lines[listx].substring(listspaces); //get line to search for
		    listfound = (linetosearch.search(listregex)===0);
		    otherlistfound = (linetosearch.search(findthemall)===0);
				//console.log("listsearch: listfound:"+listfound+"otherlistfound:"+otherlistfound);
		    if(!listfound && otherlistfound && !sublist){
		      //other listtype found: add br to last line
		      this.map.addElement({
		        line:listx-1, pos:lines[listx-1].length, html:"<br>", mdcode:"",
		        typ:"end", wystextveraenderung:0,
		        tag:listtyp+"-sublist-start-br", weight:3+listweight
		      });
		      sublist = true;
					//add sublist to lineswithhtml:
					if(this.lineswithhtml[listx]&&this.lineswithhtml[listx].substring(0,7)==="sublist"){
						this.lineswithhtml[listx]+="€€€€€";//with this we add 5 to the linesweight;
					} else{
						this.lineswithhtml[listx]="sublist€€€€€";
					}
		    } else if(!listfound && otherlistfound){
		        //other listtype found, but we are in a sublist, so just continue search:
						//add sublist to lineswithhtml:
						if(this.lineswithhtml[listx] && this.lineswithhtml[x].substring(0,7)==="sublist"){
							this.lineswithhtml[listx]+="€€€€€";//with this we add 5 to the linesweight;
						} else{
							this.lineswithhtml[listx]="sublist€€€€€";
						}

		    } else if(listfound && sublist){
		      //found other element of origlist, so close sublist in previous line:
		      this.map.addElement({
		        line:listx-1, pos:lines[listx-1].length, html:"</li>", mdcode:"",
		        typ:"end", wystextveraenderung:0,
		        tag:listtyp+"-sublist-end-li", weight:3+listweight,
						whitespaces:listspaces
		      });
		      sublist = false;
					//get mdcode for list-start-element:
					listmdcode = lines[listx].substring(0,lines[listx].indexOf(listzeichen)+listzeichen.length);
		      this.map.addElement({
		        line:listx, pos:0, html:"<li>", mdcode:listmdcode,
		        typ:"start", wystextveraenderung:listmdcode.length,
		        tag:listtyp+"-start-li", weight:0,
						whitespaces:listspaces
		      });
					//get rid of mdcode in line:
					//console.log("linelistx before change"+lines[listx]);
					lines[listx] = substitutewitheuro(listmdcode.length)+lines[listx].substring(listmdcode.length);
					//console.log("linelistx after change:"+lines[listx]);
		    } else if(listfound && !sublist){
		      //found other element of origlist without being in a sublist
		      this.map.addElement({
		        line:listx-1, pos:lines[listx-1].length, html:"</li>", mdcode:"",
		        typ:"end", wystextveraenderung:0,
		        tag:listtyp+"-sublist-end-li", weight:3+listweight,
						whitespaces:listspaces
		      });
					//get mdcode for list-start-element:
					listmdcode = lines[listx].substring(0,lines[listx].indexOf(listzeichen)+listzeichen.length);
		      this.map.addElement({
		        line:listx, pos:0, html:"<li>", mdcode:listmdcode,
		        typ:"start", wystextveraenderung:listmdcode.length,
		        tag:listtyp+"-start-li", weight:0,
						whitespaces:listspaces
		      });
					//get rid of mdcode in line:
					//console.log("linelistx before change"+lines[listx]);
					lines[listx] = substitutewitheuro(listmdcode.length)+lines[listx].substring(listmdcode.length);
					//console.log("linelistx after change:"+lines[listx]);
		    } else{
		      //no listelement in line - add /li and end the loop
		      this.map.addElement({
		        line:listx-1, pos:lines[listx-1].length, html:"</li>", mdcode:"",
		        typ:"end", wystextveraenderung:0,
		        tag:listtyp+"-end-li", weight:3+listweight,
						whitespaces:listspaces
		      });
		      break;
		    }

		  }//for-to-loop
			var test=false;
		  if(sublist && test){
		    //last line is still a sublist, so one /li is missing
		    this.map.addElement({
		      line:listx-1, pos:lines[listx-1].length, html:"</li>", mdcode:"",
		      typ:"end", wystextveraenderung:0,
		      tag:listtyp+"sublist-end-li", weight:2,
					whitespaces:listspaces
		    });
		  }
		  //all li and /li tags should be set by now. close ol/ul tag:
		  //var sublistweight = 0;
		  //if(sublist)sublistweight=3;
		  this.map.addElement({
		    line:listx-1, pos:lines[listx-1].length, html:"</"+listtyp+">", mdcode:"",
		    typ:"end", wystextveraenderung:0,
		    tag:listtyp+"-end-li", weight:4+listweight
		  });
			//set lineswithhtml:
			for(var lx=x;lx<listx;lx++){
				if(this.lineswithhtml[lx]==undefined)this.lineswithhtml[lx]="list";
			}
			this.map.sidebarelements.push({
				typ:"multiline",text:listtyp, tag: listtyp,
				startline:x, endline:listx-1
			});

		}// end of list block

      //scan for quotes quotes
  		if(linestart==">" && !(lines[x].substring(0,2)=="> ")){
  		    this.perror.push(new parsererror(x,1,lines[x].length,"quotes","missing space after >"));
  		}
  		if(lines[x].substring(0,2)=="> "){
  			qlc=x;
  			console.log("quote gefunden: "+lines[qlc]);
  			//console.log("wasn los? qlc="+qlc+" lines-länge:"+lines.length + "lines[qlc]="+lines[qlc]);
  			while(qlc<lines.length && lines[qlc].substring(0,2)=="> " ){ //}&& confirm("weiter in line?"+qlc+"llenght:"+lines.length)){
  				lines[qlc] = "€€"+lines[qlc].substring(2);
  				//this.veraenderungen.push(new Array("quote",laengebiszeileglc,2));
  				//laengebiszeileglc += lines[qlc].length;
  				qlc++;
  			}
  			//if(confirm("abbrechen?"))break;
  			//console.log("quote gefunden von"+x+" bis:"+qlc)
  			qlc--;
  			//lines[x]="<quote>"+lines[x];

  			if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
  			this.map.addElement({line:x,pos:0,html:"<quote>",mdcode:"> ",typ:"start",wystextveraenderung:2});

  			for(var ql=x;ql<qlc;ql++)this.map.addElement({line:ql,pos:lines[ql].length,
          html:"<br>",mdcode:"",typ:"end",
          wystextveraenderung:0
        })//lines[ql]+="<br>";
  			//console.log("quotes br-tags abgeschlossen");
  			//lines[qlc]+="</quote>";
        this.map.addElement({line:qlc,pos:lines[qlc].length,
          html:"</quote>",mdcode:"",typ:"end",
          wystextveraenderung:0
        })
  			for(var qil=x+1;qil<=qlc;qil++){
  				this.map.addElement({line:qil,pos:0,html:"",mdcode:"> ",typ:"start",wystextveraenderung:2});
  			}
  			letztezeile = qlc;
  			for(var lwh=x;lwh<=letztezeile;lwh++)this.lineswithhtml[lwh]="quote";
				this.map.sidebarelements.push({
					typ:"multiline",text: "quote", tag:"quote",
					startline:x, endline:qlc
				});
  		}//lines[x] fängt jetzt mit <quote> an

			//codeblock and datablock:
			if(lines[x].substring(0,3)==="```"){
				//possible code or datablock found
				var head=lines[x];
				//look out for datablock:
				var datablocktypefound =null;
				for(var blocktype=0;blocktype<slidenote.datatypes.length;blocktype++)if(head.indexOf(slidenote.datatypes[blocktype].type)>-1)datablocktypefound = slidenote.datatypes[blocktype];
				//datablocktypefound is now either null for codeblock or the datatype
				if(datablocktypefound){
					//datablock found:
					var datahead = head;
					var datatyp = datablocktypefound.type;
					console.log("datablock found:"+datahead + "->"+datatyp);
					//look out for dataend:
					var dataende = x+1;
					var innerblocks = 0;
					while(dataende<lines.length){
						if(lines[dataende].substring(0,3)==="```"){
							if(lines[dataende].length===3){
								if(innerblocks===0)break; else innerblocks--;
							}else{
								innerblocks++;
							}
						}
			      dataende++;
			    }
					if(dataende===lines.length){
						 //error no dataend found
			            this.perror.push(new parsererror(x,0,lines[x].length-1,"data","missing endsymbol ```"));
			    		this.perror.push(new parsererror(dataende-1,0,lines[x].length-1,"data","missing endsymbol ```"));
					}else{
						var rawdata = new Array();
			              for(var rdx=x+1;rdx<dataende;rdx++){
			                rawdata.push(lines[rdx]);
			                if(slidenote.datatypes.elementOfType(datatyp).mdcode==false){ //is mdcode allowed? if not:
			                          lines[rdx]=substitutewitheuro(lines[rdx].length); //prevent further parsing
											}else{ //mdcode is allowed
												if(lines[rdx].substring(0,3)=="---"){ //even if mdcode is allowed - if its a new page-sign:
													lines[rdx]=substitutewitheuro(lines[rdx].length); //prevent further parsing so that a section is not broken by page
												}
											}
			              }
										if(slidenote.datatypes.elementOfType(datatyp).mdcode==false){
			              	for(var lwh=x;lwh<=dataende;lwh++)this.lineswithhtml[lwh]="data"; //fill lineswithhtml with data
										}else{
											this.lineswithhtml[x]="data";
											this.lineswithhtml[dataende]="data";
										}
			              var mapstartel = {line:x,pos:0,html:"<data>",mdcode:lines[x],typ:"start",wystextveraenderung:0};
			    					var mapendel = {line:dataende,pos:0,html:"</data>",mdcode:lines[dataende],typ:"end",wystextveraenderung:0, brotherelement: mapstartel};
			    					mapstartel.brotherelement = mapendel;
			    					//this.map.addElement({line:dataende,pos:altelinieende.length-1,html:"</data>",mdcode:"",typ:"end",wystextveraenderung:0});
			    					//save dataobject:
			    					if(this.dataobjects == null)this.dataobjects = new Array();
										if(datahead.indexOf("//")>-1){
											var headcomment = datahead.substring(datahead.indexOf("//"));
											datahead = datahead.substring(0,datahead.indexOf("//"));
											//add new comment to map:
											this.map.addElement({
												line:x,pos:datahead.length,html:"",
												mdcode:headcomment,typ:"start",tag:"comment"
											});
										}
			    					this.dataobjects.push({
											type:datatyp, head:datahead, raw:rawdata,
											startline:x, endline:dataende
										});
			    					mapstartel.dataobject = this.dataobjects[this.dataobjects.length-1];
			    					this.map.addElement(mapstartel); //save parsing to map
			    					this.map.addElement(mapendel); //
										lines[dataende] = substitutewitheuro(lines[dataende].length); //prevent further parsing
										lines[x] = substitutewitheuro(lines[x].length);
										this.map.sidebarelements.push({
											typ:"multiline",text:datatyp,tag:datatyp,
											startline:x, endline:dataende
										});
			    					console.log("neues dataobjekt hinzugefügt");
			    					console.log(this.dataobjects);
					}

				} else{
					//codeblock found:
					//codeblock is much easier as no inner blocks are allowed. the next line with ``` breaks the codeblock:
					var codeende = x+1;
			        while(codeende < lines.length){
			          if(lines[codeende].substring(0,3)==="```")break;
			          codeende++;
			        }
			        if(codeende===lines.length || lines[codeende].substring(0,3)!="```"){
			          //error: no codeend found
			          this.perror.push(new parsererror(x,0,lines[x].length-1,"code","missing endsymbol ```"));
			        }else{
			          //codeend found:
			          this.map.addElement({
			            line:x,pos:0,html:"<code>",mdcode:lines[x],typ:"start",
			            tag:"codestart", wystextveraenderung:lines[x].length
			          });
			          this.map.addElement({
			            line:codeende, pos:0, html:"</code>", mdcode:lines[codeende], typ:"start",
			            tag:"codeende",wystextveraenderung:lines[codeende].length
			          });
			          for(var cx = x;cx<=codeende;cx++){
			            lines[cx]=substitutewitheuro(lines[cx].length); //substitute line to avoid further parsing
			            this.lineswithhtml[cx]="code"; //mark lines as codelines
			          }
								this.map.sidebarelements.push({
									typ:"multiline",text:"code",tag:"code",
									startline:x, endline:codeende
								});

			        }

				}
			}//end of code and datablocks
			//comment: a whole line is signed as a comment:
			if(lines[x].substring(0,2)==="//"){
					//valid comment found:
					var mapcomstart = {
						line:x, pos:0, html:"", mdcode:lines[x],
						typ:"start", tag:"comment"
					}
					this.map.addElement(mapcomstart);
					//prevent further parsing:
					lines[x]=substitutewitheuro(lines[x].length);
			}//end of comment-block
			//all blocks are scanned. now for one-line-elements - eg image, link, code...

			//inline code: has to be first of all one-line-elements to prevent parsing inside of it
			if(lines[x].indexOf("`")>-1){
				var codepos=0;
				while(lines[x].indexOf("`",codepos)>-1){
					codepos = lines[x].indexOf("`",codepos);
					var codestart = codepos;
					var codeend = lines[x].indexOf("`",codestart+1);
					var nextspace = lines[x].indexOf(" ",codestart);
					if(nextspace==-1)nextspace = lines[x].length;
					if(codeend ==-1){
						//codeend not in actual line - continue looking next lines? no - inlinecode is just for the same line
						this.perror.push(new parsererror(x,codepos,nextspace,"inlinecode","missing endsymbol `"));
					}else{
						//codeend found in same line:
						var mapcstart = {
							line:x, pos:codestart, html:"<code>",mdcode:"`",
							typ:"start", wystextveraenderung:1,
							tag: "inlinecodestart"
						};
						var mapcend = {
							line:x, pos:codeend, html:"</code>", mdcode:"`",
							typ:"end", wystextveraenderung:1,
							tag:"inlinecodeend", brotherelement:mapcstart
						};
						mapcstart.brotherelement=mapcend;
						this.map.addElement(mapcstart);
						this.map.addElement(mapcend);
						//prevent further parsing of inline-code:
						lines[x]=lines[x].substring(0,codestart)+
											substitutewitheuro(codeend+1-codestart)+
											lines[x].substring(codeend+1);
											//console.log("inlinecodeline after change:"+lines[x])
					}//end of codeend found in same line

					codepos++; //continue scan regardless of result
				}//end of while

			}//end of inline code
      //image:
			//console.log("imagesearch in line:"+lines[x]);
			//console.log("index:"+lines[x].indexOf("!["));
      if(lines[x].indexOf("![")>-1){
				//console.log("image found");
        var imgaktpos=0;
        while(lines[x].indexOf("![",imgaktpos)>-1 ){
          var imgpos = lines[x].indexOf("![");
          var imgposmid = lines[x].indexOf("](",imgpos);
          var imgposend = lines[x].indexOf(")",imgpos);
          var imginimg = lines[x].indexOf("![",imgpos+1);
          var nextspace = lines[x].indexOf(" ",imgpos);
          if(nextspace==-1)nextspace = lines[x].length;
          var error = "";
          if(imginimg>-1 && imginimg<imgposend){
            this.perror.push(new parsererror(x,imgpos,nextspace,"image","image in image"));//
  					error="imginimg";
  					console.log("image in image: imgpos:"+imgpos+"imginimg"+imginimg+"imgposend"+imgposend);
          }
          if(imgposend==-1 && imginimg==-1){
            this.perror.push(new parsererror(x,imgpos,nextspace,"image","missing endsymbol )"));//
  					error="imgende";
  					console.log("image: missing endsymbol"+imgpos+"->"+nextspace);
          }
          if(imgposmid==-1){
            this.perror.push(new parsererror(x,imgpos,lines[x].length-1,"image","missing midsymbol )"));//
            error="imgmid";
          }
          imgaktpos = imgpos+2; //next scan after found imagepos regardless of result
          if(error.length==0){
            var imgurl = lines[x].substring(imgposmid+2,imgposend);
            var imgalt = lines[x].substring(imgpos+2,imgposmid);
            var imghtml = '<img alt="'+imgalt+'" src="'+imgurl+'">';
            //add element to map:
            this.map.addElement({
              line:x, pos:imgpos, html: imghtml,
              mdcode:lines[x].substring(imgpos,imgposend+1),
              typ:"image", wystextveraenderung:5+imgurl.length+imgalt.length,
              src:imgurl, midpos:imgposmid, endpos:imgposend,
              alt:imgalt
            });
            //check if its the only image because its fast - or shouldnt because of datablock?
            //if(imgpos==0 && lines[x].length==imgposend+1)this.lineswithhtml[x]="image";
            //image is now parsed - get rid of it:
            lines[x]=lines[x].substring(0,imgpos)+substitutewitheuro(imgposend+1-imgpos)+lines[x].substring(imgposend+1);
          }//end of error.length = 0
        }//end of image-while
      }//end of imageblock
      //linkblock:
      if(lines[x].indexOf("](")>-1){
        var linkpos = 0;
        while(lines[x].indexOf("](",linkpos)>-1){
          var linkmid = lines[x].indexOf("](",linkpos);
          var linkstart = lines[x].indexOf("[");
          var linkend = lines[x].indexOf(")",linkmid);
          var nextspace = lines[x].indexOf(" ",linkmid);
          var error="";
          if(nextspace==-1)nextspace=lines[x].length;
          if(linkstart==-1||linkstart>linkmid){
            error= "linkstart not found:";
            this.perror.push(new parsererror(x,linkmid,nextspace,"link","missing startsymbol ["));
          }
          if(linkend==-1){
            error="linkend not found";
            this.perror.push(new parsererror(x,linkmid,nextspace,"link","missing endsymbol ]"));
          }
          if(error===""){
            //no error found - do your things:
            var linktext = lines[x].substring(linkstart,linkmid);
            var linkurl = lines[x].substring(linkmid+2,linkend);
            var linkmapelstart = {
              line:x, pos:linkstart,
              html: '<a href="'+linkurl+'">',
              mdcode: "[",
              typ:"link",
              tag:"linkstart",
              linkurl:linkurl,
              linktext:linktext
            };
            var linkmapelend = {
              line:x, pos:linkmid,
              html:"</a>",
              mdcode:']('+linkurl+')',
              typ:"link",
              tag:"linkend",
              brotherelement:linkmapelstart
            };
            linkmapelstart.brotherelement = linkmapelend;
            this.map.addElement(linkmapelstart);
            this.map.addElement(linkmapelend);
            //get rid of the non-parsing part of the link:
            lines[x]=lines[x].substring(0,linkstart)+"€"+
                      lines[x].substring(linkstart+1,linkmid)+
                      "€€"+substitutewitheuro(linkurl.length)+"€"+
                      lines[x].substring(linkend+1);
          }
          linkpos = linkmid+2; //scan further after actual link regardless of result
        }//end of while link in line
      }//end of linkblock
      //pagebreak:
      if(lines[x].substring(0,3)==="---"){
        var error="";
          //search for missing ---
          var checkforminus = "----------------------------------------------";
          while(checkforminus.length<lines[x].length)checkforminus+=checkforminus;
          if(lines[x]!=checkforminus.substring(0,lines[x].length)){
            error = "not only minus found";
            this.perror.push(new parsererror(x,0,lines[x].length,"pagebreak","not only - in pagebreak"));
          }else{
            this.lineswithhtml[x] = "pagebreak";
            this.map.addElement({
              line:x,pos:0,html:"<hr>",mdcode:lines[x],typ:"pagebreak",
              wystextveraenderung:lines[x].length
            });
            this.map.pageend.push({line:x-1, posinall: this.map.lineend[x-1]});
            this.map.pagestart.push({line:x+1, posinall: this.map.linestart[x+1]});
            lines[x]=substitutewitheuro(lines[x].length);
          }

      }//end of pagebreak
      //footnote-anchor:
      if(lines[x].indexOf("[^")>0){ //footnote-anchors arent allowed at linestart
          while(lines[x].indexOf("[^")>-1){
            var actpos = lines[x].indexOf("[^");
    				var endpos = lines[x].indexOf("]",actpos);
    				var footname;
    				var error=null;
    				if(endpos!=-1){
    					footname = lines[x].substring(actpos+2,endpos);
    					var footident = "[^"+footname+"]:";
    					//search for footnote:
    					var footnoteline=null;
    					for(var fx=x+1;fx<lines.length;fx++){
    						//console.log("footnoteparse fx"+fx);
    						if(lines[fx].substring(0,3)==="---")break;
    						if(lines[fx].substring(0,footident.length)===footident){
    							footnoteline=fx;
    							//console.log("footnoteline:"+footnoteline+"fx"+fx);
    						}
    					}
    					//console.log("footnote "+footident+" line:"+footnoteline);
    					if(footnoteline==null){
    						//error: no footnote found
    						error="no footnote found";
    						this.perror.push(new parsererror(x,actpos,endpos+1,"footnote-anchor",error));
    					}else{
    						//footnote anchor is ready, footnote found on same page at line footnoteline
    						//check if footnote is last element on page or only followed by other footnotes:
    						var islastelement=true;
    						for(var fx=footnoteline;fx<lines.length;fx++){
    							if(this.lines[fx].substring(0,3)==="---")break;
    							if(lines[fx].substring(0,2)!="[^" && this.lineswithhtml!="footnote"){
    								islastelement=false;
    								//console.log("footnote afterline "+fx+":"+lines[fx])
    							}
    						}
    						if(islastelement){
    							//everything is good, save the map-parsing:
    							this.lineswithhtml[footnoteline]="footnote";
    							var fstart = {line:x,pos:actpos,html:"<sup>",mdcode:"[^",
    								typ:"start",wystextveraenderung:2, footnoteline:footnoteline, tag:"footnote-anchor"};
    							var fend = {line:x, pos:endpos, html:"</sup>",typ:"end",mdcode:"]",
    								brotherelement:fstart, wystextveraenderung:1, tag:"footnote-anchor"};
    							fstart.brotherelement = fend;
    							var fnote = {line:footnoteline, pos:0, typ:"start",
    								html:"<p>"+footname+":",mdcode:footident,
    							 	footanchor:fstart, tag:"footnote"};
    							fstart.footer = fnote;
    							this.map.addElement(fstart);
    							this.map.addElement(fend);
    							this.map.addElement(fnote);
                  //delete footnote-tag in footnoteline to prevent further parsing of it:
                  lines[footnoteline]=substitutewitheuro(footident.length)+lines[footnoteline].substring(footident.length);
									//delete footnote-anchor-tag to prevent further parsing of it:
									lines[x]=lines[x].substring(0,actpos)+substitutewitheuro(endpos+1-actpos)+lines[x].substring(endpos+1);

    						}else{
    							//error footnote is not the last element on the page
    							error = "footnote is not last element on the page";
                  //this.perror.push(new parsererror(footnoteline,0,lines[x].length,"footnote",error));
    						}
    					}
    				}else{
    					error= "footnote-anchor not ready yet - missing symbol ]";
    					var nextspace = lines[x].indexOf(" ",actpos);
    					this.perror.push(new parsererror(x,actpos,nextspace,"footnote-anchor","missing endsymbol ]"));
    				}
    				if(error!=null){
    					console.log("footnote error:"+error);
    					break; //dont look further for other footnote-anchor
    				}
    				lines[x] = lines[x].substring(0,actpos)+ "€€"+
    											lines[x].substring(actpos+2);
          }//while footnote in line
      }//end of footnote-anchor
      //footnote
  		if(lines[x].substring(0,2)==="[^"){
  			//footnote shouldnt appear right now, therefore its missing an anchor or else:
  			var endpos = lines[x].indexOf("]:");
  			if(endpos===-1){
  				var nextspace = lines[x].indexOf(" ");
  				this.perror.push(new parsererror(x,0,nextspace,"footnote","missing endsymbol ]:"));
  			}else{
  				this.perror.push(new parsererror(x,0,endpos+2,"footnote","missing footanchor"));
  				console.log("footnote missing footanchor");
  			}
  		}
  		//end of footnote

  }//end of for(x<lines) / parseperlines
  //simple-element-block
  //now parse the simple-elements:
  for(var x=0;x<lines.length;x++){
      //check if line has to be parsed:
      //dont parse if lineswithhtml is one of the following:
      var checkstring = "pagebreak, code";
      if(checkstring.indexOf(this.lineswithhtml[x])>-1)continue; //jump to next line
      checkstring += "h1,h2,h3,ul,ol,quote"; //dont parse further this line if next line is one of these
      var breakline = null;
      for (var chkx=x;chkx<lines.length;chkx++){
        if(checkstring.indexOf(this.lineswithhtml[chkx])>-1){
          breakline = chkx;
          break;
        }

      }
      if(breakline==null)breakline=lines.length;//if no breakline found - its lines.length
      //check for link has to be with found positions in found line, so not collect here
      for(var pare=0;pare<this.parseelemente.length;pare++){
        var pelement = this.parseelemente[pare];
        var mdstart = pelement.emdstart;
        var mdend = pelement.emdend;
        var startpos = 0;
        var endline = x;
        var endpos = null;
        //check if pelement is in line:
        while(lines[x].indexOf(mdstart,startpos)>-1){
          startpos = lines[x].indexOf(mdstart,startpos);
          endpos = lines[x].indexOf(mdend,startpos+mdstart.length);
          var found=false;
          if(endpos>-1){
            //endpos found in line
            endline = x;
            found=true;
          } else{
            //search for lines: endpos is -1
            endline=x+1;
            while(!found && endline<breakline){
                endpos=lines[endline].indexOf(mdend,endpos);
                if(endpos>-1){
                  //check if mdend is * or _
                  if(mdend.length===1 && lines[endline].substring(endpos+1,endpos+2)===mdend){
                    endpos+=2; //continue loop in same line
                    continue;
                  }else{
                    //found endsymbol
                    found=true;
                  }
                }else{
                  endline++;
                }
            }//end of while endpos-1
            if(!found){
              //error: next line is not parseable:
              this.perror.push(new parsererror(x,startpos,lines[x].length,mdstart,"missing endsymbol "+mdend));
              startpos+=mdstart.length;
              continue; //next while-loop
            }
          }//end of multiline-part
          //start and end are collected. TODO: check if one is inside a link-tag:
          //dont bother with link right now. links suck
          if(found){
            var mapstart = {
              line:x, pos:startpos, html:pelement.htmlstart,
              mdcode:mdstart, typ:"start",wystextveraenderung:mdstart.length,
							weight:1
            };
            var mapend = {
              line:endline, pos:endpos, html:pelement.htmlend, mdcode:mdend,
							typ:"end",
              wystextveraenderung:mdend.length, brotherelement:mapstart,
							weight:1
            };
            mapstart.brotherelement = mapend;
            this.map.addElement(mapstart);
            this.map.addElement(mapend);
            lines[x]=lines[x].substring(0,startpos)+substitutewitheuro(mdstart.length)+lines[x].substring(startpos+mdstart.length);
            lines[endline]=lines[endline].substring(0,endpos)+substitutewitheuro(mdend.length)+lines[endline].substring(endpos+mdend.length);
          }//end of found
          startpos+=mdstart.length; //search for next element regardless of result
        }//end of while start in this line found

      }//end of iterating through parseelements
  }//end parsing simple elements per line
  //add last pageend:
  this.map.pageend.push({line:lines.length})
  //save cursorpos:
	this.parsedcursorpos = slidenote.textarea.selectionEnd;
	this.map.insertedhtmlelements.sort(function(a,b){return a.posinall-b.posinall});
  console.log("finished parsing elements");
  console.log(this.lineswithhtml);
  console.log(this.map);
  var TimecheckEnd = new Date().getTime();
  var TimecheckUsed = TimecheckEnd - TimecheckStart;
  console.log("parsed in "+TimecheckUsed+" Ms");


}


/* parsenachzeilen: - soll ersetzt werden, kommt weg
 * parst emd-text zeilenweise (this.sourcecode)
 * speichert geparsten und mit html versehenen code in this.parsedcode
 * speichert gefundene fehler in this.perror - array
 * speichert zeilenmuster in this.lineswithhtml (h1-4, ul, ol, quote, table, code, text )
*/
var parsetest = true;
emdparser.prototype.parsenachzeilen = function(parsemaptest){
	//testweise mal ausstellen die funktion und stattdessen parseMap aufrufen:
	if(parsetest){
	this.parseMap();
	return;
	}
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
		if(lines[x].substring(0,2)=="* " || lines[x].substring(0,2)=="- "){
			glc=x;
			//var laengebiszeileglc = laengebiszeile;
			var listzeichen = lines[x].substring(0,2);
			this.map.addElement({line:x,pos:0,html:"<ul>",mdcode:"",typ:"start",wystextveraenderung:0});
			var linessearch = lines[glc].search(/^([-*]|(\s{0,2})([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\)))\s/);
			while(glc < lines.length && lines[glc]!=null && (lines[glc].substring(0,2)==listzeichen || linessearch==0)){
				if(lines[glc].substring(0,2)==listzeichen){
					lines[glc] = "<li>"+ lines[glc].substring(2)+"</li>";
					this.map.addElement({line:glc,pos:0,html:"<li>",mdcode:listzeichen,typ:"start",wystextveraenderung:2});
					this.lineswithhtml[glc]="ul";
					pseudolines[glc]= "€"+pseudolines[glc].substring(1);
				} else if(lines[glc].substring(0,2)=="  "){
					lines[glc]=lines[glc].substring(2);
					this.map.addElement({line:glc,pos:0,html:"",mdcode:"  ",typ:"start",wystextveraenderung:2});
				}
 				glc++;
				if(glc<lines.length){
					linessearch = lines[glc].search(/^([-*]|(\s{0,2})([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\)))\s/);
				}
			}
			glc--;
			lines[x]="<ul>"+lines[x];
			//muss ich oben machen
			lines[glc]=lines[glc]+"</ul>";
			this.map.multilineobjects.push({typ:"ul", tag:"ul", startline:x, endline:glc});
			letztezeile=glc;
		}
		//lines[x] fängt jetzt mit ul an:
		if(lines[x].substring(0,1)=="*"){
			this.perror.push(new parsererror(x,1,lines[x].length-1,"list","missing space after *"));
		}
		//numeric list
		//console.log("x:"+x+"lwh:"+this.lineswithhtml[x]);
		if(this.lineswithhtml[x]!="code"&& this.lineswithhtml[x]!="data" &&
						//hier kommt die regex hin, die prüft ob eine liste anfängt:
						//bei performace-problemen hier die regex durch andere prüfung ersetzen.
						//lines[x].search(/[0-9]+\.\s/)==0)
						lines[x].search(/^([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\))\s/)==0)
						{
			//es gibt eine liste, prüfen mit welchem zeichen/welcher logik:
			var numlistregexlist = [/^[0-9]+\.\s/, //1.
													/^[0-9]+\.\)\s/, //1.)
												 	/^[0-9]+\)\s/, //1)
											 		/^[a-z]\)\s/, //a)
													/^[IVX]+\)\s/ ]; //I)
			var numlistregex;
			var nlregnr
			for (var nlrit = 0; nlrit < numlistregexlist.length;nlrit++)if(lines[x].search(numlistregexlist[nlrit])==0)nlregnr=nlrit;
			numlistregex=numlistregexlist[nlregnr];
			//numlistregex ist jetzt die gefundene regex
			var listzeichenarr = [". ", ".) ", ") ", ") ", ") "];
			var listzeichen = listzeichenarr[nlregnr];
			var start;
			if(nlregnr<2)start=lines[x].substring(0,lines[x].indexOf("."));
				else if(nlregnr==2)start=lines[x].substring(0,lines[x].indexOf(")"));
			var starttext = "<ol";
			if(start>0)starttext+=' start="'+start+'"';
			starttext +=">";
			this.map.addElement({line:x,pos:0,html:starttext,mdcode:"",typ:"start",wystextveraenderung:0});
			nlc=x;
			var linessearch = lines[nlc].search(numlistregex); //lines[nlc].search(/[0-9]+\.\s/);
			var linessearch2 = lines[nlc].search(/^([-*]|(\s{0,2})([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\)))\s/);
			while(nlc <lines.length && (linessearch ==0 || linessearch2 ==0)){
				if(linessearch==0){
					var tmpmdcode = lines[nlc].substring(0,lines[nlc].indexOf(listzeichen)+listzeichen.length);//". ")+2);
					this.map.addElement({line:nlc,pos:0,html:"<li>",mdcode:tmpmdcode,
					typ:"start",wystextveraenderung:tmpmdcode.length});
					lines[nlc] = "<li>"+lines[nlc].substring(lines[nlc].indexOf(listzeichen)+listzeichen.length)+"</li>";
					this.lineswithhtml[nlc]="ol";
				}else if(lines[nlc].substring(0,2)=="  "){
					//linessearch==2, also leerzeichen gefunden. leerzeichen rausnehmen:
					//dann wird beim nächsten durchlauf neue liste in liste angelegt
					lines[nlc]=lines[nlc].substring(2);
					this.map.addElement({line:nlc,pos:0,html:"",mdcode:"  ",typ:"start",wystextveraenderung:2});
				}
				nlc++;
				if(nlc<lines.length){
					linessearch = lines[nlc].search(numlistregex);///[0-9]+\.\s/); //else linessearch=null;
					linessearch2 = lines[nlc].search(/^([-*]|(\s{0,2})([0-9]+(\.|\)|\.\))|([a-z]|[IVX]+)\)))\s/);
				}
			}
			nlc--;

			lines[x] = starttext + lines[x];
			lines[nlc]+= "</ol>";
			letztezeile=nlc;
			//folgendes geht nicht mehr so, wenn eingerückte listen gibt:
			//for(var lwh=x;lwh<=letztezeile;lwh++)this.lineswithhtml[lwh]="ol";
			this.map.multilineobjects.push({typ:"ol", tag:"ol", startline:x, endline:nlc});
		}
		//lines[x]fängt jetzt mit <ol> an
		if(lines[x].search(/[0-9]/)==0&&this.lineswithhtml[x]!="data"&&this.lineswithhtml[x]!="code"){
			this.perror.push(new parsererror(x,1,lines[x].length,"numeric list","dot and/or whitespace missing"+this.lineswithhtml));
		}
		//quotes
		if(linestart==">" && !(lines[x].substring(0,2)=="> ")){
		this.errorlines[x] = '<span class="error quotes">'+lines[x]+'</span>  ';
		this.errorsourcelines[x] = '<span class="error">'+lines[x]+'</span>  ';
		this.perror.push(new parsererror(x,1,lines[x].length,"quotes","missing space after >"));
		}
		if(lines[x].substring(0,2)=="> "){
			qlc=x;
			//console.log("quote gefunden: "+lines[qlc]);
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
			this.map.multilineobjects.push({typ:"quote", tag:"quote", startline:x, endline:qlc});
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
		//datablock:
		if(lines[x].length>2 && lines[x].substring(0,2)=="||" && this.lineswithhtml[x]!="data"){
			//datablock gefunden?
			//überprüfung von gültigem datablockhead:
			var datahead;
			var datatyp;
			var rawdata;
			if(lines[x].indexOf("||",2)<0){
				//kein gültiger datahead gefunden:
				this.perror.push(new parsererror(x,0,lines[x].length-1,"data","missing endsymbol ||"));
				this.errorlines[x]='<span class="error">'+lines[x]+'</span>  ';
				this.errorsourcelines[x]='<span class="error">'+lines[x]+'</span>';
			}else{
				//gültiger datahead gefunden:
				datahead  = lines[x];
				datatyp = datahead.substring(2,datahead.indexOf("||",2));
				var datatag = "||"+datatyp+"||";
				var dataende = x+1;
				var scanweiter = true;
				while(dataende<lines.length && scanweiter) if(lines[dataende].substring(0,datatag.length)==datatag)scanweiter=false;else dataende++;
			 	if(!slidenote.datatypes.isvalid(datatyp)){
					this.perror.push(new parsererror(x,0,lines[x].length-1,"data","not a valid datatype"));
				} else if(dataende==lines.length || lines[dataende].substring(0,datatag.length)!=datatag){
					this.perror.push(new parsererror(x,0,lines[x].length-1,"data","missing endsymbol "+datatag));
					this.perror.push(new parsererror(dataende-1,0,lines[x].length-1,"data","missing endsymbol "+datatag));
					this.errorlines[x]='<span class="error">'+lines[x]+'</span>  ';
					this.errorsourcelines[x]='<span class="error">'+lines[x]+'</span>';
				}else{
					//datablock ist konsistent von lines[x] bis lines[dataend]
					var altelinie=lines[x];
					var altelinieende=lines[dataende];
					lines[x]="<data>"+lines[x];
					lines[dataende]+="</data>";
					//console.log("dataende:"+dataende+"zeile:"+lines[dataende]);
					var rawdata = new Array();
					//sanitize-code of datablock für wysiwyg und parser:
					for(var dataz=x+1;dataz<dataende;dataz++){
						rawdata.push(lines[dataz]);
						lines[dataz]=this.sanitizeemdcodeline(lines[dataz]);
						var hotpositions= this.sanitizedcodepositions(lines[dataz]);
						for(var hotp=0;hotp<hotpositions.length;hotp++){
							this.map.addElement({line:dataz,pos:hotpositions[hotp][0],html:hotpositions[hotp][1],mdcode:"&",typ:"hotcode",wystextveraenderung:0});
						}
					}
					//lineswithhtml:
					for(var lwh=x;lwh<=dataende;lwh++)this.lineswithhtml[lwh]="data";
					//mapping des gesamten blocks:
					//this.map.addElement({line:x,pos:0,html:"<data>",mdcode:altelinie,typ:"start",wystextveraenderung:altelinie.length});
					//this.map.addElement({line:dataende,pos:0,html:"</data>",mdcode:altelinieende,typ:"start",wystextveraenderung:altelinieende.length});
					var mapstartel = {line:x,pos:0,html:"<data>",mdcode:altelinie,typ:"start",wystextveraenderung:0};
					var mapendel = {line:dataende,pos:0,html:"</data>",mdcode:altelinieende,typ:"end",wystextveraenderung:0, brotherelement: mapstartel};
					mapstartel.brotherelement = mapendel;

					//this.map.addElement({line:dataende,pos:altelinieende.length-1,html:"</data>",mdcode:"",typ:"end",wystextveraenderung:0});
					//datenobjekt speichern:
					if(this.dataobjects == null)this.dataobjects = new Array();
					this.dataobjects.push({type:datatyp, head:datahead, raw:rawdata });
					mapstartel.dataobject = this.dataobjects[this.dataobjects.length-1];
					this.map.addElement(mapstartel);
					this.map.addElement(mapendel);
					//console.log("neues dataobjekt hinzugefügt");
					//console.log(this.dataobjects);
				}
			}
		} //end of datablock, lines[x] fängt jetzt mit <data> an
		//image: (has to check for alt-text too:)
		if(lines[x].indexOf("![")>-1){

			var imgaktpos=0;
			var pseudozeile=pseudolines[x];
			while(pseudozeile.indexOf("![", imgaktpos)>-1){ //können ja mehrere sein
				var imgpos =pseudozeile.indexOf("![",imgaktpos);
				var imgposmid = pseudozeile.indexOf("](",imgpos);
				var imgposend = pseudozeile.indexOf(")",imgpos);
				var imginimg = pseudozeile.indexOf("![]",imgpos+1)
				var nextspace = pseudozeile.indexOf(" ",imgpos)
				var error="";

				if(imginimg>-1 && imginimg<imgposend){
					this.perror.push(new parsererror(x,imgpos,nextspace,"image","image in image"));//
					error="imginimg";
					//console.log("image in image: imgpos:"+imgpos+"imginimg"+imginimg+"imgposend"+imgposend);

				}
				if(imgposend==-1 && imginimg==-1){
					this.perror.push(new parsererror(x,imgpos,nextspace,"image","missing endsymbol )"));//
					error="imgende";
					//console.log("image: missing endsymbol"+imgpos+"->"+nextspace);

				}
				if(imgposmid==-1){
					this.perror.push(new parsererror(x,imgpos,lines[x].length-1,"image","missing midsymbol )"));//
					error="imgmid";
				}
				imgaktpos=imgpos+4;
				//console.log("image imgpos:"+imgpos+"imgaktpos:"+imgaktpos+"nextspace:"+nextspace+"error:"+error);
				var imgurl = pseudozeile.substring(imgposmid+2,imgposend);
				var imgalt = pseudozeile.substring(imgpos+2,imgposmid);
				//TODO: if-abfrage ob img unter url existiert, sonst fehler
				var imghtml = '<img alt ="'+imgalt+'"src="'+imgurl+'">';
				if(error.length==0){
					var imgpos2 = lines[x].indexOf("![");
					var imgpos2end = lines[x].indexOf(")",imgpos2);
					lines[x] = lines[x].substring(0,imgpos2)+imghtml+lines[x].substring(imgpos2end+1);
					//if(this.insertedhtmlinline[x]==null)this.insertedhtmlinline[x]=new Array();
					//this.insertedhtmlinline[x].push(new Array(pseudozeile.indexOf("![]("),"![]("+imgurl+")",imghtml));
					this.map.addElement({line:x,pos:pseudozeile.indexOf("!["),
															html:imghtml,
															mdcode:"!["+imgalt+"]("+imgurl+")",
															typ:"image",
															wystextveraenderung:5+imgurl.length,
															src:imgurl, midpos:imgposmid,endpos:imgposend, alt:imgalt
														});
					//this.veraenderungen.push(new Array("image",laengebiszeile+imgpos,imgposend-imgpos));
					var pseudoimgpos = pseudozeile.indexOf("![");
					pseudozeile = pseudozeile.substring(0,pseudoimgpos)+"€€"+pseudozeile.substring(pseudoimgpos+2);
					//image is ready parsed, so get rid of of it totaly:
				//	var pseudoersatz = "€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€";
				//	while(pseudoersatz.length<imgurl.length+imgalt.length)pseudoersatz+=pseudoersatz;
				//	pseudoersatz = pseudoersatz.substring(0,imgurl.length+5+imgalt.length);
				//	pseudozeile = pseudozeile.substring(0,pseudoimgpos)+pseudoersatz+pseudozeile.substring(imgposend+1);
	/*				pseudozeile = pseudozeile.substring(0,pseudoimgpos)+"€€"+
												pseudozeile.substring(pseudoimgpos+2,imgposmid)+
												pseudoersatz+
												pseudozeile.substring(imgposend+1);
*/
					pseudolines[x]=pseudozeile;
				}else {
					//alert(error);
					//lines[x]=lines[x].substring(0,imgpos)+lines[x].substring(imgpos+4);
					pseudozeile = pseudozeile.substring(0,imgpos)+"€€"+pseudozeile.substring(imgpos+2); //dont scan image again!
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
			if(linkurlend == -1)this.perror.push(new parsererror(x,0,lines[x].length-1,"link","missing link endsymbol )"));//error="linkurlendsymbol";
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
				//console.log("tmpmdcode:"+tmpmdcode + "sourceline:"+sourcelines[x]);
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
		if(lines[x].indexOf("---")==0){
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
			this.map.pageend.push({line:x});
			this.map.pagestart.push({line:x+1});


		}//page-break ist jetzt eingefügt
		//footnote-anchor
		if(lines[x].indexOf("[^")>0){ //footnote-anchors arent allowed at linestart
			//console.log("footnoteanchor start at line"+x);
			var pseudozeile = pseudolines[x];
			while(pseudozeile.indexOf("[^")>-1){
				var actpos = pseudozeile.indexOf("[^");
				var endpos = pseudozeile.indexOf("]",actpos);
				var footname;
				var error=null;
				if(endpos!=-1){
					footname = pseudozeile.substring(actpos+2,endpos);
					var footident = "[^"+footname+"]:";
					//search for footnote:
					var footnoteline=null;
					for(var fx=x+1;fx<lines.length;fx++){
						//console.log("footnoteparse fx"+fx);
						if(lines[fx].substring(0,3)==="---")break;
						if(lines[fx].substring(0,footident.length)===footident){
							footnoteline=fx;
							//console.log("footnoteline:"+footnoteline+"fx"+fx);
						}
					}
					//console.log("footnote "+footident+" line:"+footnoteline);
					if(footnoteline==null){
						//error: no footnote found
						error="no footnote found";
						this.perror.push(new parsererror(x,actpos,endpos+1,"footnote-anchor",error));
					}else{
						//footnote anchor is ready, footnote found on same page at line footnoteline
						//check if footnote is last element on page or only followed by other footnotes:
						var islastelement=true;
						for(var fx=footnoteline;fx<lines.length;fx++){
							if(this.lines[fx].substring(0,3)==="---")break;
							if(lines[fx].substring(0,2)!="[^" && this.lineswithhtml!="footnote"){
								islastelement=false;
								//console.log("footnote afterline "+fx+":"+lines[fx])
							}
						}
						if(islastelement){
							//everything is good, save the map-parsing:
							this.lineswithhtml[footnoteline]="footnote";
							var fstart = {line:x,pos:actpos,html:"<sup>",mdcode:"[^",
								typ:"start",wystextveraenderung:2, footnoteline:footnoteline, tag:"footnote-anchor"};
							var fend = {line:x, pos:endpos, html:"</sup>",typ:"end",mdcode:"]",
								brotherelement:fstart, wystextveraenderung:1, tag:"footnote-anchor"};
							fstart.brotherelement = fend;
							var fnote = {line:footnoteline, pos:0, typ:"start",
								html:"<p>"+footname+":",mdcode:footident,
							 	footanchor:fstart, tag:"footnote"};
							fstart.footer = fnote;
							this.map.addElement(fstart);
							this.map.addElement(fend);
							this.map.addElement(fnote);
							//do the changes to actual lines:
							var rstart = lines[x].indexOf("[^");
							var rend = lines[x].indexOf("]",rstart);
							//console.log("footnote change linesx:"+rstart+","+rend+"\n"+lines[x]);
							lines[x] = lines[x].substring(0,rstart)+"<sup>"+
													lines[x].substring(rstart+2,rend)+"</sup>"+
													lines[x].substring(rend+1);
							lines[footnoteline] = "<p>"+footname+":"+
																		lines[footnoteline].substring(footident.length)+"</p>";

						}else{
							//error footnote is not the last element on the page
							error = "footnote is not last element on the page";
						}
					}
				}else{
					error= "footnote-anchor not ready yet - missing symbol ]";
					var nextspace = pseudozeile.indexOf(" ",actpos);
					this.perror.push(new parsererror(x,actpos,nextspace,"footnote-anchor","missing endsymbol ]"));
				}
				if(error!=null){
					//console.log("footnote error:"+error);
					break;
				}
				pseudozeile = pseudozeile.substring(0,actpos)+ "€€"+
											pseudozeile.substring(actpos+2);
			}//while-loop
		}
		//end of footnote-anchor
		//footnote
		if(lines[x].substring(0,2)==="[^"){
			//footnote shouldnt appear right now, therefore its missing an anchor or else:
			var pseudozeile = pseudolines[x];
			var endpos = pseudozeile.indexOf("]:");
			if(endpos===-1){
				var nextspace = pseudozeile.indexOf(" ");
				this.perror.push(new parsererror(x,0,nextspace,"footnote","missing endsymbol ]:"));
			}else{
				this.perror.push(new parsererror(x,0,endpos+2,"footnote","missing footanchor"));
				//console.log("footnote missing footanchor");
			}
		}
		//end of footnote
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
					//console.log("inlinecode hotcode vor change:"+hotcode+" length:"+hotcode.length);
					var oldsymbol = new Array("*", "<",">","~","[","]","(",")","|","-","_");
//					var newsymbol = new Array("&lowast;","&lt;","&gt;","&tilde;","&#91;","&#93;","&#40;","&#41;","&#124;","&#45;");
					for(var sym=0;sym<oldsymbol.length;sym++)hotcode = this.replace(hotcode,oldsymbol[sym],"€");
					//console.log("inlinecode hotcode nach change:"+hotcode+" length:"+hotcode.length);
					//console.log("inlinecode pseudoline:"+pseudolines[x]);
					pseudolines[x]=pseudolines[x].substring(0,textareacodestart)+"€"+hotcode+"€"+pseudolines[x].substring(textareacodeend+1);//+1
					//console.log("inlinecode pseudoline after:"+pseudolines[x]);
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
		//console.log("zeilendurchlauf beendet. starte einfache parseelemente. pseudolines:");
		//console.log(pseudolines);
		function getFirstStartInLineX(mdcode,line,parser){
			var posInPseudoLine = pseudolines[line].indexOf(mdcode);
			var onelement = parser.CarretOnElement(parser.map.linestart[line]+posInPseudoLine);
			var startInLinesX = 0;
			while(onelement!=null && onelement.typ===image){
				startInLines
			}

		}
	for(var x=0;x<lines.length;x++){
		for(var pare=0;pare<this.parseelemente.length;pare++){
					var posInPseudoLine = pseudolines[x].indexOf(this.parseelemente[pare].emdstart);
					var onelement = this.CarretOnElement(this.map.linestart[x]+posInPseudoLine);
					var startInLinesX = 0;
					//console.log("onelement:"+(onelement!=null)+" pos:"+pseudolines[x].indexOf(this.parseelemente[pare].emdstart)+ "el:"+this.parseelemente[pare].emdstart);
					while(onelement!=null && onelement.typ==="image"){
						//console.log("on element"+onelement.typ + "pos"+posInPseudoLine);
						//continue; //dont parse on image!
						startInLinesX=lines[x].indexOf(this.parseelemente[pare].emdstart,startInLinesX)+this.parseelemente[pare].emdstart.length;
						posInPseudoLine = pseudolines[x].indexOf(this.parseelemente[pare].emdstart,posInPseudoLine+this.parseelemente[pare].emdstart.length);
						onelement = this.CarretOnElement(this.map.linestart[x]+posInPseudoLine);
					}
					var pestart=lines[x].indexOf(this.parseelemente[pare].emdstart,startInLinesX);
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
							//console.log("pseudolines["+x+"] ="+pseudolines[x]);
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
							//console.log(this.parseelemente[pare].emdstart + " wird zu "+ersatzanf);
							pseudolines[x] = pseudolines[x].substring(0,posanf)+ersatzanf
											+pseudolines[x].substring(posanf+ersatzanf.length,posend)
											+ersatzend
											+pseudolines[x].substring(posend+ersatzend.length);
							//console.log("pseudoline[x]"+pseudolines[x]);
							//console.log("pseudoline-end");
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
	//console.log(this.lineswithhtml);
	for(var lwh=0;lwh<lines.length;lwh++){
		if(this.lineswithhtml[lwh]==null && lines[lwh].length==0){
			this.lineswithhtml[lwh]="empty";
		}	else if(this.lineswithhtml[lwh]==null){
			//console.log("text nach lwh"+lwh);
			this.lineswithhtml[lwh]="text";
			//lines[lwh]='<div class="text">'+lines[lwh];
			lines[lwh]='<p>'+lines[lwh];
			//if(this.insertedhtmlinline[lwh]==null)this.insertedhtmlinline=new Array();
			//this.insertedhtmlinline[lwh].push(new Array(0,"","<p>")); //i have to get rid of insertedhtmlinline
			this.map.addElement({line:lwh, pos:0, html:"<p>", mdcode:"", typ:"start", wystextveraenderung:0});
			var followlines=lwh+1;
			//console.log("lineswithhtmllength:"+this.lineswithhtml.length);
				while(this.lineswithhtml[followlines]==null &&
								followlines<lines.length &&
								lines[followlines].length>0
								){
					this.lineswithhtml[followlines]="text";
					followlines++;
					//console.log("fll++");
				}
			followlines--; //followlines geht jetzt bis zur letzten zeile
			//console.log("lwh->followlines"+lwh+" -> "+followlines);
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
	//add last pageend:
	this.map.pageend.push({lines:lines.length});
	//save cursorpos:
	this.parsedcursorpos = slidenote.textarea.selectionEnd;
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
	console.log("encapsulehtml startend:"+startend.start + "-"+startend.end+"muster:"+this.muster);
	console.log(pagetaglines);
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

function pagegenerator(emdparsobjekt, ausgabediv, slidenote){
	this.slidenote = slidenote;
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
	this.loadTheme("extraoptions");
	this.loadTheme("hiddenobjects");
	this.loadTheme("contextfield");
	this.loadTheme("blocks");
	this.loadTheme("stickytitles");
	this.loadTheme("procontra");
	this.loadTheme("azul");
	this.loadTheme("redalert");
	this.loadTheme("tufte");
	this.loadTheme("prototyp");
	this.loadTheme("highlight");
	this.loadTheme("transition");
	this.loadTheme("chartjs");
	this.loadTheme("table");
	this.loadTheme("imgtourl");
	this.loadTheme("klatex");
	this.loadTheme("switchparseelements");
	this.loadTheme("sections");

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
	//this.pagestyles.push(new stylepager(new Array("h2","ol"),'<div class="listblock">','</div>'));
	//this.pagestyles.push(new stylepager(new Array("h2","ul"),'<div class="listblock">','</div>'));
	//this.pagestyles.push(new stylepager(new Array("h2","ol","h2","ol"),'<div class="procontra">',"</div>"));
	//this.pagestyles.push(new stylepager(new Array("h2","text"),'<div class="textblock">','</div>'));
	//this.pagestyles.push(new stylepager(new Array("h2","text"),'<div class="textblockliste">','</div>',"multiple")); komplexere muster erlauben: alle einschließen
	this.pagestyles.push(new stylepager(new Array("footnote"),'<footer>','</footer>'));


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
	//this.presentation.innerHTML = this.presentationhtml;
	var presentationtemplate = document.createElement("template");
	presentationtemplate.innerHTML = this.presentationhtml;
	for(var t=0;t<this.themes.length;t++){
		if(this.themes[t].active)this.themes[t].insideFinalizeHtml(presentationtemplate);
	}
	this.presentation.innerHTML = presentationtemplate.innerHTML; //presentationtemplate.content.cloneNode(true);
	console.log("präsentation ins div geschrieben:"+this.presentation.innerHTML);
	this.pagedivs = document.getElementsByClassName("ppage");
	if(this.aktpage === undefined || this.aktpage>this.pagedivs.length)this.aktpage=0;
	this.pagedivs[this.aktpage].classList.add("active");
	//add bgimg-class to background-images:
	var allimages = this.presentation.getElementsByTagName("IMG");
	for(var i=0;i<slidenote.parser.map.insertedimages.length;i++){
		var image = slidenote.parser.map.insertedimages[i];
		var pg = slidenote.parser.map.pageAtPosition(image.posinall);
		var pagestartline = slidenote.parser.map.pagestart[pg].line;
		console.log("image"+i+" line:"+image.line +"pgstart:"+pagestartline);
		if(image.line === pagestartline){
			allimages[i].classList.add("bgimg");
		}

	}
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
	//afterfinalize ausführen:
	for(var x=0;x<this.themes.length;x++){
		if(this.themes[x].active)this.themes[x].afterFinalizeHtml();
	}
	//jetzt special theme-styles ausführen:
	console.log(this.themes.length+" Themes");
	//console.log(document.
	for(var x=0;x<this.themes.length;x++){
		if(this.themes[x].active){
			var checkbefore = slidenote.presentationdiv.innerHTML.length;
			this.themes[x].styleThemeSpecials(); //Hook-Funktion
			var checkafter = slidenote.presentationdiv.innerHTML.length;
			var checkdiff = checkafter - checkbefore;
			if(checkdiff!=0){
				console.log("checkresult of theme "+ this.themes[x].classname+":"+checkdiff+" added");
			}else{
				console.log("checkresult of theme "+this.themes[x].classname+": no change");
			}

		}
	}
	//afterStyleThemeSpecials ausführen:
	for(var x=0;x<this.themes.length;x++){
		if(this.themes[x].active)this.themes[x].afterStyleThemeSpecials();
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
	//console.log("final output\n"+this.presentationhtml);

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
	console.log("aktpage:"+this.aktpage+" pagedivslength:"+this.pagedivs.length+" page:"+page);
	this.pagedivs[page].classList.add("active");
}

/* loadTheme: Lädt Theme-Dateien (css,js) in die aktuelle HTML-Seite
 * globale string-variable themeobjekts dient dabei dazu zu prüfen, ob es schon mal geladen wurde um doppeltes laden zu vermeiden
 * Nach dem Aufruf ist das Theme noch nicht im pagegenerator, sondern es werden NUR die .css und .js dateien des themes in die Seite geladen
*/
themeobjekts = "";
pagegenerator.prototype.loadTheme = function(themename){
	if(this.slidenote.themeobjekts.indexOf(themename)==-1){
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
		this.slidenote.themeobjekts+=themename;
	}
	console.log(this.slidenote.themeobjekts);
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
	//css-mixup vermeiden:
	this.changeThemeStatus(this.themes.length-1, theme.active);
	//this.stylePages();
	theme.init();
}

/*getThemeByName returns the Theme found by name:
*/
pagegenerator.prototype.getThemeByName = function(name){
	for(var x=0;x<this.themes.length;x++)if(this.themes[x].classname ===name)return this.themes[x];
}
	/*showThemes zeigt die Themes in einem Div an und lässt sie dort aktivieren etc.
	*/
pagegenerator.prototype.showThemes = function(tabnr){
	var breaktext = "<br>";
	var themetabtext = '';
	var designtabtext = '<h3>Basic Theme Selection</h3>';
	var designoptions = '<hr><h3>Design Options</h3>';
	var globaloptionstext = '';
	var chosencssclass;
	for(var x=0;x<this.themes.length;x++){
		var acttheme = this.themes[x];
		if(acttheme.themetype == "css"){
			var acttext = '<input type="radio" name="design" onchange="slidenote.presentation.changeThemeStatus('+x+',this.checked)"';
			if(acttheme.active)acttext +=' checked>'; else acttext+='>';
			if(acttheme.active)chosencssclass=acttheme.classname;
			acttext += '<label>';
			acttext += acttheme.classname + ": ";
			acttext+= acttheme.description;
			acttext +='</label>';
			designtabtext += acttext + breaktext;
		}else{
			var acttext = '<input type="checkbox" onchange="slidenote.presentation.changeThemeStatus('+x+',this.checked)"';
			if(acttheme.active)acttext +=' checked>'; else acttext+='>';
			acttext += '<label>';
			if(acttheme.description==null)acttext += acttheme.classname; else acttext+= acttheme.description;
			acttext +='</label>';
			themetabtext += acttext + breaktext;
		}
		if(acttheme.designoptions!=null && acttheme.active){
			//designoptions:
			designoptions +='<div class="designoptions">';
			designoptions +='<h3>'+acttheme.classname+'</h3>';
			for(var deso=0;deso<acttheme.designoptions.length;deso++){
				actoption = acttheme.designoptions[deso];
				designoptions+='<div class="designoption">';
				console.log(actoption);
				if(actoption.type=="select"){
					designoptions+="<label>"+actoption.description+"</label>";
					designoptions+='<select onchange="slidenote.presentation.changeDesignOption('+x+','+deso+',this.value)">';
					for(var selopt = 0;selopt < actoption.labels.length;selopt++){
						designoptions+='<option value="'+actoption.values[selopt]+'"';
						if(actoption.selected==selopt)designoptions+=' selected="selected"';
						designoptions+='>';
						designoptions+=actoption.labels[selopt];
						designoptions+='</option>';
					}

					designoptions+='</select>';
				}
			}
			designoptions +='</div>';
		}
		if(acttheme.globaloptions!=null && acttheme.active){
			globaloptionstext+='<h3>'+acttheme.classname+'</h3>';
			for(var glop=0;glop<acttheme.globaloptions.length;glop++){
				actoption=acttheme.globaloptions[glop];
				globaloptionstext+='<div class="globaloption">';
				if(actoption.type=="checkbox"){
					var acttext = '<input type="checkbox" onchange="slidenote.presentation.changeGlobalOption('+x+','+glop+',this.checked)"';
					console.log(actoption);
					if(actoption.values)acttext +=' checked>'; else acttext+='>';
					acttext += '<label>';
					if(actoption.description==null)acttext += actoption.classname; else acttext+= actoption.description;
					acttext +='</label>';
					globaloptionstext+=acttext;

				}
				globaloptionstext+='</div>';
			}
		}
	}
	//themeauswahlvoschau:
	var vorschau='<div id="designvorschau">' +
					'<h1>title</h1><h2>second title</h2><ol start="1"><li>nummeric</li><li>list</li></ol>'+
					'<p>some Text</p><ul><li>unordered list</li><li>unordered list</li></ul><p><b>some </b> '+
					'<i>text</i> <strike>to see</strike> <b><i>it all</i></b><br></p>'+
					'</div>';

	var seltab = document.getElementById("themeselectiontab");
	var destab = document.getElementById("designoptionstab");
	var gloptab= document.getElementById("globaloptionstab");
	var options = document.getElementById("options");
	seltab.innerHTML = themetabtext;
	destab.innerHTML = vorschau+designtabtext+designoptions;
	gloptab.innerHTML = globaloptionstext;
	options.classList.add("visible");
	var optiontabbar = options.getElementsByClassName("tabbar")[0].getElementsByTagName("h2");
	var tabbs = options.getElementsByClassName("optiontab");
	console.log(optiontabbar);
	for(var otb=0;otb<optiontabbar.length;otb++){
		optiontabbar[otb].classList.remove("active");
		tabbs[otb].classList.remove("active");
	}
	var tabbnr = tabnr;
	if(tabbnr==null)tabbnr=0;
	optiontabbar[tabbnr].classList.add("active");
	tabbs[tabbnr].classList.add("active");
	if(tabbnr==0){
		document.getElementById("designvorschau").classList.add(chosencssclass);
	}


}

//optionsTab zeigt den jeweiligen Tab an:
pagegenerator.prototype.optionsTab = function(tabnr){
	/*var options = document.getElementById("options");
 	var optiontabbar = options.getElementsByClassName("tabbar")[0].getElementsByTagName("h2");
	var optiontabs = document.getElementsByClassName("optiontab");
	for(var x=0;x<optiontabbar.length;x++){
		optiontabbar[x].classList.remove("active");
		optiontabs[x].classList.remove("active");
	}
	optiontabbar[tabnr].classList.add("active");
	optiontabs[tabnr].classList.add("active");
	*/
	this.showThemes(tabnr);
}

//hideThemes versteckt die Theme-auswahl bei klick auf close
pagegenerator.prototype.hideThemes = function(){
	document.getElementById("options").classList.remove("visible");
	slidenote.textarea.focus();
	console.log("parseneu forced after optionsclose");
	slidenote.parseneu();
}
//changeThemeStatus erwartet eine themenr und ändert das entsprechende theme
pagegenerator.prototype.changeThemeStatus = function(themenr, status){
	if(this.themes[themenr].themetype=="css" && status){
		//es darf nur ein css ausgewählt werden?
		var vorschau = document.getElementById("designvorschau");

		for(var x=0;x<this.themes.length;x++)if(this.themes[x].themetype=="css"){
			this.themes[x].active=false;
			if(vorschau!=null)vorschau.classList.remove(this.themes[x].classname);
		}
		if(vorschau!=null)vorschau.classList.add(this.themes[themenr].classname);

	}
	//this.themes[themenr].active = status;
	this.themes[themenr].changeThemeStatus(status);
	if(this.themes[themenr].editorbuttons!=null){
		if(status){
			for(var x=0;x<this.themes[themenr].editorbuttons.length;x++){
				var actbutton = this.themes[themenr].editorbuttons[x];
				var newhtmlbutton = document.createElement("button");
				newhtmlbutton.type = "button";
				newhtmlbutton.classList.add(this.themes[themenr].classname+"button");
				newhtmlbutton.innerHTML = actbutton.innerhtml;
				//var actbuttonfunction = "insertbutton('null','"+actbutton.mdstartcode+"','"+actbutton.mdendcode+"');";
				newhtmlbutton.value = actbutton.mdstartcode;
				//console.log("actbuttonfunction:"+actbuttonfunction);
				//newhtmlbutton.setAttribute("onclick",""+actbuttonfunction);
				if(this.themes[themenr].editorbuttons[x].insertfunction==undefined){
					newhtmlbutton.onclick = function(){
						slidenote.insertbutton(this.value);
					}
				}else {
					newhtmlbutton.onclick =
						slidenote.presentation.themes[themenr].editorbuttons[x].insertfunction;
				}

				document.getElementById("insertarea").appendChild(newhtmlbutton);
			}
		}else{
			var oldbuttons = document.getElementsByClassName(this.themes[themenr].classname+"button");
			for(var x=oldbuttons.length-1;x>=0;x--)oldbuttons[x].parentNode.removeChild(oldbuttons[x]);
		}
	}
	console.log("themenr"+themenr+" "+this.themes[themenr].classname+" active geändert auf"+status);
}

pagegenerator.prototype.changeDesignOption = function(themenr,optionnr, value){
	this.themes[themenr].changeDesignOption(optionnr, value);
	console.log("themenr"+themenr+" "+this.themes[themenr].classname+" active geändert auf"+status);
}
pagegenerator.prototype.changeGlobalOption = function(themenr,optionnr, value){
	this.themes[themenr].changeGlobalOption(optionnr, value);
	console.log("themenr"+themenr+" "+this.themes[themenr].classname+" active geändert auf"+value);
}

pagegenerator.prototype.showInsertMenu = function(){
	var insertmenu = document.getElementById("insertarea");
	console.log("show insertMenu");
	insertmenu.style.visibility = "visible";
	insertmenu.tabIndex = 0;
	//position insertmenu after carretsymbol or above:
	var carretline = document.getElementsByClassName("carretline")[0];
	var cursorlinesymbol = document.getElementById("cursorlinesymbol");
	if(carretline){
		var top = carretline.offsetTop + document.getElementById("sidebar").offsetTop +5;
		console.log("insertmenu-top:"+top);
		var topmax = slidenote.textarea.offsetHeight - insertmenu.offsetHeight;
		if(top>topmax){
			top-=insertmenu.offsetHeight;
			var cursorlinesymboltop = insertmenu.offsetHeight -9;
			cursorlinesymbol.style.top = cursorlinesymboltop+"px";
			//insertmenu.getElementsByTagName("IMG")[1].style.display="none";
		} else{
			//insertmenu.getElementsByTagName("IMG")[1].style.display="unset";
			cursorlinesymbol.style.top = "-7px";
		}
		insertmenu.style.top = top+"px";
	}
	slidenote.textarea.focus(); //get focus on slidenote again to regain cursor
	//insertmenu.focus();
	carretline.style.visibility="hidden";

	var closeMenu = function(){
		setTimeout(function (){
			var insertmenu = document.getElementById("insertarea");
			insertmenu.tabIndex = undefined;
			insertmenu.style.visibility = "hidden";
			document.getElementsByClassName("carretline")[0].style.visibility="visible";
			slidenote.textarea.focus();
		},200);

	}
		insertmenu.onclick = closeMenu;
		slidenote.textarea.addEventListener("click", closeMenu);
		slidenote.textarea.addEventListener("keyup",closeMenu);
		slidenote.textarea.addEventListener("scroll",closeMenu);
		for(var x=0;x<slidenote.presentation.themes.length;x++){
			if(slidenote.presentation.themes[x].active)slidenote.presentation.themes[x].styleThemeMDCodeEditor("insertAreaVisible"); //Hook-Funktion
		}

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
	var cursorpos = slidenote.textarea.selectionEnd;
	//this.cursorposBeforePresentation = cursorpos;
	if(!fullscreen){
		//this.init();
		fullscreen=true;
		if(parsetest)slidenote.parser.renderMapToPresentation();
		document.getElementById("praesentation").innerHMTL = "";
		this.init(slidenote.parser, document.getElementById("praesentation"));
		//var test2 = document.getElementsByTagName("code");
		//if(test2!=null)console.log(test2.length+"codes");
		this.stylePages();
		//var test = document.getElementsByTagName("code");
		//if(test!=null)console.log(test.length+"codes code1: ");
		//console.log("querycodeanzahl:"+document.querySelectorAll(".presentation code")[0].innerHTML);

		//console.log("querycodeanfang:"+document.querySelectorAll(".presentation code")[0].innerHTML.substring(0,20));
		//this.showPage(presentation.emdparsobjekt.pageAtPosition(quelle.selectionStart)[0]);
		console.log("show page:"+this.emdparsobjekt.map.pageAtPosition(cursorpos) + " pos:"+cursorpos);
		//this.showPage(this.emdparsobjekt.map.pageAtPosition(cursorpos));
		var showpagenr = this.emdparsobjekt.map.pageAtPosition(cursorpos);
		if(this.generatedPages){
			for(var gpx=this.generatedPages.length;gpx>=0;gpx--){
				if(this.generatedPages[gpx]<showpagenr)showpagenr++;
			}
			console.log("changed pagenr to:"+showpagenr + " gp-length:"+this.generatedPages.length);

		}
		this.showPage(showpagenr);
		praesesrahmen.classList.add("fullscreen");
		praesesrahmen.tabIndex=1; //make it tabable to get keystrokes
		praesesrahmen.focus(); //focus it to get keystrokes
		//document.getElementById("praesentation").focus();
		//praesesrahmen.style.height = document.height;
		document.body.style.height = "100vh";
		document.body.style.overflow = "hidden";
	} else{
		fullscreen=false;
		praesesrahmen.tabIndex = undefined; //undo tabable so it cant get accessed by accident/screenreader
		if(this.generatedPages){
			for(var gpx=0;gpx<this.generatedPages.length;gpx++){
				if(this.generatedPages[gpx]<this.aktpage)this.aktpage--;
			}
			console.log("changed aktpage to:"+this.aktpage);
		}
		//presentation.ausgabediv.classList.remove("active");
		//console.log("map.linestart"+this.aktpage+":"+slidenote.parser.map.linestart[slidenote.parser.map.pagestart[this.aktpage].line]);
		var oldPage = slidenote.parser.map.pageAtPosition(quelle.selectionEnd);//slidenote.parser.pageAtPosition(quelle.selectionEnd, "pagenr");
		console.log("oldpage:"+oldPage+"aktpage:"+this.aktpage);
		if(oldPage != this.aktpage){
			quelle.selectionEnd = slidenote.parser.map.linestart[slidenote.parser.map.pagestart[this.aktpage].line];//presentation.emdparsobjekt.positionAtPage(presentation.aktpage);
			quelle.selectionStart = quelle.selectionEnd;
			quelle.focus();
			quelle.selectionEnd = slidenote.parser.map.linestart[slidenote.parser.map.pagestart[this.aktpage].line];//presentation.emdparsobjekt.positionAtPage(presentation.aktpage);
		} else{
			quelle.focus();
		}
		console.log("parse neu ein");
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
	this.designoptions;
	this.globaloptions;
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
Theme.prototype.insideFinalizeHtml = function(template){
	//HookFunction inside Finalize Html, before adding template to body and rendering it
}
Theme.prototype.afterFinalizeHtml = function(){
	//Hook-Function, called before styleThemeSpecials
}
Theme.prototype.afterStyleThemeSpecials = function(){
	//Hook-Function, called after styleThemeSpecials
}
Theme.prototype.styleThemeMDCodeEditor = function(){
	//Hook-Funktion, gedacht zum überschreiben in .js-Datei des Themes
	//Wird ausgelöst wenn MDCodeEditor ausgewählt ist
}

Theme.prototype.addDesignOption = function(type, description, labels, values, selected){
	//type: html-element-unterscheidung:
	var htmlelements ="radio,select,checkbox,button";
	if(this.designoptions==null)this.designoptions = new Array();
	this.designoptions.push({type:type,description:description,labels:labels,values:values,selected:selected});
}

Theme.prototype.changeDesignOption = function(optionnr, value){
	//Hook-Funktion, gedacht zum Überschreiben in .js-Datei des Themes
}

Theme.prototype.addGlobalOption = function(type, description, labels, values){
	var htmlelements = "radio, select, checkbox, button";
	if(this.globaloptions==null)this.globaloptions = new Array();
	this.globaloptions.push({type:type,description:description, labels:labels, values:values});
}

Theme.prototype.changeGlobalOption = function(optionnr, value){
	//Hook-Funktion, gedacht zum Überschreiben in .js-Datei des Themes
}
Theme.prototype.addEditorbutton = function(buttoninnerhtml,startcode,endcode, insertfunction){
	if(this.editorbuttons==null)this.editorbuttons = new Array();
	this.editorbuttons.push({mdstartcode:startcode, mdendcode:endcode,innerhtml:buttoninnerhtml, insertfunction:insertfunction});
}
Theme.prototype.init = function(){
	//Hook-Funktion, gedacht zum Überschreiben in .js-Datei des Themes
	//wird nach zufügen des Themes aufgerufen
}
Theme.prototype.changeThemeStatus = function(status){
	this.active = status;
}
Theme.prototype.saveConfigString = function(){
	//Hook-Funktion, gedacht zum Überschreiben in .js-Datei des Themes
	//wird von slidenoteguardian benutzt um Configs zu speichern
	return null;
}
Theme.prototype.loadConfigString = function(data){
	//Hook-Funktion, gedacht zum Überschreiben in .js-Datei des Themes
	//wird von slidenoteguardian benutzt um Configs zu laden
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
	this.themeobjekts="";
	this.presentation = new pagegenerator(this.parser,this.presentationdiv, this);

	//datablock types:
	this.datatypes = new Array(); //objects with type, mdcode, theme
	this.datatypes.isvalid = function(datatype){
		var result=false;
		for(var x=0;x<this.length;x++){
			if(this[x].type===datatype)result=true;
		}
		return result;
	}
	this.datatypes.elementOfType = function(datatype){
		var result;
		for(var x=0;x<this.length;x++)if(this[x].type===datatype)result=this[x];
		return result;
	}
	/*examples:
	slidenote.datatypes = [
		{type:"chart", mdcode:false, theme:chartjs},
		{type:"table", mdcode:true, theme:table},
		{type:"latex", mdcode:false, theme:latex},
		{type:"flow", mdcode:false, theme:flowjs},
		{type:"section", mdcode:true, theme:section},
		{type:"header",mdcode:true, theme:persistantheaderjs}
	]

	*/

	//edit-modus:
	this.wysiwygactivated = false;
	this.texteditorerroractivated = true;
	this.wysiwygarea.classList.add("hidden");
	this.texteditorerrorlayer.classList.remove("hidden");

	//markdowneditor-sachen:
	this.lasttyping = new Date().getTime();
	this.lastpressedkey = "";
}

slidenotes.prototype.choseEditor=function(editor){
	this.editormodus=editor;
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
		document.getElementById("nicesidebarsymbol").style.display="unset";
	}else if(editor=="focus"){
		this.wysiwygactivated=false;
		this.texteditorerroractivated = true;
		this.wysiwygarea.classList.add("hidden");
		this.texteditorerrorlayer.classList.remove("hidden");
		document.getElementById("slidenotediv").classList.remove("vollbild");
		document.getElementById("sidebar").innerHTML="";
		document.getElementById("nicesidebarsymbol").style.display="none";
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
	document.getElementById("editorchoice").value = editor;
	console.log("choseEditor parse:");
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
	//texteditorfehlerlayer.style.height = (eingabeblock.offsetHeight-4)+"px";
	texteditorfehlerlayer.style.height = (eingabeblock.clientHeight-4)+"px";
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
		//MDCodeEditor:
		if(this.texteditorerroractivated){
			//this.texteditorerrorlayer.innerHTML = this.parser.parseerrorsourcebackground();
			this.texteditorerrorlayer.innerHTML = this.parser.renderCodeeditorBackground();
			//add sidebar here
			if(this.editormodus!="focus" && document.getElementById("editorchoice").value!="focus")
				this.parser.generateSidebar();

			if(this.afterCodeEditorrender)this.afterCodeEditorrender();
			//getting rid of false lines from proposedsymbols:
			var proposedsymbols = document.getElementsByClassName("proposedsymbol");
			for(var pps = 0;pps<proposedsymbols.length;pps++){
				if(proposedsymbols[pps].offsetLeft<10) proposedsymbols[pps].style.display = "none";
			}
			this.scroll(this.textarea);
			//this.texteditorImagesPreview = document.getElementById("texteditorimagespreview");
			//this.texteditorImagesPreview.innerHTML = this.parser.renderCodeeditorImagePreview();
			this.texteditorrahmensetzen();
			for(var x=0;x<this.presentation.themes.length;x++){
				if(this.presentation.themes[x].active)this.presentation.themes[x].styleThemeMDCodeEditor(); //Hook-Funktion
			}
		}
	}
	var endzeit = new Date();
	var parszeit = zwischenzeit - startzeit;
	var renderzeit = endzeit - zwischenzeit;
	var gesamtzeit = endzeit - startzeit;
	console.log("Timecheck: Parsen von "+this.textarea.value.length+" Zeichen und "+this.parser.map.insertedhtmlelements.length+" Elementen brauchte: "+parszeit+"ms - Rendern brauchte:"+renderzeit+"ms" );
	if(slidenoteguardian)slidenoteguardian.autoSaveToLocal(new Date().getTime());
};

slidenotes.prototype.renderwysiwyg = function(){
	//nur wysiwyg neu aufbauen
	var st = this.wysiwygarea.scrollTop;
	this.parser.parsewysiwyghtml();
	this.wysiwygarea.innerHTML = this.parser.errorcode;
	//ergänzung für base64-urls:
	if(this.base64images!=null){
		//ersetze img-srcs durch entsprechende base64-codes:
		//console.log("base64 nicht leer - bilder ersetzen");
		var b64imges = this.wysiwygarea.getElementsByTagName("img");
		for(var x=0;x<b64imges.length;x++){
			var b64url=this.base64images.imageByName(b64imges[x].src.substring(b64imges[x].src.lastIndexOf("/")+1));
			if(b64url!=null)b64imges[x].src = b64url.base64url;
		}
	}
	this.wysiwygarea.scrollTop = st;
	this.wysiwyg.scrollToCursor();
	console.log("renderwysiwyg abgeschlossen");
}

slidenotes.prototype.parseLater = function(){
	var lasttyping = new Date().getTime();
	var pause = 500;
	var diff = lasttyping - this.lasttyping;
	console.log("parselater()"+diff);
	this.lasttyping = lasttyping;
	setTimeout("slidenote.parseLater2("+pause+")",pause);
}
slidenotes.prototype.parseLater2 = function(pause){
	var lasttyping = new Date().getTime();
	var diff = lasttyping - this.lasttyping;

	if(diff>pause-10){
		console.log("parse von parselater2");
		this.parseneu();
	}
	console.log("parselater2:"+diff+(diff>pause));
}

slidenotes.prototype.parseAfterPause = function(){
	this.keypressstack--;
	console.log("keypressstack:"+this.keypressstack);
	if(this.keypressstack>0)return;
	console.log("keypresstack = 0, check if you have to parse:"+document.getElementById("carret").innerHTML);
	if(document.getElementById("carret").innerHTML.length>0)slidenote.parseneu();
}

slidenotes.prototype.keypressdown = function(event, inputobject){
	var key = ""+event.key;
	console.log(event);
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
	//mdcode-editor-part:
	if(!this.wysiwygactivated&&this.texteditorerroractivated){
		//var renderkeys = "*_#"
		if(key==="Enter"){// || key==="Backspace" || renderkeys.indexOf(key)>-1){
			console.log("parse keypressdown");
			this.parseneu();//on Enter you should always parse anew
			this.scroll();
		}else if(key.indexOf("Arrow")>-1){
			if(document.getElementById("editorchoice").value!="focus")
			setTimeout("slidenote.parser.generateSidebar()",10);
		}else if(key.indexOf("Page")>-1){
			this.parser.map.lastcursorpos = this.textarea.selectionEnd;
			event.preventDefault();
		}else{
			if(key.length===1 && !event.ctrlKey){ //TODO: Mac-Command-Taste?
				//this.lastcarretpos = carretpos;
				if(this.textarea.selectionEnd-this.textarea.selectionStart>0){
					console.log("parseneu forced because of selection");
					setTimeout("slidenote.parseneu()",50); //on selection parse anew
				}else if(this.lastpressedkey==="Dead"){
					//last key pressed was a dead key, so parse anew:
					console.log("parseneu forced because of dead-key");
					setTimeout("slidenote.parseneu()",50);
				}else{
					var cursor = document.getElementById("carret");
					cursor.innerHTML = cursor.innerHTML+""+key;
					if(this.keypressstack===undefined)this.keypressstack=0;
					this.keypressstack++;
					setTimeout("slidenote.parseAfterPause()", 500);

					console.log("actkey:"+key+"last key:"+this.lastpressedkey);
				}
			}

			//this.parseLater();
		}
	}

	//from here on only if wysiwyg is activated:
	if(!this.wysiwygactivated){

		return;
	}

	if(key==="Shift")this.wysiwyg.shiftdown = true;
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
			//old selection exists, so reuse this
			var oldtop = this.wysiwygarea.scrollTop; //remember old scrollTop
			this.wysiwygarea.focus(); //focus on wysiwygarea
			this.wysiwyg.setCursorToElement(alteselection, true); //set selection on wysiwygarea
			this.wysiwygarea.scrollTop = oldtop; //set old scrollTop so browser does not scroll to top
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


	/*var carretpos = this.textarea.selectionEnd;
	if(carretpos - this.lastcarretpos!=1){
		console.log("parseneu forced by carretpos on keyup"+carretpos+"->"+this.lastcarretpos);
		this.parseneu();
	}
	this.lastcarretpos = carretpos;*/
	if(key=="undefined")key=getKeyOfKeyCode(event.keyCode);//key=String.fromCharCode(event.keyCode);
	if(this.texteditorerroractivated){
		var renderkeys = "*_#]:\\";
		if(key==="Enter" || key==="Backspace" || key==="Delete" || renderkeys.indexOf(key)>-1){
			console.log("parseneu forced after key "+key);

			this.parseneu();
			this.scroll();
			this.lasttyping = new Date().getTime();
		}
		console.log("Key pressed:"+key);
		if(key.indexOf("Arrow")>-1 || key==="Home" || key==="End"){
			console.log("home, end or arrow pressed");
			var actcursor=document.getElementById("carret");
			if(actcursor.innerHTML.length>0){
				console.log("parseneu forced after arrowkey");
				this.parseneu();
				this.scroll();
			}else{
				console.log("parse only new cursor after arrowkey");
				actcursor.parentNode.removeChild(actcursor);
				this.parser.renderNewCursorInCodeeditor();
			}
			return;
		}

		if(key==="PageUp" || key==="PageDown"){
			var selstart = this.textarea.selectionStart;
			var selend = this.textarea.selectionEnd;
			var currentline;
			var gotoline=null;
			var currentpos;
			if(this.textarea.selectionDirection === "backward"){
				currentline = this.parser.lineAtPosition(selstart);
				currentpos=selstart;
			}	else {
				currentline = this.parser.lineAtPosition(selend);
				currentpos = selend;
			}
			if(key==="PageUp"){

				for(var gtl=this.parser.map.pagestart.length-1;gtl>=0;gtl--){
						var pageel = this.parser.map.pagestart[gtl];
						if(pageel.line<currentline && gotoline==null){
							gotoline=pageel.line;
							gotopage=gtl;
						} else if(pageel.line===currentline &&
											this.parser.map.linestart[pageel.line]<currentpos && gotoline==null){
							gotoline=pageel.line;
							gotopage=gtl;
							console.log("from:"+selstart+"to:"+this.parser.map.linestart[pageel.line]+"line"+gtl);
						}
					}
					if(gotoline==null)gotoline=0;
			} else {
				for(var gtl=0;gtl<this.parser.map.pagestart.length;gtl++){
						var pageel = this.parser.map.pagestart[gtl];
						if(pageel.line>currentline && gotoline==null){
							gotoline=pageel.line;
							gotopage=gtl;
						}
				}
				if(gotoline==null)gotoline=this.parser.map.lineend.length-1;
			}

			if(event.shiftKey){
				if(key==="PageUp"){
					if(this.textarea.selectionDirection==="backward")this.textarea.selectionStart = this.parser.map.linestart[gotoline];
					if(this.textarea.selectionDirection === "forward"){
						if(this.parser.map.linestart[gotoline]>=selstart)this.textarea.setSelectionRange(this.textarea.selectionStart, this.parser.map.linestart[gotoline],"forward");
						if(this.parser.map.linestart[gotoline]<selstart)this.textarea.setSelectionRange(this.parser.map.linestart[gotoline], this.textarea.selectionStart,"backward");
					}
				}
				if(key==="PageDown"){
					if(this.textarea.selectionDirection==="forward")this.textarea.selectionEnd = this.parser.map.linestart[gotoline];
					if(this.textarea.selectionDirection==="forward" && gotoline===currentline)this.textarea.selectionEnd = this.parser.map.lineend[gotoline];
					if(this.textarea.selectionDirection==="backward"){
						console.log("from:"+currentline+"to:"+gotoline+"selection:"+selstart+"/"+selend);
						if(this.parser.map.linestart[gotoline]<=selend)this.textarea.setSelectionRange(this.parser.map.linestart[gotoline],this.textarea.selectionEnd,"backward");
						if(this.parser.map.linestart[gotoline]>selend)this.textarea.setSelectionRange(this.textarea.selectionEnd, this.parser.map.linestart[gotoline],"forward");
					}
				}
			}else{
					this.textarea.selectionStart = 	this.parser.map.linestart[gotoline];
					this.textarea.selectionEnd = this.textarea.selectionStart;
			}
			console.log("parseneu forced by pageup/down");
			this.parseneu();
			var htmllines = document.getElementsByClassName("backgroundline");
			if(gotoline<htmllines.length){
				var oftop=0;
				if(gotoline>0)oftop=htmllines[gotoline-1].offsetTop;
				if(oftop==undefined)oftop=0;
				this.textarea.scrollTop = oftop;
				console.log("scroll to:"+oftop);
				this.scroll();
			}
			console.log("from "+currentline+"go to line:"+gotoline +" page:"+gotopage + "from"+this.parser.map.pagestart.length);
			return;
		}
		if(key==="Escape"){
			var imguploadscreen = document.getElementById("imagesblock");
			if(imguploadscreen.classList.contains("visible")){
				imguploadscreen.classList.remove("visible");
				this.textarea.selectionEnd = this.textarea.selectionEnd +1;
				this.textarea.selectionStart = this.textarea.selectionEnd;
			}else{
				this.parseneu();
				this.presentation.showpresentation();
			}
		}
		if(this.lastpressedkey==="Dead"){
			console.log("parseneu forced by dead key");
			this.parseneu();

		}
		if(this.lastpressedkey ==="Dead" && key ==="Shift")this.lastpressedkey = "Dead";
			else	this.lastpressedkey = key;

	}


	if(!this.wysiwygactivated)return;
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
				console.log("start parse");
				this.parseneu();
			}else {//if(!event.ctrlKey){
				console.log("tippen mit:"+key + " metakey:"+event.metaKey);
				this.wysiwyg.typing(key);
			}
		} else if(!this.texteditorerroractivated) {
			console.log("parsen....");
			this.parseneu();
		}
	}
};

slidenotes.prototype.insertbutton = function(emdzeichen, mdstartcode, mdendcode){
	console.log("insert button:"+emdzeichen+"mdstart:"+mdstartcode);
	var textarea = this.textarea;
	var startemdl = new Array('**','*','~~',"%head","%list","%nrlist","%link","%quote","%image","%table","-----");
	var endemdl = new Array('**','*','~~',"\n","\n","\n","%link","\n","%image","%table","\n");
	var emdnr;
	var emdstart="";
	var emdend="";
	var multilineselection = false;
	var actelement = this.parser.CarretOnElement(textarea.selectionEnd);
	if(actelement!=null && actelement.dataobject!=null){
		if(this.datatypes.elementOfType(actelement.dataobject.type)!=null &&
			 this.datatypes.elementOfType(actelement.dataobject.type).mdcode ==false){
				 alert("mdcode insert not allowed inside datablocks of type "+actelement.dataobject.type);
				 return;
			 }
	}
	if(emdzeichen.substring(0,5)=="%head"){
		emdstart="\n#";
		//emdnr = prompt("h... 1,2,3,4?");
		emdnr = emdzeichen.substring(5);
		for(var xa=1;xa<emdnr;xa++)emdstart+="#";
		emdend="\n";
	}else if((emdzeichen=="%nrlist" || emdzeichen=="%list" || emdzeichen=="%quote") &&
						textarea.selectionStart ===textarea.selectionEnd){
							var insz = "";
							if(emdzeichen==="%nrlist"){
								emdstart="1. ";
								emdend="\n2. \n3. \n";
							}
							if(emdzeichen==="%list"){
								emdstart="- ";
								emdend="\n- \n- \n";
							}
							if(emdzeichen==="%quote"){
								emdstart="> ";
								emdend="\n";
							}

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
		//if(slidenote.base64images!=null){
		//	var imgurl = slidenote.base64images.lastImage().name;
		//} else {
			var imgurl = prompt("hier kommt bald imageupload rein. solange: tippe hier url ein:");
		//}
			emdend="![]("+imgurl+")";
  }else if(emdzeichen.substring(0,4)==="%b64"){
		if(slidenote.base64images!=null){
			emdend="![]("+emdzeichen.substring(4)+")";
		}
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
	}else if(emdzeichen.substring(0,3)=="```"){
		emdstart=emdzeichen+"\n";
		//emdend="\n"+emdzeichen.substring(0,emdzeichen.indexOf("||",2)+2) +"\n";
		emdend="\n```\n";
	}else if(emdzeichen==="---"){
		emdstart = "\n"+emdzeichen+"\n";
		emdend = "";
	}else if(emdzeichen==="%comment"){
		emdstart = "\n//";
		endend = "\n";
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
	//textarea.scrollTop = scrolltop; //scrolle an richtige stelle
	//testparsenachzeilen(document.getElementById("quelltext").value); //zeichen einparsen
	console.log("parse nach input");
	this.parseneu();


};

slidenotes.prototype.scroll = function(editor){
	this.texteditorrahmensetzen();
	if(editor==this.textarea && this.texteditorerroractivated){
		this.texteditorerrorlayer.scrollTop = editor.scrollTop;
		var sidebartop = 0-editor.scrollTop;
		document.getElementById("sidebar").style.top = sidebartop+"px";
		var nssym = document.getElementById("nicesidebarsymbol");
		if(nssym){
			nssym.style.top = (sidebartop + document.getElementsByClassName("carretline")[0].offsetTop) + "px";
			document.getElementById("insertarea").style.top = nssym.style.top;
		}
	}
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
		cursortop = cursor.offsetTop;// - this.wysiwygarea.offsetTop;
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
			console.log("scrolling"+this.wysiwygarea.scrollTop + "->"+ cursortop);
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
