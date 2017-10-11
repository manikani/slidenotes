# Proof of concept des emd-parsers sowie des pagegenerators
erstellt in 58 stunden
Stand 12. April 2017
-----
#Konzept des Prozesses:
Durch das Parsen eines Eingabetextes mit EMD-Formatierung soll eine ansehbare Slideshow generiert und abgespielt werden können. 
Dabei baut das Programm auf folgende Layer auf:
1. Es gibt einen Texteditor, der die Eingabe erleichtert
2. Es gibt einen Parser, der den Texteditor aus der Eingabe aufnimmt und nach Fehlern sucht, diese an den Texteditor zurück gibt. Derselbe Parser übernimmt auch die Aufgabe, emd-code in html-code umzuwandeln und den Code vorzuparsen
3. Es gibt einen Pagegenerator, der den geparsten Text nimmt und daraus dann die Slideshow erstellt
-----
#Der Texteditor
Ich habe mir kurz den Wysiwyg-Editor angeschaut. Abgesehen davon, dass er nicht funktioniert und ich den Code erstmal reparieren müsste habe ich mir selbst auch Gedanken gemacht und sehe nicht, dass das Konzept des **What you see is what you get** hier Sinn macht. 
Statt dessen denke ich, dass der EMD-Code ja genau das Gegenteil von WYSIWYG bedeutet: nämlich eben nicht mithilfe von unsichtbarem Code (der nur über die Knöpfe oben oder Shortcuts funktionert) sondern in einem Texteditor einen möglichst simplen Code schreiben. 
Ein WYSIWYG geht von diesem Konzept total weg. Daher war auch der WYSIWYG-Editor des Projekts so gescheitert: es ist nur so halb wysiwyg, eigentlich nicht, weil es wird ja noch der code dargestellt, aber irgendwas dazwischen. Das hilft glaube ich nicht, sondern frustriert nur. 
Der berühmte Word-Effekt trat bei mir selbst des öfteren auf, als ich versuchte, Text in dem Editor zu formatieren. 
(Man kennt ihn auch als Was-zum-Teufel-tut-er-da? Effekt)

-----
#Die Lösung:
Der Texteditor selbst richtet sich vielmehr nach einem Code-Editor und versucht, dessen Stärken einzubringen. Er zeigt dir Fehler an und schlägt vor, diese zu beheben. Indem es dir bspw. den ***fehlenden Stern*** anzeigt. 
Die *geparste* Ausgabe kann auch direkt live angezeigt werden. So gibt es die Möglichkeit, rechts neben den Editor ein Ausgabefenster zu setzen, in welchem bspw. eine miniaturisierte Vorschau sichtbar ist. Ansonsten kann jederzeit geswitched werden. 
Die Hauptarbeit erledigt dabei der Parser, der den Text bei jeder Keyboardeingabe u.ä. erneut parst und so direkt mehrere Ausgabemöglichkeiten anbieten kann. 
Durch die direkte Rückkopplung von Fehlern ist es möglich, relativ schnell die **Fehler zu erkennen** und auszumerzen. Das Vorschlagen von fehlenden Symbolen lässt einen flüssiger und schneller arbeiten als von der Tastatur zur Maus zu wechseln wie in einem Wysiwyg-Editor. 

Nachteil ist natürlich: Je länger der Text wird, desto langsamer wird der Editor, das heißt, dass Tippgefühl wird immer blöder. hier müsste noch getrimmt werden, dass nur sichtbarer Code geparsed wird oder von der aktuellen Seite oder ähnliches. Und nicht alle Ausgabeformate wie momentan. 
Das Problem hast du beim Wysiwyg aber genauso. 
-----
#Vergleich Aufwand WYSIWYG-Editor oder Eigenlösung

#WYSIWYG-Editor

##Pro 
1. Es ist schon viel Code-Arbeit geschrieben
2. Sicherheitschecks durch mehr Leute
##Wysiwyg Contra
1. Verstehen und Reparieren des vorhandenen Codes
2. Styler und Pager arbeiten mit Html-Code
3. oder: Anpassen des vorhandenen Codes
4. Verwalten von Abhängigkeiten: Abhängigkeitskonflikte vermeiden

