var id=0;
var wordnet = [];
var tags = [];


var icicle;



d3.csv("data/qsp1.csv", function(d) {
	id= id+1;	
	var toReturn =  {
		qspid : id,
	    count : +d.count,
	    template : d.template,
	    columnA : parseColumnSemantics( d.columnA, 1),//columnAobject,
	    columnB : d.columnB//parseColumnSemantics( d.columnB, 2)
	  };	
	  return toReturn;
	}, function(data) {
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
			processSemanticTxt(txt);
			$("#loader").css( "display","none");

			$("#interface").css( "display","block");
			displayTemplates(data);
			populateColumnA(data, "");
			
			$('#templateList').on('click', 'li', function() {
			    $('#selectedTemplate').empty();
			    $('#selectedTemplate').append(this.id);		    
			    populateColumnA(data, this.id);
			});
			
			$('#columnAlist').on('click', 'li', function() {
				alert('Creating partition display for subtree of '+this.id+': '+$(this).attr('qspColA'));
				displaySemanticIcicle(this.id);

			});
		
			
		});
			
});//end loading data

//Helper functions

function parseColumnSemantics(data, num){
	var columnObject = [];
	var objectElements = data.split(/[[\]]{1,2}/);	
	columnObject["label"] = objectElements[0];
	columnObject["id"]= objectElements[1];
	columnObject["abstractionLevel"]= objectElements[2];
	columnObject["columnCount"]= +objectElements[3];

	return columnObject;
}
function displayTemplates(data){
	var uniqueEntities = _.uniq(data, function (item, key, a) {
		if((item.template).length<20 )//filter out dirty data
			return item.template;
		});
	var list = $("#templateList");
	var listelements = []
	$.each(uniqueEntities, function( index, value) {
		var element = {};
		var template = value.template;
		var filteredByTemplate = data.filter(function( obj ) {
		    return obj.template == template;
		});
		var templatecount = 0;
		$.each(data, function(index, value){
			if(value.template == template)
				templatecount= templatecount + value.count;
		});
		element.template = template;
		element.templatecount = templatecount;
		listelements.push(element);		
	});
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;})
	$.each(listelements, function( index, value) {
	list.append('<li class="list-group-item" id="'+value.template+'" permutations = "'+value.templatecount+
			'"><span class ="badge">'+value.templatecount+'</span>'+value.template+'</li>');
	});
}


function populateColumnA(data,  template){
	$('#columnAlist').empty();
	
	
	var filtereddata = data;
	if(template!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == template;
		});
	}
	
	filtereddata.sort(function(a, b){
    	var a1= a.columnA.columnCount, b1= b.columnA.columnCount;
    	if(a1 == b1) return 0;
    	return b1 > a1? 1: -1;
	});	

	var uniqueSemantics = _.uniq(filtereddata, function (item, key, a) {return item.columnA.label;});		
	
	
	$.each(uniqueSemantics, function( index, value) {
		thislabel= value.columnA.label;
		if(!isNaN(value.columnA.columnCount)){
  			$('#columnAlist').append('<li id='+value.columnA.id+' qspColA="'+thislabel+'" class="list-group-item">'+
  		      '<span id="columnA" >'+thislabel+'</span><span class="badge">'+value.columnA.columnCount+'</span></li>');
		}
  	});	
}





	
function processSemanticTxt(txt){

    var lines = txt.split("\n");
    console.log(lines.length);
    for (var i = 0, len = lines.length; i < len; i++) {
    	line = lines[i];
    	if(line.length>1){
    	// check string ending
    	if(/\[\]/.test(line.substr(line.length-3, line.length-2))){
    		line = line+"}"
    	}
    	else{
    	
	    	lastindex = line.lastIndexOf('\}')
	    	//mallformed:  {[{"trend_3_3":0}, {"trend_2_1":1}
	    	if(/[0-9]+\}/.test(line.substring(lastindex-1, lastindex+1))){
	    		line = line.slice(0, -2)+'}]}';   
	    	}
	    	
	    	else if( line.substring(lastindex-2, lastindex+1) !=='[]}'){
	    		line = line.slice(0, -3)+'}]}';      		
	    	}
    	}
    	
    	//check internally
    	index0 = line.indexOf('derivedFrom');
		if(index0!=-1){
			index = line.indexOf('\]',index0);
    		if(index!=-1 && line[index-1]!=='['){
    			line = line.substr(0, index) + '"' + line.substr(index);
    		}
		}
		
		groupindex = 0;
		while(line.indexOf("\{grouping", groupindex)!==-1){
			groupindex = line.indexOf("\{grouping", groupindex);
			line = line.substr(0, groupindex+1) + '"' + line.substr(groupindex+1);
		}
			
			
    	jsonSemantics = $.parseJSON(line);
    	if((jsonSemantics.uid).indexOf('wordnet')!==-1)
    		wordnet.push(jsonSemantics);
    	else
    		tags.push(jsonSemantics);
		}
    }


 wordnet = _.sortBy(wordnet, function(o){ return - o.columnCount;})
