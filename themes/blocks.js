/* blocks: a theme that interprets content as horizontal or vertical blocks to arrange them  */

var newtheme = new Theme("blocks");
newtheme.description = "Arranges Content as Horizontal or Vertical Blocks";


newtheme.buildgrid = function(gridcontainer){
  var gridelemente = gridcontainer.children;
  var gridarray = [];
  var gridx = 0;
  var gridy = 0;
  var maxheight = 0;
  var heightleft = 0;
  for(var x=0;x<gridelemente.length;x++){
  	var gridel = gridelemente[x];
    console.log("grid: start with element:"+gridel.innerHTML);
    console.log("grid: element has clientHeight:"+gridel.clientHeight);
    //console.log("gridarea before change:"+gridel.style.gridArea);
    if(gridel.classList.contains("bgimg")){
      //background-image found - dont insert into gridarray
      continue;
    }
  	if(!gridel.style.gridArea){
      gridel.style.gridArea="gridel"+x;
      gridel.areaname = "gridel"+x;
    }
    console.log("grid: again clientHeight"+gridel.clientHeight);
    //console.log("gridel-gridarea:"+gridel.style.gridArea);
  	if(gridel.classList.contains("vertical")){
  	 //element is vertical:
  		if(gridarray[gridy]==null)gridarray[gridy] = new Array();
  		if(gridx===2 && gridelemente[x+1] && gridelemente[x+1].classList.contains("vertical")){
  			gridx=0;gridy++;
  			gridarray[gridy]=new Array();
  		}
      if(gridx===1 && heightleft>0 && maxheight>heightleft
          && this.clientHeight(gridel, "60%")>heightleft){
        //element does not fit next to neighbour:
        console.log("grid: vertical does not fit into column - go to next row");
        //gridx=0;gridy++;
        //gridarray[gridy]=new Array();
        gridx=0;
      }
  		gridarray[gridy][gridx]=gridel;
  		maxheight=this.clientHeight(gridel) *1.5;
  		heightleft = maxheight;
      console.log("grid: vertical found with maxheight:"+maxheight);
      console.log("grid: clientHeight:"+gridel.clientHeight);
  		gridx++;
  		if(gridx>2){
  			gridx=0;gridy++;
  			maxheight=0; heightleft=0;
  		}
  	}else if(gridel.classList.contains("horizontal")){
  	 //element is horizontal - always break:
     console.log("grid:horizontal element found");
  		if(gridx>0){
        gridx=0;
        if(heightleft===maxheight)gridy++; //vertical starts in same row
        maxheight=0;
        heightleft=0;
      }
  		gridarray[gridy]=[gridel];
  		gridy++;
  	}else{
  		//element is flexible:
  		if(gridx==0){
  			//easiest case: just print it into the whole row:
        console.log("grid: add element easy to row"+gridy +" with clientHeight"+gridel.clientHeight);
  			gridarray[gridy]=[gridel];
  			gridy++;
  		}else if(gridx==1){
  			//harder case: make shure if it fits into line
        //console.log("grid: height of element before:"+gridel.clientHeight);
  			//gridel.classList.add("block-flex-neighbour"); //add class to get width to 60%;
  			var height=this.clientHeight(gridel, "60%");//gridel.clientHeight;	//get actual height of element if put as neighbour
        //console.log("grid: height of element after:"+height);
        console.log("grid: height:"+height+"heightleft:"+heightleft);
  			//gridel.classList.remove("block-flex-neighbour"); //remove class to not mess with other css
  			if(heightleft<height){
  				//element does not fit into column, check if put into next row or use this row:
  				if(heightleft<maxheight){
            console.log("grid: heightleft<maxheight - add element to row"+gridy);
  					//vertical element has one neighbour yet, so put it in the same row, deleting old vertical in this row
  					gridx=0;
  					gridarray[gridy]=[gridel];
  					gridy++;
  					heightleft=0;
  					maxheight=0;
  				}else{
  					//switch to next row:
            console.log("grid: switch to next row after row:"+gridy);
  					gridx=0;
  					gridy++;
  					gridarray[gridy]=[gridel];
            gridy++;
  					heightleft=0;
  					maxheight=0;
  				}
  			}else{
  				//element fits into colum:
  				gridarray[gridy][gridx]=gridel;
  				//if more elements are coming continue with vertical in column 1
          if(gridelemente.length > x+1){
            console.log("gridelementelength:"+gridelemente.length+"x:"+x);
            gridy++;
            gridarray[gridy]=new Array();
            gridarray[gridy][0]=gridarray[gridy-1][0];
  				  heightleft-=height;
          }
  			}
  		}else{
  			//its not on first or second position, so make shure to break into new row
  			gridx=0;
  			gridy++;
  			gridarray[gridy]=[gridel];
  			gridy++;
  		}
  	}
  }
  //now i should have array where i can build up the grid from:
  //first get the max amount of elements in a row:
  var colums =1;
  for(var x=0;x<gridarray.length;x++){
  	if(gridarray[x].length>colums)colums=gridarray[x].length;
  	//do not only build 2-colums-template if neighbour is not vertical - build a 3-column instead:
  	if(gridarray[x].length ==2 && colums ==2 && !gridarray[x][1].classList.contains("vertical"))colums=3;
  }
  console.log("gridarray:");
  console.log(gridarray);
  //now build the area-array:
  var gridarea = new Array();
  for(var x=0;x<gridarray.length;x++){
  	gridarea[x] = new Array();
  	for(var y=0;y<colums;y++){
  		if(gridarray[x].length===1){
  			gridarea[x].push(gridarray[x][0].areaname);
  		}else if(gridarray[x].length===colums){
  			gridarea[x][y]=gridarray[x][y].areaname;
  		}else if(gridarray[x].length===2){
  			if(y===0)gridarea[x][y]=gridarray[x][y].areaname;
  			if(y>=1)gridarea[x][y]=gridarray[x][1].areaname;
  		}
  	}
  }
  console.log("gridarea:");
  console.log(gridarea);
  //the area-array is now filled with the right values - build an area out of it:
  var area = '';
  for(var x=0;x<gridarea.length;x++){
  area +='"';
  for(var y=0;y<colums;y++)area+=gridarea[x][y]+' ';
  area+='" ';
  }
  console.log("area to use:"+area);
  gridcontainer.style.gridTemplateAreas = area;
  //gridcontainer.style.gridTemplateRows = "repeat("+gridarray.length+", 1fr )";
  gridcontainer.classList.add("gridx"+colums);
  for(var x=0;x<gridelemente.length;x++)gridelemente[x].classList.add("griditem");
}