-----
#Vergleich Aufwand WYSIWYG-Editor oder Eigenlösung

#Eigenlösung

##Pro
1. Code from Scratch - Null Abhängigkeiten, pures Javascript
2. Code in purem Javascript: Gut pflegbar auf lange Zeit
3. Keine Abhängigkeiten: Keine Sorge ob beim Update das Programm noch funktioniert
4. Styler und Pager arbeiten mit geparstem Code aus Eigenbau, müssen nicht auf Html zurückgreifen 
##Contra
1. Code from Scratch: Alles selbst schreiben
2. Keine Sicherheitschecks durch andere Leute

-----
#Vergleich Aufwand WYSIWYG-Editor oder Eigenlösung

##Fazit: 
Code from Scratch hat auf kurze Sicht mehr Arbeitsaufwand, auf lange Sicht aber schlägt es auf jeden Fall. Fraglich ist auch, ob der Aufwand, den Fremdcode zu verstehen und anzupassen die bis zum Proof-Of-Concept gebrauchte Arbeitszeit (bisher 36 Stunden) nicht weit übersteigt. 
Darüber hinaus code ich lieber ohne JQuery, nicht nur wegen der Abhängigkeiten sondern vor allem wegen der besseren Übersichtlichkeit des puren Javascript-Codes. 
-----
#Der Parser
Der Parser ist ein Object, welches text aus dem texteditorfenster nimmt und einparst. Da der EMD-Code hauptsächlich, aber nicht ausschließlich Zeilenbasiert ist, parst er den Text zunächst in Zeilen ein und danach Zeile für Zeile. 
Dabei tauscht er sie mit HTML aus, merkt sich aber bereits bestimmte Muster und erkennt Fehler im Code. Anschließend bietet er verschiedene Ausgabeformate des Codes an:
1. Interpretierter HTML-Code
2. Interpretierter HTML-Code mit Fehleranzeige (wäre ein Ansatz, wenn Wysiwyg im Eigenbau gebaut werden soll)
3. Code mit Fehleranzeige ausführlich
4. Code als Hintergrund für Texteditor

Mit Letzterem wird die direkte Rückkopplung an die Eingabe des Users ermöglicht. Wichtig sind eigentlich nur der interpretierte Code, sowie der Code als Hintergrund für den Texteditor. 
Darüber hinaus bietet er eine grobe Vorsortierung/Parsung des Inhalts an, mit welchem der Pagegenerator arbeiten kann, sowie Funktionen, um für den Texteditor Positionen im Code rauszusuchen etc. 
Dadurch ist es beispielsweise möglich, nahtlos zwischen der Ausgabe und dem Texteditor hin und herzuschalten, was das Editieren einfacher macht. 
Klick dich durch die Präsentation und verstecke mal selbige an einer Stelle - du landest direkt am Anfang des Codes der zuletzt gesehenen Seite. 
-----
#Der Pagegenerator
* parsed sich aus dem Code die Seiten heraus. 
* sucht nach Mustern, wobei er auf Daten zurückgreifen kann die ihm vom Parser geliefert werden. Das bietet sich wegen der Zeilenbasierung des EMD-Code sehr gut an. 
* styled die Seiten anhand der erkannten Muster mit zusätzlichem HTML
* ist die Schnittstelle um zusätzliche css-Klassen anzuhängen, also zu Themen
* verwaltet die Präsentation, also die eigentliche Ausgabe
-----
#Das Theming
Der Pagegenerator hat die Aufgabe, die Seiten entsprechend den Vorgaben eines Themes zu gestalten. Dazu kann er die Seiten mit zusätzlichen HTML-Tags stylen und Tags mit CSS-Klassen versehen. 
Das Theming gestaltet sich also über zwei Layer:
1. Direkte Gestaltung über Suchmuster
2. Gestaltung über CSS-Klassen
Ein Theme besteht daher auch aus einer oder mehreren der folgenden Komponenten: 
1. Such- und Ersetzungsmuster für das HTML-Styling nach dem Parserobjekt 
2. Suchmuster für HTML-Elemente im fertigen HTML-Code
3. Such- und Ersetzungsmuster für Code innerhalb gefundener HTML-Elemente
3. Anhängen von themespezifischen Klassen an gefundene Elemente
4. Anhängen von Klassen des Themes an die Seiten generell

