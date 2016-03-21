var id=0;
var queryPermutations= [];
var wordnet = [];
var tags = [];
var queryTemplates = {};
var parsetdata = [];
var icicle;

var selectedTemplateID = "",selectedColumnAID = "",selectedColumnBID= "";
var columnAelements= [], columnBelements= []; 
var displayParsetsOn = false; //start with parallel-sets functionality off

d3.csv("data/qsp1.csv", function(d) {
	id= id+1;	
	var toReturn =  {
		qspid : id,
	    count : +d.count,
	    template : d.template,
	    columnA : parseColumnSemantics( d.columnA, 1),
	    columnB : parseColumnSemantics( d.columnB, 2)
	  };	
	  return toReturn;
	}, function(data) {
		$("#loader").append("<br>- Loaded data/qsp1.csv")
		$("#loader").append("<br>- Processed data/qsp1.csv")
		queryPermutations = data;
		$.get("data/wordsemantics-2.20-json.txt",function(txt){
			$("#loader").append("<br>- Loaded data/wordsemantics-2.20-json.txt")

			processSemanticTxt(txt);

			$("#loader").append("<br>- Processed data/wordsemantics-2.20-json.txt")
			$.get("data/templateQC.txt",function(txt){
				$("#loader").append("<br>- Loaded data/templateQC.txt")

			    var lines = txt.split("\n");
			    for (var i = 0, len = lines.length; i < len; i++) {
			    	line = lines[i];
			    	var res = line.split(",");
			    	queryTemplates[res[1]] = {}
			    	queryTemplates[res[1]].count = res[0];
			    	queryTemplates[res[1]].text = res[2];
			    }				
				$("#loader").append("<br>- Processed data/templateQC.txt")
				
				$("#loader").css( "display","none");	
				$("#interface").css( "display","block");

//				window.setTimeout(displayTemplates(data), 5000);
				displayTemplates(data);
				
//				$(window).trigger('resize');
				console.log("Displayed Templates")
				
				populateColumn(data, 'columnA')

				populateColumn(data, 'columnB')

				$('#templateList').on('click', 'li', function() {
				    selectedTemplateID = this.id;
				    selectedTemplateString = this.getAttribute('text')
				    $('#templateList').hide();
				    $('.templatetext').show();
				    $('#selectedTemplate1').empty();
				    $('#selectedTemplate1').append('<div><button id="clearTemplate" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span> Back to template list</button><div>'+
				    		'<div>'+this.getAttribute('text').slice(0, this.getAttribute('text').indexOf("X"))+' </div>');

				    $('#selectedTemplate2').empty();
				    $('#selectedTemplate2').append(selectedTemplateString.slice(selectedTemplateString.indexOf("X")+1, selectedTemplateString.indexOf("Y")));
				    
				    $('#selectedTemplate3').empty();
				    $('#selectedTemplate3').append(selectedTemplateString.slice(selectedTemplateString.indexOf("Y")+1, selectedTemplateString.length-1));

				    
				    //				    $('#colAprompt').empty();
//				    $('#colAprompt').append('Select a semantic type from the list of <b>semantic types used in query template:'+selectedTemplateID+'</b>');
//				    
//				    $('#colBprompt').empty();
//				    $('#colBprompt').append('Select a semantic type from the list of <b>semantic types used in query template:'+selectedTemplateID+'</b>');
//				    
				    $('#templateList li').removeClass( 'selectedListElement' );
				    $(this).toggleClass('selectedListElement');
				    			    
				    $("#columnAsemanticExplorer").hide();
					$("#columnAlist").show();
				    $("#columnBsemanticExplorer").hide();
					$("#columnBlist").show();
					
				    populateColumn(data, 'columnA');
				    populateColumn(data, 'columnB');
				    displayQueries("", "")
				});
				
				$(document).on("click", "#columnAlist .semanticlistelement", function() {
					
						if(selectedColumnAID == this.getAttribute('uid')){
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnAID;
							})[0].abstrationLevel;
							$('#columnAlist'+selectedColumnAID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
							selectedColumnAID = "";
						}
						else{
							if(selectedColumnAID!=""){
								abstractionLevel = _.select(wordnet, function (obj) {
									  return obj.uid === selectedColumnAID;
								})[0].abstrationLevel;
								$('#columnAlist'+selectedColumnAID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
								$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
							}
							//update selected semantic
							selectedColumnAID = this.getAttribute('uid');
	
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-log-out" label="inspect children"></span>');
							$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
						}
						semobject = _.select(wordnet, function (obj) {
							  return obj.uid === selectedColumnAID;
						})[0];
						displayParsets(semobject, "columnA", 10);
						displayQueries("columnA", selectedColumnAID);
						populateColumn(data, 'columnB');
				});
				$(document).on("click", "#columnAlist .inspect", function(){
					$('#colAprompt').append('<button id="backTocolumnA" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnAID, 'columnA');
					displayQueries("columnA", selectedColumnAID);
				})
					$(document).on("click", "#columnBlist .inspect", function(){
					$('#colAprompt').append('<button id="backTocolumnB" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnBID, 'columnB');
					displayQueries("columnB", selectedColumnBID);
				})
				$(document).on("click", "#columnBlist .semanticlistelement", function() {
					if(selectedColumnBID == this.getAttribute('uid')){
						abstractionLevel = _.select(wordnet, function (obj) {
							  return obj.uid === selectedColumnBID;
						})[0].abstrationLevel;
						$('#columnBlist'+selectedColumnBID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
						$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();
						selectedColumnBID = "";
					}
					else{
						if(selectedColumnBID!=""){
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnBID;
							})[0].abstrationLevel;
							$('#columnBlist'+selectedColumnBID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();

						}
						//update selected semantic
						selectedColumnBID = this.getAttribute('uid');

						$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-log-out" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
					}
									    
				    if(selectedColumnAID!=""){
					    populateColumn(data, 'columnA');
					    $('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-log-out" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
				    displayQueries("columnB", selectedColumnBID)
				});
				$(document).on("keyup","#columnAfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#columnAcontainer .searchable tr').hide();
		            $('#columnAcontainer .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        });
				$(document).on("keyup","#columnBfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#columnBcontainer .searchable tr').hide();
		            $('#columnBcontainer .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
				$(document).on("click", "#clearTemplate", function(){
//					$('#selectedTemplate').empty();
//				    $('#selectedTemplate').append('You have not selected a template yet.');
					$('#templateList').show();
					$('.templatetext').hide();
					$('#templateList li').removeClass( 'selectedListElement' );
					selectedTemplateID = "";
					selectedColumnAID = "";					
					selectedColumnBID = "";

					populateColumn(data, 'columnA');
					populateColumn(data, 'columnB');
				});

				$(document).on("click", "#clearColA", function(){
//					$('#selectedSemTypeA').empty();
//				    $('#selectedSemTypeA').append('You have not selected a semantic type yet.');
					selectedColumnAID = "";
					selectedColumnBID = "";

					$("#columnAsemanticExplorer").hide();
					$("#columnAcontainer").show();
					
					$('#selectedSemTypeB').empty();
					if(selectedTemplateID=="")
						$('#selectedSemTypeB').append('You have not selected a semantic type yet.');

					else	
						$('#selectedSemTypeB').append('Displaying semantic types used in queries where template is <b>'+selectedTemplateID+'</b> ');
					populateColumn(data, 'columnA');
					populateColumn(data, 'columnB');
				});
				$(document).on("click", "#clearColB", function(){

					$("#columnBsemanticExplorer").hide();
				    $("#columnBcontainer").show();
					selectedColumnAID = "";
					selectedColumnBID = "";
				});
				$(document).on("click", "#backTocolumnA", function(){
					$("#columnAsemanticExplorer").empty();
					$("#columnAsemanticExplorer").hide();
					$("#columnAcontainer").show();
					$("#backTocolumnA").remove()
					selectedColumnAID = $("#columnAlist .drilldown").getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnAID;
					})[0];
					displayParsets(semobject, "columnA", 10);
					displayQueries("columnA", selectedColumnAID);
				});
				
				$(document).on("click", "#backTocolumnB", function(){
					$("#columnBsemanticExplorer").empty();
					$("#columnBsemanticExplorer").hide();
					$("#columnBcontainer").show();
					$("#backTocolumnB").remove();
					selectedColumnBID = $("#columnBlist .drilldown").getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnBID;
					})[0];
					displayParsets(semobject, "columnB", 10);
					displayQueries("columnB", selectedColumnBID);

				});
			});
		});
});//end loading data


function displayParsets(d, position, topK){
	var semanticid = d.uid;
	$("#"+position+"parset").empty();
	//prep the data for parallel sets
	parsetdata=[];
    addToParsetData(semanticid, position, topK);
    
//    var svgBox = document.getElementById(position+"svg").getBBox();
//    var svgBox = document.getElementById(position+"parsetsvg").getBBox();
    var svg = d3.select("#"+position+"parset").append("svg")
	.attr("id", "#"+position+"parsetsvg")
	.attr("width", 400)
	.attr("height", 450)
    
    var margin = {top: 0, right: 25, bottom: 50, left: 0};
    var width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
//    var width = 400 ,height = 400;
   
    
    console.log(width+", "+height);
//    svgBox.width(width).height(height);    
	var chart = d3.parsets().dimensions(["ColumnX","ColumnY"]).width(width).height(height);				
	
	d3.selection.prototype.moveToBack = function() { 
	    return this.each(function() { 
	        var firstChild = this.parentNode.firstChild; 
	        if (firstChild) { 
	            this.parentNode.insertBefore(this, firstChild); 
	        } 
	    }); 
	};

	var vis = svg.append("g")
	.attr("id", position+"parset")
//     .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
	.attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,"+height+")rotate(-90)");//this is correct. 
	
	vis.datum(parsetdata).call(chart);
    
	vis.selectAll(".category text")
    .attr("dx", 5)
    .attr("transform", "rotate(90)");
	
	vis.selectAll(".category rect")
    .attr("y", 0);
	
	vis.selectAll("text.dimension")
    .attr("dy", "1.5em")
    .attr("transform", "rotate(90)");
	
	vis.selectAll("text.dimension .sort.alpha")
    .attr("x", 0)
    .attr("dx", 0)
    .attr("dy", "1.5em");
	
	 vis.selectAll("text.dimension .sort.size")
    .attr("dx", "1em");
	
}


//function displayParsets(d, position, topK){
//	var semanticid = d.uid;
////	$("#parallelsets").empty();
//	parsetdata=[];
//    addToParsetData(semanticid, position, topK);
//    
//    var svgBox = document.getElementById(position+"svg").getBBox();
//
//    
//    var margin = {top: 0, right: 120, bottom: 50, left: 0};
//    // width BEFORE rotation (aka height later), should be as much as the partition box height.
//    var width = document.getElementById("partition"+position+d.uid).getBBox().height,// - margin.left - margin.right,//partitionBox.width - margin.left - margin.right,
//    //height, or width after rotation, should be as long a
//    height = 500;// - margin.top - margin.bottom;
//    
//    console.log(width+", "+height);
//        
//	var chart = d3.parsets()
//				.dimensions(["ColumnX","ColumnY"])
//				.width(width)
//				.height(height);
//	
////	var partitionX = document.getElementById("columnApartition").getBBox().x;
////	var partitionY = document.getElementById("columnApartition").getBBox().y;
//	
//	d3.selection.prototype.moveToBack = function() { 
//	    return this.each(function() { 
//	        var firstChild = this.parentNode.firstChild; 
//	        if (firstChild) { 
//	            this.parentNode.insertBefore(this, firstChild); 
//	        } 
//	    }); 
//	};
//	
//	// need to move the parset g down to the bottom y coordinate of the rectangle we are hovering over
////	var translateY = document.getElementById("partition"+position+d.uid).getBoundingClientRect().y+document.getElementById("partition"+position+d.uid).getBBox().height;
//	console.log(document.getElementById("partition"+position+d.uid).getBoundingClientRect())
//	
//	console.log(document.getElementById("partition"+position+d.uid).getBBox())
//	var translateY = document.getElementById("partition"+position+d.uid).getBoundingClientRect().bottom;
//	var translateX = 25;//document.getElementById("partition"+position+d.uid).getBBox().width;
//
//	console.log("translateY: "+translateY);
//	console.log("translateX: "+translateX);
//
//	
//	var vis = d3.select("#"+position+"svg").append("g")
//	.attr("id", position+"parset")
////     .attr("width", width + margin.left + margin.right)
////    .attr("height", height + margin.top + margin.bottom)
//	.attr("width", width)
//    .attr("height", height)
//    .append("g")
////    .attr("transform", "translate(20,"+width+")rotate(-90)");
//    .attr("transform", "translate("+translateX+","+translateY+")rotate(-90)");//this is correct. Only need to assign translateX with correct get correct x offset
//
//	vis.datum(parsetdata).call(chart);
//    
//	vis.selectAll(".category text")
//    .attr("dx", 5)
//    .attr("transform", "rotate(90)");
//	
//	vis.selectAll(".category rect")
//    .attr("y", 0);
//	
//	vis.selectAll("text.dimension")
//    .attr("dy", "1.5em")
//    .attr("transform", "rotate(90)");
//	
//	vis.selectAll("text.dimension .sort.alpha")
//    .attr("x", 0)
//    .attr("dx", 0)
//    .attr("dy", "1.5em");
//	
//	 vis.selectAll("text.dimension .sort.size")
//    .attr("dx", "1em");
//	
//	d3.select("#"+position+"parset").moveToBack();
//}

function addToParsetData(semantic, position, topK ){
	var k = 0;
	if(position == "columnA"){
		semanticXlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;

		$.each(columnBelements, function(key, value){
			if(k<topK){
				semanticYlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.semobject.columnB.id;
				})[0].label;
				for(var ind= 0; ind<value.querycount; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					parsetdata.push(parsetelement);
				}
			k++
			}else {
				//add an object for every query not in top 10 categories
//				for(var ind= 0; ind<value.querycount; ind++){
//					parsetelement = {}
//					parsetelement.ColumnX = semanticXlabel 
//					parsetelement.ColumnY = "other";
//					parsetdata.push(parsetelement);
//				}
				return false;
			}
		});
	}
	else{
		semanticYlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;
		$.each(columnAelements, function(key, value){
			if(k<topK){
				semanticXlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.semobject.columnA.id;
				})[0].label;
				for(var ind= 0; ind<value.querycount; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					parsetdata.push(parsetelement);
				}
			k++
			}else {
				//add an object for every query not in top 10 categories
//					for(var ind= 0; ind<value.querycount; ind++){
//						parsetelement = {}
//						parsetelement.ColumnX = "other"; 
//						parsetelement.ColumnY = semanticYlabel;
//						parsetdata.push(parsetelement);
//					}
				return false;
			}
		});
	
	}
}

