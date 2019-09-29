#Testnote
##Eine Testnote um zu testen, ob alles klappt und wo es hakt
### einfache Tests um nach einfachen Fehlern zu suchen
####Geht so weiter...
#####und weiter...
######und weiter...



-----
#Einfache Zeichen
Ein **Doppelstern**, *einfach Stern*, __Doppelunterstrich__, _einfacher Unterstrich_, ~~durchgestrichen~~, ***Trippel-Sternchen***
....
__Doppelter Unterstrich mit *einfachem Stern* gemischt__, **Doppelstern mit ~~durchgestrichen~~ gemischt**, *einfacher Stern mit **doppeltem Stern und ~~durchgestrichen~~** gemischt*

-----
#Listen und Aufzählungen

##Aufzählungen

* einfache liste
* einfache liste2
* einfache liste3

1. nummerierte liste
2. nummerierte liste
3. nummerierte liste

##Noch ne einfache Aufzählung:

1.) nummerierte Liste
2.) nummerierte Liste
3.) nummerierte Liste

##und noch eine:

4) nummerierte liste mit start=4
5) blablub
6) blubbla
---
#Einfache Listen und Verschachtelungen:

a) einfache Liste mit Minus
b) einfache Liste mit Minus
1. Unterpunkt mit Plus
c) einfache Liste mit Minus
* Unterpunkt mit Sternchen
d) einfache Liste mit Minus
  - Unterpunkt eingerückt mit Minus
  - Weiterer Unterpunkt eingerückt mit Minus
		- Unterpunkt mit Minus und eingerückten zwei Tabs

-----
#quote und code

> Zitat Anfang
> Zitat Mitte
> Zitat Ende

Eine Zeile mit `inline-code **asdf** bis hier` 
Nach dem `**inlinecode**` sollte aber *noch was stehen*

```code
#Ein Codeblock
<a href="irgendwo">blablub</a>
``` 
-----
#Link und Images
Ein [einfacher Link](url) nach url was war denn da los?
Ein [javascript-hack-Link](url">bla</a><script src="localtest/hello.js"></script><a href="url2) 
Ein Bild von lapa: ![](images/lapa.jpg) eol
Ein [**fetter link**](images/lapa.jpg) zu lapas bild
Ein Bildlink?: [![](images/lapa.jpg)](images/lapa.jpg) 
Ein Bischen Text drunter zum Testen...
#Titel mit Bild ![](images/lapa.jpg)
testtext
---
![](background)
# Eine Slide mit Hintergrundbild

Einfach so ein bischen Text

1. und 
2. eine 
3. Liste
4. als
5. Platzfüller

-----
# Leerzeichen und Tabs
Ein Text mit drei Leerzeichen zwischen A   B
Ein Text mit Tab zwischen A	B
Ein weiterer Text mit mehreren A	Tabs	B
Ein weiterer Text mit mehreren A			Tabs				B
Ein weiterer Text mit mehreren A					Tabs						B
-----
#Ein Datenblock: Chart Pie
```chart:pie
option a:10
option b:20
option c: 30
```
-----
#nächster datenblock: Chart Bar
```chart:bar
xaxis: X-Achsentitel
yaxis: Y-Achsentitel
---
option a: 10
option b: 20
option c: 30
```
-----
#noch ein datenblock: Chart Line
```chart:line
title: titel für screenreader
xaxis: X-Achsentitel 
yaxis: Y-Achsentitel
---
option a: 10
option b: 20
option c: 30
```
---
#Noch ein Datenblock: Chart Line mit anderer Datastructure:
```chart:line
first label, second label, third label
1, 2, 3
```
---
#neue LineChart mit mehreren Werten

```chart:line
datasetlabel1: 2009
datasetlabel2: 2010
---
Januar, Februar, März, April, Mai, Juni, Juli, August
1, 20, 3, 40, 5, 60, 7, 80
11,22,33,44,55,66,77,88
```

-----
#table-datenblock
```table
a|b|c
1|2|3
1|2|3
```

+++table
überschrift a,überschrift b,überschrift c
spalte 1, spalte 2,spalte 3
spalte 1, spalte 2,spalte 3
+++


-----
#Latex:
```latex
\mathbf{V}_1 \times \mathbf{V}_2 = \begin{vmatrix}
\mathbf{i} & \mathbf{j} & \mathbf{k} \
\frac{\partial X}asdf{\partial u} & \frac{\partial Y}{\partial u} & 0 \
\frac{\partial X}{\partial v} & \frac{\partial Y}{\partial v} & 0 \
\end{vmatrix}
```
---
# Test Inline-Layout

+++layout:inline

textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1

![](lapa)
Dies ist Lapa

# Sticky-Title
Ein Textblock, an welchem ein Titel klebt ist ein Textblock mit einer Überschrift und wird als Gesamtpaket betrachtet
+++

