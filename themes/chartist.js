var newtheme = new Theme("chartist");
newtheme.description = "Charts with Chartist - takes ```chart:(line|bar|pie)";
newtheme.helpText = function(dataobject){
  var result = "Insert Your Data to create nice graphs on the fly."+
    "<br>Copy and Paste your Data from your Excell-Sheet or CSV and put some flavour with a nice configured head into it";
    return result;
}

//Plugins:
var loadChartistPlugins = function(){
/*jsfile2 = document.createElement('script');
jsfile2.setAttribute("type","text/javascript");
jsfile2.setAttribute("src", "themes/chartist/chartist-plugin-accessibility.js");
document.getElementsByTagName("head")[0].appendChild(jsfile2);
jsfile3 = document.createElement('script');
jsfile3.setAttribute("type","text/javascript");
jsfile3.setAttribute("src", "themes/chartist/chartist-plugin-zoom.js");
document.getElementsByTagName("head")[0].appendChild(jsfile3);
var jsfile4 = document.createElement('script');
jsfile4.setAttribute("type","text/javascript");
jsfile4.setAttribute("src", "themes/chartist/chartist-plugin-pointlabels.js");
document.getElementsByTagName("head")[0].appendChild(jsfile4);*/
if(this.loadingFiles===undefined)this.loadingFiles = new Array();
  this.loadingFiles.push(slidenote.appendFile("script","chartist/chartist-plugin-accessibility.js"));
  this.loadingFiles.push(slidenote.appendFile("script","chartist/chartist-plugin-zoom.js"));
  this.loadingFiles.push(slidenote.appendFile("script","chartist/chartist-plugin-pointlabels.js"));
  for(var x=0;x<this.loadingFiles.length;x++){
      var file = this.loadingFiles[x];
      file.id="chartplugin"+x;
      file.onload = function(){
        console.log("file "+this.id+" loaded");
        slidenote.extensions.removeFromLoadingList(this.id);
        console.log(slidenote.extensions.loadingThemes.toString());
      };
      file.onerror = function(){slidenote.extensions.failTheme(this.id)};
      slidenote.extensions.loadingThemes.push({name:file.id});
  }
  slidenote.extensions.removeFromLoadingList("chartist-placeholder");

}
/*
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/chartist/chartist.js");
jsfile.onload = loadChartistPlugins;
document.getElementsByTagName("head")[0].appendChild(jsfile);*/
//newtheme.loadingFiles = new Array();
slidenote.extensions.loadingThemes.push({name:"chartist-placeholder"});
slidenote.appendFile("script","chartist/chartist.js").onload = loadChartistPlugins
newtheme.addEditorbutton('<img src="'+slidenote.basepath+'themes/chartist/chartbutton.png" alt="Chart" title="Chart">','```chart'); //only for comparison right now
slidenote.datatypes.push({type:"chart",mdcode:false, theme:newtheme}); //TODO: change chartsvg to chart


