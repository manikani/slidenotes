# Barrierefreiheit

## Generelle Überlegungen
- Aufgeräumtes Interface, wenig Rauschen erzeugen
- Interface ist anpassbar/konfigurierbar an individuelle Bedürfnisse
- GUI sollte so intuitiv wie möglich gestaltet sein
- Alles sollte per Tastatur steuerbar sein
- Screenreadern sollte die interpretation so leicht wie möglich gemacht werden

## Editor
- Der Editor ist das Herzstück von Slidenotes.io
- Verschiedene Interface Designs sind auswählbar
- Screenreadersupport über Focus()
- Auf den MD-Code zugeschnittene Shortcuts und Steuermöglichkeiten
- Going beyond Screenreadersupport

## Präsentation
- HTML-Aufbau
- Javascript enhancement
- Going beyond Screenreadersupport
---
# Generelle Überlegungen
## Aufgeräumtes Interface, wenig Rauschen erzeugen

Das Interface sollte immer übersichtlich bleiben. Ein "Rauschen" durch zuviele gleichzeitige Auswahlmöglichkeiten sollte soweit es geht vermieden werden. Zuviel Rauschen erschwert es bestimmten Personen, die gewünschte Funktion zu finden und verwirrt mehr als das es hilft. 
Klare Strukturen helfen.

---
# Generelle Überlegungen
## Interface ist anpassbar/konfigurierbar an individuelle Bedürfnisse

Die eierlegende Wollmilchsau gibt es nicht. So unterschiedlich wie die nutzenden Personen sind, so sind auch ihre Bedürfnisse. Ein Interface kann niemals alle Bedürfnisse erfüllen. Es sollte daher anpassbar oder konfigurierbar sein. Dies gilt vor allem für den Editor. Dazu dort mehr.

---
# Generelle Überlegungen
## GUI so intuitiv wie möglich 

Eine GUI, für die ich erst Informatik studiert haben muss ist keine barrierefreie GUI. Um Barrierefrei zu sein muss sie so intuitiv wie möglich gestaltet werden. Dies gilt insbesondere für Buttons jeglicher Art. 
Hilfestellungen wie Hilfetexte oder ähnliches sollten immer zweite Wahl sein.

---
# Generelle Überlegungen
## Alles sollte per Tastatur steuerbar sein

Nicht alle Nutzenden verfügen über eine Maus oder das Feingefühl, um damit einen von drei Buttons zu treffen. Alles sollte daher per Tastatur steuerbar sein. Während die Grundsteuerung "Auswahl per TAB" gewährleistet und unterstützt wird als Quasi-Standard, kann darüber hinaus eigene Steuerung eingeführt werden, die spezieller auf Slidenotes zugeschnitten ist und so den Nutzenden hilft. Da es auch hier ein zu diverses Feld gibt, sollten die Shortcuts persönlich konfigurierbar sein. 

---
# Generelle Überlegungen
## Screenreadern sollte die interpretation so leicht wie möglich gemacht werden

Durch Nutzung von semantischem HTML und einem stringenten Aufbau sollte die Grundstruktur dem Screenreader in verständlicher Weise aufbereitet werden können. Durch Trennung von Darstellung (*css*) und Aufbau (*html*) kann darüber hinaus trotzdem auch für Sehende ein gutes und rauschfreies Ergebnis erzielt werden.
---
# Editor
## Der Editor, das Herzstück von Slidenotes.io

Der Editor hilft dabei, den Code der Slidenote zu schreiben. Prinzipiell kann auch ein eigener, lokaler Editor benutzt werden und der Code später in den Slidenote-Editor per Copy-Paste eingefügt werden. Aber der Editor selbst ermöglicht ein schnelleres Erstellen der Präsentation, da er auf den Code und die Bedürfnisse zugeschnitten ist. Er parsed den geschriebenen Slidenote-Code live und kann ihn in verschiedener, auf das jeweilige Bedürfnis zugeschnittener Weise, ausgegeben werden. 

# Editor
## Verschiedene Interface Designs sind auswählbar

Es gibt nicht "das" beste Interface. Es gibt nur gute Interfaces für verschiedene Anforderungen. Vielfalt ist die Kraft. 
Beispiele:
1. context mode: zeigt seitlich des Editors eine MD-Elemente-Übersicht an (sidebar), zusätzlich zu im Editor visualisierten Informationen. Erzeugt das meiste Rauschen
2. focus mode: verzichtet auf die dauerhafte kontextabhängige Hilfsstruktur seitlich des Editors und focusiert auf den Editor selbst.
3. raw mode: verzichtet auf alle visuellen Hilfen, kann Kompatiblitätsproblemen mit bestimmten Screenreadern etc. entgegenkommen und ist die schnellste Eingabemethode. 
4. big mode: alles wird größer dargestellt: Schriftgröße größer, dadurch weniger Text gleichzeitig sichtbar, große intuitive Buttons anstelle von Textbuttons. Visualisierung im Editor ja, sidebar nein. Erzeugt am wenigsten Rauschen
5. audio mode: Keinerlei visuelle Hilfe, textarea wird seitlich scrollbar gemacht, so dass Zeilen übereinander dargestellt werden und nicht mehr umbrechen. 