newtheme.clientHeight = function(element, width){
  //var el = document.createElement("div");
  var el = element.cloneNode(true);
  el.classList.add("testdiv");
  //el.innerHTML = element.innerHTML;
  //if(element.getElementsByTagName("img")>0){
  //  var images = element.getElementsByTagName("img");
  //  for(var ix=0;ix<images.length;ix++){
  //    var image = new Image();
  //    image.src = images[ix].src;
  //    console.log("grid: new image-size:"+image.naturalHeight);
  //    el.appendChild(image);
  //  }
  //}
  //document.getElementsByTagName("body")[0].appendChild(el);
  slidenote.presentationdiv.appendChild(el);
  if(width)el.style.width = width;
  var result = el.clientHeight;
  console.log("grid: clientHeight returned"+result);
  //document.getElementsByTagName("body")[0].removeChild(el);
  slidenote.presentationdiv.removeChild(el);
  return result;
}
newtheme.clientWidth = function(element){
  var el = document.createElement("div");
  el.classList.add("testdiv");
  el.innerHTML = element.innerHTML;
  document.getElementsByTagName("body")[0].appendChild(el);
  var result = el.clientWidth;
  document.getElementsByTagName("body")[0].removeChild(el);
  return result;
}

newtheme.addBlockClassesToElements = function(gridcontainer){
  var pagenode = gridcontainer;
  var nodes = gridcontainer.children;
  for(var e=0;e<nodes.length;e++){
    var node = nodes[e];
    if(node.className === "imageblock" || node.nodeName==="IMG"){
      //imageblock: get clientWidth and clientHeight;
      var cliw = this.clientWidth(node); //does not work like this:
      //cliw = 0;
      //var imagesinblock = node.getElementsByTagName("img");
      //console.log(imagesinblock);
      //for(var ix=0;ix<imagesinblock.length;ix++)if(imagesinblock[ix].naturalWidth>cliw)cliw=imagesinblock[ix].naturalWidth;
      //console.log("grid: imagesinblock[0].naturalWidth:"+imagesinblock[0].naturalWidth);
      var clih = this.clientHeight(node, cliw);
      var landscape = (cliw - clih > 0);
      console.log("grid: imagew:"+cliw+"imageh:"+clih);
      if(!landscape)node.classList.add("vertical");
      if(landscape)node.classList.add("horizontal");
      //if(e===0){
        //image is first element, so image as background
      //  node.classList.add("bgimg");
      //}
    }// end of imageblock
    console.log("nodeName: "+node.nodeName);
    if(node.nodeName === "OL" || node.nodeName === "UL"){
      console.log("grid: list found clientwidth:"+node.clientWidth);
      //lists: go through listelements li.
      //if listelements are longer than 30% of page its horizontal
      var lis = node.getElementsByTagName("li");
      console.log("blocks: lis.length" +lis.length);
      console.log("blocks: lis[0].length"+lis[0].innerHTML.length);
      var maxw = 0;
      for(var l=0;l<lis.length;l++){
        if(lis[l].innerHTML.length>maxw)maxw = lis[l].innerHTML.length;
      }
      var screenw = document.getElementsByTagName("body")[0].clientWidth; //pagenode.clientWidth;
      var maxChar = screenw / 8;
      console.log("maxChar dynamic:"+maxChar);
      maxChar = maxChar * 0.5; //50%
      if(maxChar===0)maxChar = 20;
      console.log("maxChar:"+maxChar);
      if(maxw<maxChar && lis.length>3){
        node.classList.add("vertical");
      }else{
         node.classList.add("horizontal");
      }
    }//end of if list
    if(node.tagName==="FOOTER"){
      node.classList.add("horizontal");
      node.areaname="footer";
      node.style.gridArea = "footer";
    }
    console.log("blocks:classlist of element"+node.classList);
    if(node.classList.contains("listblock")){
      //tread listblocks always as vertical? just try it:
      node.classList.add("vertical");
    }
  }//end of nodes
}