// createLabelList(wordnet);
// createLabelList(tags);
	
}
function createLabelList(wordsemantics){
	$.each(wordsemantics, function(key, value){
		if((value.uid).indexOf('wordnet')!==-1)
			$("#wordnetlist").append('<li>'+value.label+', '+value.columnCount+'</li>');
		else{
			$("#taglist").append('<li>'+value.uid+'</li>');

		}
	});
}

function displaySemanticIcicle(uid){
	
	$("#semanticExplorer").empty();
	var width = 960,
	height = 500;
	var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([0, height]);


	
	
	
	
	//create data for zoomable partition
	icicle = {}
	var semanticobject = _.select(wordnet, function (obj) {
		  return obj.uid === uid;
		});
	recursiondepth = 0;
	var key = semanticobject[0].label;
	icicle[key] = {};
	processObject(semanticobject[0], recursiondepth, icicle[key]);
//	console.log(JSON.stringify(icicle));
	$("#iciclePrintout").empty();
	$("#iciclePrintout").append(JSON.stringify(icicle));

	
	
	
	
	
	var partition = d3.layout.partition()
					.children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
					.value(function(d) { return d.value; });

	var svg = d3.select("#semanticExplorer").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	var rect = svg.selectAll("rect");
	
	
	//add rectangles to the rect container
	var rectangles =  rect.data(partition(d3.entries(icicle)[0]))
							.enter()
							.append("rect");
     
     var rectangleAttributes = rectangles
     		.attr("x", function(d) { return x(d.x); })
     		.attr("y", function(d) { return y(d.y); })
     		.attr("width", function(d) { return x(d.dx); })
     		.attr("height", function(d) { return y(d.dy); })
     		//.attr("fill", function(d) { return color((d.children ? d : d.parent).key); })
     		.attr("fill", "#B4CFEC")
     		.attr("name", function(d) { return d.name; })
     		.on("click", clicked);
     debugger;
	//Add the SVG Text Element to the svgContainer
	 var text = svg.selectAll("text")
	 				.data(partition(d3.entries(icicle)[0]))
	                .enter()
	                .append("text");
	 
	//Add SVG Text Element Attributes
	 var textLabels = text
	                  .attr("x", function(d) { return x(d.x)+20; })
	                  .attr("y", function(d) { return y(d.y)+40; })
	                  .text( function (d) { return d.key; })
	                  .attr("font-family", "sans-serif")
	                  .attr("font-size", "20px")
	                  .attr("fill", "red");
	 
	 
//	c.append("svg:text")
//		.attr("y",function(d) { d.y+20;})
//		.attr("x",function(d) { d.x+15;})
//		.text(function(d) { 
////			console.log(d.key);
//			return d.key;
//			}
//		);
	
	function clicked(d) {
		alert('You clicked on '+d.key);
		console.log('You clicked on '+d.key);

		debugger;
		  x.domain([d.x, d.x + d.dx]);
		  y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);
		  
		  rectangles.transition()
		      .duration(750)
		      .attr("x", function(d) { return x(d.x); })
		      .attr("y", function(d) { return y(d.y); })
		      .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
		      .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		  
		  text.transition()
		    .duration(750)
		    .attr("x", function(d) { return x(d.x)+20; })
		    .attr("y", function(d) { return y(d.y)+40; })
		    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
		    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}
	
}















//create data structure like https://gist.github.com/tchaymore/1255176
// for zoomable partition

function processObject(parent, recursiondepth, parentIcicle){
	recursiondepth++;
	
	$.each(parent.derivedFrom, function(index, value){
		var depth ="-";
		var o = _.select(wordnet, function (obj) {
			  return obj.uid === value;
			});
		
		if(o.length==0){//reached a leaf (tag)
			//initialize if this is the first tag
			if(parentIcicle[parent.label]===undefined)
				parentIcicle[parent.label]= {};
			
			o = _.select(tags, function (obj) {
			  return obj.uid === value;
			});
			recursiondepth--;
			for(var i= 0; i<recursiondepth; i++){
				depth = depth+"-";
			}
			childSemantics = o[0];
//			console.log("TAG "+depth+" "+childSemantics.label);
			parentIcicle[parent.label][childSemantics.label] = childSemantics.columnCount;
			return parentIcicle;

			}
		else{
			if(parentIcicle[parent.label]===undefined)
				parentIcicle[parent.label]= {};
			for(var i= 0; i<recursiondepth; i++){
				depth = depth+"-";
			}
			childSemantics = o[0];
//			console.log(depth+" "+ childSemantics.label);
			parentIcicle[parent.label]= processObject(childSemantics, recursiondepth, parentIcicle);
			
		}
	});
//	return parentIcicle;
}