---
# Editor
## Screenreadersupport über Focus()

Um den Editor Screenreader tauglich zu machen, arbeiten wir mit dem Focus() Event, welches von den meisten Screenreadern unterstützt wird. 
Alle Images im Editor sind mit ALT-Texten versehen, zusätzliche Hilfen können über screenreader-only Texte, d.h. Textelemente, die per css visuell versteckt sind aber von Screenreadern gelesen werden. Eine visuelle Repräsentation kann abgeschaltet werden (raw-Mode oder audio-mode) und so ein Rauschen für den Screenreader mit unnötigen Informationen vermieden werden. 

---
# Editor
## Auf den MD-Code zugeschnittene Shortcuts und Steuermöglichkeiten

- Alle wichtigen Elemente sind per Keyboard defaultmäßig erreichbar (Tab-Index)
- Alle wichtigen Elemente sind per Shortcut erreichbar
- Die normalen Funktionen des Browsers werden ergänzt wo es geht und ersetzt wo es sein muss
- Die Steuerungsmöglichkeit sollte intuitiv sein, Pfeiltastenunterstützung in jedem Menü möglich sein. 

---
# Editor
## Going beyond Screenreadersupport
###Why:

Bestmögliches Ergebnis mit Screenreader ist eine freie Textarea, per Tab und logischem Aufbau (header-Tags) erreichbare Elemente (Toolbar, Options etc.) und per Shortcut erreichbare Eingabehilfen (Insertmenü). All diese Elemente sind per Screenreader erreichbar und interpretierbar. Durch die Focus-Steuerung per Javascript kann bei einigen Screenreadern eine bestmögliche Unterstützung gewährleistet werden. 
 
Doch das wars. All die Zusatzinformationen, die sonst per visualisierten Hilfen dargestellt werden (der Cursor ist in einem Titelelement bspw) fehlen. In der Textarea stehen also nur die vom jeweiligen Screenreader bereitgestellten Hilfen zur Verfügung um sich Überblicke zu verschaffen. Der Versuch, dem Screenreader weitere Informationen beizubringen scheint relativ fruchtlos. 
---
# Editor
## Going beyond Screenreadersupport
### Introducing speechSynthesis

Anstelle (nur) darauf zu vertrauen, dass der Screenreader unsere Informationen so darstellt wie wir es wollen und um die Schwächen des Screenreader auszuschalten, können wir uns mit [speechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) unseren eigenen Screenreader für den Slidenoteeditor bauen. Damit können wir Informationen nicht nur visuell aufbereiten sondern auch audiell und somit eine an die Steuerungsmöglichkeiten und Shortcuts zugeschnittene audielle Aufbereitung des Slidenotecodes zur Verfügung stellen. Damit wird es möglich, dass

1.) Wir die Kontrolle zurückbekommen über die audielle Aufbereitung und Darstellung des Slidenoteeditors und nicht mehr davon abhängig sind, wie der uns unbekannte Screenreader das aus unserem HTML zusammenwurschtelt 
2.) Die Steuerung in der Slidenote-Textarea audiell unterstützt wird
3.) Kontextinformationen audiell erfassbar werden (bspw. strg-e: read current element) 

Kurz: Die User-Experience wird auf ein Level gesteigert, was ein weit komfortableres Editieren möglich machen kann als ein reiner Screenreader-Support. 
---
# Editor
## Going beyond Screenreadersupport
### Screenreader und speechSynthesis - Kompatiblitätsprobleme und Grenzen

Kompatiblitätsprobleme sind vorprogrammiert. Was aber denke ich immer geht beim Screenreader - egal welcher - ist, den Screenreader per Tastendruck zu deaktivieren. Ab da würde speechSynthesis greifen. 
Es kann aber auch Sinn machen, beide gleichzeitig zu verwenden - aber bestimmte Funktionen auszustellen, die bereits vom Screenreader übernommen sind um Dopplungen zu vermeiden. (Bspw. Öffne Insertmenü-> focus auf Button -> Screenreader liest Button -> speechSynthesis sagt "Element List Insertmenu. Selected Button:...")
Um das zu ermöglichen ist unser speechSynthesis-Speaker so konfigurierbar wie möglich.