function loadQTC(filename){
	var qtc = {}; 
	$.get(filename,function(txt){
	    var lines = txt.split("\n");
	    for (var i = 0, len = lines.length; i < len; i++) {
	    	line = lines[i];
	    	var res = line.split(" ");	    	
	    	qtc[res[1]] = res[0];
	    }
	    return qtc;
	});	
}
//Helper functions
function populateColumn(data, column){
	$('#'+column+'container').empty();
	$('#'+column+'container')
	.append('<div style="padding-bottom:10px;">Abstraction: <br> '+
			'<div id="'+column+'abstraction" class= "abstractionslider" name ="Abstraction"></div>'+
			'<div class="input-group" id="input'+column+'"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="'+column+'filter" type="text" class="form-control" placeholder="Type here...">	</div></div>'+
	'<div class = "scrollable"><table class="table table-striped semanticlist" id="'+column+'table" ><tbody class="searchable" id="'+column+'list"></tbody></table></div>');
	
	$('#'+column+'list').empty();
	
	var filtereddata = data;
	
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	
	if(selectedColumnAID!=""){
		filtereddata = filtereddata.filter(function( obj ) {
	    return obj.columnA.id == selectedColumnAID;
		});
	}
	if(selectedColumnBID!=""){
		filtereddata = filtereddata.filter(function( obj ) {
	    return obj.columnB.id == selectedColumnBID;
		});
	}
	var uniqueEntities = _.uniq(filtereddata, function (item, key, a) {
		return item[column].label;}
	);
	var listelements = []
var minQueryCount= 0, maxQueryCount= 0;
	//for every querysemantics that matches my filters
	$.each(uniqueEntities, function( index, value) {
		if(value[column].id!=undefined){
			var element = {};
			element.semobject = value;//get the querysemantics
			
//			element.querycount = fetchQC(value[column].id,column, value.template)
			element.querycount = fetchQC(value[column].id,column, selectedTemplateID)
			listelements.push(element);	
			if(element.querycount<minQueryCount)minQueryCount = element.querycount;
			if(element.querycount>maxQueryCount)maxQueryCount = element.querycount;

		}
	});
	listelements = _.sortBy(listelements, function(element){ return - element.querycount;})

	if(column =="columnA"){columnAelements = listelements;}
	else if(column == "columnB"){columnBelements = listelements;}
	abstractions = [];
	
	var columnlist = $('#'+column+'list');
	var columnlisthtml = "";
	var fontscale = d3.scale.linear()
	.domain([minQueryCount, maxQueryCount])
	.range([10, 30])
	$.each(listelements, function( index, element) {
		if($.inArray(element.semobject[column].abstractionLevel, abstractions) == -1){
			abstractions.push(element.semobject[column].abstractionLevel);
		}
		thislabel= element.semobject[column].label;
		if(!isNaN(element.querycount)){
			columnlisthtml = columnlisthtml+'<tr id="'+column+'list'+element.semobject[column].id+'" uid="'+element.semobject[column].id+'" abstraction="'+
					element.semobject[column].abstractionLevel+'" qspCol="'+thislabel+
					'"  style="background:rgba(70,130,180,'+ 1/element.semobject[column].abstractionLevel +
					'); "><td><span class="badge" >'+element.querycount+'</span></td><td uid="'+element.semobject[column].id+
					'" class="drilldown"></td><td class=" semanticlistelement" uid="'+element.semobject[column].id+'"  style="font-size:'+fontscale(element.querycount)+'px;" >'+
		      thislabel+'</td></tr>';
		}
  	});
	columnlist.append(columnlisthtml);
	
	
	$("#"+column+"abstraction").slider({
		range:true,
        values:[1,8],
        min: 1,
        max: 8,
        step: 1,
        slide: function( event, ui ) {
			var selected = ui.values;
			$('#'+column+'abstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,'+1/selected[0]+'), rgba(70,130,180,'+1/selected[1]+'))');

			var table = document.getElementById(column+"table");
	        for (var i = 1, row; row = table.rows[i]; i++) {
			  if( row.getAttribute("abstraction")>=selected[0] && row.getAttribute("abstraction")<=selected[1])
				  $(row).show();
			  else
				  $(row).hide();
			}
        }
	})
	.each(function() {
		 // Add labels to slider whose values 
	    // are specified by min, max

	    // Get the options for this slider (specified above)
	    var opt = $(this).data().uiSlider.options;

	    // Get the number of possible values
	    var vals = opt.max - opt.min;

	    // Position the labels
	    for (var i = 0; i <= vals; i++) {

	        // Create a new element and position it with percentages
	        var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%').css('margin-top','15px');

	        // Add the element inside #slider
	        $("#"+column+"abstraction").append(el);
	    }
	});	
	$('#'+column+'abstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,1), rgba(70,130,180,'+1/8+'))');

//	$('.ui-widget-content').css('background','gray');
	console.log("Displayed "+column);
//	$(window).trigger('resize');

}