//internal vars:
newtheme.charts = new Array();
//newtheme.chartcontainers = new Array();
newtheme.hasInsertMenu = true;
newtheme.insertMenuArea = function(dataobject){
  var type = "line"; // line is standard-type:
  if(dataobject.head.indexOf("pie")>-1)type="pie";
  if(dataobject.head.indexOf("bar")>-1)type="bar";
  var subtype = dataobject.head.substring(9);
  if(subtype.length<2)subtype="line";
  console.log("subtype:"+subtype);

  var result = document.createElement("div");
  result.classList.add("chartistinsertmenu")

  var charttypes = ["line", "arealine", "bar", "horizontalbar", "stackbar", "horizontalstackbar", "pie", "halfpie"];
  var chartbarea = document.createElement("ul");
  for(var ct=0;ct<charttypes.length;ct++){
    var ctype = charttypes[ct];
    var button = document.createElement("li");
    //button.classList.add("chartistbutton")
    button.charttype = ctype;
    button.addEventListener("click",function(){
      slidenote.extensions.getThemeByName("chartist").changeChartType(this.charttype);
    });
    if(subtype===ctype)button.classList.add("active");
    var buttonimg = new Image();
    buttonimg.src=slidenote.basepath+"themes/chartist/"+ctype+"button.png";
    button.appendChild(buttonimg);
    chartbarea.appendChild(button);
  }

  chartbarea.classList.add("chartist-chartbuttonarea");
  result.appendChild(chartbarea);

  var buttonarea = document.createElement("div");
  if(type!="pie"){
    var xaxisbutton = document.createElement("button");
    xaxisbutton.innerText = "Label X-Axis";
    xaxisbutton.title = "A Label shown under the X-Axis of the Graph";
    xaxisbutton.addEventListener("click",function(){slidenote.extensions.getThemeByName("chartist").insert("xaxislabel")});
    buttonarea.appendChild(xaxisbutton);

    var yaxisbutton = document.createElement("button");
    yaxisbutton.innerText = "Label Y-Axis";
    yaxisbutton.title = "A Label shown at the Side of the Y-Axis of the Graph";
    yaxisbutton.addEventListener("click",function(){slidenote.extensions.getThemeByName("chartist").insert("yaxislabel")});
    buttonarea.appendChild(yaxisbutton);
    var datasetlabel = document.createElement("button");
    datasetlabel.innerText = "Label Dataset";
    datasetlabel.title = "A Label shown above the Graph shown which color uses which Data";
    datasetlabel.addEventListener("click",function(){slidenote.extensions.getThemeByName("chartist").insert("datasetlabel")});
    buttonarea.appendChild(datasetlabel);
  }
  var summary = document.createElement("button");
  summary.innerText="Summary";
  summary.title = "A Summary of your graph for Screenreaders"
  summary.addEventListener("click",function(){slidenote.extensions.getThemeByName("chartist").insert("summary")});
  buttonarea.appendChild(summary);

  var example = document.createElement("button");
  example.innerText = "Insert Example";
  example.addEventListener("click",function(){slidenote.extensions.getThemeByName("chartist").insert("example")});
  buttonarea.appendChild(example);

  result.appendChild(buttonarea);
  return result;
}

newtheme.changeChartType = function(charttype){
  //var charttype = document.activeElement.value;
  console.log("charttype:"+charttype);
  var selectionend = slidenote.textarea.selectionEnd;
  var selectionstart = slidenote.textarea.selectionStart;
  var actelement = slidenote.parser.CarretOnElement(selectionend);
  console.log(actelement);
  var start = actelement.posinall //"´´´chart:".length;
  console.log("insert "+charttype+" on ");
  slidenote.textarea.value = slidenote.textarea.value.substring(0,start) +
                              "```chart:"+
                              charttype + //"\n"+
                              slidenote.textarea.value.substring(slidenote.textarea.value.indexOf("\n",start));
  console.log("parseneu forced by chartist-changeChartType");
  var diff = charttype.length + 9 - actelement.mdcode.length;
  console.log("charttype:"+charttype+" md:"+actelement.mdcode+" diff:"+diff);
  slidenote.textarea.selectionEnd = selectionend+diff;
  slidenote.textarea.selectionStart = selectionstart+diff;
  slidenote.parseneu();
  slidenote.textarea.focus();
}

//internal function:
newtheme.updatecharts = function(){
  console.log("updating charts...");
  for(var x=0;x<this.charts.length;x++){
    this.charts[x].update();
  }
}

