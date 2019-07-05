<?php

/**
 * @file
 * Default theme implementation to display a node.
 *
 * Available variables:
 * - $title: the (sanitized) title of the node.
 * - $content: An array of node items. Use render($content) to print them all,
 *   or print a subset such as render($content['field_example']). Use
 *   hide($content['field_example']) to temporarily suppress the printing of a
 *   given element.
 * - $user_picture: The node author's picture from user-picture.tpl.php.
 * - $date: Formatted creation date. Preprocess functions can reformat it by
 *   calling format_date() with the desired parameters on the $created variable.
 * - $name: Themed username of node author output from theme_username().
 * - $node_url: Direct url of the current node.
 * - $display_submitted: Whether submission information should be displayed.
 * - $submitted: Submission information created from $name and $date during
 *   template_preprocess_node().
 * - $classes: String of classes that can be used to style contextually through
 *   CSS. It can be manipulated through the variable $classes_array from
 *   preprocess functions. The default values can be one or more of the
 *   following:
 *   - node: The current template type, i.e., "theming hook".
 *   - node-[type]: The current node type. For example, if the node is a
 *     "Blog entry" it would result in "node-blog". Note that the machine
 *     name will often be in a short form of the human readable label.
 *   - node-teaser: Nodes in teaser form.
 *   - node-preview: Nodes in preview mode.
 *   The following are controlled through the node publishing options.
 *   - node-promoted: Nodes promoted to the front page.
 *   - node-sticky: Nodes ordered above other non-sticky nodes in teaser
 *     listings.
 *   - node-unpublished: Unpublished nodes visible only to administrators.
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 *
 * Other variables:
 * - $node: Full node object. Contains data that may not be safe.
 * - $type: Node type, i.e. story, page, blog, etc.
 * - $comment_count: Number of comments attached to the node.
 * - $uid: User ID of the node author.
 * - $created: Time the node was published formatted in Unix timestamp.
 * - $classes_array: Array of html class attribute values. It is flattened
 *   into a string within the variable $classes.
 * - $zebra: Outputs either "even" or "odd". Useful for zebra striping in
 *   teaser listings.
 * - $id: Position of the node. Increments each time it's output.
 *
 * Node status variables:
 * - $view_mode: View mode, e.g. 'full', 'teaser'...
 * - $teaser: Flag for the teaser state (shortcut for $view_mode == 'teaser').
 * - $page: Flag for the full page state.
 * - $promote: Flag for front page promotion state.
 * - $sticky: Flags for sticky post setting.
 * - $status: Flag for published status.
 * - $comment: State of comment settings for the node.
 * - $readmore: Flags true if the teaser content of the node cannot hold the
 *   main body content.
 * - $is_front: Flags true when presented in the front page.
 * - $logged_in: Flags true when the current user is a logged-in member.
 * - $is_admin: Flags true when the current user is an administrator.
 *
 * Field variables: for each field instance attached to the node a corresponding
 * variable is defined, e.g. $node->body becomes $body. When needing to access
 * a field's raw values, developers/themers are strongly encouraged to use these
 * variables. Otherwise they will have to explicitly specify the desired field
 * language, e.g. $node->body['en'], thus overriding any language negotiation
 * rule that was previously applied.
 *
 * @see template_preprocess()
 * @see template_preprocess_node()
 * @see template_process()
 */
?>
<div id="node-<?php print $node->nid; ?>" class="<?php print $classes; ?> clearfix"<?php print $attributes; ?>>
<script language="javascript">
var initial_note = {
title: '<?php print $title;?>',
nid: <?php print $node->nid;?>,
encnote:'<?php if(isset($field_encryptednote[0]))print($field_encryptednote[0]['value']);?>',
encimg:'<?php if(isset($field_encimages[0]))print($field_encimages[0]['value']);?>', //old! delete in future update!
encimages:[<?php if(isset($field_encimg))foreach($field_encimg as $actimg){print('"'.str_replace("\n","",$actimg['value']).'",')};?>], //new one
encimgmeta:'<?php if(isset($field_imagemeta[0]))print($field_imagemeta[0]['value']);?>',
notehash:'<?php if(isset($field_notehash[0]))print($field_notehash[0]['value']);?>',
imagehash:'<?php if(isset($field_imageshash[0]))print($field_imageshash[0]['value']);?>',
author: {id:<?php print($uid);?>} 
}
</script>

