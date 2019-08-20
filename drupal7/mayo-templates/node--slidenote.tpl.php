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
<!--loading cms-infos: -->
<script language="javascript">
var initial_note = {
title: '<?php print $title;?>',
nid: <?php print $node->nid;?>,
encnote:'<?php if(isset($field_encryptednote[0]))print($field_encryptednote[0]['value']);?>',
encimg:'<?php if(isset($field_encimages[0]))print($field_encimages[0]['value']);?>', //old! delete in future update!
encimages:[<?php if(isset($field_encimg))foreach($field_encimg as $actimg)print('"'.str_replace("\n","",$actimg['value']).'",');?>], //new one
encimgmeta:'<?php if(isset($field_imagemeta[0]))print($field_imagemeta[0]['value']);?>',
notehash:'<?php if(isset($field_notehash[0]))print($field_notehash[0]['value']);?>',
imagehash:'<?php if(isset($field_imageshash[0]))print($field_imageshash[0]['value']);?>',
author: {id:<?php print($uid);?>} 
}
</script>
<!-- disabling loaded drupal-elements temporarily till deleted elsewhere -->
<script language="javascript">
function removeDrupalElements(){
var links = document.getElementsByTagName("link");
for(var x=links.length-1;x>=0;x--){
    if(links[x].href.indexOf("mayo")>-1)links[x].parentElement.removeChild(links[x]);
}

var scripts = document.getElementsByTagName("script");
for(var x=scripts.length-1;x>=0;x--){
    if(scripts[x].src.indexOf("jquery")>-1)scripts[x].parentElement.removeChild(scripts[x]);;
}

var styles = document.getElementsByTagName("style");
    for(var x=styles.length-1;x>=0;x--){
        styles[x].parentElement.removeChild(styles[x]);
    }
var slidenotediv = document.getElementById("slidenotediv");
var body = document.getElementsByTagName("body")[0];
for(var x=0;x<body.children.length;x++)body.children[x].style.display = "none";
body.appendChild(slidenotediv);
}

</script>

<script language="javascript" src="/sites/all/libraries/slidenotes/slidenotes.js"></script>
<script language="javascript" src="/sites/all/libraries/slidenotes/themes/slidenoteguardian.js"></script>