newtheme.insert = function(selection){
  var posibleinjections =  {
    xaxislabel:this.syntaxContainer.xaxis+this.syntaxContainer.metadataseparator+" ",
    yaxislabel:this.syntaxContainer.yaxis+this.syntaxContainer.metadataseparator+" ",
    datasetlabel:this.syntaxContainer.datasetidentifier+this.syntaxContainer.metadataseparator+" ",
    summary:this.syntaxContainer.summary+this.syntaxContainer.metadataseparator+" ",
    example:this.syntaxContainer.xaxis+this.syntaxContainer.metadataseparator+" xaxislabel \n"+this.syntaxContainer.yaxis+this.syntaxContainer.metadataseparator+"yaxislabel \n"+this.syntaxContainer.datasetidentifier+"1"+this.syntaxContainer.metadataseparator+" dataset1 \n"+this.syntaxContainer.datasetidentifier+"2"+this.syntaxContainer.metadataseparator+" dataset2 \n\n"+this.syntaxContainer.headseparator+"\njan:1:2\nfeb:2:3\nmar:3:4\napr:4:5"
    //add new buttons like this
  }
  var injection = posibleinjections[selection];
  var selectionstart = slidenote.textarea.selectionStart;
  var selectionend = slidenote.textarea.selectionEnd;
  var diff=0;
    var charbeforeinsert = slidenote.textarea.value.substring(selectionstart-1,selectionstart);
    if(charbeforeinsert!="\n")injection = "\n"+injection;
    var posofchartbegin = slidenote.textarea.value.lastIndexOf("```chart",selectionstart);
    var posofchartend = slidenote.textarea.value.indexOf("\n```",selectionend);
    var posofheadseparator = slidenote.textarea.value.lastIndexOf(this.syntaxContainer.headseparator,selectionstart);
    if(posofheadseparator<posofchartbegin ||posofheadseparator===-1)posofheadseparator=slidenote.textarea.value.indexOf(this.syntaxContainer.headseparator,selectionend);
    if((posofheadseparator>posofchartend||posofheadseparator===-1)&&selection!="example"){
      //no headseparator: just add one:
      injection+="\n"+this.syntaxContainer.headseparator;
      diff-=this.syntaxContainer.headseparator.length+1;
    }else{
      if(posofheadseparator<selectionend&&selection!="example"){
        //headseparator found before selection: move to headseparator
        selectionstart = posofheadseparator-1;
        selectionend = posofheadseparator-1;
        injection = "\n"+injection;
      }
      //check for datalabels:
      if(selection==="datasetlabel"){
        var oldend=posofheadseparator;
        if(oldend===-1 || oldend===undefined)oldend=posofchartend;
        var posoflastdatalabel = slidenote.textarea.value.lastIndexOf("\n"+this.syntaxContainer.datasetidentifier,oldend);
        if(posoflastdatalabel>-1 && posoflastdatalabel>posofchartbegin){
          var datasetnr = slidenote.textarea.value.substring(posoflastdatalabel+this.syntaxContainer.datasetidentifier.length+1,slidenote.textarea.value.indexOf(this.syntaxContainer.metadataseparator,posoflastdatalabel));
          if(!isNaN(datasetnr))datasetnr++;
          console.log("datasetnr:"+datasetnr);
          injection = "\n"+this.syntaxContainer.datasetidentifier+datasetnr+this.syntaxContainer.metadataseparator+" ";
          var nextlinepos = slidenote.textarea.value.indexOf("\n",posoflastdatalabel+1);
          if(nextlinepos>-1){
            selectionstart = nextlinepos;
            selectionend = nextlinepos;
          }
        }else{
          injection="\n"+this.syntaxContainer.datasetidentifier+"1"+this.syntaxContainer.metadataseparator+" ";
        }
      }else{
        //no datasetlabel, so it must be unique:
        var oldend=posofheadseparator;
        if(oldend===-1 || oldend===undefined)oldend=posofchartend;
        var oldposofelement = slidenote.textarea.value.lastIndexOf("\n"+posibleinjections[selection],oldend);
        if(oldposofelement>posofchartbegin){
          injection="";
          selectionstart=oldposofelement+posibleinjections[selection].length+1;
          selectionend = selectionstart;
        }
        console.log("chart:oldposofelement"+oldposofelement+"\n>>"+selection+"<<");

      }

    }
  var scrtop = slidenote.textarea.scrollTop;
  slidenote.textarea.value = slidenote.textarea.value.substring(0,selectionstart)+injection+slidenote.textarea.value.substring(selectionstart);
  diff+= injection.length;
  slidenote.textarea.focus();
  slidenote.textarea.selectionStart = selectionstart + diff;
  slidenote.textarea.selectionEnd = selectionend + diff;
  slidenote.textarea.scrollTop = scrtop;
  console.log("parseneu forced by insert of chartmenu");
  slidenote.parseneu();

}

