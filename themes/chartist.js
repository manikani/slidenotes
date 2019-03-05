var newtheme = new Theme("chartist");
newtheme.description = "Charts with Chartist - takes ```chart:(line|bar|pie)";


//Plugins:
var loadChartistPlugins = function(){
jsfile2 = document.createElement('script');
jsfile2.setAttribute("type","text/javascript");
jsfile2.setAttribute("src", "themes/chartist/chartist-plugin-accessibility.js");
document.getElementsByTagName("head")[0].appendChild(jsfile2);
jsfile3 = document.createElement('script');
jsfile3.setAttribute("type","text/javascript");
jsfile3.setAttribute("src", "themes/chartist/chartist-plugin-zoom.js");
document.getElementsByTagName("head")[0].appendChild(jsfile3);
}
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/chartist/chartist.js");
jsfile.onload = loadChartistPlugins;
document.getElementsByTagName("head")[0].appendChild(jsfile);

newtheme.addEditorbutton('SVG-Chart','```chart'); //only for comparison right now
slidenote.datatypes.push({type:"chart",mdcode:false, theme:newtheme}); //TODO: change chartsvg to chart


//internal vars:
newtheme.charts = new Array();
newtheme.chartcontainers = new Array();


//internal function:
newtheme.updatecharts = function(){
  console.log("updating charts...");
  for(var x=0;x<this.charts.length;x++){
    this.charts[x].update();
  }
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

      var numdata = new Array();
      var labeldata = new Array();
      var datasetlabel = new Array();
      var xlabel=null;
      var ylabel=null;
      var datatitle=null;
      var charttype=null;
      var datasetnr = 0;
      //console.log( {labels:labeldata, numbers:numdata, datasetlabels:datasetlabel, xlabel:xlabel, ylabel:ylabel});
      console.log("title"+datatitle+" xlabel"+xlabel);
      for(var x=0;x<dataobject.raw.length;x++){
      	var rawact = dataobject.raw[x];
      	if(rawact.indexOf(":")>0){
          //doppelpunktschreibweise
      		var doppunkt = rawact.indexOf(":");
      		if(datasetnr==0)labeldata.push(rawact.substring(0,doppunkt));
      		if(rawact.indexOf(":",doppunkt+1)<0){
            if(numdata[datasetnr]==null)numdata[datasetnr]=new Array();
      			numdata[datasetnr].push(rawact.substring(doppunkt+1));
      		}else{
      			//mehr als ein doppelpunkt
            if(numdata[datasetnr]==null)numdata[datasetnr]=new Array();
            while(rawact.indexOf(":",doppunkt+1)>=0){
              numdata[datasetnr].push(rawact.substring(doppunkt+1,rawact.indexOf(":",doppunkt+1)));
              doppunkt=rawact.indexOf(":",doppunkt+1);
              datasetnr++;
              if(numdata[datasetnr]==null)numdata[datasetnr]=new Array();
            }
            numdata[datasetnr].push(rawact.substring(doppunkt+1));
            console.log("subsrtingdoppunkt+1:"+rawact.substring(doppunkt+1));
            console.log(numdata);
            datasetnr=0;
            //numdata[datasetnr].push(rawact.substring(doppunkt+1,rawact.indexOf(":",doppunkt)));

      		}
      	}
        //if(rawact.indexOf("\t")>=0){
        if(rawact.search(/[\t,;]/)>=0){
          //separator rausfinden:
          var separators = ["\t",",",";"];
          var separator;
          var sepcount = 0;
          for (var sepx=0;sepx<separators.length;sepx++){
            if(rawact.split(separators[sepx]).length>sepcount){
              sepcount = rawact.split(separators[sepx]).length;
              separator=separators[sepx];
            }
          }
          console.log("separator:"+separator);
          //openoffice schreibweise
          console.log("rawact:"+rawact);
          if(labeldata.length==0){
            //noch keine label da, label einlesen:
            var tabpos = 0;
            var ldata;
            while(tabpos>=0){
              if(rawact.indexOf(separator,tabpos)>=0) ldata = rawact.substring(tabpos,rawact.indexOf(separator,tabpos));
                else ldata = rawact.substring(tabpos);
              if(ldata.length>0)labeldata.push(ldata);
              tabpos = rawact.indexOf(separator,tabpos);
              if(tabpos>=0)tabpos++;
            }
          }else{
            //label sind da, also sind es daten:
            var tabpos =0;
            if(numdata[datasetnr]!=null && numdata[datasetnr].length>0)datasetnr++;
            if(numdata[datasetnr]==null)numdata[datasetnr]=new Array();
            while(tabpos>=0){
              if(rawact.indexOf(separator,tabpos)>=0)
              numdata[datasetnr].push(rawact.substring(tabpos,rawact.indexOf(separator,tabpos)));
              else numdata[datasetnr].push(rawact.substring(tabpos));
              tabpos = rawact.indexOf(separator,tabpos);
              if(tabpos>=0)tabpos++;
            }
            //check ob erstes feld keine nummer ist, dann nämlich ist es ein datenlabel:
            //if(typeof numdata[datasetnr][0] =="string"){
            if(isNaN(numdata[datasetnr][0])){
              datasetlabel[datasetnr] = numdata[datasetnr].shift();
            }


          }

        }
      	if(rawact.substring(0,3)=="###"){
      		datasetlabel.push(rawact.substring(3));
          if(numdata[datasetnr]!=null)datasetnr++;
      	}else if(rawact.substring(0,2)=="##"){
      		if(xlabel==null)xlabel=rawact.substring(2);else if(ylabel==null)ylabel=rawact.substring(2);
      	}else if(rawact.substring(0,1)=="#"){
      		datatitle=rawact.substring(1);
      	}
      }
      //daten wurden eingescannt
      console.log("daten eingescannt:");
      console.log(numdata); console.log(labeldata);
      console.log("headsubstring:"+dataobject.head.substring(9));
      var headsub = dataobject.head.substring(9);
      //charttype:
      if(headsub.indexOf("pie")>-1 || headsub.indexOf("Pie")>-1)charttype="pie";
      if(headsub.indexOf("bar")>-1 || headsub.indexOf("Bar")>-1)charttype="bar";
      if(charttype==null)charttype="line"; //falls kein charttype gewählt wurde

      //data is ready - time to start the chart:
      var presentationdiv = datadivs[datax];
      if(numdata.length>0){
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

      //FIX STRING TO NUMBERS IN NUMDATA:
      console.log(numdata);
      var series = new Array();
      for(var numx=0;numx<numdata[0].length;numx++)series.push(parseInt(numdata[0][numx],10));
      for(var numx=0;numx<numdata.length;numx++){
        for(var numy=0;numy<numdata[numx].length;numy++){
          numdata[numx][numy]=parseInt(numdata[numx][numy],10);
        }
      }
      console.log("series/numdatacheck:");console.log(series); console.log(numdata);
      var chartdata = {
        labels: labeldata,
        series: numdata
      };
      var chartoptions = this.getChartOptions({
        dataobject:dataobject, headsub:headsub,
        charttype:charttype, chartdata:chartdata});
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
        console.log("chartw/h:"+w+"/"+h);
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

      if(datasetlabel.length>0){
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
      	})
  	]
  };
  if(charttype == "line"){
  	options.fullWidth = true;
    options.chartPadding=20;
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
              console.log("labelInterpolationFnc:"+"value:"+value+"labelvalue:"+labels[value])
              console.log(value);
              console.log(labels);
              console.log(more);
              console.log(more2);
              console.log(more3);
              console.log(more4);
              return value;
            }
    	};
    	options.axisY.type = Chartist.AutoScaleAxis;

  	}//end of zoom


  }else if(charttype=="bar"){
    //options.chartPadding=20;
  	options.axisY = {
  		onlyInteger:true,
  		//offset:20
  	}
  	if(head.indexOf("horizontal")>-1){
      //options.axisY = undefined;
      console.log("horizontalbar");
      options.seriesBarDistance = 10;
  		options.horizontalBars = true;
  		options.reverseData = true; //what does this do? test it
  		//options.axisY.offset = 70;
      options.axisX = {onlyInteger:true};
  	}
  	if(head.indexOf("stack")>-1){
  		options.stackBars=true;

  	}
  }else if(charttype=="pie"){
  	if(head.indexOf("half")>-1||head.indexOf("gauge")>-1){
  		options.donut= true;
  		options.donutWidth= 60;
    		options.donutSolid= true;
    		options.startAngle= 270;
        options.endAngle=90;
    		//options.total= 200;
    		options.showLabel= true;
  	}
  }else {
  	options = null;
  }
  console.log("optionsobject:");console.log(options);
  return options;
}

