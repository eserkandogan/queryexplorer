/**
 * 
 */
//	var client = new $.es.Client({
//		  host: 'http://localhost:9200',
////		  log: 'trace'
//		});
var elasticsearch = true;	
var id=0;
var queryPermutations = [];
var allQueries = 0;
var wordnet = [], senses = [];
var tags = [];
var queryTemplates = {};
var parsetAdata = [];
var parsetBdata = [];
var icicle;
var a,b; //variables used to measure execution time of code

var selectedTemplateID = "", selectedColumnAID = "", selectedColumnBID = "";
var columnAelements = [], columnBelements = []; 
var displayParsetsOn = false; //start with parallel-sets functionality off
/////////////////////////////////////////////////////////////////////////////

a = performance.now();
$.getJSON( "data/QuerySemanticPermutations/qsp_1.json", function( data ) {
queryPermutations = data;
$.getJSON( "data/QuerySemanticPermutations/qsp_2.json", function( data2 ) {
queryPermutations = queryPermutations.concat(data2);
$.getJSON( "data/QuerySemanticPermutations/qsp_3.json", function( data3 ) {
queryPermutations = queryPermutations.concat(data3);	  
$.getJSON( "data/QuerySemanticPermutations/qsp_4.json", function( data4 ) {
queryPermutations = queryPermutations.concat(data4);
$.getJSON( "data/QuerySemanticPermutations/qsp_5.json", function( data5 ) {
queryPermutations = queryPermutations.concat(data5);
$.getJSON( "data/QuerySemanticPermutations/qsp_6.json", function( data6 ) {
queryPermutations = queryPermutations.concat(data6);
$.getJSON( "data/QuerySemanticPermutations/qsp_7.json", function( data7 ) {
queryPermutations = queryPermutations.concat(data7);
$.getJSON( "data/QuerySemanticPermutations/qsp_8.json", function( data8 ) {
queryPermutations = queryPermutations.concat(data8);
$.getJSON( "data/QuerySemanticPermutations/qsp_9.json", function( data9 ) {
queryPermutations = queryPermutations.concat(data9);
$.getJSON( "data/QuerySemanticPermutations/qsp_10.json", function( data10 ) {
queryPermutations = queryPermutations.concat(data10);
$.getJSON( "data/QuerySemanticPermutations/qsp_11.json", function( data11 ) {
queryPermutations = queryPermutations.concat(data11);
$.getJSON( "data/QuerySemanticPermutations/qsp_12.json", function( data12 ) {
queryPermutations = queryPermutations.concat(data12);
	$.getJSON( "data/QuerySemanticPermutations/qsp_13.json", function( data13 ) {
		queryPermutations = queryPermutations.concat(data13);

		$.getJSON( "data/wordnet.json", function( wordnetdata ) {
			wordnet = wordnetdata;
			$.getJSON( "data/tags.json", function( tagdata ) {
				tags = tagdata;
				  $.get("data/templateQC.txt",function(txt){
					  b = performance.now();
					  colorTrace('It took ' + (b - a) + ' ms to load all the data', "pink");
					  $("#loader").append("<br>- Loaded data/templateQC.txt")
				
					  var lines = txt.split("\n");
					  for (var i = 0, len = lines.length; i < len; i++) {
					    	line = lines[i];
					    	var res = line.split(",");
					    	queryTemplates[res[1]] = {}
					    	queryTemplates[res[1]].count = res[0];
					    	queryTemplates[res[1]].text = res[2];
					    	
					    	allQueries=allQueries+parseFloat(res[0]);
					  }				
					  $("#loader").append("<br>- Processed data/templateQC.txt");
				
				
				$.each(wordnet, function(index, value){
					senses.push(value.uid);
				})
				
				////////////// Data Loaded //////////
				
				
				
				
				
				$("#loader").css( "display","none");	
				$("#interface").css( "display","block");

				displayTemplates();
				
				console.log("Displayed Templates")
				
				populateColumn('columnA');
				populateColumn('columnB');
//				populateSemanticsBrowser();
//				populateTagsBrowser();
				
				// event listener for template selection
				$('#templateList').on('click', 'li', function() {
					
					// releasing a template selection
				    if(selectedTemplateID == this.id){	
				    	selectedTemplateID= '';
				    	$('.templatetext').hide();
						displayTemplates(queryPermutations);//recalculate query counts
				    }
				    // selecting a template that was not selected
				    else{ 
				    	selectedTemplateString = this.getAttribute('text');
				    	selectedTemplateID = this.id;
				    	
				    	// show selected template around placeholders (columns)
					    $('.templatetext').show();
					    $('#selectedTemplate2').empty();
					    $('#selectedTemplate2').append(selectedTemplateString.slice(selectedTemplateString.indexOf("X")+1, selectedTemplateString.indexOf("Y")));
					    $('#selectedTemplate3').empty();
					    $('#selectedTemplate3').append(selectedTemplateString.slice(selectedTemplateString.indexOf("Y")+1, selectedTemplateString.length-1));
					    $(this).children().filter('.templatevalue').html(this.getAttribute('text').slice(0, this.getAttribute('text').indexOf("<b>X")));
					    $('#templateList li').removeClass( 'selectedListElement' );
					    $(this).toggleClass('selectedListElement');
				    }
				    // make sure semantic explorers (icicle views) are hidden and semantic lists are visible			    
				    $("#columnAsemanticExplorer").hide();
				    $("#columnBsemanticExplorer").hide();
					$("#columnAlist").show();
					$("#columnBlist").show();
					
					// generate semantic lists based on template selection
				    populateColumn('columnA');
				    populateColumn('columnB');
				    
				    displayQueries("", "");
				    
				    // highlight semantics that were preselected
				    if(selectedColumnAID!=""){
				    	$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
				    	$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
				    if(selectedColumnBID!=""){
				    	$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
					}
				});
				
				$(document).on("click", "#columnAlist .semanticlistelement", function() {
				    $("input[name='columnAparallelsets']").prop('checked', false);

						if(selectedColumnAID == this.getAttribute('uid')){//i am deselecting me, reset everything.
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnAID;
							})[0].abstractionLevel;
							$('#columnAlist'+selectedColumnAID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
							$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').empty();

							selectedColumnAID = "";
						}
						else{
							if(selectedColumnAID!=""){
								abstractionLevel = _.select(wordnet, function (obj) {
									  return obj.uid === selectedColumnAID;
								})[0].abstractionLevel;
								$('#columnAlist'+selectedColumnAID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
								$('#columnAlist'+selectedColumnAID+ ' .drilldown').empty();
								$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').empty();

							}
							//update selected semantic
							selectedColumnAID = this.getAttribute('uid');
							$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
							$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
							$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
						}
						displayQueries("columnA", selectedColumnAID);
						displayTemplates(queryPermutations);
						
						populateColumn('columnB');
						if(selectedColumnBID!=""){
							$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
							$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
							
							$('#columnBlist'+selectedColumnBID).css('background', 'yellow');

						}
						
						if(selectedColumnAID!=""){
							semobject = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnAID;
							})[0];
							displayParsets(semobject, "columnA", true);
						}
						if(selectedTemplateID !="")
							$("li[id="+selectedTemplateID+"]").toggleClass('selectedListElement');
				});
				$(document).on("click", "#columnAlist .inspect", function(){
					$('#colAprompt').append('<button id="backTocolumnA" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnAID, 'columnA', false);
					displayQueries("columnA", selectedColumnAID);
				});
				$(document).on("click", "#columnBlist .inspect", function(){
					$('#colBprompt').append('<button id="backTocolumnB" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnBID, 'columnB', false);
					displayQueries("columnB", selectedColumnBID);
				})
				$(document).on("click", "#columnAlist .showicicles", function(){
					$('#colAprompt').append('<button id="backTocolumnA" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnAID, 'columnA', true);
					displayQueries("columnA", selectedColumnAID);
				});
				$(document).on("click", "#columnBlist .showicicles", function(){
					$('#colBprompt').append('<button id="backTocolumnB" class="btn btn-primary btn-xs" type="button"> <span class="glyphicon glyphicon-chevron-left"></span>  Back to semantics list </button>')
					displaySemanticIcicle(selectedColumnBID, 'columnB', true);
					displayQueries("columnB", selectedColumnBID);
				})
				$(document).on("click", "#columnBlist .semanticlistelement", function() {
					//i'm just deselecting the element
					if(selectedColumnBID == this.getAttribute('uid')){
						abstractionLevel = _.select(wordnet, function (obj) {
							  return obj.uid === selectedColumnBID;
						})[0].abstractionLevel;
						$('#columnBlist'+selectedColumnBID).css('background', 'rgba(70,130,180,'+ 1/abstractionLevel +	')');
						$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').empty();
						selectedColumnBID = "";
					}
					//I clicked an element to select it
					else{
						if(selectedColumnBID!=""){
							abstractionLevel = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnBID;
							})[0].abstractionLevel;
							$('#columnBlist'+selectedColumnBID).css('background','rgba(70,130,180,'+ 1/abstractionLevel +	')');
							$('#columnBlist'+selectedColumnBID+ ' .drilldown').empty();
							$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').empty();
						}
						//update selected semantic
						selectedColumnBID = this.getAttribute('uid');

						$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');

						$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
					}

				    populateColumn('columnA');
				    
				    if(selectedColumnAID!=""){
					    $('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
					    $('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
					displayTemplates(queryPermutations);
				    displayQueries("columnB", selectedColumnBID);
				    if(selectedColumnBID!=""){
						semobject = _.select(wordnet, function (obj) {
								  return obj.uid === selectedColumnBID;
							})[0];
					    displayParsets(semobject, "columnB", true);
				    }
				    if(selectedTemplateID !="")
						$("li[id="+selectedTemplateID+"]").toggleClass('selectedListElement');
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
		        
		        $(document).on("keyup","#semanticsbrowserfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#semanticsbrowser .searchable tr').hide();
		            $('#semanticsbrowser .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
		          $(document).on("keyup","#tagsbrowserfilter", function () {

		            var rex = new RegExp($(this).val(), 'i');
		            $('#tagsbrowser .searchable tr').hide();
		            $('#tagsbrowser .searchable tr').filter(function () {
		                return rex.test($(this).text());
		            }).show();

		        })
				$(document).on("click", "#backToTemplate", function(){
					$('#templateList').show();
					$('.templatetext').hide();
				});

				
				$(document).on("click", "#backTocolumnA", function(){
					$("#columnAsemanticExplorer").empty();
					$("#columnAsemanticExplorer").hide();
					$("#columnAcontainer").show();
					$("#backTocolumnA").remove();
					selectedColumnAID =	document.querySelector("#columnAlist .inspect").parentElement.getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnAID;
					})[0];
					displayParsets(semobject, "columnA", true);
					displayQueries("columnA", selectedColumnAID);
				});
				
				$(document).on("click", "#backTocolumnB", function(){
					$("#columnBsemanticExplorer").empty();
					$("#columnBsemanticExplorer").hide();
					$("#columnBcontainer").show();
					$("#backTocolumnB").remove();
					selectedColumnBID = document.querySelector("#columnBlist .inspect").parentElement.getAttribute("uid");
					semobject = _.select(wordnet, function (obj) {
						  return obj.uid === selectedColumnBID;
					})[0];
					displayParsets(semobject, "columnB", true);
					displayQueries("columnB", selectedColumnBID);

				});
				$(document).on("change","input[type='checkbox']",function() {
				    if(this.checked) {
				        //Do stuff
				    	console.log($(this).prop("value"));
				    	columnName = this.parentElement.getAttribute("column");
				    	semanticid = $(this).prop("value");
				        addToParsetData(semanticid, columnName, 10);
				        semobject = _.select(wordnet, function (obj) {
							  return obj.uid === semanticid;
						})[0];
				        displayParsets(semobject, columnName, false);
				    }
				});
			});
		});
	});
});
});});});});});});});});});});});});

function displayParsets(d, position, reset){
	var semanticid = d.uid;
	$("#"+position+"parset").empty();
	//prep the data for parallel sets
	if(reset){
		if(position=="columnA")
			parsetAdata=[];
		else if(position=="columnB")
			parsetBdata=[];
		addToParsetData(semanticid, position, 10);
	}
    
    var svg = d3.select("#"+position+"parset").append("svg")
	.attr("id", "#"+position+"parsetsvg")
	.attr("width", "90%")
	.attr("height", 450);
    
    var margin = {top: 0, right: 25, bottom: 50, left: 0};
    var width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    console.log(width+", "+height);
	var chart = d3.parsets().dimensions(["ColumnX","ColumnY"]).width(width).height(height);				

	var vis = svg.append("g")
	.attr("id", position+"parset")
//     .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
	.attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,"+(width + margin.left + margin.right)+")rotate(-90)");//this is correct. 
	
	if(position=="columnA")
		vis.datum(parsetAdata).call(chart);	
	else if(position=="columnB")
		vis.datum(parsetBdata).call(chart);
    
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
function snoopForLeaves(leafArray, parent){
	kids = parent.derivedFrom;
	if(kids)
		$.each(kids, function(index, value){
			if(value.indexOf("wordnet_")!=-1){
				var childSemantics = _.select(wordnet, function (obj) {
					  return obj.uid === value;
					})[0];
				
				if(childSemantics.abstractionLevel == 1){
					leafArray.push(childSemantics);
				}
				else{
					snoopForLeaves(leafArray, childSemantics);
				}
			}
		})
}
function addToParsetDataFull(semantic, column, topK ){
	//get all leafs of the semantic type in question
	var leafArray = []
	var parent = _.select(wordnet, function (obj) {
		  return obj.uid === semantic;
		})[0];
	snoopForLeaves(leafArray, parent);
	
	var filtereddata = queryPermutations;
	var k = 0;
	//filter on template if one is selected
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	//filter all query permutations that have the LEAF semantic types
	filtereddata = filtereddata.filter(function( obj ) {
	    return $.inArray(obj[column].id, leafArray)!=-1;
	});
	//sort all filtered query permutations
	listelements = _.sortBy(filtereddata, function(element){ return - element.count;})
	
	
	if(column == "columnA"){
		var semanticType = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0];
		// get the label of the semantic type user is looking at
		var semanticXlabel = semanticType.label;
//		var children = semanticType.derivedFrom;

		//for all filtered query permutations, record the top K combinations 
		$.each(listelements, function(key, value){
			if(k<topK){
				var filter = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnB.id;
				});
				if(filter.length!=0){
					semanticYlabel = filter[0].label;
						
					for(var ind= 0; ind<value.count; ind++){			
						parsetelement = {}
						parsetelement.ColumnX = semanticXlabel 
						parsetelement.ColumnY = semanticYlabel;
						if(column=="columnA")parsetAdata.push(parsetelement);
						else if(column=="columnB")parsetBdata.push(parsetelement);
					}
					k++
				}
			}else {
				return false;
			}
		});
	}
	else if (column == "columnB"){
		semanticYlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;

		$.each(listelements, function(key, value){
			if(k<topK){
				semanticXlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnA.id;
				})[0].label;
				for(var ind= 0; ind<value.count; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					if(column=="columnA")parsetAdata.push(parsetelement);
					else if(column=="columnB")parsetBdata.push(parsetelement);
				}
			k++
			}else {
				return false;
			}
		});
	
	}
}

