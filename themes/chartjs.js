var newtheme = new Theme("chartjs");
newtheme.description = "Charts with Chart.js - takes datatags ||chart||line, ||chart||pie, ||chart||bar";
//newtheme.active = false;
//dateien nachladen:
var jsfile = document.createElement('script');
jsfile.setAttribute("type","text/javascript");
jsfile.setAttribute("src", "themes/chartjs/Chart.bundle.js");
document.getElementsByTagName("head")[0].appendChild(jsfile);

//grundfarben festlegen:
var chartjscolors = {
  name: ["Red","Blue", "Yellow", "Green", "Purple", "Orange"],
  colors:['rgba(255, 99, 132, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(255, 206, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)'],
  backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
  ],
  borderColor: [
      'rgba(255,99,132,1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
  ],
  selectedcolors:[0,1,2,3,4,5],
  selectedbackground:function(num){
    return this.backgroundColor[this.selectedcolors[num]];
  },
  selectedborder:function(num){
    return this.borderColor[this.selectedcolors[num]];
  },
  backgroundArray:function(){
    var newbackground = new Array();
    for (var x=0;x<this.selectedcolors.length;x++)newbackground.push(this.backgroundColor[this.selectedcolors[x]]);
    return newbackground;
  },
  borderArray:function(){
    var newborders = new Array();
    for(var x=0;x<this.selectedcolors.length;x++)newborders.push(this.borderColor[this.selectedcolors[x]]);
    return newborders;
  }
}

for(var x=0;x<chartjscolors.selectedcolors.length;x++){
  var chartjsnil = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  newtheme.addDesignOption("select", "Color of "+chartjsnil[x]+ " Dataset ", chartjscolors.name,chartjscolors.selectedcolors,chartjscolors.selectedcolors[x]);
}

newtheme.changeDesignOption = function(optionnr, value){
  chartjscolors.selectedcolors[optionnr]=value;
  this.designoptions[optionnr].selected=value;
}

newtheme.addEditorbutton('<img src="themes/chartjs/piebutton.png">',"||chart||pie","||chart||");
newtheme.addEditorbutton('<img src="themes/chartjs/barbutton.png">',"||chart||bar","||chart||");
newtheme.addEditorbutton('<img src="themes/chartjs/linebutton.png">',"||chart||line","||chart||");