newtheme.syntaxContainer = {
  //define here new syntax to use for identifiers etc:
  headseparator:"---",  //line with headseparator will separate metadata(before) from data(after)
  dataseparators:[":","\t",",",";"], //possible separators for data-structure (csv or similar)
  //metadata:
  metadataseparator:":",  //separator for metadata-structure - eg: [identifier][separator][value] like xaxis:10
  xaxis:"xaxis", //xaxis-label
  yaxis:"yaxis", //yaxis-label
  datasetidentifier:"dataset", //datasetidentifier
  summary:"summary", //for screenreaders, not implemented yet
  //source:"source", //source of data, not implemented yet

}

newtheme.parseMetadata = function(rawdata){
  var metadata = {};
  var headseparator = this.syntaxContainer.headseparator;
  var metadataseparator = this.syntaxContainer.metadataseparator;
  var datasetidentifier = this.syntaxContainer.datasetidentifier; //dataset1, dataset2 etc.
  metadata.datasetlabel = new Array();
  var rawmetadata = new Array();
  for(var x=0;x<rawdata.length;x++){
    if(rawdata[x]===headseparator)break;
    rawmetadata.push(rawdata[x]);
  }
  if(rawmetadata.length===rawdata.length)return {};
  for(var x=0;x<rawmetadata.length;x++){
    var identifier = rawmetadata[x].substring(0,rawmetadata[x].indexOf(metadataseparator));
    var value = rawmetadata[x].substring(rawmetadata[x].indexOf(metadataseparator)+metadataseparator.length);
    metadata[identifier] = value;
    if(identifier.indexOf(datasetidentifier)===0){
      var nr = identifier.substring(datasetidentifier.length);
      if(isNaN(nr)){
        metadata.datasetlabel.push(value);
      }else{
        metadata.datasetlabel[nr]=value;
      }
    }
  }
  if(metadata.datasetlabel[0]===undefined && metadata.datasetlabel.length>1){
    //asume user started with 1 instead of 0, correct it:
    metadata.datasetlabel.shift();
  }
  return metadata;
}

newtheme.parseData = function(origdata, metadata){
  var data = {labels:new Array(), series:new Array()};
  var headseparator = this.syntaxContainer.headseparator;
  var datastart = 0;
  for(var x=0;x<origdata.length;x++){
    if(origdata[x]===headseparator){datastart=x+1;break;}
  }
  var rawdata = origdata.slice(datastart);
  var rawdatastr = rawdata.join("\n");
  var separators = this.syntaxContainer.dataseparators; //[":","\t",",",";"];
  var sepmax = 0;
  var separator = null;
  for(var x=0;x<separators.length;x++){
    var sepcount = rawdatastr.split(separators[x]).length-1;
    if(sepcount > sepmax ){
      sepmax = sepcount;
      separator = separators[x];
    }
  }
  if(sepmax===0||separator===null)return null; //no valid dataseparator found
  //generate matrix:
  var datamatrix = new Array();
  for(var x=0;x<rawdata.length;x++){
    if(rawdata[x].length>0){ //dont push empty lines - ignore them
      datamatrix.push(rawdata[x].split(separator));
    }
  }
  //check if horizontal or vertical datastructure:
  var horizontal = false;
  //if first line contains no-numbers apart from first element its for labels, therefore horizontal structure:
  for (var x=1;x<datamatrix[0].length;x++){
    if(isNaN(datamatrix[0][x]))horizontal = true;
  }
  if(horizontal){
    console.log("horizontal data - label:");
    data.labels = datamatrix.shift();
    console.log(data.labels);
    console.log(datamatrix);
    for(var x=0;x<datamatrix.length;x++){
      for(var dx=0;dx<datamatrix[x].length;dx++){
        if(datamatrix[x][dx]==="" || isNaN(datamatrix[x][dx]))
        datamatrix[x][dx]=null;else datamatrix[x][dx]=datamatrix[x][dx]*1;
      }
      data.series.push(datamatrix[x]);
    }
  }else{
    //vertical structure:
    for(var y=0;y<datamatrix.length;y++){
      if(datamatrix[y].length===1)continue;
      data.labels.push(datamatrix[y][0]);
      for(var x=1;x<datamatrix[y].length;x++){
        var actdata = datamatrix[y][x];
        if(data.series[x-1]===undefined)data.series[x-1]=new Array();
        if(actdata ==="" || isNaN(actdata))actdata=null;else actdata=actdata*1;
        data.series[x-1].push(actdata);
      }
    }
  }

  return data;
}