function addToParsetData(semantic, column, topK ){
	var filtereddata = queryPermutations;
	var k = 0;
	//filter on template if one is selected
	if(selectedTemplateID!=""){
	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	//filter all query permutations that have the semantic type in question
	filtereddata = filtereddata.filter(function( obj ) {
	    return obj[column].id == semantic;
	});
	//sort all filtered query permutations
	listelements = _.sortBy(filtereddata, function(element){ return - element.count;})
	
	
	if(column == "columnA"){
		// get the label of the semantic type user is looking at
		semanticXlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;
		//for all filtered query permutations, record the top K combinations 
		$.each(listelements, function(key, value){
			if(k<topK){
				var filter = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnB.id;
				});
				if(filter.length!=0){
						semanticYlabel = filter[0].label;
					for(var ind= 0; ind<value.count; ind++){			
						parsetelement = {}
						parsetelement.ColumnX = semanticXlabel 
						parsetelement.ColumnY = semanticYlabel;
						if(column=="columnA")parsetAdata.push(parsetelement);
						else if(column=="columnB")parsetBdata.push(parsetelement);
					}
					k++
				}
			}else {
				return false;
			}
		});
	}
	else if (column == "columnB"){
		semanticYlabel = _.select(wordnet, function (obj) {
			  return obj.uid === semantic;
		})[0].label;

		$.each(listelements, function(key, value){
			if(k<topK){
				semanticXlabel = _.select(wordnet, function (obj) {
					  return obj.uid === value.columnA.id;
				})[0].label;
				for(var ind= 0; ind<value.count; ind++){			
					parsetelement = {}
					parsetelement.ColumnX = semanticXlabel 
					parsetelement.ColumnY = semanticYlabel;
					if(column=="columnA")parsetAdata.push(parsetelement);
					else if(column=="columnB")parsetBdata.push(parsetelement);
				}
			k++
			}else {
				return false;
			}
		});
	
	}
}
function truncateText(text, width) {
    return function(d, i) {
      var t = this.textContent = text(d, i),
          w = width(d, i);
      if (this.getComputedTextLength() < w) return t;
      this.textContent = "…" + t;
      var lo = 0,
          hi = t.length + 1,
          x;
      while (lo < hi) {
        var mid = lo + hi >> 1;
        if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
        else hi = mid;
      }
      return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
    };
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


function populateTagsBrowser(){
	$('#tagsbrowser').empty();
	$('#tagsbrowser').append('<div style="padding-bottom:10px;">'+
			'<div class="input-group" id="inputtagsbrowser"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="tagsbrowserfilter" type="text" class="form-control" placeholder="Type here...">	'+
	'</div></div>'+'<table class = " table table-striped " id = "alltagstable"><thead><tr>'+
	'<th>Complete<br>Query Count</th><th>ColumnX<br>Query Count</th><th>ColumnY<br>Query Count</th> <th>Tag</th>'+
	'</tr></thead><tbody class="searchable " id ="tagsbrowsertable"></tbody></table>');
	var tablebody = $('#tagsbrowsertable')
	$.each(tags, function( index, value) {
		
		countsA =  countAllQueriesOfSemType(value, 1);
		countsB =  countAllQueriesOfSemType(value, 2);
		tablebody.append('<tr ><td>'+(countsA+countsB)+'</td><td>'+countsA+'</td><td>'+countsB+'</td><td>'+value.label+' </td></tr>');
	});
	
	$(function(){
		  $('#alltagstable').tablesorter({sortList: [[0,1]]} ); 
		});
}

function populateSemanticsBrowser(){
	$('#semanticsbrowser').empty();
	$('#semanticsbrowser').append('<div style="padding-bottom:10px;">Abstraction: <br> '+
			'<div id="semanticsbrowserabstraction" class= "abstractionslider" name ="Abstraction"></div>'+
			'<div class="input-group" id="inputsemanticsbrowser"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="semanticsbrowserfilter" type="text" class="form-control" placeholder="Type here...">	'+
	'</div></div>'+'<table class = " table table-striped " id = "allsemanticstable"><thead><tr>'+
	'<th>Complete<br>Query Count</th><th>ColumnX<br>Query Count</th><th>ColumnY<br>Query Count</th> <th>SemanticType</th>'+
	'</tr></thead><tbody class="searchable " id ="semanticsbrowsertable"></tbody></table>');
	var tablebody = $('#semanticsbrowsertable')
	$.each(wordnet, function( index, value) {
		
		countsA =  countAllQueriesOfSemType(value, 1)
		countsB =  countAllQueriesOfSemType(value, 2);
		tablebody.append('<tr style="background:rgba(70,130,180,'+ 1/value.abstractionLevel +
				'); " abstraction="'+
				value.abstractionLevel+'"><td>'
//				+(((countsA+countsB) *100)/totalNumOfQueries).toFixed(4)+' % </td><td>'
				+(countsA+countsB)+'</td><td>'+countsA+'</td><td>'+countsB+'</td><td>'+value.label+' </td></tr>');
	});
	
	
	$("#semanticsbrowserabstraction").slider({
		range:true,
        values:[1,8],
        min: 1,
        max: 8,
        step: 1,
        slide: function( event, ui ) {
			var selected = ui.values;
			$('#semanticsbrowserabstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,'+1/selected[0]+'), rgba(70,130,180,'+1/selected[1]+'))');

			var table = document.getElementById("semanticsbrowsertable");
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
	        $("#semanticsbrowserabstraction").append(el);
	    }
	});	
	$('#semanticsbrowserabstraction .ui-slider-range').css('background','linear-gradient(to right, rgba(70,130,180,1), rgba(70,130,180,'+1/8+'))');
	$(function(){
		  $('#allsemanticstable').tablesorter({sortList: [[0,1]]}); 
		});
}
function totalNumOfQueries(selectedTemplateID){
	if(selectedTemplateID!="")
		return queryTemplates[selectedTemplateID].count;
	else
		return allQueries;
}


/****************************************************
 * Generate list of templates ranked by query counts
 * *************************************************/
function displayTemplates(){

	var listelements = [];
	
	var list = $("#templateList");
	list.empty();
	var minQueryCount=0,maxQueryCount=0;
	//No filters have been applied
	if(selectedTemplateID=="" && selectedColumnAID=="" && selectedColumnBID==""){
		$.each(queryTemplates, function( index, value) {
			var element = {};
			element.template = index;
			element.text = value.text;
			element.templatecount = value.count;
			listelements.push(element);			
		});
	}
	// there is a filter on one or more query attributes
	else if (selectedColumnAID!="" || selectedColumnBID!=""){		
		$.each(queryPermutations, function(index, value){
			if(selectedColumnAID!="" && selectedColumnBID!="" &&
			value.columnA.id == selectedColumnAID && value.columnB.id == selectedColumnBID){
				elementindex= 0;
				var exists = _.find(listelements, function(item, index){
					if(item.template==value.template)
						elementindex = index;
					return item.template==value.template
				});
				if(exists!== undefined){
					listelements[elementindex].templatecount = exists.templatecount + value.count;
				}else if(queryTemplates[value.template]!==undefined){
					var element = {};
					element.template = value.template;
					element.text = queryTemplates[value.template].text;
					element.templatecount = value.count;
					listelements.push(element);
				}
			}else if (selectedColumnAID=="" && selectedColumnBID!=""&&
					value.columnB.id == selectedColumnBID){
				elementindex= 0;
				var exists = _.find(listelements, function(item, index){
					if(item.template==value.template)elementindex = index;
					return item.template==value.template
					});
				if(exists!== undefined){
					listelements[elementindex].templatecount = exists.templatecount + value.count;
				}else if(queryTemplates[value.template]!==undefined){
					var element = {};
					element.template = value.template;
					element.text = queryTemplates[value.template].text;
					element.templatecount = value.count;
					listelements.push(element);
				}
			}
			else if (selectedColumnAID!="" && selectedColumnBID=="" &&
					value.columnA.id == selectedColumnAID){
				elementindex= 0;
				var exists = _.find(listelements, function(item, index){
					if(item.template==value.template)elementindex = index;
					return item.template==value.template
					});
				if(exists!== undefined){
					listelements[elementindex].templatecount = exists.templatecount + value.count;
				}else if(queryTemplates[value.template]!==undefined){
					var element = {};
					element.template = value.template;
					element.text = queryTemplates[value.template].text;
					element.templatecount = value.count;
					listelements.push(element);
				}
			}
		});
	}
	//sort templates by template count
	listelements = _.sortBy(listelements, function(element){ return - element.templatecount;});
	
	minQueryCount = listelements[listelements.length - 1].templatecount
	maxQueryCount = listelements[0].templatecount;
	var fontscale = d3.scale.linear()
		.domain([minQueryCount, maxQueryCount])
		.range([10, 30])
		.clamp(true);
	
	// create and append template list to browser
	var listhtml= "";
	$.each(listelements, function( index, value) {
		listhtml = listhtml+ '<li class="list-group-item" id="'+value.template+'" text="'+value.text+'" permutations = "'+value.templatecount+
		'" style="font-size:'+fontscale(value.templatecount)+'px;"><span class ="badge">'+value.templatecount+'</span><span class="templatevalue">'+value.text+'</span></li>';
	});
	list.append(listhtml);
	
	console.log("Displayed templates for selectedColumnAID= '"+selectedColumnAID+"' and selectedColumnBID='"+selectedColumnBID+"'")
}
function populateColumn(column){
	if(elasticsearch)
		populateColumnServerside(column);
	else 
		populateColumnLocaly(column);
}

/********************************************************************
 * Server side creation of sense listings (for columnA or columnB)
 * ranked by query count using rest services and elastic search
 * *****************************************************************/
function populateColumnServerside(column){
	
	$.ajax({
	     url: 'controller?action=GET_SENSE_LIST&selectedTemplateID='+selectedTemplateID+
	     											'&selectedColumnAID='+selectedColumnAID+
	     											'&selectedColumnBID='+selectedColumnBID+
	     											'&column='+column,
	     type: 'post', 
	     dataType: 'json',
         contentType: "application/json; charset=utf-8",
         mimeType: 'application/json',
	     success: function(listelements) {
	       console.log('populateColumnServerside successful');
	       createRankedSenseListElement(listelements, column);
	     },
	     error:function(result) {
	       alert('ERROR');
	     }
	});
}



/**********************************************************************
 * Client side creation of sense listings (for columnA or columnB)
 * ranked by query count, iterating through JSONArrays of data
***********************************************************************/
function populateColumnLocaly(column){

	
	console.log("Populating column "+column)
	
	
	var listelements = []
	var filteredqp;
	a = performance.now();

	if(		(column == "columnA" && selectedColumnBID != "") ||
			(column == "columnB" && selectedColumnAID != "")){
		if(selectedTemplateID == ""){
			if(column == "columnA" && selectedColumnBID != ""){				
				$.each(queryPermutations, function(index, value){
					if(value.columnB.id == selectedColumnBID){
						elementindex= 0;
						var exists = _.find(listelements, function(item, index){
							if(item.semobject.uid==value.columnA.id)elementindex = index;
							return item.semobject.uid==value.columnA.id});
						
						if(exists!== undefined){
							listelements[elementindex].querycount = exists.querycount + value.count;
						}else{
							var element = {};
							
							element.semobject = {
									uid:value.columnA.id,
									label:value.columnA.label,
									abstractionLevel: value.columnA.abstractionLevel
								}	
							element.querycount = value.count;
							listelements.push(element);
						}
					}
				});
			}
			else if(selectedTemplateID == "" && column == "columnB" && selectedColumnAID != ""){
				$.each(queryPermutations, function(index, value){
					if(value.columnA.id == selectedColumnAID){
						var exists = _.find(listelements, function(item, index){
							if(item.semobject.uid==value.columnB.id)elementindex = index;
							return item.semobject.uid==value.columnB.id});
						if(exists!== undefined){
							listelements[elementindex].querycount = exists.querycount+ value.count;
						}else{
							var element = {};
							element.semobject = {
									uid:value.columnB.id,
									label:value.columnB.label,
									abstractionLevel: value.columnB.abstractionLevel
								}	
							element.querycount = value.count;
							listelements.push(element);
						}
					}
				});
			}
		}
		else if(selectedTemplateID != ""){
			if(column == "columnA" && selectedColumnBID != ""){
				$.each(queryPermutations, function(index, value){
					if(value.columnB.id == selectedColumnBID && value.template == selectedTemplateID){
						var element = {};
						element.semobject = {
								uid:value.columnA.id,
								label:value.columnA.label,
								abstractionLevel: value.columnA.abstractionLevel
							}
						element.querycount = value.count;
						listelements.push(element);
						}
				});
			}
			else if(column == "columnB" && selectedColumnAID != ""){
				$.each(queryPermutations, function(index, value){
					if(value.columnA.id == selectedColumnAID && value.template == selectedTemplateID){
						var element = {};
						element.semobject = {
								uid:value.columnB.id,
								label:value.columnB.label,
								abstractionLevel: value.columnB.abstractionLevel
							}
						element.querycount = value.count;
						listelements.push(element);
					}
				});
			}
		}
	}
	else if((column == "columnA" && selectedColumnBID == "") ||
			(column == "columnB" && selectedColumnAID == "")){		
		$.each(wordnet, function( index, value) {
			var element = {};
			element.semobject = value;
			if(selectedTemplateID == ""){
				element.querycount = countQueriesOfWordInPosition(value, column);
			}
			else if(selectedTemplateID != ""){
				element.querycount = countQueriesOfWordInPositionWithTemplate(value, column);
			}
			// if this semantic type really does participate in queries, add it to the list
			if(element.querycount!=0)listelements.push(element);
		});
	}

	b = performance.now();
	colorTrace('It took ' + (b - a) + ' ms to list semantic types AND calculate query counts for  '+ column +'', "blue");
	createRankedSenseListElement(listelements, column);
	console.log("Finished populating column "+column);
}

/***********************************************
 * Given a list of senses and their query counts
 * create the list element and add to dom
 * *********************************************/
function createRankedSenseListElement(listelements, column){
	$('#'+column+'container').empty();
	$('#'+column+'container')
	.append('<div style="padding-bottom:10px;">Abstraction: <br> '+
			'<div id="'+column+'abstraction" class= "abstractionslider" name ="Abstraction"></div>'+
			'<div class="input-group" id="input'+column+'"> '+
			'<span class="input-group-addon">Filter</span>'+			
	'<input id="'+column+'filter" type="text" class="form-control" placeholder="Type here...">	</div></div>'+
	'<div class = "scrollable"><table class="table table-striped semanticlist" id="'+column+
	'table" ><tbody class="searchable" id="'+column+'list"></tbody></table></div>');
	
	$('#'+column+'list').empty();
	
	var minQueryCount = (_.min(listelements, function(item){return item.querycount})).querycount;
	var maxQueryCount = (_.max(listelements, function(item){return item.querycount})).querycount;
	
	a = performance.now();
	listelements = _.sortBy(listelements, function(element){ return - element.querycount;})
	b = performance.now();
	colorTrace('It took ' + (b - a) + ' ms to sort items in '+ column, "blue");
	
	
	if(column =="columnA"){columnAelements = listelements;}
	else if(column == "columnB"){columnBelements = listelements;}
	abstractions = [];
	
	var columnlist = $('#'+column+'list');
	var columnlisthtml = "";
	var fontscale = d3.scale.linear().domain([minQueryCount, maxQueryCount]).range([10, 30]);
	
	a = performance.now();
	$.each(listelements, function( index, element) {
		if($.inArray(element.semobject.abstractionLevel, abstractions) == -1){
			abstractions.push(element.semobject.abstractionLevel);
		}
		thislabel= element.semobject.label;
		if(!isNaN(element.querycount)){
			columnlisthtml = columnlisthtml+'<tr id="'+column+'list'+element.semobject.uid+'" uid="'+element.semobject.uid+'" abstraction="'+
					element.semobject.abstractionLevel+'" qspCol="'+thislabel+
					'"  style="background:rgba(70,130,180,'+ 1/element.semobject.abstractionLevel +
					'); "><td column="'+column+'"><input type="checkbox" name="'+column+'parallelsets" value="'+
					element.semobject.uid+'"> </td><td>'
					+((element.querycount *100)/totalNumOfQueries(selectedTemplateID)).toFixed(4)+' % </td><td>'
					+'<span class="badge" >'
					+element.querycount+'</span></td><td uid="'+element.semobject.uid+
					'" class="doubledrilldown"></td><td uid="'+element.semobject.uid+
					'" class="drilldown"></td><td class=" semanticlistelement" uid="'+element.semobject.uid+
					'"  style="font-size:'+fontscale(element.querycount)+'px;" >'+
		      thislabel+'</td></tr>';
		}
  	});

	b = performance.now();
	colorTrace('It took ' + (b - a) + ' ms to create the interface elements in '+ column, "blue");
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

}













function calculateQueryCount(template){
	var querycount = 0;
	//build query
	var query, mustarray=[];
	var term;
	term = {term: {"template":template}};
	mustarray.push(term);
	if (selectedColumnAID!="") {
		term = {term: {"columnA.id":selectedColumnAID}};
		mustarray.push(term);
		}
	if (selectedColumnBID!="") {
		term = {term: {"columnB.id":selectedColumnBID}};
		mustarray.push(term);
		}
	query = {query: { filtered: {filter: {bool:{must:mustarray}}}}};

	client.search({index:'viqs',type:'querysemantics',body:query}).then(function (resp) {
			querycount = resp.hits.total;
	    	console.log(querycount);
		}, function (err) {
		    console.trace(err.message);
		});
	return querycount;	
}

/******************************************************************
 * Return query count for an attribute in a given position
 * e.g., * - <wordnet_123>-* OR * - *-<wordnet_123>
 * ***************************************************************/
// this is a duplicate function of countAllQueriesOfSemType. TODO replace everywhere with countQueriesOfWordInPosition
function countQueriesOfWordInPosition(word, column){	
	if(column == "columnA") position = 1;
	else if(column == "columnB") position = 2; 
	
	var count = 0;
	$.each(word.queryStats, function(ind, val){
		if(Object.keys(val)[0].endsWith(position))
			count+=val[Object.keys(val)[0]]
	});
	return count;
}

/******************************************************************
 * Return query count for a known template and one known attribute
 * e.g., compare_2 - <wordnet_123>-*  OR  compare_2 - *-<wordnet_123>
 * ***************************************************************/
function countQueriesOfWordInPositionWithTemplate(word, column){
	if(column == "columnA") position = 1;
	else if(column == "columnB") position = 2; 
	
	id = selectedTemplateID+"_"+position;
	filteredQueryStats  = (_.uniq(word.queryStats, function (item) {//go through semantic object query stats 
		return Object.keys(item)[0]==id;
		}));
	
	if(filteredQueryStats[1]==undefined){
		return 0;
	}
	else{			
		return filteredQueryStats[1][id];
	}	
}
/**********************************************************************
 * add query counts from all <template_id> - <wordnet_123> - <wordnet_456>
 * e.g., * - <wordnet_123> - <wordnet_456>:<see query permutations file>
 * *********************************************************************/
function countQueriesGivenTwoAttributes(columnAuid, columnBuid){
	filteredqp = $.grep(queryPermutations, function (item) {//go through all query permutations 
		return  item.columnA.id == columnAuid  && item.columnB.id == columnBuid;
		})
	totalcount = 0;
	$.each(filteredqp, function( index, value) {
		totalcount = totalcount+ value.count;
	});
	return totalcount;	
}



function parseColumnSemantics(data, num){
	
	var columnObject = {};
	
	if(data!==undefined){	
		var objectElements = data.split(/[[\]]{1,2}/);	
		columnObject.label = objectElements[0];
		columnObject.id= objectElements[1];
		columnObject.abstractionLevel= objectElements[2];
		columnObject.columnCount = + objectElements[3];
	}
	return columnObject;
}
function saveQSP(){
	startindex = 0; 
	increment = 100000;
	fileindex = 1;
	while(startindex<queryPermutations.length){
		if(startindex+increment>=queryPermutations.length)
			endindex = queryPermutations.length-1;
		else endindex = startindex+increment;
		
	  $.ajax({
		     url: 'controller?action=SAVE_QSP&filename=qsp_'+fileindex,
		     type: 'post', 
		     dataType: 'json',
	         contentType: "application/json; charset=utf-8",
	         mimeType: 'application/json',
		     data: JSON.stringify(queryPermutations.slice(startindex,endindex)),
		     success: function(result) {
		       console.log('Successfully saved qsp_'+fileindex);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
	  var bulkstring = "";
	  $.each(queryPermutations.slice(startindex,endindex), function(index, item){
		  var indexjson = {};
		  indexjson.index = {};
		  indexjson.index._index= "viqs";
		  indexjson.index._type= "querysemantics";
		  indexjson.index._id= item.qspid;
		  
		  bulkstring = bulkstring+ JSON.stringify(indexjson)+ "\n";
		  bulkstring = bulkstring+ JSON.stringify(item)+ "\n";
	  });
	  $.ajax({
		     url: 'controller?action=SAVE_QSP_BULK&filename=qsp_bulk_'+fileindex,
		     type: 'post', 
		     dataType: 'text',
		     data: bulkstring,
		     success: function(result) {
		       console.log('Successfully saved qsp_bulk_'+fileindex);
		     },
		     error:function(result) {
		       alert('ERROR');
		     }
		});
	  
	  
	  
	  fileindex++;
	  startindex = startindex+1 + increment;
	}
	
	
	
}

//THIS IS A DUPLICATE FUNCTION
function countAllQueriesOfSemType(semtype, position){
	var count = 0;
	$.each(semtype.queryStats, function(ind, val){
		if(Object.keys(val)[0].endsWith(position))
			count+=val[Object.keys(val)[0]]
	});
	return count;
}

/**
 * Calculate query count of a semantic type given the
 * semantic type, placeholder position, and selected template 
 * and combination with other placeholders  **/
function fetchQC(uid,column,template, filteredQueryPermutations){
	var o;
	if(uid.indexOf('wordnet')!==-1){
		o = _.select(wordnet, function (obj) {return obj.uid === uid;})[0];
	}else{//it's a tag!
		o = _.select(tags, function (obj) {  return obj.uid === uid;})[0];
	}
	
	totalcount = 0;
	var id;
	// template is NOT blank
	if(template!==""){
		// calculating count for colA with no selected colB (template-columnA_*)
		if(column == "columnA" && selectedColumnBID == ""){
			id = template+"_1";
			filteredQueryStats  = (_.uniq(o.queryStats, function (item) {//go through semantic object query stats 
				return Object.keys(item)[0]==id;
				}));
			if(filteredQueryStats[1]==undefined){
				return 0;
			}
			else{			
				return filteredQueryStats[1][id];
			}	
		}
		// calculating count for colB with no selected colA (template-*_columnB)
		else if(column == "columnB" && selectedColumnAID == ""){
			id = template+"_2";
			filteredQueryStats  = (_.uniq(o.queryStats, function (item) {
				return Object.keys(item)[0]==id;
				}));
			if(filteredQueryStats[1]==undefined){
				return 0;
			}
			else{			
				return filteredQueryStats[1][id];
			}	
		}
		//template-semA_semB
		else if(column == "columnA" && selectedColumnBID != ""){
			filteredqp = $.grep(filteredQueryPermutations, function (item) {//go through all query permutations 
				return item.template == template && item.columnA.id == uid && item.columnB.id == selectedColumnBID;
				});
			if (filteredqp.length==2)
				filteredqp[1].count;
			else if(filteredqp.length==1 && filteredqp[0].template == template && filteredqp[0].columnA.id == uid && filteredqp[0].columnB.id == selectedColumnBID)
				return filteredqp[0].count
			else
				return 0;
		}
		//template-semA_semB
		else if(selectedColumnAID != "" && column == "columnB"){
			filteredqp = $.grep(filteredQueryPermutations, function (item) {//go through all query permutations 
				return item.template == template && item.columnA.id == selectedColumnAID  && item.columnB.id == uid;
				})
				if (filteredqp.length==2)
					filteredqp[1].count;
				else if(filteredqp.length==1 && filteredqp[0].template == template && filteredqp[0].columnA.id == selectedColumnAID  && filteredqp[0].columnB.id == uid)
					return filteredqp[0].count
				else
					return 0;
		}
	}
	
	//template is BLANK
	else if( template == ""){
		//remaining placeholder is empty
		if (column=="columnB" && selectedColumnAID == "")
			return countAllQueriesOfSemType(o, 2);
		else if (column=="columnA" && selectedColumnBID == "")
			return countAllQueriesOfSemType(o, 1);
		
		// remaining placeholder has a value
		else if (column=="columnA" && selectedColumnBID != "")
			return countsOfAllPermutationsWithAandB(uid, selectedColumnBID, filteredQueryPermutations)	
		else if (column=="columnB" && selectedColumnAID != "")
			return countsOfAllPermutationsWithAandB(selectedColumnAID, uid, filteredQueryPermutations)
		
			// BOTH placeholders are BLANK 
		else{
			totalcount = 0;
			$.each(o.queryStats, function( index, value) {
				totalcount = totalcount+value[Object.keys(value)[0]];
			});
			return totalcount;
		}
	}
}	

/************************************************
 * Calculate query count if template is blank and 
 * both placeholders have selected values
 * **********************************************/
function countsOfAllPermutationsWithAandB(columnAuid, columnBuid, filteredQueryPermutations){
	filteredqp = $.grep(filteredQueryPermutations, function (item) {//go through all query permutations 
		return  item.columnA.id == columnAuid  && item.columnB.id == columnBuid;
		})
	totalcount = 0;
	$.each(filteredqp, function( index, value) {
		totalcount = totalcount+ value.count;
	});
	return totalcount;	
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
function displaySemanticIcicle(uid, column, fullIcicle){
	var body = d3.select("body");
	var partitiontooltip = $("#partitiontooltip");
	 $("#"+column+"container").hide();
	 $("#"+column+"semanticExplorer").empty();
	 $("#"+column+"semanticExplorer").show();
	var fullIcicle = fullIcicle;
	var w = 600,h = 600;
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
	
	var filtereddata = queryPermutations;
	
	if(selectedTemplateID!=""){
		console.log("Remove all Query Permutations with selectedTemplateID !="+selectedTemplateID)

	    filtereddata = filtereddata.filter(function( obj ) {
	    	return obj.template == selectedTemplateID;
		});
	}
	
	if(column == "columnB" && selectedColumnAID!=""){
		console.log("Remove all Query Permutations with selectedColumnAID !="+selectedColumnAID)

		filtereddata = filtereddata.filter(function( obj ) {
	    return obj.columnA.id == selectedColumnAID;
		});
	}
	else if(column == "columnA" && selectedColumnBID!=""){
		console.log("Remove all Query Permutations with selectedColumnBID !="+selectedColumnBID)

		filtereddata = filtereddata.filter(function( obj ) {
		    return obj.columnB.id == selectedColumnBID;
		});
	}
	
	icicle.name= key;
	icicle.uid=semanticobject[0].uid;
	icicle.abstractionLevel = semanticobject[0].abstractionLevel;
	icicle.type="wordnet";
	icicle.count = fetchQC(semanticobject[0].uid,column,selectedTemplateID, filtereddata);
	icicle.children= [];
	processObject(semanticobject[0], icicle.children, column, fullIcicle);
	
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
			   var m = d3.mouse(body.node());
			   partitiontooltip.show()
			          .css("left", m[0] + 10 + "px")
			          .css("top", m[1] - 10 + "px")
			          .text(d.name +", "+d.count);
			      
//			   	if (displayParsetsOn== false)
//			   		return;
//			   	if (!d.children) 
//			   		return;
//			   	displayParsets(d, column, true);
			   	})
		   .on("mouseout",function(){
			   partitiontooltip.hide();

//			   	if (displayParsetsOn== false)
//			   		return;
//			   	d3.selectAll("#"+column+"parset").remove()
		   		});
	
	var kx = w / root.dx, ky = h / 1;
	
	g.append("svg:rect")
	.attr("uid", function(d) { return d.uid; })
    .attr("width", root.dy * kx)
    .attr("height", function(d) { return d.dx * ky; })
    .attr("class", function(d) { 
    	if(d.depth==0)
    		return "selectedListElement";
    	else
    		return d.type=="wordnet" ? "parent" : "child"; 
    	}).style("opacity", function(d) { return d.type=="wordnet" && d.depth!=0 ? 1/d.abstractionLevel : 1;})
    ;

    g.append("svg:text")
    .attr("uid", function(d) { return d.uid; })
    .attr("transform", transform)
    .attr("dy", ".35em")
    .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
    .text(truncateText(function(d) { return d.name +", "+d.count; }, function(d) { return root.dy * kx; }));

    d3.select(window).on("click", function() {clicked(root); })
    
    function transform(d) {return "translate(8," + d.dx * ky / 2 + ")"; }
    

    function clicked(d) {
    	
    	if($("#"+column+"semanticExplorer").css('display')=='none')return;
    	if(fullIcicle){
        	
    		if (!d.children) return;
    		
            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);
            
            var g = svg.selectAll("#"+column+"partition g");
            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d) { 
                	return d.dx * ky; });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) { 
                	return d.dx * ky > 12 ? 1 : 0; });
              d3.event.stopPropagation();
              
              if(column == "columnA"){
            	  selectedColumnAID = d.uid;
            	  populateColumn('columnB');
            	  if(selectedColumnBID!=""){
				    	$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						
				    	$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
					}
              }

              else if(column == "columnB"){
            	  selectedColumnBID = d.uid
            	  populateColumn('columnA');
            	  if(selectedColumnAID!=""){
				    	$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						
				    	$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
              }
    	}
    	else{
	    	displaySemanticIcicle(d.uid, column, false);
	    	d3.event.stopPropagation();
	        if(column == "columnA"){
	       	 	selectedColumnAID = d.uid;
	       	 	populateColumn('columnB');
	       	 	if(selectedColumnBID!=""){
			    	$('#columnBlist'+selectedColumnBID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
					$('#columnBlist'+selectedColumnBID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
					
			    	$('#columnBlist'+selectedColumnBID).css('background', 'yellow');
				}
	        }
	
	        else if(column == "columnB"){
	        	selectedColumnBID = d.uid
	       		populateColumn('columnA');
	        	 if(selectedColumnAID!=""){
				    	$('#columnAlist'+selectedColumnAID+ ' .drilldown').append('<span class="inspect glyphicon glyphicon-step-forward" label="inspect children"></span>');
						$('#columnAlist'+selectedColumnAID+ ' .doubledrilldown').append('<span class="showicicles glyphicon glyphicon-fast-forward" label="inspect children"></span>');
						
				    	$('#columnAlist'+selectedColumnAID).css('background', 'yellow');
					}
	        }  
	        displayParsets(d, column, true);
    	}
    }	
}



function processObject(parent, parentIcicle, column, fullicicle){
	var filtereddata = queryPermutations;
	if(selectedTemplateID!=""){

	 filtereddata = filtereddata.filter(function( obj ) {
	    return obj.template == selectedTemplateID;
		});
	}
	
	if(column == "columnB" && selectedColumnAID!=""){

		filtereddata = filtereddata.filter(function( obj ) {
	    return obj.columnA.id == selectedColumnAID;
		});
	}
	else if(column == "columnA" && selectedColumnBID!=""){

		filtereddata = filtereddata.filter(function( obj ) {
		    return obj.columnB.id == selectedColumnBID;
		});
	}
	
	
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
			object.count = fetchQC(childSemantics.uid,column,selectedTemplateID, filtereddata);
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
					object.abstractionLevel = childSemantics.abstractionLevel;
					object.type = "wordnet";
					object.count = fetchQC(childSemantics.uid,column,selectedTemplateID, filtereddata);
						
					if(fullicicle){
						object.children= [];
					}
					parentIcicle.push(object);
				}
			if(fullicicle){
				var arrobj = _.filter(parentIcicle, function(value){ 
			    if (value.name == childSemantics.label){ 
			      return value;
			    } 
			 })[0];
			
			processObject(childSemantics, arrobj.children, column, fullicicle);
				
			}

		}
	});
}

function displayQueries(column, uid){
	var examplequeries = $("#examplequeries");
	examplequeries.empty();
	examplequeries.append(selectedTemplateID+": "+column+", "+ uid);
	
}


function colorTrace(msg, color) {
    console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}