<div id="slidenotediv">
<div id="slidenoteeditor">
        <button id="cloud"><img id="savestatus" src="/sites/all/libraries/slidenotes/images/buttons/cloud.svg"></button>
        <button id="loadnote"><div><span id="slidenotetitle"><?php print $title ?></span><img src="/sites/all/libraries/slidenotes/images/buttons/loadnotebackground.png"></div></button>
        <button id="outlet">95 Words, 12 Pages,<br> 120 Seconds to read...</button>
    <div id="editorblock">
        <div id="texteditorerrorlayer"></div>
		<textarea spellcheck="false" id="quelltext" onload="" autofocus         onfocus="setTimeout('initeditor()',100);"></textarea>

    </div>
    <div id="buttonarearight">
        <button class="fluidbutton" id="toolbarbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/toolbar.png" alt="Toolbar"></button>
        <button class="fluidbutton" id="imagegallerybutton"><img src="/sites/all/libraries/slidenotes/images/buttons/imagegallery.png" alt="imagegallery"></button>
        <button class="fluidbutton" id="historyBackButton"><img src="/sites/all/libraries/slidenotes/images/buttons/undo.png" alt="undo"></button>
        <button class="fluidbutton" id="historyForwardButton"><img src="/sites/all/libraries/slidenotes/images/buttons/redo.png" alt="redo"></button>
    </div>
    <div id="toolbar"><div class="arrow_box" id="texteditorbuttons">
        <div class="screenreader-only">Toolbar</div>
        <ul id="toolbarbuttons">
			<li><button onclick="insertbutton('---')" title="new slide"><span class="buttonmdcode">---</span> new slide</button></li>
			<li><button onclick="insertbutton('%head1')" title="title"><img src="/sites/all/libraries/slidenotes/images/buttons/h1.png" alt="Title"><span class="buttonmdcode">#</span> headline</button></li>
			<li><button onclick="insertbutton('*')" title="italic"><img src="/sites/all/libraries/slidenotes/images/buttons/italic.png" alt="italic"><span class="buttonmdcode">*</span>italic<span class="buttonmdcode">*</span></button></li>
			<li><button onclick="insertbutton('**')" title="bold"><img src="/sites/all/libraries/slidenotes/images/buttons/bold.png" alt="bold"><span class="buttonmdcode">**</span>bold<span class="buttonmdcode">**</span></button></li>
			<li><button onclick="insertbutton('~~')" title="crossed"><img src="/sites/all/libraries/slidenotes/images/buttons/stroke.png" alt="stroke"><span class="buttonmdcode">~~</span>deleted<span class="buttonmdcode">~~</span></button></li>
			<li><button onclick="insertbutton('%list')" title="unordered list"><img src="/sites/all/libraries/slidenotes/images/buttons/ul.png" alt="list"><span class="buttonmdcode">- </span>list</button></li>
			<li><button onclick="insertbutton('%nrlist')" title="ordered list"><img src="/sites/all/libraries/slidenotes/images/buttons/ol.png" alt="ordered list"><span class="buttonmdcode">1. </span>ordered list</button></li>
			<li><button onclick="insertbutton('%quote')" title="quote"><img src="/sites/all/libraries/slidenotes/images/buttons/quote.png" alt="quote"><span class="buttonmdcode">&gt; </span>quote</button></li>
			<li><button onclick="insertbutton('%footnote')" title="footnote"><img src="/sites/all/libraries/slidenotes/images/buttons/quote.png" alt="footnote"><span class="buttonmdcode">[^*]</span> footnote</button></li>
			<li><button onclick="insertbutton('%comment')" title="comment"><img src="/sites/all/libraries/slidenotes/images/buttons/comment.png" alt="comment"><span class="buttonmdcode">//</span> comment</button></li>
			<li><button onclick="insertbutton('%code')" title="code"><img src="/sites/all/libraries/slidenotes/images/buttons/code.png" alt="code"><span class="buttonmdcode">`</span>code<span class="buttonmdcode">`</span></button></li>
			<li><button onclick="insertbutton('%link')" title="hyperlink"><img src="/sites/all/libraries/slidenotes/images/buttons/link.png" alt="link"><span class="buttonmdcode">[</span>link<span class="buttonmdcode">](url)</span></button></li>

        </ul>
    </div></div>
    <div id="imagegallery">imagegallery</div>
    <div id="optionarea">
        <button id="optionsbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/options.svg"><br>options</button>
        <button id="publishbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/publish.svg"><br>publish</button>
        <button id="importexportbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/import-export.svg"><br>import&<br>export</button>
    </div>
    <div id="sidebarcontainer">
        <div id="sidebar"></div>
        <div id="nicesidebarsymbol"><a id="nicesidebarsymbolcontainer" href="javascript:slidenote.presentation.showInsertMenu();"><span id="nicesidebarsymbollabel">list</span><img src="/sites/all/libraries/slidenotes/images/buttons/droptildeneu.png" alt="open Elements Menu"></a><img id="cursorlinearrow" src="/sites/all/libraries/slidenotes/images/buttons/cursorlineneu.png"></div>
			<div id="insertarea">
          <div id="insertmenulabel" class="screenreader-only"></div>
			    <div id="standardinsertmenu">
					<!--<button class="newpagebutton" onclick="insertbutton('---')" >new Page</button>-->
				</div>
				<div id="extrainsertmenu">
<!-- some test-data:
<button>- </button><button>+ </button><button>* </button><hr><button>1. </button><button>1.) </button><button>1) </button><button>a) </button><button>I) </button>
end test-data-->
				</div>
			</div>

    </div>
    <div id="playbuttonarea">
        <button class="fluidbutton" id="presentationoptionsbutton"><img src="/sites/all/libraries/slidenotes/images/buttons/presentation-options.svg"></button>
        <button class="fluidbutton" id="playbutton" onclick="slidenote.presentation.showpresentation()"><img src="/sites/all/libraries/slidenotes/images/buttons/play-button.svg"></button>
    </div>
<!-- the menus:-->
    <div id="menucloud"><div class="arrow_box">
        <div>cloud status:<span id="cloudstatus"></span></div>
        <button id="savebutton">save to cloud now</button>
        <button id="addrevision">add revision</button>
        <div class="separator">revert to revision</div>
        <ul id="revisionlist">
