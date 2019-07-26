# Chart-Tutorial

Welcome to the Chart-Tutorial. This tutorial explains how to use charts in slidenotes.io. 

To begin the presentation press ctrl+Escape or the play button
---
# A simple Chart

A Chart is a **graphical interpretation of data**. Therefore all you need is to write down a chart-section and inside of it the data:

```code
\```chart
identifier: 10
identifier2: 22
identifier3: 33
\```
```

and you get a simple chart like this:

```chart
identifier: 10
identifier2: 22
identifier3: 33
```
---
# Real World Example

As you saw, the ***datastructure*** is quiet simple. You need an **identifier** and a **value** in form of **a number**. Lets take a more realistic example and say we want to demonstrate the maximum temperatures of last week: 

```code
\```chart
monday:33
tuesday:28
wednesday:26
thursday:28
friday:28
saturday:37
sunday:36
\```
```

As you can see, its quite easy to write down and it makes a clean linear graph out of it:

```chart
monday:33
tuesday:28
wednesday:26
thursday:28
friday:28
saturday:37
sunday:36
```

---
# Different Chart Types: Bar

Charts can have different *types*. As now, slidenotes.io supports *8 different types* for you to select, which are divided into three groups: **linear**, **bar** and **pie**. Each different type has its own chart-header as `\`\`\`chart:type`. so to write the same example as before, but this time as a **bar**-chart you would write in the header: `\`\`\`chart:bar`

```code
\```chart:bar
monday:33
tuesday:28
wednesday:26
thursday:28
friday:28
saturday:37
sunday:36
\```
```

You will get:

```chart:bar
monday:33
tuesday:28
wednesday:26
thursday:28
friday:28
saturday:37
sunday:36
```

---
# Different Chart-Types: Pie 

As the Example before does not make any sense to a pie lets just bake a pie. 

```layout:left
##recipe
```code
\```chart:pie
flour:300
sugar:100
butter:100
baking powder:5
apple:1000
\```
```

1. mix everything except the apples and fill your form with 2/3 of the mass
2. cut apples very fine and fill your form up
3. top it with the mass you have left in crumbles, so that apples still are visible
4. put it in the oven for 40 minutes...

```

##baked result:

```chart:pie
flour:300
sugar:100
butter:100
baking powder:10
aplle:1000
```


well... enough of that. lets continue. 

---
# Experiment yourself

So why not try it yourself now? Hit Escape and alter the following chart. Note: you can use the elements insert-menu to help you with the task whenever your carret is inside a chart-section. Windows-keyboard-User can also press "Control"+"ContextMenu" to open up the insert-menu.   
Graph-Types are: 
a) line, arealine
b) bar, horizontalbar, stackbar, horizontalstackbar
c) pie, halfpie 

```chart:line
monday:33
tuesday:28
wednesday:26
thursday:28
friday:28
saturday:37
sunday:36
```

---
# Datastructure

As we mentioned before: Charts are the representation of data. This data has to be accessible in a certain form. In the previous example we always used the form which is the best and easiest way for us humans to get it right. For small graphs like this, mostly written by hand on the fly, its the best. so lets say its the slidenote-style.  Unfortunately this is seldom the case with real data you want to use. 
Because data in the real world comes from other sources and certainly you dont want to write them again by hand to use them. So what to do? Write your own regex or changing it by hand? Hopefully not. 

##supported datastructures:

The datastructure needs the following: an **identifier** and its related **value**. Most real world data comes in tables. So we support the following structures: 

```layout:left
###horizontal

1. line with identifiers, separated by an separator
2. line with values, separated by an separator

```

```layout:right

###vertical
column with **identifiers** - **separator** - **value**

Lets make that clearer with an example on the following page.