-----
#Suchmuster
Die Suchmuster für das HTML-Styling sind noch sehr einfach gehalten. Momentan implementiert ist ein Suchmusterparsen für zeilenbasierte Suchmuster. 
##Zeilenbasierte Suchmuster
Es gibt eine ***Syntax*** für Suchmuster, nach denen gesucht werden kann. Dieses besteht aus Codes für die jeweilige Zeile, hintereinander angehängt. 
Zukünftig soll diese Syntax erweitert werden um komplexere Suchmuster zu gestalten. 
Ein Beispiel für ein solches Suchmuster ist bereits implementiert: Gegenüberstellung von Aufzählungen. 
Das Suchmuster besteht aus: "h2","list","h2","list". 
Das bedeutet: wenn in den Zeilen folgendes Muster auftritt, ein titel, dann eine liste über eine oder mehrere zeilen, dann ein titel, dann eine weitere liste wird um diese Zeilen ein weiterer Div-Tag gepackt. So kann später einfacher mit CSS gearbeitet werden. Das ist das Stylen des HTML-Codes. 

##zukünftig
Die Syntax muss erweitert werden, sollen komplexere Suchmuster erfolgen. Bspw. mehrere Textblöcke, bestehend aus Überschrift und Text, in ein Div packen könnte die Syntax folgendermaßen aussehen:
"h2","text","wiederholung"
Dies könnte interpretiert werden als Solange abwechselnd h2 und text kommen gilt der bereich zwischen erstem h2 und letztem text und kann umrahmt werden mit Div. 
Oder sogar noch komplexer, bspw:
"h2","text+", "wiederholung"
könnte das + dafür stehen, dass der text über mehrere zeilen gehen kann. Oder noch erweiteter:
"h2","text+","text->Zeilenanfang", "wiederholung"
dass eine Text-Zeile kommt die mit Zeilenanfang ->anfängt, {}enthält usw. 
Vieles möglich.

-----
#CSS
Das Theming der CSS-Klassen sollte grundsätzlich so aufgebaut werden, dass sie als Start der CSS-Definition ihren Theme-Namen als Klasse haben. Also bspw.:
```
.mytheme h2{
   font-family:superbeautifullfont;
}
```
Durch das Anhängen der Theme-Klasse an die Präsentation bzw. deren Rahmen wird das Theme aktiv. So können verschiedene CSS-Themes ausgewählt und - falls kompatibel - sogar miteinander kombiniert werden. Themes lassen sich so leicht nachladen. 
Für spezielle Klassen und Suchmuster für selbige können eigene Themes-Objekte erstellt werden. Diese dienen dazu, weitere fehlende Html-Muster und Suchmuster hinzuzufügen. Und sie initialisieren das Theme bzw. fügen es dem Pagegenerator hinzu und mehr. Erstellt werden sie in einer Javascript-Datei. 

##Ein Theme besteht daher aus zwei Dateien:
1. themename.js
2. themename.css

-----
#Das Themeobjekt
Um ordentlich Themen zu können habe ich ein Hook-ähnliches System eingebaut. Durch das Nachladen der Theme.js-Datei wird das eigentliche Theme in den Pagegenerator geladen. Dadurch können auch nachträglich noch Themes hinzugefügt werden. 
Die Theme.js-Datei beinhaltet dabei die Initialisierung und Anhängung eines Theme-objekts und hat immer folgenden Aufbau:

```
//emdcode-theme: searches for emd-code inside code-block and themes it:
var newtheme = new Theme("themename", gewicht); //gewicht ist optional falls die Reihenfolge der Ausführung der Themes wichtig wird
newtheme.addStyle(suchmuster,'<div class="themeclassname">','</div>'); //Einfaches Suchmuster
newtheme.styleThemeSpecials = function(){ //Hook-Funktion
// Kann komplett frei geschrieben werden oder auf Hilfsfunktionen des Theme-Objekts zurückgreifen
}
presentation.addTheme(newtheme); //Übergibt das Theme an den Pagegenerator 
```