<script language="javascript" src="/sites/all/libraries/slidenotes/slidenotes.js"></script>
<script language="javascript" src="/sites/all/libraries/slidenotes/themes/slidenoteguardian.js"></script>
<script language="javascript"><!--
var slidenote;
var slidenoteguardian;
var presentation; //TODO: sollte noch entfernt werden. nur noch slidenote-objekt global
var editorinit=false; //wird nicht mehr gebraucht?

function initeditor(){
	console.log("initeditor:"+editorinit + "slidenote:"+(slidenote==null));
	//console.log(slidenote);
	if(slidenote==null){
		var texted = 		document.getElementById("quelltext");
		var texterr =		 document.getElementById("texteditorerrorlayer");
		var errordet =	 document.getElementById("fehlercode");
		var slideshow = 	document.getElementById("praesentation");
		if(texted==null||texterr==null||errordet==null||slideshow==null){
			//etwas fehlt noch...
			console.log("etwas fehlt noch")
			setTimeout("initeditor()",500); //gib ihm noch Zeit
		} else{
			var basepath = basepath="/sites/all/libraries/slidenotes/";			
			slidenote = new slidenotes(texted, texterr, errordet, slideshow, basepath );
			slidenote.appendFile("css","../layout.css");
			slidenote.appendFile("css","slidenoteguardian.css");
			slidenote.basepath="/sites/all/libraries/slidenotes/";
			slidenote.imagespath="/sites/all/libraries/slidenotes/images/";			
			
			presentation = slidenote.presentation;
			//texted.onresize = slidenote.parseneu;
			texted.onresize= function(){slidenote.parseneu();};
			texted.onkeydown= function(event){
				slidenote.keypressdown(event, texted);
			};

			texted.onkeyup=function(event){slidenote.keypressup(event, texted);};
			texted.onpaste=function(){setTimeout('slidenote.parseneu()',150)};
			texted.oncut=function(){setTimeout('slidenote.parseneu()',150)};
			//autofocus tonfocus="initeditor(this.value);
			texted.onscroll=function(){slidenote.scroll(texted);};
			texted.onclick = function(){console.log("parseneu forced by click"+this.selectionEnd);slidenote.parseneu();};

			document.getElementById("importbutton").addEventListener("click",function(){document.getElementById("importfile").click()});
			document.getElementById("exportbutton").addEventListener("click",function(){
				var menu=document.getElementById("exportoptions");
				if(menu.classList.contains("active"))menu.classList.remove("active");else menu.classList.add("active");
			});
			document.getElementById("exportoptions").addEventListener("click", function(){this.classList.remove("active")});
			document.getElementById("editoroptionbuttonbutton").addEventListener("click",function(e){
				var optionmenu = document.getElementById("optionmenu");
				if(optionmenu.classList.contains("active")){
					optionmenu.classList.remove("active");
				}else{
					//get all themes:
					var themelist = document.getElementById("optionmenupresentationdesign");
					themelist.innerHTML = "";
					var themeul = document.createElement("ul");
					var themes = slidenote.extensions.themes;
					var themedesctext = "";
					for(var tx=0;tx<themes.length;tx++){
						if(themes[tx].themetype ==="css"){
							var themeli = document.createElement("li");
							var themeinput = document.createElement("input");
							themeinput.type = "radio";
							themeinput.name = "design";
							themeinput.number = tx;
							if(themes[tx].active)	themeinput.checked = true; else themeinput.checked=false;
							var themelabel = document.createElement("label");
							themelabel.innerText = themes[tx].classname;
							themeli.appendChild(themeinput);
							themeli.appendChild(themelabel);
							themeul.appendChild(themeli);
							if(themes[tx].active)themedesctext = themes[tx].description;
							themeinput.description = themes[tx].description;
							themeinput.onchange = function(){
								slidenote.extensions.changeThemeStatus(this.number,this.checked);
								if(this.checked)document.getElementById("themedescription").innerText=this.description;
								slidenoteguardian.saveConfig("local");

							}
						}
					}
					themelist.appendChild(themeul);
					var themedescription = document.getElementById("themedescription");
					themedescription.innerText = themedesctext;
					optionmenu.classList.add("active");
				}
			});
			document.getElementById("nightmodetoggle").addEventListener("click",function(e){
				var toggler=document.getElementById("nightmodetoggle");
				if(toggler.classList.contains("off")){
					toggler.classList.remove("off");
					toggler.classList.add("on");
					document.getElementById("slidenotediv").classList.add("nightmode");
		    }else{
					toggler.classList.remove("on");
					toggler.classList.add("off");
					document.getElementById("slidenotediv").classList.remove("nightmode");
	      }
				//save config after changing to nightmode:
				if(slidenoteguardian){
					slidenoteguardian.saveConfig("local");
				}
			});

			//texted.addEventListener("focusout",function(){console.log("parseneu forced by focus-out");slidenote.parseneu();});
			slidenote.parseneu();
			console.log("slidenotes geladen");
			console.log(slidenote);

			document.getElementById("praesentationrahmen").onkeyup = function(event){
				//Keyboardsteuerung der Slideshow:
				var key=""+event.key;
				console.log("keycode of pressed key:"+key);
				if(key==="Escape")slidenote.presentation.showpresentation();
				if(key==="ArrowRight" || key===" ")presentation.nextPage();
				if(key==="ArrowLeft")presentation.lastPage();
				if(key==="0" ||key==="1" ||key==="2" ||key==="3" ||key==="4" ||key==="5" ||key==="6" ||key==="7" ||key==="8" ||key==="9" ){
					if(presentation.lastpressednrkey==undefined)presentation.lastpressednrkey="";
					presentation.lastpressednrkey+=key;
				}
				if(key==="Enter"){
					presentation.lastpressednrkey--;
					console.log(presentation.lastpressednrkey);
					presentation.showPage(presentation.lastpressednrkey);
					presentation.lastpressednrkey="";
				}
			};
			slidenoteguardian = new slidenoteGuardian(slidenote);
		}
	}

}
function insertbutton(code){
	if(slidenote!=null)slidenote.insertbutton(code);
}