newtheme.styleThemeSpecials = function(){
  var presimages = slidenote.presentationdiv.getElementsByTagName("img");
  this.imagestoload =0;
  for(var x=0;x<presimages.length;x++){
      if(presimages[x].naturalWidth===0){
        this.imagestoload++;
        presimages[x].addEventListener("load", function(){
          var theme = slidenote.presentation.getThemeByName("blocks");
          theme.preLoad();
        });
        presimages[x].addEventListener("error", function(){
          slidenote.presentation.getThemeByName("blocks").preLoad();
        });
      }
  }
  if(this.imagestoload===0){
    //does not work:setTimeout(this.styleGrid(), 1000);
    //try with image:
    var tmpimage = new Image();
    tmpimage.onload = function(){
      slidenote.presentation.getThemeByName("blocks").styleGrid();
      this.parentNode.removeChild(this);
    }
    tmpimage.src = "images/lapa.jpg";
    document.getElementsByClassName("presentation")[0].appendChild(tmpimage);
  }
}

newtheme.preLoad = function(){
  this.imagestoload--;
  if(this.imagestoload===0)this.styleGrid();
}

newtheme.styleGrid = function(){
  //for testing purpose:
  //add horizontal/vertical to block:
  //cycle through all pages:
  var pagenodes = document.getElementsByClassName("ppage");
  for(var p=0;p<pagenodes.length;p++){
    var pagenode = pagenodes[p];
    var nodes = pagenode.childNodes;
    //add classes to distinguish between vertical, horizontal and flex:
    this.addBlockClassesToElements(pagenode);
    //build grid:
    this.buildgrid(pagenode);

  }//end for pagenodes

}

slidenote.addTheme(newtheme);
