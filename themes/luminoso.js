/*das ist ein beispiel-theme script. es tut nichts weiter, als festzulegen, dass es den namen luminoso trägt, ein basic-theme ist (luminoso.themetype = "css" und eine description, die beschreibt, was die user erwartet*/ 
var luminoso = new Theme("luminoso"); //erstelle ein theme mit namen luminoso

luminoso.themetype = "css"; //themetype ist css, also ein basis-theme und keine erweiterung
luminoso.description = "a light colored theme"; //beschreibung, die im tooltip angezeigt wird
slidenote.addTheme(luminoso);// füge das theme der slidenote hinzu