function parsetesting(){
	var parsetext = slidenote.textarea.value;
	parsetest = false;
	console.log("parse mit parsenachzeilen");
	slidenote.parseneu();
	parsetest = true;
	console.log("parse mit parsemap");
	slidenote.parseneu();
	console.log("parsetest multiply textarea-value by 5");
	for(var x=0;x<5;x++)slidenote.textarea.value += parsetext;
	parsetest = false;
	console.log("parse mit parsenachzeilen");
	slidenote.parseneu();
	parsetest = true;
	console.log("parse mit parsemap");
	slidenote.parseneu();
	console.log("parsetest multiply textarea-value by 10");
	for(var x=0;x<5;x++)slidenote.textarea.value += parsetext;
	parsetest = false;
	console.log("parse mit parsenachzeilen");
	slidenote.parseneu();
	parsetest = true;
	console.log("parse mit parsemap");
	slidenote.parseneu();


}

--></script>
</head>
<body onload="initeditor()">
<div id="slidenotediv">
	<div id="editorblock">
		<div id="editorheader">
			<button><a href="/user"><img src="/sites/all/libraries/slidenotes/images/buttons/home.png">HOME</a></button>
			<button id="importbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/import.png">IMPORT<input type="file" id="importfile"></button>
			<img id="encstatus" src="/sites/all/libraries/slidenotes/images/schloss-grau.png" alt="initial state">
			<span id="notetitle"><?php print $title ?></span>
			<button id="exportbutton">EXPORT<img src="/sites/all/libraries/slidenotes/images/buttons/export.png"></button>
			<button id="savebutton">SAVE<img id="savestatus" src="/sites/all/libraries/slidenotes/images/buttons/cloudsaved.png"></button>
		</div>
		<div id="exportoptions">
			<ul>
				<li>BACKUP OF CODE:</li>
				<li><button onclick="slidenoteguardian.saveNote('filesystem')">encrypted .slidenote</button></li>
				<li><button onclick="slidenoteguardian.exportToFilesystem(slidenote.textarea.value, slidenoteguardian.notetitle+'.md')">unencrypted .md textfile</button></li>
				<li>PUBLISH PRESENTATION:</li>
				<li><button onclick="slidenoteguardian.exportPresentationToCMS()">Publish to slidenote.io</button></li>
				<li><button onclick="slidenoteguardian.exportPresentationLocal(true);">Save as encrypted .html</button></li>
				<li><button onclick="slidenoteguardian.exportPresentationLocal(false);">Save as unencrypted .html</button></li>
			</ul>
		</div>
		<div id="editoroptionbutton"><button id="editoroptionbuttonbutton">Options <img src="/sites/all/libraries/slidenotes/images/buttons/optioni.png"></button></div>
		<div id="texteditorbuttons">
			<!--<input type="button" onclick="cursorspantest()" value="cursorspantest">-->
			<!--<button onclick="insertbutton('---')" >new Page</button>-->
			<button onclick="insertbutton('%head1')" ><img src="/sites/all/libraries/slidenotes/images/buttons/h1.png"></button>
			<button onclick="insertbutton('%head2')" ><img src="/sites/all/libraries/slidenotes/images/buttons/h2.png"></button>
			<button onclick="insertbutton('%head3')" ><img src="/sites/all/libraries/slidenotes/images/buttons/h3.png"></button>
			<button onclick="insertbutton('%list')" ><img src="/sites/all/libraries/slidenotes/images/buttons/ul.png"></button>
			<button onclick="insertbutton('%nrlist')" ><img src="/sites/all/libraries/slidenotes/images/buttons/ol.png"></button>
			<button onclick="insertbutton('%quote')" ><img src="/sites/all/libraries/slidenotes/images/buttons/quote.png"></button>
			<button onclick="insertbutton('%comment')" ><img src="/sites/all/libraries/slidenotes/images/buttons/comment.png"></button>
			<button onclick="insertbutton('**')" ><img src="/sites/all/libraries/slidenotes/images/buttons/bold.png"></button>
			<button onclick="insertbutton('*')" ><img src="/sites/all/libraries/slidenotes/images/buttons/italic.png"></button>
			<button onclick="insertbutton('~~')" ><img src="/sites/all/libraries/slidenotes/images/buttons/stroke.png"></button>
			<button onclick="insertbutton('%code')" ><img src="/sites/all/libraries/slidenotes/images/buttons/code.png"></button>
			<button onclick="insertbutton('%link')" ><img src="/sites/all/libraries/slidenotes/images/buttons/link.png"></button>
			<!--<button type="button" class="imagebutton" onclick="document.getElementById('imagesblock').classList.add('visible')">image</button>-->
		</div>
		<div id="sidebarcontainer">
			<div id="sidebar"></div>
			<div id="nicesidebarsymbol"><a href="javascript:slidenote.presentation.showInsertMenu();"><img src="/sites/all/libraries/slidenotes/images/buttons/droptilde.png"></a><img src="/sites/all/libraries/slidenotes/images/buttons/cursorline.png"></div>
			<div id="insertarea">
				<span> <label><span id="insertmenulabel">INSERT</span>   <img src="/sites/all/libraries/slidenotes/images/buttons/droptilde.png"></label><img id="cursorlinesymbol" src="/sites/all/libraries/slidenotes/images/buttons/cursorline.png"></span>

				<div id="standardinsertmenu">
					<button class="newpagebutton" onclick="insertbutton('---')" >new Page</button>
				</div>
				<div id="extrainsertmenu">
				</div>
			</div>
			<!--<div style="">123456789012345</div>-->

		</div>
		<div id="texteditor" class="texteditor">
			<div id="texteditorerrorlayer"></div>
			<textarea spellcheck="false" id="quelltext" onload="" autofocus onfocus="setTimeout('initeditor()',100);"></textarea>
			<div id="texteditorimagespreview"></div>
		</div>
		<div id="optionmenu">
			<h3>PRESENTATION DESIGN</h3>
			<div id="optionmenupresentationdesigncontainer">
			<div id="optionmenupresentationdesign">
				<ul>
					<li><input type="radio" name="basictheme" value="pop"> POP</li>
					<li><input type="radio" name="basictheme" value="pop"> TUFTE</li>
					<li><input type="radio" name="basictheme" value="pop"> CONSOLE</li>
				</ul>
			</div>
			<div id="themedescription"></div>
		</div>

			<div><select onchange="slidenote.extensions.getThemeByName('highlight').changeDesignOption(0,this.value)">
				<option value="" hidden selected disabled>CODE HIGHLIGHTING</option>
				<option value="agate">agate</option>
				<option value="androidstudio">androidstudio</option>
				<option value="arduino-light">arduino-light</option>
				<option value="arta">arta</option>
				<option value="ascetic">ascetic</option>
				<option value="atelier-cave-dark">atelier-cave-dark</option>
				<option value="atelier-cave-light">atelier-cave-light</option><option value="atelier-dune-dark">atelier-dune-dark</option><option value="atelier-dune-light">atelier-dune-light</option><option value="atelier-estuary-dark">atelier-estuary-dark</option><option value="atelier-estuary-light">atelier-estuary-light</option><option value="atelier-forest-dark">atelier-forest-dark</option><option value="atelier-forest-light">atelier-forest-light</option><option value="atelier-heath-dark">atelier-heath-dark</option><option value="atelier-heath-light">atelier-heath-light</option><option value="atelier-lakeside-dark">atelier-lakeside-dark</option><option value="atelier-lakeside-light">atelier-lakeside-light</option><option value="atelier-plateau-dark">atelier-plateau-dark</option><option value="atelier-plateau-light">atelier-plateau-light</option><option value="atelier-savanna-dark">atelier-savanna-dark</option><option value="atelier-savanna-light">atelier-savanna-light</option><option value="atelier-seaside-dark">atelier-seaside-dark</option><option value="atelier-seaside-light">atelier-seaside-light</option><option value="atelier-sulphurpool-dark">atelier-sulphurpool-dark</option><option value="atelier-sulphurpool-light">atelier-sulphurpool-light</option><option value="atom-one-dark">atom-one-dark</option><option value="atom-one-light">atom-one-light</option><option value="brown-paper">brown-paper</option><option value="codepen-embed">codepen-embed</option><option value="color-brewer">color-brewer</option><option value="darcula">darcula</option><option value="dark">dark</option><option value="darkula">darkula</option><option value="default">default</option><option value="docco">docco</option><option value="dracula">dracula</option><option value="far">far</option><option value="foundation">foundation</option><option value="github">github</option><option value="github-gist">github-gist</option><option value="googlecode">googlecode</option><option value="grayscale">grayscale</option><option value="gruvbox-dark">gruvbox-dark</option><option value="gruvbox-light">gruvbox-light</option><option value="hopscotch">hopscotch</option><option value="hybrid">hybrid</option><option value="idea">idea</option><option value="ir-black">ir-black</option><option value="kimbie.dark">kimbie.dark</option><option value="kimbie.light">kimbie.light</option><option value="magula">magula</option><option value="mono-blue">mono-blue</option><option value="monokai">monokai</option><option value="monokai-sublime">monokai-sublime</option><option value="obsidian">obsidian</option><option value="ocean">ocean</option><option value="paraiso-dark">paraiso-dark</option><option value="paraiso-light">paraiso-light</option><option value="pojoaque">pojoaque</option><option value="purebasic">purebasic</option><option value="qtcreator_dark">qtcreator_dark</option><option value="qtcreator_light">qtcreator_light</option><option value="railscasts">railscasts</option><option value="rainbow">rainbow</option><option value="routeros">routeros</option><option value="school-book">school-book</option><option value="solarized-dark">solarized-dark</option><option value="solarized-light">solarized-light</option><option value="sunburst">sunburst</option><option value="tomorrow">tomorrow</option><option value="tomorrow-night-blue">tomorrow-night-blue</option><option value="tomorrow-night-bright">tomorrow-night-bright</option><option value="tomorrow-night">tomorrow-night</option><option value="tomorrow-night-eighties">tomorrow-night-eighties</option><option value="vs2015">vs2015</option><option value="vs">vs</option><option value="xcode">xcode</option><option value="xt256">xt256</option><option value="zenburn">zenburn</option></select></div>
			<h3>INTERFACE DESIGN</h3>
			<div id="optionmenuinterfacedesign">
				<select id="editorchoice" onchange="slidenote.choseEditor(this.value)">
					<option value="md-texteditor" selected>context-mode (default)</option>
					<option value="focus">focus-mode</option>
					<option value="raw-text">raw text</option>
				</select>
			</div>
			<div>NIGHT MODE <a href="#" class="off" id="nightmodetoggle"><span>OFF</span>|<span>ON</span></a></div>
			<div><a href="javascript:slidenote.extensions.showThemes()">Advanced Options ℹ</a></div>
			<div><ul>
				<li><a href="#">documentation</a></li>
				<li><a href="#">bug reports</a></li>
				<li><a href="#">community</a></li>
			</ul>
			</div>
			<div>(c) slidenotes.io</div>
		</div>
		<div id="footer">
			<button onclick="slidenote.presentation.showpresentation()"><img src="/sites/all/libraries/slidenotes/images/buttons/presentationtoggle.png"> PRESENTATION</button>
		</div>
		<div id="imagesblock">
				<h1>Image Upload <button onclick="Javascript:document.getElementById('imagesblock').classList.remove('visible');">close</button></h1>
			<div>
				Select an local image file to upload, then click on image to use it in this slidenote
				<input type="file" id="fileInput">
			</div>
			<div id="imageResizeOptions">
				<input type="radio" name="imageResize" value="1024x768" onchange="slidenote.base64images.changeMaxSize(this.value)"><label>Background/Big (1024x768)</label>
				<input type="radio" name="imageResize" value="400x300" onchange="slidenote.base64images.changeMaxSize(this.value)"><label>Medium (400x300)</label>
				<input type="radio" name="imageResize" value="100x50" onchange="slidenote.base64images.changeMaxSize(this.value)"><label>Icon (100x50)</label>
			</div>
			<div id="filePreview"></div>
			<h1>Files in Database (click on image to reuse)</h1>
			<div id="fileOld"></div>
		</div>

	</div>
	<div id="praesentationrahmen">
		<div id="praesentation"></div>
		<div class="praesentationsteuerung">
				<input type="button" value="last page please" onclick="presentation.lastPage()">
				<input type="button" value="next page please" onclick="presentation.nextPage()">
				<input type="button" onclick="presentation.showpresentation()" value="hide presentation">
		</div>
	</div>
	<div id="options">
		<h1>Options<button id="optionsclose" onclick="slidenote.extensions.hideThemes()" value="close">close</button></h1>
		<div class="tabbar">
			<h2><a href="javascript:slidenote.extensions.optionsTab(0)">Design Options</a></h2>
			<h2><a href="javascript:slidenote.extensions.optionsTab(1)">Global Options</a></h2>
			<h2><a href="javascript:slidenote.extensions.optionsTab(2)">Extensions</a></h2>
		</div>
		<div id="designoptionstab" class="optiontab"></div>
		<div id="globaloptionstab" class="optiontab"></div>
		<div id="themeselectiontab" class="optiontab"></div>
	</div>
	<div id="fehlercoderahmen">
		<div id="fehlercode"></div>
		<input type="button" onclick="this.parentNode.classList.remove('active')" value="close">
	</div>
</div>
<div id="slidenoteGuardianPasswordPromptStore">
<div id="slidenoteGuardianPasswordPromptTemplate">
	<div id="slidenoteGuardianPasswordPromptNotetitle">TITLE</div>
	<div id="slidenoteGuardianPasswordPromptTemplatePreText"></div>
	<form onsubmit="event.preventDefault();" action="#" method="POST">
		<label id="slidenoteGuardianPasswordPromptUsernameLabel">FILENAME FOR EXPORT</label>
		<input type="text" id="username">
		<label>PASSWORD</label>
		<input type="password" id="password">
		<label id="slidenoteGuardianPasswordPromptRetypeLabel">RE-TYPE PASSWORD</label>
		<input type="password" id="pwcheckfield">
		<button type="submit" id="slidenoteGuardianPasswordPromptEncrypt">ENCRYPT</button>
		<div id="slidenoteGuardianPasswortPromptAfterText">we recommend using a password manager to keep up with the task of choosing and remembering safe passwords on the web.</div>
	</form>

</div>
</div>

</div>