##Absolutes Minimum ist daher
1. ) es muss ein theme erstellt werden mit einem themenamen (var newtheme = new Theme("themename));
2. ) das erstellte theme muss dem pagegenerator übergeben werden (presentation.addTheme(newtheme));
3. ) es gibt eine css-datei deren definitionen mit dem themenamen als klasse beginnen (.themename )


-----
#Proof of Concept:
Als Beispiel habe ich das Theme emdcode entworfen. Es besteht aus zwei Dateien:
##emdcode.css
```
.emdcode .emdcodesymbol {
   color:blue;
}

.emdcode code ol{
   background:grey;
   color:black;
}
.emdcode code li{
   border-bottom: 1px solid black;
   margin-bottom: 2px;
   background:lightgrey;
}
```
##emdcode.js
```
var newtheme = new Theme("emdcode", 1);
newtheme.styleThemeSpecials = function(){
	this.cycleThroughHtmlElements("code"); //Hilfsfunktion des Theme-Objekts, erwartet zweite Hook-Funktion
}
newtheme.specialStylePerElement = function(texta){ //zweite Hookfunktion des Theme-Objekts
	var text = "";
	text += texta;
	var zeichen = new Array(
				"| -------- | -------- | -------- |",
				"|","-----",
				"![","[","](",")",
				"#","*","~~");
	for(var x=0;x<zeichen.length;x++){
		var schl=0;
		while(text.indexOf(zeichen[x],schl)>-1){
			var treffer = text.indexOf(zeichen[x],schl);
			text = text.substring(0,treffer)
				+'<span class="emdcodesymbol">'
				+text.substring(treffer, treffer + zeichen[x].length)
				+ '</span>' 
				+ text.substring(treffer + zeichen[x].length);
			schl =treffer+28+zeichen[x].length;
		}
	}
	//alle zeichen sind jetzt ummantelt
	var lines = new Array();
	var aktpos = 0;
	while(text.indexOf("<br>",aktpos)>-1){
		if(aktpos<text.indexOf("<br>",aktpos))
		  lines.push( 
			text.substring(
			aktpos , text.indexOf("<br>", aktpos)
			)
		);
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


```
-----
So können einfach zusätzliche Themes nachgeladen werden und es muss nicht alles in einem Code stehen. So kann später über das CMS das Theming leichter um weitere Themes erweitert werden. Alternative zum Javascript-Aufbau wäre eine ähnliche Syntax wie fürs zeilenbasierte Stylen zu entwickeln. Bspw. eine Lösung um aus folgendem Code:
```
#Rechnung xy
1. Posten a 500€
2. Posten b 300€
3. Posten c 100€
4. Posten d 790€
* Ergebnis:  1690€
```
eine schicke Darstellung einer Rechnung zu generieren. Hier kann natürlich auch der EMD-Code verlassen werden und neue Sachen eingebracht werden, bspw.:
```
#Rechnung xy
Posten a 20€
+ Posten wasweisich 30€
+ Sonderausgabe Essen 50€
= 100€ Gesamtausgabe
```
-----
#Zusätzliches Theming
Nicht nur neue Elemente können so generiert werden: 
Durch die Offenheit des Hook-Systems können auch neue Automatisierungen eingebracht werden: 

##Beispielsweise: 
* Automatisches Erkennen von langen Textblöcken
* Erkennen wenn Seitenlänge länger als 100% der Präsentation ist
* Automatische Anpassung der Schriftgröße um Seite auf 100% der Präsentation zu bringen
* Unterscheidung verschiedener Code-Arten um verschiedene Hervorhebungsmodi zu aktivieren
* Dynamische Verwaltung und Aktivierung verschiedener Themes
* Zufügen von komplexen Suchmustern, die nicht zeilenbasiert sind
-----
#Weitere Beispiele/Ideen für automatisierte Gestaltung:

```
##überschrift
textblock
->pfeiltext
##überschrift
textblock
```
wird zu:

```
<div class="textblockarea">
  <div class="textblock">
    <h2>überschrift</h2>
    <span class="text">textblock</span>
  </div>
  <div class="textblockpfeil">pfeiltext</div>
  <div class="textblock">
    <h2>überschrift</h2>
    <span class="text">textblock</span>
  </div>
</div>
```
Ohne Erweiterung der Syntax streiche nur den Pfeil und anstelle der klasse textblockpfeil bekommts textblockzwischentext
-----
#Erweiterung der EMD-Syntax
Wie schnell zu sehen ist, verlockt es, die EMD-Syntax zu erweitern. Es braucht aber eine genaue Evaluierung ob das Sinn macht. 

##Erweiterung Pro
1. Es lässt sich genauer parsen und damit durch den User steuern. Der Code wird genauer.
2. Für den User eröffnen sich neue Gestaltungsmöglichkeiten der Präsentation
3. Es lassen sich neue Möglichkeiten der Präsentation in den Code einbringen, die ohne spezielle Anweisung im Code höchstens erratbar wären ob sie Sinn machen
##Erweiterungen Contra
1. User müssen eine größere Syntax lernen als nur die EMD-Syntax
2. Bei zu vielen Erweiterungen verliert die EMD-Syntax ihren Sinn
3. Neue Erweiterungen verlocken zu neuen Erweiterungen verlocken zu neuen Erweiterungen bis irgendwann das Programm ein Powerpoint im Texteditor ist. Ein entsprechend funktionierendes Programm gibt es bereits kostenlos und nennt sich OpenOffice. Das hat neben der Möglichkeit im Texteditor seine Präsentation zu schreiben auch noch eine schicke grafische Bedieneroberfläche und ist auf allen Betriebssystemen verfügbar. 

##Ohne Erweiterungen Pro
1. Die Syntax bleibt einfach und schnell zu lernen
2. Schnelleres Schreiben ohne sich auf Syntax zu konzentrieren
3. Bei funktionierenden Automatisierungen im Style-Prozess ist das Schreiben einer Präsentation um ein vielfaches schneller als in OpenOffice
##Ohne Erweiterungen Contra
1. Stylemöglichkeiten bleiben sehr begrenzt
2. Mit der Menge der Automatisierungen im Style-Prozess steigt die Menge der False-Positives
3. Das Ergebnis ist für die User bei vielen Automatisierungen nicht mehr vorhersehbar
4. Das Ergebnis ist durch die Unvorhersehbarkeit auch im Nachhinein schwierig zum gewünschten Ergebnis zu bringen

-----
#Einbindung des emd-parsers und des Pagegenerators in CMS
Der EMD-Parser und der Pagegenerator sind im Proof of Concept ein Gesamtpaket, was sich aber bei genauerer Betrachtung erstmal für das Erstellen der Präsentation eignet. Die Möglichkeit der Präsentation ist jedoch schon gegeben. Effekte in der Präsentation werden in der Regel mehr durch CSS-Klassen definiert und nicht im Javascript-Code. Momentan steht das Javascript im luftleeren Raum und wird nur über Inhalte direkt gefüttert.
 
##In der Zukunft ist gedacht, das Javascript in ein CMS einzubinden, um damit das Paket zu vervollständigen:
1. Es kann (neue) Präsentationen **speichern**
2. Es kann einen **Überblick über bisher erstellte Präsentationen** geben
3. Es kann alte Präsentationen **laden**
4. Es übernimmt die **Rechteverwaltung** und sorgt so dafür, dass nur User A die Präsentationen von User A sehen darf
5. Es kann natürlich auf Wunsch auch eine Präsentation der Allgemeinheit **zur Verfügung stellen**
6. Es kann **Themes nachträglich laden**, bspw. ein Einkaufssystem für Themes zur Verfügung stellen
7. Es sorgt für die **Sicherheit** der Daten der User **durch Verschlüsselung** selbiger

Als **CMS** würde ich **Drupal** nehmen, da ich mich mit diesem CMS am Besten auskenne und es so für mich pflegeleichter ist als ein neues CMS dafür zu erkunden. 
Ein ***Selbstschreiben eines CMS*** ist aufgrund der damit verbundenen ***Sicherheitsrisiken*** nicht ratsam - *nicht ohne Grund habe ich die sicherheitsrelevanten Ebenen auf das CMS geschoben, wie bspw. das Laden alter Präsentationen.*
-----
#Ende der Präsentation
vielen Dank fürs Zuschauen

