/*beispieldatei um ein neues theme zu generieren:
*  in diesem beispiel wird das theme procontra erstellt, welches zum zieltext
*  hat, zwei blöcke nebeneinander darzustellen
*  zunächst wird ein neues theme erstellt.
*/
var themeprocontra = new Theme("procontra");
themeprocontra.description = "Create Pro-Contra-Style Blocks";
/* anschließend wird dem theme ein spezieller style zugewiesen:
* er besteht aus einem suchmuster (array mit zeilencodes) sowie einem start und end-html-tag
*/
themeprocontra.addStyle(new Array("h2","list"),'<div class="listblock">',"</div>");

//jetzt ummanteln wir mit dem stil pro-contra zwei listblöcke:
themeprocontra.addStyle(new Array("h2","list","h2","list"),'<div class="procontra">',"</div>");

/* unser beispiel ist hiermit schon zu ende
* es fehlt nur noch die übergabe an die präsentation:
*/

slidenote.addTheme(themeprocontra);