---
# Test Layout Left
+++layout:left

textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1

![](lapa)
Dies ist Lapa

# Sticky-Title
Ein Textblock, an welchem ein Titel klebt ist ein Textblock mit einer Überschrift und wird als Gesamtpaket betrachtet
+++

# Hier geht es normal weiter

Und zwar mit Text und einer Liste:

1. also punkt 1
2.  und punkt 2
3. und punkt 3...

Hier könnte noch viel mehr stehen... zum Beispiel:
ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1
---
# Test Layout Right
+++layout:right

textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1

![](lapa)
Dies ist Lapa

# Sticky-Title
Ein Textblock, an welchem ein Titel klebt ist ein Textblock mit einer Überschrift und wird als Gesamtpaket betrachtet
+++

# Hier geht es normal weiter

Und zwar mit Text und einer Liste:

1. also punkt 1
2.  und punkt 2
3. und punkt 3...

Hier könnte noch viel mehr stehen...

---
# Test Layout Hälfte:

## Hier oben kann auch noch mehr stehen...

+++layout:left
#Linker Block:

textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1

![](lapa)
Dies ist Lapa

# Sticky-Title
Ein Textblock, an welchem ein Titel klebt ist ein Textblock mit einer Überschrift und wird als Gesamtpaket betrachtet
+++

+++layout:right
# Rechter Block

Und zwar mit Text und einer Liste:

1. also punkt 1
2.  und punkt 2
3. und punkt 3...

Hier könnte noch viel mehr stehen...
+++

---
# Test Layout Dritteln:

## Hier oben kann auch noch mehr stehen...

+++layout:left
#Linker Block:

textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1 ist halt so ein textblock 1

![](lapa)
Dies ist Lapa

# Sticky-Title
Ein Textblock, an welchem ein Titel klebt ist ein Textblock mit einer Überschrift und wird als Gesamtpaket betrachtet
+++

+++layout:middle
![](background)

# Mittlerer Block 

Hat ein Hintergrundbild
+++

+++layout:right
# Rechter Block

Und zwar mit Text und einer Liste:

1. also punkt 1
2.  und punkt 2
3. und punkt 3...

Hier könnte noch viel mehr stehen...
+++

---
# Definitionen:

Ab hier folgen ein paar Seiten mit Definitionen, teils komplett ausgeschrieben, teils wo Tests bereits enthalten sind raus gelassen
---
# Titel und Fließtext - dies ist ein Titel (h1)

## Dies ist ein Untertitel

Fließtext. Lorem Ipsum dolor sit amet...
Im Fließtext können Fußnoten [^1] auftauchen

[^1]: Inhalt der Fußnote
---
![](hintergrundbild)

---
![](hintergrundbild)

#Hintergrundbilder 

Bilder in der ersten Zeile einer Slide definieren ein Hintergrundbild. Bilder im Hintergrund sollten flächig die Slide ausfüllen. Wenn Text über dem Hintergrundbild liegt sollte auf Lesbarkeit durch das Theme geachtet werden und bspw. ein Filter über das Bild gelegt werden um den Text besser lesbar zu machen. 

---
# Bild Teil von Textblock: Bild float inline rechts

![](bild) Wenn am Ende eines Fließtexts ein Bild steht, sollte das rechts im Fließtext floaten. Wenn das Bild am Anfang des Fließtextes steht, sollte es nach links floaten. Wenn das Bild im Fließtext steht, sollte es als Icon aufgefasst werden und auf Höhe einer Zeile gebracht werden.
 
Overall this method offers so much
flexibility that you might consider
replacing all your content. Overall
this method offers so much ![](icon)
flexibility that you might consider
replacing all your content
text (paragraph or title)
Overall this method offers so much flexibility that you might
consider replacing all your content.
![](bild)

---
# Hochkantobjekte

![](hochkantbild) 

Fließtext und andere dehnbare Objekte die auf Hochkantbilder folgen, sollte rechts neben dem Hochkantbild dargestellt werden bis die Höhe des Hochkantbildes ungefähr erreicht ist. Alle dann folgenden flexiblen Objekte sollten wieder normal, das heißt horizontal Raum einnehmend dargestellt werden. 
---
# Layout-Sections teilen die Seite auf

Mit Hilfe von Layout-Sections können User direkten Einfluss nehmen auf die Positionierung ihrer Slide, indem sie sie in Sections unterteilen. 
Sections werden dazu benutzt, Teile der Seite/Slide zu einem Block zusammen zu fassen. Sie sind vor allem fürs Layout interessant, daher kam auch die Idee zu Sections - um ein einfaches Spaltenlayout schreiben zu können ohne auf Tabellen oder ähnlichen Murks zurück greifen zu müssen.