function parseColumnSemantics(data, num){
	
	var columnObject = [];
	
	if(data!==undefined){	
		var objectElements = data.split(/[[\]]{1,2}/);	
		columnObject["label"] = objectElements[0];
		columnObject["id"]= objectElements[1];
		columnObject["abstractionLevel"]= objectElements[2];
		columnObject["columnCount"]= +objectElements[3];
	}
	return columnObject;
}
function displayTemplates(data){
	var uniqueEntities = _.uniq(data, function (item, key, a) {
		if((item.template).length<20 )//filter out dirty data
			return item.template;
		});
	var list = $("#templateList");
	var listelements = []
	var minQueryCount= 0,maxQueryCount = 0;
	$.each(uniqueEntities, function( index, value) {
		var element = {};
		var template = value.template;
		if(queryTemplates[template]!=undefined && (queryTemplates[template].text).indexOf('Ignore')==-1){
			element.template = template;
			element.templatecount = queryTemplates[template].count;
			element.text = queryTemplates[template].text;
			listelements.push(element);	

			if(element.templatecount<=minQueryCount)
				minQueryCount = element.templatecount;
			if(element.templatecount>=maxQueryCount)
				maxQueryCount = element.templatecount;
		}
	});
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;})
	maxQueryCount = listelements[0].templatecount;
	var listhtml= "";
	var fontscale = d3.scale.linear()
	.domain([minQueryCount, maxQueryCount])
	.range([10, 30])
	.clamp(true);
	$.each(listelements, function( index, value) {
//	list.append('<li class="list-group-item" id="'+value.template+'" permutations = "'+value.templatecount+
//			'"><span class ="badge">'+value.templatecount+'</span>'+value.text+'</li>');
		listhtml = listhtml+ '<li class="list-group-item" id="'+value.template+'" text="'+value.text+'" permutations = "'+value.templatecount+
		'" style="font-size:'+fontscale(value.templatecount)+'px;"><span class ="badge">'+value.templatecount+'</span>'+value.text+'</li>';
	});
	list.append(listhtml);
}