```

---
# Examples of datastructures
Lets write the datastructure in the two ways and as a separator we use a comma. 
##first the horizontal way:
```code
monday,tuesday,wednesday,thursday,friday,saturday,sunday
33,28,26,28,28,37,36
```

##and the datastructure in the vertical way:
```code
monday,33
tuesday,28
wednesday,26
thursday,28
friday,28
saturday,37
sunday,36
```
---
##output:
```layout:left
###horizontal:
```chart
monday,tuesday,wednesday,thursday,friday,saturday,sunday
33,28,26,28,28,37,36
```
```
###vertical:
```chart:line
monday,33
tuesday,28
wednesday,26
thursday,28
friday,28
saturday,37
sunday,36
```
---
# Datastructure: separator

The separator in the previous example used was the comma. It is compliant with the .csv-structure so you should be able to input your data directly from .csv-files you either exported from a database or your excell-sheet. 
But this can be inconvenient as you dont want to export your sheet to csv... its just simple text. 
To make things easier for you we support different separators - as of now they are:
**":"     "tab"      ","      ";"**

With this, we have covered most if not all sheet-programs, so that you can just mark your data in your excell-sheet, copy it (ctrl+c) and insert it here (ctrl+v). Was it ever easier or faster to create a graph out of your data? 

---
# But wait... there is more...

Getting exited yet how easy it is? Well, what happens if you have more then one dataset? Lets say we want to compare last years average temperatures with this years average temperatures by month. What does this means? First of all it means that each **identifier** has **more than *one* value**. 
This sounds more complicated than it is. Lets write it down the slidenote-way:
*month* : *value last year* : *value this year*
```code
january: 9.8:12.3
february: 10.1:11.3
march: 12.2:14.1
april: 16.0:15.4
``` 

```chart
january: 9.8:12.3
february: 10.1:11.3
march: 12.2:14.1
april: 16.0:15.4
```

---
# multiple datavalues in datastructure

As we have seen, its easy to get more data into it. In the horizontal style you add just one line with separated values:

```code
january,february,march,april
9.8,10.1,12.2,16.0
12.3,11.3,14.1,15.4
```

In the vertical style you add it with a separator similar to the slidenote-style:

```code
january,9.8,12.3
february,10.1,11.3
march,12.2,14.1
april,16.0,15.4
```

---
# More than one means exactly that...
Lets try this one:
```code
january,february,march,april
9.8,10.1,12.2,16.0
1,2,6,8
4.9,5.6,8.8,11.4
```

##Temperatures Athenas, Paris, Frankfurt:
```chart
january,february,march,april
9.8,10.1,12.2,16.0
1,2,6,8
4.9,5.6,8.8,11.4
```



---
# something is missing... Metadata
Getting fixed on? You want more control? Well, here it comes - the options-area. 
With a `---` as a line inside your chart-section you divide the chart-section in two areas. The upper one (or "everything before the line with ---") is the options-area, where you can define certain options for this chart specificly. We will go over them briefly, but first lets look at an example:
```code
\```chart
xaxis: months 
yaxis: temperature in celsius
dataset1: this year 
dataset2: last year
---
january:9.8:12.3
february:10.1:11.3
march:12.2:14.1
april:16.0:15.4
\```
```

As you can see, there are four entrys in the options-area. The first two define the labels as they would apear aside or under the axis. Then there is **dataset1**  and **dataset2**. With this we set a title for each set of values. Lets see that in action on the next slide.

---
# Experiment with it

Here you see the result of the chart-code of the last example. Press Escape and experiment with it as you like, then come back or continue on next slide. You are nearly through. 

```chart
xaxis: months 
yaxis: temperature in celsius
dataset1: this year 
dataset2: last year
---
january:9.8:12.3
february:10.1:11.3
march:12.2:14.1
april:16.0:15.4
```

  
---
# Overview over Chart-Options

Charttypes can have different options. For example an X-Axis-Label does not make any sense on a pie-chart. If you ever wonder, the Insert-Menu from Charts helps you in finding the right ones. You dont have to remember them all. But nevertheless here is an overview:

1.) xaxis: displays a label under the x-axis
2.) yaxis: displays a label aside the y-axis
3.) dataset$: displays a label atop the graph with the text in this line
4.) summary: displays to screenreader an alternative text which should summarise the graphs output. dont copy your data here, as your data is accessible to screenreaders in form of a table! instead give a sumarize
---
# More options to come   

You want more Options? Well, we are eager to implement more in the future. Tell us what you think would be a usefull option, we are open for feedback as always :)


---
# Thats it!

Thank you for using this tutorial. We hope it helped you. 

Also special thanks to Gion Kunz and all the contributers to the project [chartistjs](http://gionkunz.github.io/chartist-js/index.html), which delivers the magic of the graph. 


.