newtheme.styleThemeSpecials = function(){
  //get all data-blocks with chart:
  var datadivs = slidenote.presentationdiv.getElementsByTagName("data");
  console.log("datadivs:")
  console.log(datadivs);

  for(var datax=0;datax<slidenote.parser.dataobjects.length;datax++){
    if(slidenote.parser.dataobjects[datax].type=="chart"){
      console.log("chart gefunden");
      var dataobject = slidenote.parser.dataobjects[datax];
      console.log(dataobject);
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
      //var logdaten = {labels:labeldata, numbers:numdata, datasetlabels:datasetlabel, xlabel:xlabel, ylabel:ylabel};
      //console.log(logdaten);
      //- jetzt unterscheiden ob bar usw.:
      //if(dataobject.head.substring("||chart||".length, 3)=="bar")
      //es gibt: line,bar, pie
      var posiblecharttypes = ["line","pie","bar"];
      console.log("headsubstring:"+dataobject.head.substring(9));
      var headsub = dataobject.head.substring(9);
      for(var pct=0;pct<posiblecharttypes.length;pct++){
        if(headsub.substring(0,posiblecharttypes[pct].length)==posiblecharttypes[pct]){
          charttype=posiblecharttypes[pct];
        }
        console.log(headsub.substring(0,posiblecharttypes[pct].length))
      }
      console.log("charttype:"+charttype);
      if(charttype==null)charttype="line"; //falls kein charttype gewählt wurde
      var showscales=true;
      if(charttype=="pie")showscales=false;
      //das entsprechende div mit einem canvas versehen:
      var ausgabediv = datadivs[datax];
      console.log("ausgabediv x:"+datax);
      console.log(ausgabediv);
      var ausgabecan = document.createElement("CANVAS");
      //ausgabecan.style.width="500px":
      //ausgabecan.style.height="500px";
      ausgabediv.innerHTML="";
      var containerdiv = document.createElement("div");
      containerdiv.classList.add("chart-container");
      containerdiv.style.height="300px";
      ausgabediv.appendChild(containerdiv);
      //ausgabediv.style.width="500px";
      ausgabediv.style.height="50px";
      ausgabediv.style.position="relative";
      ausgabediv.classList.add("chart-container");
      containerdiv.appendChild(ausgabecan);
      var ausgabedata = {
          labels: labeldata, //["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: new Array()
      };
      /*var colors=['rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'];*/
      for(var dsx=0;dsx<numdata.length;dsx++){
            //if(datasetlabel[dsx]==null && datatitle!=null)datasetlabel[dsx]=datatitle;
        ausgabedata.datasets.push({
            label: datasetlabel[dsx],//'# of Votes',
            data: numdata[dsx], //[12, 190, 3, 5, 2, 3],
            backgroundColor: chartjscolors.backgroundArray(),
            /*[
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],*/
            borderColor: chartjscolors.borderArray(),
            /*[
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],*/
            borderWidth: 1
        });
        if(charttype=="line"){
          ausgabedata.datasets[ausgabedata.datasets.length-1].backgroundColor = chartjscolors.selectedbackground(dsx);
          ausgabedata.datasets[ausgabedata.datasets.length-1].borderColor = chartjscolors.selectedbackground(dsx);
        }
      }


      var ausgabeoptions = {
          //responsive:false,
          maintainAspectRatio: false,
          title: {
               display:(datatitle!=null),
                  text:datatitle
           }//,
           //if(showscales)
      };
      if(showscales)ausgabeoptions.scales= {
          //display:showscales,
           xAxes: [{
                      display: true,
                      scaleLabel: {
                          display: (xlabel!=null),
                          labelString: xlabel
                      }
          }],
          yAxes: [{
                  ticks: {
                    beginAtZero:true
                  },
                  scaleLabel: {
                    display: (ylabel!=null),
                    labelString: ylabel
                  }
          }]
      };
      //wenn erstes datenset kein label hat keine legend anzeigen lassen:
      if(datasetlabel[0]==null&&charttype!="pie"){
        ausgabeoptions.legend = {display:false};
      }
      //wenn pie dann prozentangaben im kuchen anzeigen:
      if(charttype=="pie"){
        ausgabeoptions.events = false;
        ausgabeoptions.animation = {
            duration: 500,
            easing: "easeOutQuart",
            onComplete: function () {
              var ctx = this.chart.ctx;
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';

              this.data.datasets.forEach(function (dataset) {

                for (var i = 0; i < dataset.data.length; i++) {
                  var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                      total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                      mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
                      start_angle = model.startAngle,
                      end_angle = model.endAngle,
                      mid_angle = start_angle + (end_angle - start_angle)/2;

                  var x = mid_radius * Math.cos(mid_angle);
                  var y = mid_radius * Math.sin(mid_angle);

                  //ctx.fillStyle = '#fff';
                  //if (i == 3){ // Darker text color for lighter background
                    ctx.fillStyle = '#444';
                  //}
                  var percent = String(Math.round(dataset.data[i]/total*100)) + "%";
                  ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                  // Display percent in another line, line break doesn't work for fillText
                  ctx.fillText(percent, model.x + x, model.y + y + 15);
                }
              });
            }
          }
      }
      console.log("erstelle chart mit");
      console.log(ausgabeoptions);
      console.log(ausgabedata);
      if(slidenote.charts==null)slidenote.charts = new Array();
      slidenote.charts.push(new Chart(ausgabecan, {
        type: charttype,//'bar',
        data: ausgabedata,
        options: ausgabeoptions
      }));
      // Change the display size
      //myChart.resize(300, 200); does not work

      // Resync the render size
      //myChart.resize(); does not work
    }//end of type chart
  }
}

slidenote.presentation.addTheme(newtheme);
