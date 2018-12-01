#Testnote
##Eine Testnote um zu testen, ob alles klappt und wo es hakt
### einfache Tests um nach einfachen Fehlern zu suchen
####Geht so weiter...
#####und weiter...
######und weiter...



-----
#Einfache Zeichen
**Doppelstern**, *einfach Stern*, __Doppelunterstrich__, _einfacher Unterstrich_, ~~durchgestrichen~~, ***Trippel-Sternchen***
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
- einfache Liste mit Minus
- einfache Liste mit Minus
+ Unterpunkt mit Plus
- einfache Liste mit Minus
* Unterpunkt mit Sternchen
- einfache Liste mit Minus
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

```
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
-----
# Leerzeichen und Tabs
Ein Text mit drei Leerzeichen zwischen A   B
Ein Text mit Tab zwischen A	B
Ein weiterer Text mit mehreren A	Tabs	B
Ein weiterer Text mit mehreren A			Tabs				B
Ein weiterer Text mit mehreren A					Tabs						B
-----
#Ein Datenblock: Chart Pie
```chart pie
#titel
##untertitel 1
##untertitel 2
option a:10
option b:20
option c: 30
```
-----
#nächster datenblock: Chart Bar
```chart bar
#titel
##untertitel 1
##untertitel 2
option a:10
option b:20
option c: 30
```
-----
#noch ein datenblock: Chart Line
```chart line
#titel
##untertitel 1
##untertitel 2
option a:10
option b:20
option c: 30
```
---
#Noch ein Datenblock: Chart Line mit anderer Datastructure:
```chart pie
#My Pie
first label, second label, third label
1, 2, 3
```
---
```chart line
#neue LineChart mit mehreren Werten
###2009
###2010
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
-----
#Latex:
```latex
\mathbf{V}_1 \times \mathbf{V}_2 = \begin{vmatrix}
\mathbf{i} & \mathbf{j} & \mathbf{k} \
\frac{\partial X}{\partial u} & \frac{\partial Y}{\partial u} & 0 \
\frac{\partial X}{\partial v} & \frac{\partial Y}{\partial v} & 0 \
\end{vmatrix}
```
---
#Letzte Seite
Mehr fällt mir grad nicht ein zum Testen...
---

# slidenotes
This project is still under heavy development and is not meant to be used yet in production! 
Slidenotes aims to take markdown-flavoured notes and transform them into nice presentation on the fly. 
Till now its Core is written in pure Javascript. 
The Core is roughly divided in three parts: 
1. a markdown-parser
2. an editor-part (markdown-wysiwyg-editor and enhanced text-editor)
3. a presentation-maker

In the future its planned to combine this javascript with an CMS like drupal to get a user-experience where you can not only transform md-code into nice presentations, but also store it in a secure form online, share it, publish it and edit it from whatever device you prefer. 
With the design-choice to be a web-app we can achive easily a platform-independence, so you can share, view and edit your slidenotes on your computer - be it with MacIntosh O$X, Window$, Linux, BSD... - or on your mobile device - be it android or iOS. 