newtheme.styleThemeSpecials = function(){
  //get all data-blocks with chart:
  var datadivs = slidenote.presentationdiv.getElementsByTagName("section");
  console.log("datadivs:")
  console.log(datadivs);

  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    if(slidenote.parser.dataobjects[datax].type=="chart"){
      console.log("chart gefunden");
      var dataobject = slidenote.parser.dataobjects[datax];
      var metadata = this.parseMetadata(dataobject.raw);
      var chartdata = this.parseData(dataobject.raw);
      console.log("headsubstring:"+dataobject.head.substring(9));
      var headsub = dataobject.head.substring(9);
      //charttype:
      var charttype="line";
      if(headsub.indexOf("pie")>-1 || headsub.indexOf("Pie")>-1)charttype="pie";
      if(headsub.indexOf("bar")>-1 || headsub.indexOf("Bar")>-1)charttype="bar";

      console.log("data for chart scanned:");
      console.log(metadata);console.log(chartdata);
      //data is ready - time to start the chart:
      var presentationdiv = datadivs[datax];
      if(chartdata){
        presentationdiv.innerHTML = "";
        presentationdiv.classList.add("chart");
        presentationdiv.classList.add("chart-"+charttype);
      }else{
        presentationdiv.innerHTML="<br>Chart: Error in parsing Data: no Data found Content:"+presentationdiv.innerHTML;
        continue;
      }
        //find out height:


      //TODO: find out dimension for graph
      presentationdiv.classList.add("ct-perfect-fourth");


      var chartoptions = this.getChartOptions({
        dataobject:dataobject, headsub:headsub,
        charttype:charttype, chartdata:chartdata, metadata:metadata});
      console.log("chartdata:");console.log(chartdata);
      //responsiveOptions: can be called aditionaly
      var responsiveOptions = this.getResponsiveOptions({headsub:headsub,charttype:charttype});
      var chsvg;
      //chartoptions.width = "100%";
      //chartoptions.height = "40vh";
      console.log("chart:presentationdiv clientheight"+presentationdiv.clientHeight);

      if(charttype==="line"){
        chsvg = new Chartist.Line(presentationdiv, chartdata, chartoptions);
      }else if(charttype==="bar"){
        chsvg = new Chartist.Bar(presentationdiv, chartdata, chartoptions);
      }else if(charttype="pie"){
        var sum = function(a, b) { return a + b };
        var pielabels = new Array();
        var labeldata = chartdata.labels;
        var series = chartdata.series[0];
        if(labeldata.length>0){
          for(var lx=0;lx<labeldata.length;lx++)pielabels[lx]=labeldata[lx];
        }else{
          for(var lx=0;lx<numdata.length;lx++)pielabels[lx]=numdata[lx];
        }
        //change label:
        for(var lx=0;lx<pielabels.length;lx++){
          if(ylabel)pielabels[lx]+=": "+series[lx]+" "+ylabel;
          pielabels[lx]+=" \n";
          pielabels[lx]+= Math.round(series[lx] / series.reduce(sum) * 100);
          pielabels[lx]+="%";
        }
        chsvg = new Chartist.Pie(presentationdiv,
        {labels:pielabels, series:series},
        chartoptions);
      }
      //add viewbox to chart:
      chsvg.on("created", function(data){
        console.log("chart created");
        console.log(data);
        var w = data.svg._node.clientWidth;
        var h = data.svg._node.clientHeight;
        if(w==0||h==0){
          w = data.svg._node.parentNode.clientWidth;
          h = data.svg._node.parentNode.clientHeight;
        }
        console.log("chartw/h:"+w+"/"+h);
        if(w>0&&h>0)
        data.svg.attr({
          viewBox:"0 0 "+w+" "+h,
          preserveAspectRatio:"xMinYMax meet"
              });
        //console.log(data.parent());
        //console.log()
      })
      this.charts.push(chsvg);
      //console.log("chsvg:");console.log(chsvg);console.log(chsvg.svg);
      //console.log(presentationdiv.children);
      //adding labels to x and y axis:
      var xlabel = metadata[this.syntaxContainer.xaxis];
      var ylabel = metadata[this.syntaxContainer.yaxis];
      var datasetlabel = metadata.datasetlabel;
      //console.log("datasetlabel:"+metadata[this.syntaxContainer.])
      //console.log(datasetlabel);
      if(xlabel && charttype!="pie"){
        console.log("x-axis-label:"+xlabel);
        var xlabeldiv = document.createElement("div");
        xlabeldiv.classList.add("chart-x-axis-label");
        xlabeldiv.classList.add("ct-label");
        xlabeldiv.innerText=xlabel;
        presentationdiv.appendChild(xlabeldiv);
      }
      if(ylabel && charttype!="pie"){
        var ylabeldiv = document.createElement("div");
        ylabeldiv.classList.add("chart-y-axis-label");
        ylabeldiv.classList.add("ct-label");
        ylabeldiv.innerText=ylabel;
        presentationdiv.appendChild(ylabeldiv);
      }
      console.log("chart:presentationdiv-height nach appending childs"+presentationdiv.clientHeight);

      if(datasetlabel && datasetlabel.length>0){
        var dsetlabeldiv = document.createElement("div");
        dsetlabeldiv.classList.add("chart-datasetlabel-container");

        for(var dx=0;dx<datasetlabel.length;dx++){
          var dsetlabel = document.createElement("span");
          var dsetlabeltext = document.createElement("span");
          dsetlabeltext.innerText=datasetlabel[dx];
          dsetlabel.appendChild(dsetlabeltext);
          dsetlabel.classList.add("chart-datasetlabel");
          dsetlabel.classList.add("ct-label");
          dsetlabel.classList.add("chart-datasetlabel-"+dx);
          var labelbox = document.createElement("div");
          labelbox.classList.add("chart-datasetlabel-box-"+dx);
          labelbox.classList.add("chart-datasetlabel-box");
          dsetlabel.appendChild(labelbox);
          //var abc="abcdefghijklmnopqrstuvwxyz";
          //dsetlabel.classList.add("ct-series-"+abc.substring(dx,dx+1));
          dsetlabeldiv.appendChild(dsetlabel);
        }
        presentationdiv.appendChild(dsetlabeldiv);
      }

    }//if type=chart
  }//forto
}//styleThemeSpecials