newtheme.chartOptionsoverview = function(){
  var linechartoptions = {
    axisY:{
      onlyInteger: true,
      offset:20,
      showLabel: true,
      showGrid: true
    },
    high:3, //maximum value
    low:-3, //minimum value
    fullWidth:true, //last point at end of chart
    showArea:true, //fill space of line
    showLine:true, //show line or only area?
    showPoint:true, //show points or not?
    //seriesBarDistance: 15 //x-axis-spacebetween
  } //end of linechartoptions

  var barchartoptions = {

    axisX: {
      // On the x-axis start means top and end means bottom
      position: 'end',
      //bipolarmode:
      labelInterpolationFnc: function(value, index) {
        return index % 2 === 0 ? value : null;
      }
    },

    axisY: {
       offset: 80,
       //adding currency to label on y-axis:
       labelInterpolationFnc: function(value) {
         return value + ' CHF'
       },
       scaleMinSpace: 15
    },
    stackBars: false, //stacks bars on top of each other
    horizontalBars: true, //horizontalBar
    reverseData: true, //horizontalBar - check what it does

    high:10,
    low:-10,

    seriesBarDistance: 15 //x-axis-spacebetween
  }//end of barchartoptions

  var piechartoptions = {
    labelInterpolationFnc: function(value) {
      console.log("value of label:");console.log(value);
      return Math.round(value / series.reduce(sum) * 100) + '%';
    } //percentage of values on pie

  }//end of piechartoptions
  return null;
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

slidenote.presentation.addTheme(newtheme);