function fetchQC(uid,column,template){
	var o;
totalcount = 0;
var id;
	if(template!==""){
		if(column == "columnA")
			id = template+"_1";
		else if(column == "columnB")
			id = template+"_2";
		if(uid.indexOf('wordnet')!==-1){
			o = _.select(wordnet, function (obj) {
				  return obj.uid === uid;
				})[0];
		}
		else{//it's a tag!
			o = _.select(tags, function (obj) {
				  return obj.uid === uid;
				})[0];
		}
		
		filteredQueryStats  = (_.uniq(o.queryStats, function (item) {
			return Object.keys(item)[0]==id;
			}));
		if(filteredQueryStats[1]==undefined){
//			console.log(uid+" "+column+" "+template);
			return 0;
		}
		else{			
			return filteredQueryStats[1][id];// NO IDEA WHY TWO ARE RETURNED!!!! :/
}	
	}
	else{
		totalcount = 0;
		if(uid.indexOf('wordnet')!==-1){
			o = _.select(wordnet, function (obj) {
			  return obj.uid === uid;
			})[0];
		}
		else{
			o = _.select(tags, function (obj) {
				  return obj.uid === uid;
				})[0];
			}
		$.each(o.queryStats, function( index, value) {
			totalcount = totalcount+value[Object.keys(value)[0]];
		});
		return totalcount;
	}
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
function displaySemanticIcicle(uid, column){
	 $("#"+column+"container").hide();
	 $("#"+column+"semanticExplorer").empty();
	 $("#"+column+"semanticExplorer").show();
	
	var w = 400,h = 400;
	var x = d3.scale.linear().range([0, w]);
	var y = d3.scale.linear().range([0, h]);

	//create data for zoomable partition
	icicle = {}
	var semanticobject = _.select(wordnet, function (obj) {
		  return obj.uid === uid;
		});
	var key = semanticobject[0].label;
	$("#"+column+"semanticExplorer").append('<p>Displaying zoomable partition for semantic type = "'+key
			+'", with id="'+uid+'"</p>');
	
	icicle.name= key;
	icicle.uid=semanticobject[0].uid;
	icicle.abstractionLevel = semanticobject[0].abstrationLevel;
	icicle.type="wordnet";
	icicle.count = fetchQC(semanticobject[0].uid,column,selectedTemplateID);
	icicle.children= [];
	processObject(semanticobject[0], icicle.children, column);
	
	var partition = d3.layout.partition()
   .value(function(d) { return d.count; });
	
	var nodes = partition.nodes(icicle);
	var root = nodes[0];
	
	var svg = d3.select("#"+column+"semanticExplorer").append("svg")
		.attr("id", column+"svg")
		.attr("width", w)
		.attr("height", h)
		.append("g")
		.attr("id", column+"partition");
	
	var g = svg.selectAll("#"+column+"partition g")
		   .data(nodes)
		   .enter()
		   .append("svg:g")
		   .attr("id", function(d) { 
			   return "partition"+column+d.uid; })
		   .attr("uid", function(d) { 
			   return d.uid; })
		   .attr("abstractionLevel", function(d) { 
		   		return d.abstractionLevel; })
		   .attr("transform", function(d) { 
		   		return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
		   .on("click", clicked)
		   .on("mouseover", function(d) { 
			   	if (displayParsetsOn== false)
			   		return;
			   	if (!d.children) 
			   		return;
			   	displayParsets(d, column, 10);
			   	})
		   .on("mouseout",function(){
			   	if (displayParsetsOn== false)
			   		return;
			   	d3.selectAll("#"+column+"parset").remove()
		   		});
	
	var kx = w / root.dx, ky = h / 1;
	
	g.append("svg:rect")
	.attr("uid", function(d) { return d.uid; })
    .attr("width", root.dy * kx)
    .attr("height", function(d) { return d.dx * ky; })
    .attr("class", function(d) { 
    	if(d.children)
    		return "selectedListElement";
    	else
    		return d.type=="wordnet" ? "parent" : "child"; 
    	})

    .style("opacity", function(d) { 
    	return d.type=="wordnet"&& !d.children ? 1/d.abstractionLevel : 1;
   	 })
    ;

    g.append("svg:text")
    .attr("uid", function(d) { return d.uid; })
    .attr("transform", transform)
    .attr("dy", ".35em")
    .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
    .text(function(d) { return d.name +", "+d.count; })

    g.style("display", function(d) {
   	    if (d.depth > 1) {
   	        return "none";//nodes whose depth is more than 1 make its vanish
   	      } else {
   	        return "block";
   	      }
   	    });
    
    d3.select(window).on("click", function() { clicked(root); })
    
    function transform(d) {return "translate(8," + d.dx * ky / 2 + ")"; }

    function clicked(d) {
    	if($("#"+column+"semanticExplorer").css('display')=='none')return;
    	
    	displaySemanticIcicle(d.uid, column);
    	d3.event.stopPropagation();
        if(column == "columnA"){
       	 	selectedColumnAID = d.uid;
       	 	populateColumn(queryPermutations, 'columnB');
        }

        else if(column == "columnB"){
        	selectedColumnBID = d.uid
       		populateColumn(queryPermutations, 'columnA');
        }  
        displayParsets(d, column, 10);
    }	
}


function processObject(parent, parentIcicle, column){
//this version only goes down depth 1
	$.each(parent.derivedFrom, function(index, value){
		var o = _.select(wordnet, function (obj) {
			  return obj.uid === value;
			});
		
		if(o.length==0){//reached a leaf (tag)
			o = _.select(tags, function (obj) {
			  return obj.uid === value;
			});
			childSemantics = o[0];
			
			var object = {};
			object.name = childSemantics.label;
			object.uid = childSemantics.uid;
			object.type = "tag";
			object.count = fetchQC(childSemantics.uid,column,selectedTemplateID);
			parentIcicle.push(object);
		}
		else{
			childSemantics = o[0];

			var arr = _.filter(parentIcicle, function(value){ 
			    if (value.name == childSemantics.label){ 
			      return value;
			    } 
			 })
			if (arr.length==0) {
					var object = {};
					object.name = childSemantics.label;
					object.uid = childSemantics.uid;
					object.abstractionLevel = childSemantics.abstrationLevel;
					object.count = fetchQC(childSemantics.uid,column,selectedTemplateID);
					object.type = "wordnet";
//					object.children= [];
					parentIcicle.push(object);
				}
			
//			var arrobj = _.filter(parentIcicle, function(value){ 
//			    if (value.name == childSemantics.label){ 
//			      return value;
//			    } 
//			 })[0];
//			
//			processObject(childSemantics, arrobj.children, column);
		}
	});
}

//function displaySemanticIcicle(uid, column){
//	 $("#"+column+"container").hide();
//	 $("#"+column+"semanticExplorer").empty();
//	 $("#"+column+"semanticExplorer").show();
//	
//	var w = 700,h = 600;
//	var x = d3.scale.linear().range([0, w]);
//	var y = d3.scale.linear().range([0, h]);
//
//	//create data for zoomable partition
//	icicle = {}
//	var semanticobject = _.select(wordnet, function (obj) {
//		  return obj.uid === uid;
//		});
//	var key = semanticobject[0].label;
//	$("#"+column+"semanticExplorer").append('<p>Displaying zoomable partition for semantic type = "'+key
//			+'", with id="'+uid+'"</p>');
//	icicle.name= key;
//	icicle.uid=semanticobject[0].uid;
//	icicle.abstractionLevel = semanticobject[0].abstrationLevel;
//	icicle.children= [];
//	processObject(semanticobject[0], icicle.children, column);
//	
//	var partition = d3.layout.partition()
//    .value(function(d) { return d.count; });
//	
//	var nodes = partition.nodes(icicle);
//	var root = nodes[0];
//	
//	var svg = d3.select("#"+column+"semanticExplorer").append("svg")
//		.attr("id", column+"svg")
//		.attr("width", w+100)
//		.attr("height", h+100)
//		.append("g")
//		.attr("id", column+"partition");
//	
//	var g = svg.selectAll("#"+column+"partition g")
//    .data(nodes)
//    .enter()
//    .append("svg:g")
//    .attr("id", function(d) { return "partition"+column+d.uid; })
//    .attr("uid", function(d) { return d.uid; })
//    .attr("abstractionLevel", function(d) { 
//    	return d.abstractionLevel; })
//    .attr("transform", function(d) { 
//    	return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
//    .on("click", clicked)
//    .on("mouseover", function(d) { 
//    	if (displayParsetsOn== false)return;
//    	if (!d.children) return;
//    	displayParsets(d, column, 10);})
//    .on("mouseout",function(){
//    	if (displayParsetsOn== false)return;
//    	d3.selectAll("#"+column+"parset").remove()
//    });
//	
//	var kx = w / root.dx,
//    ky = h / 1;
//	
//	g.append("svg:rect")
//	.attr("uid", function(d) { return d.uid; })
//     .attr("width", root.dy * kx)
//     .attr("height", function(d) { return d.dx * ky; })
//     .attr("class", function(d) { 
//    	 return d.children ? "parent" : "child"; })
//     .style("opacity", function(d) { 
//    	 return d.children ? 1/d.abstractionLevel : 1;
//    	 })
//     ;
//
//     g.append("svg:text")
//     .attr("uid", function(d) { return d.uid; })
//     .attr("transform", transform)
//     .attr("dy", ".35em")
//     .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
//     .text(function(d) { return d.name; })
//
//     g.style("display", function(d) {
//    	    if (d.depth > 1) {
//    	        return "none";//nodes whose depth is more than 1 make its vanish
//    	      } else {
//    	        return "block";
//    	      }
//    	    });
//     
// d3.select(window)
//     .on("click", function() { clicked(root); })
//	
//     
//    function transform(d) {
//        return "translate(8," + d.dx * ky / 2 + ")";
//    }
// 
// function clicked(d) {
//	 	d3.selectAll("#"+column+"parset").remove();
//	 	displayQueries(column, d.uid);
//        if (!d.children) return;
//
//        kx = (d.y ? w - 40 : w) / (1 - d.y);
//        ky = h / d.dx;
//        x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
//        y.domain([d.x, d.x + d.dx]);
//        
//        
//        d3.selectAll("#"+column+"partition g").each( function(d1, i){
//        	if($(this).css("display")=="none" && d1.depth==d.depth-1){// the element is hidden and before the element i clicked on
//        		$(this).css("display","block");//show element
//        	}
//        	else if (d1.depth ==d.depth+1 || d1.uid==d.uid) {//the element is the element i clicked on or a depth ahead.
//        		$(this).css("display","block");//show element
//            }
//            else {                    	
//                $(this).css("display", "none");
//            }
//        });
//         
//   
//        var g = svg.selectAll("#"+column+"partition g");
//        var t = g.transition()
//            .duration(d3.event.altKey ? 7500 : 750)
//            .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });
//
//        t.select("rect")
//            .attr("width", d.dy * kx)
//            .attr("height", function(d) { 
//            	return d.dx * ky; });
//
//        t.select("text")
//            .attr("transform", transform)
//            .style("opacity", function(d) { 
//            	return d.dx * ky > 12 ? 1 : 0; });
//          d3.event.stopPropagation();
//           
//          
//          if(column == "columnA"){
//        	  selectedColumnAID = d.uid;
//        	  populateColumn(queryPermutations, 'columnB');
//          }
//
//          else if(column == "columnB"){
//        	  selectedColumnBID = d.uid
//        	  populateColumn(queryPermutations, 'columnA');
//          }         
//    }	
//}
//
//
//function processObject(parent, parentIcicle, column){
//
//	$.each(parent.derivedFrom, function(index, value){
//		var o = _.select(wordnet, function (obj) {
//			  return obj.uid === value;
//			});
//		
//		if(o.length==0){//reached a leaf (tag)
//			o = _.select(tags, function (obj) {
//			  return obj.uid === value;
//			});
//			childSemantics = o[0];
//			
//			var object = {};
//			object.name = childSemantics.label;
//			object.uid = childSemantics.uid;
//			object.count = fetchQC(childSemantics.uid,column,selectedTemplateID);
//			parentIcicle.push(object);
//		}
//		else{
//			childSemantics = o[0];
//
//			var arr = _.filter(parentIcicle, function(value){ 
//			    if (value.name == childSemantics.label){ 
//			      return value;
//			    } 
//			 })
//			if (arr.length==0) {
//					var object = {};
//					object.name = childSemantics.label;
//					object.uid = childSemantics.uid;
//					object.abstractionLevel = childSemantics.abstrationLevel;
//
//					object.children= [];
//					parentIcicle.push(object);
//				}
//			
//			var arrobj = _.filter(parentIcicle, function(value){ 
//			    if (value.name == childSemantics.label){ 
//			      return value;
//			    } 
//			 })[0];
//			
//			processObject(childSemantics, arrobj.children, column);
//		}
//	});
//}

function displayQueries(column, uid){
	var examplequeries = $("#examplequeries");
	examplequeries.empty();
	examplequeries.append(selectedTemplateID+": "+column+", "+ uid);
	
}