newtheme.getChartOptions = function(data){
  var charttype = data.charttype;
  var chartcontainer = data.container;
  var head = data.headsub;
  var summary = data.metadata[this.syntaxContainer.summary];
  if(summary==undefined)summary="A graphical Chart";
  var options = {  plugins: [
      	Chartist.plugins.ctAccessibility({
      	 // caption: 'Chart',
      	 // seriesHeader: 'business numbers',
      	 // summary: 'A graphic that shows the business numbers of the fiscal year 2015',
      	 // valueTransform: function(value) {
      	 //   return value + ' dollar';
      	 // },
      	  // ONLY USE THIS IF YOU WANT TO MAKE YOUR ACCESSIBILITY TABLE ALSO VISIBLE!
      	  //visuallyHiddenStyles: 'position: absolute; top: 100%; width: 100%; font-size: 11px; overflow-x: auto; background-color: rgba(0, 0, 0, 0.1); padding: 10px'
          summary:summary
        })
  	]
  };
  if(charttype == "line"){
  	options.fullWidth = true;
    options.chartPadding=60;
  	options.axisY = {
  		onlyInteger:true,
  		offset:20
  		}
  	if(head.indexOf("area")>-1){
  		options.showArea = true;
  		options.low = 0;
  	}
  	if(head.indexOf("zoom")>-1){
      for(var x=0;x<data.chartdata.series.length;x++){
        //data.chartdata.labels[x]=x+1;
        for(var y=0;y<data.chartdata.series[x].length;y++){
            data.chartdata.series[x][y]={x:y,y:data.chartdata.series[x][y]};
        }

      }
      var onZoom = function(chart, reset){
        slidenote.resetChartZoom = reset;
      }
  		options.plugins.push(Chartist.plugins.zoom({
        onZoom: onZoom,
        resetOnRightMouseBtn: true
      }));
      console.log(data.chartdata.labels);
  		options.axisX = {
      			type: Chartist.AutoScaleAxis,
            onlyInteger: true,
            chartdatalabels:data.chartdata.labels,
            labelInterpolationFnc: function(value, labels, more, more2, more3, more4){
              //console.log(value);
              //console.log(labels);
              //console.log(data);
              //console.log(options);
              //console.log(this);
              //console.log("bla");
              //console.log(options.axisX.chartdatalabels[value]);
              return options.axisX.chartdatalabels[value];
            }
    	};
    	options.axisY.type = Chartist.AutoScaleAxis;

  	}//end of zoom


  }else if(charttype=="bar"){
    //options.chartPadding=20;
    //options.align = 'left';
    //plugin-options for pointlabel:
    var pointlabeloptions = {
        textAnchor: 'middle',
        labelClass: 'ct-pointlabel ct-label',
        //align:'left'
        align:'top',
        labelOffset:{x:0,y:-2}
      }
  	options.axisY = {
  		onlyInteger:true,
  		//offset:20
  	}
    if(data.chartdata.series.length===1){
      options.distributeSeries= true;
      data.chartdata.series = data.chartdata.series[0];
    }
  	if(head.indexOf("horizontal")>-1){
      //options.axisY = undefined;
      console.log("horizontalbar");
      options.seriesBarDistance = 10;
  		options.horizontalBars = true;
  		options.reverseData = true; //what does this do? test it
  		//options.axisY.offset = 70;
      options.axisX = {onlyInteger:true};
      pointlabeloptions.align="right";
      pointlabeloptions.labelOffset={x:10,y:4};
  	}


  	if(head.indexOf("stack")>-1){
  		options.stackBars=true;
      pointlabeloptions.align="middle";
      pointlabeloptions.labelOffset = {x:0,y:2};
      pointlabeloptions.labelClass +=" ct-label-stackbar";
  	}
    options.plugins.push(
      Chartist.plugins.ctPointLabels(
        pointlabeloptions
      ));

  }else if(charttype=="pie"){
  	if(head.indexOf("half")>-1||head.indexOf("gauge")>-1){
      var total = 0;
      for(var tx=0;tx<data.chartdata.series[0].length;tx++)total+=data.chartdata.series[0][tx];
      total = total*2;
      console.log("halfpie with total:"+total);
      console.log(data.chartdata.series);
  		options.donut= true;
  		options.donutWidth= 60;
    		options.donutSolid= true;
    		options.startAngle= 270;
        //options.endAngle=90;
        //options.total=10;
    		options.total= total;
    		options.showLabel= true;
  	}
  }else {
  	options = null;
  }
  console.log("optionsobject:");console.log(options);
  return options;
}