<!-- just for testing purpose some elements -->
            <li><button>mon 06-11-19 11:49</button></li>
            <li><button>mon 06-11-19 11:49</button></li>
            <li><button>mon 06-11-19 11:49</button></li>
        </ul>
    </div></div>
    <div id="menuload"><div class="arrow_box">
        <button id="newnote"><img src="/sites/all/libraries/slidenotes/images/buttons/+.png">new slidenote</button>
        <ul id="notelist">
            <li><button class="circle"><img src="/sites/all/libraries/slidenotes/images/buttons/-.png" alt="delete slidenote new note"></button><button class="loadnotebutton actnotebutton">new note</button></li>
            <li><button class="circle"><img src="/sites/all/libraries/slidenotes/images/buttons/-.png"></button><button class="loadnotebutton ">dinosaurs today</button></li>
            <li><button class="circle"><img src="/sites/all/libraries/slidenotes/images/buttons/-.png"></button><button class="loadnotebutton ">reading literature in the last century</button></li>
        </ul>
    </div></div>
    <div id="menuoutlet"></div>
    <div id="menupublish"><div class="arrow_box">
        <button id="publishtocms">publish presentation to slidenotes.io</button>
        <div class="separator">published to slidenotes.io</div>
        <ul id="publishedlist">
<!-- some test-data to see structure: -->
            <li>
                <button class="circle"><img src="/sites/all/libraries/slidenotes/images/buttons/-.png" alt="delete presentation"></button>
                <button class="loadnotebutton">mon 06-11-19 11:49</button>
                <button class="copylink"><img src="/sites/all/libraries/slidenotes/images/buttons/publish.svg" alt="copy link of presentation..."><br>copy link</button>
            </li>
            <li>
                <button class="circle"><img src="/sites/all/libraries/slidenotes/images/buttons/-.png" alt="delete presentation"></button>
                <button class="loadnotebutton">mon 06-11-19 11:00</button>
                <button class="copylink"><img src="/sites/all/libraries/slidenotes/images/buttons/publish.svg" alt="copy link of presentation..."><br>copy link</button>
            </li>
        </ul>
    </div></div>
    <div id="menuimportexport"><div class="arrow_box">
        <button id="importbutton"><div>import slidenote or MD-file</div><input type="file" id="importfile" accept=".slidenote,.txt,.md,.csv"></button>
        <div class="separator">download slidenote as</div>
        <button onclick="slidenoteguardian.saveNote('filesystem')">encrypted .slidenote file</button>
        <button onclick="slidenoteguardian.exportToFilesystem(slidenote.textarea.value, slidenoteguardian.notetitle+'.md')">unencrypted .md/.txt file</button>
        <div class="separator">download presentation as</div>
        <button onclick="slidenoteguardian.exportPresentationLocal(true);">encrypted .html file</button>
        <button onclick="slidenoteguardian.exportPresentationLocal(false);">unencrypted .html file</button>
    </div></div>
    <div id="menuoptionseditor"><div class="arrow_box">
        <a href="/user" class="menuitem">Account</a>
        <a href='/user/logout' class="menuitem">log out</a>
        <div class="separator">night shift</div>
        <button id="nightmodetoggle" class="menuitem"><div>on</div><div>off</div></button>
        <div class="separator">view mode</div>
        <div id="optionmenuinterfacedesign">
                <!--<button id="editorchoicebutton" class="menuitem">-->
				<select id="editorchoice" class="menuitem"  onchange="slidenote.choseEditor(this.value)">
					<option value="md-texteditor" selected>context-mode (default)</option>
					<option value="focus">focus-mode</option>
					<option value="raw-text">raw text</option>
				</select>
                <!--</button>-->
		</div>
        <div class="separator">---</div>
        <button onclick="slidenote.extensions.showThemes()">Advanced Options</button>
        <div class="separator">slidenotes.io service</div>
        <ul>
				<li><a href="#" class="menuitem">tutorials</a></li>
				<li><a href="#" class="menuitem">documentation</a></li>
				<li><a href="#" class="menuitem">bug reports</a></li>
				<li><a href="#" class="menuitem">community</a></li>
			</ul>

    </div></div>
    <div id="menuoptionspresentation"><div class="arrow_box_down">
        <div class="separator">slide design</div>
        <ul id="basicthemelist">
					<li><div>prototype</div><input type="radio" name="basictheme" value="prototype"><div class="prototype"><div>WELCOME</div>TO SLIDENOTES</div></li>
					<li><div>prototype</div><input type="radio" name="basictheme" value="pop"><div class="pop"><div>WELCOME</div> TO SLIDENOTES</div></li>
                    <li><div>prototype</div><input type="radio" name="basictheme" value="coding"><div class="coding"><div>WELCOME</div> TO SLIDENOTES</div></li>
		</ul>
    </div></div>