+    Sections werden definiert durch +++layout block.
+    Sections werden interpretiert wie Seiten, es ist also mit MD-Code möglich, in ihnen weiter zu arbeiten und mehrere MD-Code Elemente so zu einem Block zusammen zu fassen.
+    Sections können Links und Rechts positioniert werden wenn sie im Header "left" oder "right" stehen haben
+    Sections können ebenso wie Slides Hintergrundbilder haben. Dazu muss die erste Zeile einer Section ein Bild sein
+    Sections mit left/right header teilen sich die Seite horizontal auf (1/n-tel der Seite bei n Sections)
+    Sections mit left/right header gehen bis zum vertikalen Ende der Seite
+    Sections dürfen zwar MD-Code enthalten, aber der Code für neue Seite ist gesperrt ("---") da sonst das Parsen nicht mehr vernünftig laufen kann.
+    Sections mit inline sind selbst Raumfüllend, aber stellen die in ihnen gerenderten Blöcke nebeneinander statt untereinander dar

---
# Positionierung ohne Layout-Sections

Ohne Sections müssen automatisierte Regeln erkennen, ob es Sinn macht, Objekte/Blöcke nebeneinander darzustellen oder nicht. Objekte, die nebeneinander dargestellt werden können gelten als "**vertikal**". 
Objekte, die nicht nebeneinander dargestellt werden sollten sondern Bildschirmbreite füllend sind, sind "**horizontal**". Objekte, die gedehnt werden können, gelten als "**flexibel**".

Problem bleibt allerdings nach wie vor zu erkennen, ob es sinn macht, das Objekt/den Block als vertikal einzustufen. 
Bisher habe ich vier Regeln definiert:
imageblock: vertikal oder horizontal je nach bildinhalt (hochkantbild vertikal, sonst horizontal oder flexibel)
listen: wenn es eine schmale liste ist, die mehr als 3 listelemente hat als vertikal, sonst flexibel 
footer: immer horizontal
listblock (stickytitle): immer vertikal (willkürlich, aber funktioniert ganz gut, zumal einfach zu beheben ist wenn nicht gewünscht und sonst unmöglich, die liste ohne section vertikal zu bekommen wenn sie zu breit ist)

---
# Layout Left:

+++layout:left
Dieser Text steht zu 30% auf linker Seite ab erscheinen. 
Er wird überdies interpretiert wie eine eigene Slide, d.h. er kann Hintergrundbilder haben
+++

Weiterer Fließtext erscheint mit 60% Breite rechts neben dem Sectionblock. Overall this method offers so much
flexibility that you might consider
replacing all your content. Overall
this method offers so much
flexibility that you might consider
replacing all your content
text (paragraph or title)
Overall this method offers so much flexibility that you might
consider replacing all your content.
---
#Section nach Rechts mit 30%:

+++layout:right
Text rechts, 30%
+++

weiterer Text flexibility that you might consider
replacing all your content. Overall
this method offers so much
flexibility that you might consider
replacing all your content
text (paragraph or title)
Overall this method offers so much flexibility that you might
consider replacing all your content.
---

# Sections teilen sich die Seite zu 50%:

+++layout:left
linker Text
+++

+++layout:right
rechter Text
+++

---
# Sections teilen sich die Seite zu einem Drittel:

+++layout:left
linker Text
+++

+++layout:left
mittlerer Text
+++

+++layout:left
rechter Text
+++

---
#Bildblöcke aka Bildunterschriften

Text ohne Leerzeile an einem Bild wird als Bildunterschrift gesehen und in einen Block gefasst. 

![](bild)
Bildunterschrift

---
# ![](titelicon) Images in Titeln ![](titelicon)

Images in Titeln werden im Titel selbst dargestellt und auf Größenverhältnis des Titels angepasst, heißt auf selbe Höhe gebracht wie Titelhöhe ist. 

---
# Sticky Titles

Textblöcke und Listen, an denen Titel sind, werden zu einem Block zusammengefasst dargestellt. 

##Listentitel
1. erstens
2. zweitens
3. drittens

##Textblock
Hier steht einfach nur so ein bischen Fließtext zum Füllen

---
# Textbreite der Listen bestimmt deren Ausrichtung

Schmale Listen werden als vertikale Objekte betrachtet und dementsprechend Positioniert:

## Breite Listen Untereinander:

- Overall this method offers so much flexibility that
you might consider replacing all your content
- Overall this method offers so much flexibility that
you might consider replacing all your content

Overall this method offers so much flexibility that
you might consider replacing all your content
- Overall this method offers so much flexibility that
you might consider replacing all your content

## Schmale Listen nebeneinander:
1. So 
2. ist
3. es

- warum 
- wieso
- weshalb

---
#Letzte Seite
Mehr fällt mir grad nicht ein zum Testen...