newtheme.getResponsiveOptions = function(data){
  var smalllabeloptions = [
    ['screen and (min-width: 641px) and (max-width: 1024px)', {
      seriesBarDistance: 10,
      axisX: {
        labelInterpolationFnc: function (value) {
          return value;
        }
      }
    }],
    ['screen and (max-width: 640px)', {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function (value) {
          return value[0];
        }
      }
    }]
  ];//end of responsiveOptions
  if(data.charttype==="line"||data.charttype==="bar")return smalllabeloptions;
}
newtheme.afterStyle = function(){
  console.log("update charts:");
  this.updatecharts();
}

newtheme.styleThemeMDCodeEditor = function(){
  var dataobjects = slidenote.parser.dataobjects;
  var lines = slidenote.texteditorerrorlayer.getElementsByClassName("backgroundline");
  for(var x=0;x<dataobjects.length;x++)if(dataobjects[x].type==="chart"){
    var start = dataobjects[x].startline+1;
    var olines = dataobjects[x].raw;
    for(var ol=0;ol<olines.length;ol++)if(olines[ol]==="---"){
      var cpos = lines[start+ol].innerHTML.indexOf("carret");
      if(cpos===-1)
      lines[start+ol].innerHTML = '--- &nbsp;&nbsp;&nbsp;&nbsp;<span class="pagenr">&uarr;options&uarr; &darr;data&darr;</span>'
      lines[start+ol].classList.add("metadataseparator");
      for(mdl=ol-1;mdl>=0;mdl--)lines[start+mdl].classList.add("metadata");
    }
  }
}

slidenote.addTheme(newtheme);