<!-- only stuff for making shadows and such:-->
    <!-- old stuff(cornerleft)
    <div id="cornerleft"></div>
    <div id="topleft"></div>
    <img id="cornerleftimage" src="/sites/all/libraries/slidenotes/images/cornerleftimage.png">
    <div id="topmiddle"></div>
    <div id="noteareaempty"><img src="/sites/all/libraries/slidenotes/images/borderleft.png"></div>
    <div id="cornerright"></div>
-->
  <div id="topright"><svg viewBox="0 0 40 40" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
			    <g transform="matrix(1,0,0,1,-1190.49,-3479)">
			        <g transform="matrix(1,0,0,1,0,3479)">
			            <g transform="matrix(1,0,0,1,0,-3479)">
			                <path class="rightcorner" filter="url(#rightcorner-shadow" d="M1230.49,3519L1230.41,3519C1229.09,3497.58 1211.92,3480.41 1190.49,3479.09L1190.49,3479L1230.49,3479L1230.49,3519Z"/>
			                <path class="rightcorner" d="M1230.49,3519L1230.41,3519C1229.09,3497.58 1211.92,3480.41 1190.49,3479.09L1190.49,3479L1230.49,3479L1230.49,3519Z"/>
			            </g>
			        </g>
			    </g>
			    <defs>
			    	<filter id="rightcorner-shadow">
			    		<feOffset result="offOut" in="SourceAlpha" dx="-1" dy="0" />
      					<feGaussianBlur result="blurOut" in="offOut" stdDeviation="4" />
      					<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
      					<feComponentTransfer>
    						<feFuncA type="linear" slope="0.3"/>
  						</feComponentTransfer>
        			</filter>
			    </defs>
			</svg></div>
    <div id="shadowelleft"></div>
    <div id="shadowelright"></div>
    <div id="rahmenright"></div>
</div><!--end of slidenoteeditor-div-->
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

</div><!-- end of slidenotediv-->
<div id="slidenoteloadingscreenwrapper">
  <div id="slidenoteeditorloadingscreen">
    <img id="loadingcircle" src="/sites/all/libraries/slidenotes/images/loadingscreen.png">
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
<div id="slidenoteLoadingScreen">
	<h1>Please wait while your presentation is generated...</h1>
	<img src="/sites/all/libraries/slidenotes/images/wait-charlie-chaplin.gif" height="80%">
</div>


<!-- script von marie.htm: -->
<script>
var slidenoteguardian;
var slidenote;

//some test-things:
function testinit(){
  return;
    slidenoteguardian.loadedSlidenotes = [{title:"new note",url:"/home/mochilera/Dokumente/jkop/design/marie/editor/marie.htm"},
    {title:"test",url:"dev.slidenotes.io/slidenote/3"},
    {title:"dinosaurier heute",url:"dev.slidenotes.io/slidenotes/dinosaurier"}];
    slidenoteguardian.loadedPresentations = [{title:"test", date:"testdate",id:"10",slidenote:"3",url:"testurl"}];

    menumanager.init();
}

var menumanager = {};
menumanager.menus = new Array();
menumanager.menuByName = function(name){
    for(var x=0;x<this.menus.length;x++)if(this.menus[x].name===name)return this.menus[x];
}
menumanager.buildSlidenoteList = function(){
    if(!slidenoteguardian || !slidenoteguardian.hascmsconnection)return;
    var menudiv = this.menuByName("menuload");
    var menu = document.getElementById("notelist");
    menu.innerHTML= "";
    var list = slidenoteguardian.loadedSlidenotes;
    for(var x=0;x<list.length;x++){
        var title = list[x].title;
        var url = list[x].url;
        var li=document.createElement("li");
        var del = document.createElement("button");
        var lod = document.createElement("button");
        del.classList.add("circle");
        var delimg = new Image();
        delimg.src = slidenote.imagespath+"buttons/-.png";
        delimg.alt = "delete slidenote >>>"+title+"";
        del.appendChild(delimg);
        del.targeturl = url+"/delete";
        del.onclick = function(){
            if(confirm("are you shure you want to delete selected slidenote?")){
                location.href=this.targeturl;
            };
        }
        lod.classList.add("loadnotebutton");
        if(url.indexOf(location.pathname)>-1)lod.classList.add("actnotebutton");
        lod.innerText = title;
        lod.url = url;
        lod.onclick = function(){
            //put save-question here
            location.href= this.url;
        }
        li.appendChild(del);
        li.appendChild(lod);
        menu.appendChild(li);
    }

}

menumanager.buildPublishedMenu = function(){
    var list = slidenoteguardian.loadedPresentations;
    var menu = document.getElementById("publishedlist");
    menu.innerHTML = "";
    for(var x=0;x<list.length;x++){
        var delurl = "/node/"+list[x].id+"/delete";
        var title=list[x].title;
        var url = list[x].url;
        var li = document.createElement("li");
        var del = document.createElement("button");
        var lod = document.createElement("button");
        del.classList.add("circle");
        var delimg = new Image();
        delimg.src = slidenote.imagespath+"buttons/-.png";
        delimg.alt = "delete presentation >>>"+title+"";
        del.appendChild(delimg);
        del.targeturl = delurl;
        del.onclick = function(){
            if(confirm("are you shure you want to delete selected slidenote?")){
                location.href=this.targeturl;
            };
        }
        lod.innerText = list[x].date;
        lod.targeturl = url;
        lod.onclick = function(){
            //TODO: put save question here
            location.href=this.targeturl;
        }
        var cpl = document.createElement("button");
        cpl.classList.add("copylink");
        var cplimg = new Image();
        cplimg.src = slidenote.imagespath+"buttons/publish.svg";
        cplimg.alt = "copy link of presentation >>>"+title;
        cpl.appendChild(cplimg);
        var cpltext = document.createElement("div");
        cpltext.innerText="copy link";
        cpl.appendChild(cpltext);
        cpl.value = url;
        cpl.onclick = function(){
            var text = this.value;
            var input = document.createElement('input');
            input.setAttribute('value', text);
            document.body.appendChild(input);
            input.select();
            var result = document.execCommand('copy');
            document.body.removeChild(input)
            console.log("copied "+text+" to clipboard:"+result);
        }
        li.appendChild(del);
        li.appendChild(lod);
        li.appendChild(cpl);
        menu.appendChild(li);
    }
}

menumanager.buildPresentationMenu = function(){
  var cssthemes = slidenote.extensions.CssThemes();
  var list = document.getElementById("basicthemelist");
  list.innerHTML = "";
  for(var x=0;x<cssthemes.length;x++){
    var li = document.createElement("li");
    var title = document.createElement("div");
    title.innerText = cssthemes[x].classname;
    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "basictheme";
    radio.value = cssthemes[x].classname;
    if(cssthemes[x].active)radio.checked = true; else radio.checked=false;
    var preview = document.createElement("div");
    preview.classList.add("themepreview");
    preview.classList.add(cssthemes[x].classname);
    preview.innerHTML="<div>Welcome</div><p>to Slidenotes</p>";
    title.title=cssthemes[x].description;
    radio.title=cssthemes[x].description;
    preview.title=cssthemes[x].description;
    radio.onchange = function(){
      slidenote.extensions.changeThemeStatusByClassname(this.value,this.checked);
      slidenoteguardian.saveConfig("local");
    }

    li.appendChild(title);
    li.appendChild(radio);
    li.appendChild(preview);
    list.appendChild(li);
  }

}

menumanager.init = function(){
    var menus = ["menuload","menucloud","menupublish","menuimportexport", "menuoptionseditor", "menuoptionspresentation","toolbar"];
    this.standardmenus = menus;
    var menubuttons = ["loadnote","cloud","publishbutton","importexportbutton", "optionsbutton","presentationoptionsbutton","toolbarbutton"];
    for(var x=0;x<menus.length;x++){
        var button = document.getElementById(menubuttons[x]);
        var menu = document.getElementById(menus[x]);
        this.menus.push({name:menus[x],menu:menu,button:button});
        button.menu = menus[x];
        menu.button = menubuttons[x];
        if(menus[x]==="menuoptionspresentation")button.addEventListener("click",function(){
          slidenote.menumanager.buildPresentationMenu();
        });
        button.onclick = function(){
            var menus = document.getElementsByClassName("autohidemenu");
            var menu  = document.getElementById(this.menu);
            for(var x=0;x<menus.length;x++)if(menus[x]!=menu){
                menus[x].classList.remove("active");
                if(menus[x].button)
                document.getElementById(menus[x].button).classList.remove("active");
            }
            if(menu===null||menu===undefined)return;
            if(menu.classList.contains("active")){
                menu.classList.remove("active");
                this.classList.remove("active");

            } else{
                menu.classList.add("active");
                this.classList.add("active");
            }
            var firstbutton = menu.getElementsByClassName("menuitem");
            if(firstbutton.length<1)firstbutton = menu.getElementsByTagName("button");
            if(firstbutton.length<1)return;
            firstbutton[0].focus();
        }
        if(menus[x]!="toolbar"){
            menu.classList.add("autohidemenu");
            //menu.onblur = function(){console.log("test onblur");this.classList.remove("active");};
            //menu.onfocusout = function(){console.log("test onfocusout");this.classList.remove("active");};
        }
    }
    document.getElementsByTagName("textarea")[0].addEventListener("focus",function(event){
        var menus = document.getElementsByClassName("autohidemenu");
        for(var x=0;x<menus.length;x++){
            menus[x].classList.remove("active");
            if(menus[x].button)
            document.getElementById(menus[x].button).classList.remove("active");
        }
    });
    this.buildSlidenoteList();
    var editorsel = document.getElementById("editorchoice");
    editorsel.onkeydown = function(e){if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault();};
    editorsel.onkeypress = function(e){if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault();};
    editorsel.onkeyup = function(e){if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault();};
    //more buttons: night-mode toggle:
    document.getElementById("nightmodetoggle").onclick = function(){
        var sleditor = document.getElementById("slidenoteeditor");
        var slbody = document.getElementsByTagName("body")[0];
        if(sleditor.classList.contains("nightmode")){
            sleditor.classList.remove("nightmode");
            slbody.style.background = "unset";
        }  else {
          sleditor.classList.add("nightmode");
          slbody.style.background="black";
        }
        if(slidenoteguardian){
          slidenoteguardian.saveConfig("local");
        }
    }
    //temporary here to have it available on monday, TODO: delete this part:
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

}

function initeditor(){
    //console.log("focus on editor");
    if(slidenote==null){
        var texted = 		document.getElementById("quelltext");
		    var texterr =		 document.getElementById("texteditorerrorlayer");
		    var slideshow = 	document.getElementById("praesentation");
        if(texted===null||texterr==null||slideshow===null){
            console.log("something is missing...");
            setTimeout("initeditor()",500);
            return;
        }else{
            var basepath ="/sites/all/libraries/slidenotes/";			
			slidenote = new slidenotes(texted, texterr, null, slideshow, basepath );
			slidenote.appendFile("css","../marie.css");
			slidenote.appendFile("css","slidenoteguardian.css");
			slidenote.basepath="/sites/all/libraries/slidenotes/";
			slidenote.imagespath="/sites/all/libraries/slidenotes/images/";
            removeDrupalElements();			

            presentation = slidenote.presentation;
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
    			texted.addEventListener("focus",function(){
    				var carret = document.getElementById("carret");
    				if(carret)carret.classList.remove("unfocused");
            var sel = document.getElementsByClassName("selectioncarretmarker");
            if(sel.length===0)return;
            for(var x=sel.length-1;x>=0;x--){
              //sel[x].parentElement.removeChild(sel[x]);
              //sel[x].classList.add("hiddenselectioncarretmarker");
              var seltxt = sel[x].parentElement.innerHTML;
              //console.log(seltxt);
              seltxt = seltxt.replace('<u class="selectioncarretmarker">','');
              seltxt = seltxt.replace('</u>','');
              //console.log("ergebnis:"+seltxt);
              sel[x].parentElement.innerHTML = seltxt;
              //sel[x].classList.remove("selectioncarretmarker");
            }
            //slidenote.parseneu();

    			});
    			texted.addEventListener("focusout",function(){
    				var carret = document.getElementById("carret");
    				if(carret)carret.classList.add("unfocused");
    				//console.log("onblur show carret");
    				//console.log(carret);
            //adding selection-marking:
            var selstart = slidenote.textarea.selectionStart;
            var selend = slidenote.textarea.selectionEnd;
            if(selend-selstart!=0){
              var startline = slidenote.parser.lineAtPosition(selstart);
              var endline = slidenote.parser.lineAtPosition(selend);
              var bglines = document.getElementsByClassName("backgroundline");
              var startpos = selstart - slidenote.parser.map.linestart[startline];
              var endpos = selend - slidenote.parser.map.linestart[endline];
              //set end: (first end because of changes later on)
              /*var changesinline = slidenote.parser.mdcodeeditorchanges[endline];
              var inspos = endpos;
              for(var x=0;x<changesinline.length;x++){
                if(startpos>=changesinline[x].pos){
                  inspos+=changesinline[x].html.length;
                  if(changesinline[x].typ==="<")inspos--;
                }
              }
              var txt = bglines[endline].innerHTML;
              txt = txt.substring(0,inspos)+'<u class="selectioncarretmarker">'+txt.substring(inspos);
              bglines[endline].innerHTML = txt;
              */
              //helper function: do all changes:
              function applychanges(changes, text){
                var txt=text;
                for(var x=0;x<changes.length;x++){
                  txt = txt.substring(0,changes[x].pos)+changes[x].html+txt.substring(changes[x].pos);
                }
                return txt;
              }
              //set start:
              var changesinline = new Array();
              var changesinendline = new Array();
              for(var x=0;x<slidenote.parser.mdcodeeditorchanges.length;x++){
                if(slidenote.parser.mdcodeeditorchanges[x].typ==="cursor")continue;
                if(slidenote.parser.mdcodeeditorchanges[x].line===startline)changesinline.push(slidenote.parser.mdcodeeditorchanges[x]);
                if(slidenote.parser.mdcodeeditorchanges[x].line===endline)changesinendline.push(slidenote.parser.mdcodeeditorchanges[x]);
              }
              var inspos = startpos;
              for(var x=0;x<changesinline.length;x++){
                if(startpos>changesinline[x].pos){
                  inspos+=changesinline[x].html.length;
                  if(changesinline[x].typ==="<")inspos--;
                }
              }
              var txt = bglines[startline].innerHTML;
              if(slidenote.parser.lineswithhtml[startline]==="code")txt = applychanges(changesinline,slidenote.parser.sourcecode.split("\n")[startline]);
              txt = txt.substring(0,inspos)+'<u class="selectioncarretmarker">'+txt.substring(inspos);
              var starthtml = txt;
              txt=bglines[endline].innerHTML;
              if(slidenote.parser.lineswithhtml[endline]==="code")txt = applychanges(changesinline,slidenote.parser.sourcecode.split("\n")[endline]);
              var inspos2 = endpos;
              for(var x=0;x<changesinendline.length;x++){
                var ch = changesinendline[x];
                if(endpos>ch.pos){
                  inspos2+=ch.html.length;
                  if(ch.typ==="<")inspos2--;
                }
              }
              if(startline===endline){
                var carretstart = txt.indexOf('<span id="carret"');
                var carretend = txt.indexOf('</span>',carretstart)+'</span>'.length;
                var carretlength = carretend - carretstart;
                if(carretstart===-1)carretlength=0;
                inspos2+=carretlength;
              }
              txt = txt.substring(0,inspos2)+"</u>"+txt.substring(inspos2);
              if(startline===endline)txt = txt.substring(0,inspos)+'<u class="selectioncarretmarker">'+txt.substring(inspos);
              var endhtml = txt;
              if(startline!=endline){
                starthtml+="</u>";
                bglines[startline].innerHTML = starthtml;
                endhtml = '<u class="selectioncarretmarker">'+endhtml;
              }
              bglines[endline].innerHTML = endhtml;
              //bglines[startline].innerHTML = txt;
              //set in-between:
              if(startline!=endline){
                for(var x=startline+1;x<endline;x++){
                  if(bglines[x].classList.contains("pagebreak")){
                    var pbtxt = bglines[x].innerHTML;
                    pbtxt = '<u class="selectioncarretmarker">---</u>' + pbtxt.substring(3);
                    bglines[x].innerHTML = pbtxt;
                  }else bglines[x].innerHTML = '<u class="selectioncarretmarker">'+bglines[x].innerHTML+'</u>';
                }
              }

            }
    			});
          document.getElementById("importbutton").addEventListener("click",function(){document.getElementById("importfile").click()});
          console.log("slidenote-object created");
          console.log(slidenote);
          slidenote.menumanager = menumanager;
          slidenote.menumanager.init();
          slidenote.extensions.addAfterLoadingThemesHook(function(){
    				slidenoteguardian = new slidenoteGuardian(slidenote);
    			});
      }
    }
}
function insertbutton(code){
	if(slidenote!=null)slidenote.insertbutton(code);
}
</script>


